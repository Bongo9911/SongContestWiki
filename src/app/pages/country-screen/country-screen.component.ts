import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { firestore } from 'firebase';
import { Contest, Song } from 'src/app/shared/datatypes';

@Component({
  selector: 'app-country-screen',
  templateUrl: './country-screen.component.html',
  styleUrls: ['./country-screen.component.css']
})
export class CountryScreenComponent implements OnInit {

  readonly pointset: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12'];
  
  id: string;
  country: string;

  songs: Song[] = [];
  sortedData: Song[];

  numEntries: number = 0;
  numQualifiers: number = 0;

  songlist: any[] = []

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.country = params.country;
    });

    //get all the songs sent for that country
    this.database.firestore.collection('contests').doc(this.id)
      .collection('songs').where('country', '==', this.country).get().then(docs => {
        docs.forEach((doc) => {
          this.songs.push(doc.data() as Song);
          this.songs = this.songs.sort((a, b) => (a.edition > b.edition) ? 1 : -1);
          this.numEntries = this.songs.length;
          this.numQualifiers = this.songs.filter(function (song) {
            return song.qualifier !== 'NQ';
          }).length;
        });
      });

    // this.database.firestore.collection('contests')
    //   .doc(this.id).collection('songs').get().then(docs => {
    //     docs.forEach((doc) => {
    //       this.songlist.push({ id: doc.id, ...doc.data() });
    //     });
    //   });
  }

  ngOnInit(): void {
  }

  getStyle(dq: string, place: number): object {
    switch (place) {
      case 1:
        return { 'background-color': '#ffd700' };
      case 2:
        return { 'background-color': '#c0c0c0' };
      case 3:
        return { 'background-color': '#cc9966' };
      case 4:
      case 5:
      case 6:
        return { 'background-color': '#bae8ff' };
      default:
        if (dq === 'FWD' || dq == 'FDQ') return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
        else return { 'background-color': 'ghostwhite' };
    }
  }

  getSFStyle(place: number): object {
    switch (place) {
      case 1:
        return { 'background-color': '#ffd700' };
      case 2:
        return { 'background-color': '#c0c0c0' };
      case 3:
        return { 'background-color': '#cc9966' };
      default:
        return { 'background-color': 'ghostwhite' };
    }
  }

  sortData(sort: Sort, sf: string) {
    let data = this.songs;

    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'draw':
          if (sf === 'f') {
            return compare(a.fro, b.fro, isAsc);
          }
          else {
            return compare(a.sfro, b.sfro, isAsc);
          }
        case 'edition': return compare(a.edition, b.edition, isAsc);
        case 'user': return compare(a.user, b.user, isAsc);
        case 'language': return compare(a.language, b.language, isAsc);
        case 'artist': return compare(a.artist.toLowerCase(), b.artist.toLowerCase(), isAsc);
        case 'song': return compare(a.song.toLowerCase(), b.song.toLowerCase(), isAsc);
        case 'fplace': return compare(a.fplace, b.fplace, isAsc);
        case 'fpoints': return compare(a.fpoints, b.fpoints, isAsc);
        case 'sfplace': return compare(a.sfplace, b.sfplace, isAsc);
        case 'sfpoints': return compare(a.sfpoints, b.sfpoints, isAsc);
        default: return 0;
      }
    });

    this.songs = this.sortedData;
  }

  async uploadPoints(points: string) {
    const parsedString = points.split('\n').map((line) => line.split('\t'))

    let pointsarray = new Array<string>(10);
    let data = {}

    for (let i = 0; i < parsedString.length; ++i) {

      pointsarray[this.pointset.indexOf(parsedString[i][7])] = parsedString[i][5];
      console.log('foo');
      if (i + 1 === parsedString.length || parsedString[i][4] != parsedString[i + 1][4]) {
        data[parsedString[i][1].toLowerCase() + 'pointset'] = {};
        data[parsedString[i][1].toLowerCase() + 'pointset']['points'] = [...pointsarray];

        if (parsedString[i][1] != 'F') {
          data[parsedString[i][1].toLowerCase() + 'pointset']['cv'] = false;
        }

        this.database.collection<Contest>('contests', ref => ref.where('id', '==', this.id))
          .doc(this.id).collection<Song>('songs').doc(this.songlist.filter(function (song) {
            return song.edition === parsedString[i][0];
          }).filter(function (song) {
            return song.country === parsedString[i][3];
          })[0].id).update(data)

        data = {}
        pointsarray = new Array<string>(10); //destroy the old array and make a new empty one
      }
    }
  }

  //TODO: Upload points from sheet https://docs.google.com/spreadsheets/d/17goq4iFSuPCpw2EdfJ49YvNxlai5NO-vJDj8I7_iTos/edit#gid=2029422360
  async uploadTablePoints(points: string) {
    const parsedString = points.split('\n').map((line) => line.split('\t'))

    let pointsarray = new Array<string>(10);
    let data = {}

    for (let i = 1; i < parsedString.length; ++i) {

      for (let j = 1; j < parsedString[i].length; ++j) {

        pointsarray[this.pointset.indexOf(parsedString[i][j])] = parsedString[0][j];
        console.log('foo');

        if (j + 1 === parsedString[i].length) {
          data['sf2pointset'] = {};
          data['sf2pointset']['points'] = [...pointsarray];
          data['sf2pointset']['cv'] = true;

          this.database.collection<Contest>('contests', ref => ref.where('id', '==', this.id))
            .doc(this.id).collection<Song>('songs').doc(this.songlist.filter(function (song) {
              return song.edition === '23';
            }).filter(function (song) {
              return song.country === parsedString[i][0];
            })[0].id).update(data)

          data = {}
          pointsarray = new Array<string>(10); //destroy the old array and make a new empty one
        }

      }
    }
  }

  async uploadPointTotals(points: string) {
    const parsedString = points.split('\n').map((line) => line.split('\t'))

    parsedString.forEach(x => {
      let data = {
        rawextpoints: parseInt(x[1]),
        extpoints: parseInt(x[2]),
        intpoints: parseInt(x[3])
      }

      this.database.collection<Contest>('contests', ref => ref.where('id', '==', this.id))
        .doc(this.id).collection('songs').doc(this.songlist.filter(function (song) {
          return song.edition === '23';
        }).filter(function (song) {
          return song.country === x[0];
        })[0].id).update(data)
    })
  }

  deleteSongs() {
    this.songlist.filter(song => { return song.edition === '20.5' }).forEach(toDelete => {
      this.database.collection<Contest>('contests', ref => ref.where('id', '==', this.id))
        .doc(this.id).collection<Song>('songs').doc(toDelete.id).delete();
    })
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}