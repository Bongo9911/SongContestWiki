import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { Contest, Song } from 'src/app/shared/datatypes';
import firebase from 'firebase';

@Component({
  selector: 'app-user-screen',
  templateUrl: './user-screen.component.html',
  styleUrls: ['./user-screen.component.css']
})
export class UserScreenComponent implements OnInit {
  readonly pointset: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12'];

  con: Contest = {
    name: '',
    id: ''
  };
  id: string;
  user: string;

  songs: Song[] = [];

  numEntries: number = 0;
  numQualifiers: number = 0;

  bestPlace: string = "";
  bestEd: string = "";
  worstPlace: string = "";
  worstEd: string = "";

  songlist: any[] = [];

  phases: number = 2;

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.user = params.user;
    });

    this.database.firestore.collection('contests').where('id', '==', this.id).get()
      .then(docs => {
        docs.forEach((doc) => {
          this.con = doc.data() as Contest;
        });
      });

    //get all the songs sent for that user
    //get all the songs sent for that country
    this.database.firestore.collection('contests').doc(this.id)
      .collection('newsongs').where('user', '==', this.user).get().then(docs => {
        docs.forEach((doc) => {
          this.songs.push(doc.data() as Song);
          this.songs = this.songs.sort((a, b) => (a.edval > b.edval) ? 1 : -1);
          this.numEntries = this.songs.length;
          this.numQualifiers = this.songs.filter(function (song) {
            return song.draws.length === song.phases;
          }).length;

          this.phases = [...this.songs].sort((a, b) => a.phases > b.phases ? 1 : -1)[0].phases
        });

        for (let i = 0; i <= 3; ++i) {
          let songsort = [...this.songs].filter(song => song.draws.length === 2 - i &&
            'place' in song.draws[2 - i - 1])
          if (songsort.length) {
            songsort.sort((a, b) => a.draws[a.phases - i - 1].place > b.draws[b.phases - i - 1].place
              ? 1 : -1)
            this.bestPlace = this.numToRankString(songsort[0].draws[songsort[0].phases - i - 1].place);
            switch (i) {
              case 1:
                this.bestPlace += ' (SF)'
                break;
              case 2:
                this.bestPlace += ' (QF)'
                break;
              case 3:
                this.bestPlace += ' (OF)'
                break;
            }
            this.bestEd = songsort[0].edition;
            break;
          }
        }

        for (let i = 3; i >= 0; --i) {
          let songsort = [...this.songs].filter(song => song.draws.length === 2 - i &&
            'place' in song.draws[2 - i - 1])
          if (songsort.length) {
            songsort.sort((a, b) => a.draws[2 - i - 1].place < b.draws[2 - i - 1].place ? 1 : -1)
            this.worstPlace = this.numToRankString(songsort[0].draws[2 - i - 1].place);
            switch (i) {
              case 1:
                this.worstPlace += ' (SF)'
                break;
              case 2:
                this.worstPlace += ' (QF)'
                break;
              case 3:
                this.worstPlace += ' (OF)'
                break;
            }
            this.worstEd = songsort[0].edition;
            break;
          }
        }
      });

    this.database.firestore.collection('contests').doc(this.id)
      .collection('songs').where('edition', '==', '30').get().then(docs => {
        docs.forEach((doc) => {
          this.songlist.push({ id: doc.id, ...doc.data() });
        });
      });
  }

  //Converts the number to a string in the form of "nth"
  numToRankString(num: number): string {
    let place = num.toString();
    if (place.length === 1 || (place.length >= 2 && place[place.length - 2] !== "1")) {
      switch (place[place.length - 1]) {
        case "1":
          place += "st";
          break;
        case "2":
          place += "nd";
          break;
        case "3":
          place += "rd";
          break;
        default:
          place += "th";
          break;
      }
    }
    else {
      place += "th";
    }

    return place;
  }

  ngOnInit(): void {
  }

  getStyle(song: Song): object {
    if (song.dqphase + 1 === song.draws.length) {
      return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
    }
    else {
      if (song.phases === song.draws.length) {
        if (song.draws[song.phases - 1].place === 1) return { 'background-color': '#ffd700' };
        else if (song.draws[song.phases - 1].place === 2) return { 'background-color': '#c0c0c0' };
        else if (song.draws[song.phases - 1].place === 3) return { 'background-color': '#cc9966' };
        else if (song.draws[song.phases - 1].qualifier === 'FAQ')
          return { 'background-color': '#bae8ff' }; //AQ
      }
    }
    //default return
    return { 'background-color': 'ghostwhite' };
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

  sortData(sort: Sort) {
    let data = this.songs;

    if (!sort.active || sort.direction === '') {
      return;
    }

    let sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      let num = 0;
      switch (sort.active) {
        case 'edition': return compare(a.edval, b.edval, isAsc);
        case 'country': return compare(a.country, b.country, isAsc);
        case 'language': return compare(a.language, b.language, isAsc);
        case 'artist': return compare(a.artist.toLowerCase(), b.artist.toLowerCase(), isAsc);
        case 'song': return compare(a.song.toLowerCase(), b.song.toLowerCase(), isAsc);
        case 'fplace':
        case 'sfplace':
        case 'qfplace':
        case 'ofplace':
          if (sort.active == 'sfplace') num = 1;
          else if (sort.active == 'qfplace') num = 2;
          else if (sort.active == 'ofplace') num = 3;
          return compare(a.draws.length >= a.phases - num && a.phases >= (num + 1)
            && 'place' in a.draws[a.phases - (1 + num)]
            ? a.draws[a.phases - (1 + num)].place : Number.MAX_VALUE,
            b.draws.length >= b.phases - num && b.phases >= (num + 1)
              && 'place' in b.draws[b.phases - (1 + num)] ?
              b.draws[b.phases - (1 + num)].place : Number.MAX_VALUE, isAsc);
        case 'fpoints':
        case 'sfpoints':
        case 'qfpoints':
        case 'ofpoints':
          if (sort.active == 'sfpoints') num = 1;
          else if (sort.active == 'qfpoints') num = 2;
          else if (sort.active == 'ofpoints') num = 3;
          return compare(a.draws.length >= a.phases - num && a.phases >= (num + 1)
            && 'points' in a.draws[a.phases - (1 + num)]
            ? a.draws[a.phases - (1 + num)].points : Number.MIN_VALUE,
            b.draws.length >= b.phases - num && b.phases >= (num + 1)
              && 'points' in b.draws[b.phases - (1 + num)] ?
              b.draws[b.phases - (1 + num)].points : Number.MIN_VALUE, isAsc);
        default: return 0;
      }
    });

    this.songs = sortedData;
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

        console.log(parsedString[i][3])

        this.database.firestore.collection('contests').doc(this.id)
          .collection('songs').doc(this.songlist.filter(function (song) {
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

          this.database.firestore.collection('contests').doc(this.id)
            .collection('songs').doc(this.songlist.filter(function (song) {
              return song.edition === '21';
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
        intpoints: parseInt(x[1]),
        rawextpoints: parseInt(x[2]),
        extpoints: parseInt(x[3]),
      }

      this.database.firestore.collection('contests').doc(this.id)
        .collection('songs').doc(this.songlist.filter(function (song) {
          return song.country === x[0];
        })[0].id).update(data)
    })
  }

  uploadPointsFromSpreadsheet(points: string) {
    const parsedString = points.split('\n').map((line) => line.split('\t'))

    for (let j = 1; j < parsedString[0].length; ++j) {
      let pointsarray: string[] = new Array(10);
      for (let i = 1; i < parsedString.length; ++i) {
        if (this.pointset.indexOf(parsedString[i][j]) !== -1) {
          pointsarray[this.pointset.indexOf(parsedString[i][j])] = parsedString[i][0];
        }
      }
      console.log(pointsarray);

      this.database.firestore.collection('contests').doc(this.id)
        .collection('songs').doc(this.songlist.filter(function (song) {
          return song.country === parsedString[0][j];
        })[0].id).update({
          sf3pointset: {
            cv: true,
            points: pointsarray,
          }
        })
    }
  }

  deleteSongs() {
    this.songlist.filter(song => { return song.edition === '20.5' }).forEach(toDelete => {
      this.database.firestore.collection('contests').doc(this.id)
        .collection('songs').doc(toDelete.id).delete();
    })
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}