import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';

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
  edition: Edition = {
    edition: '0',
    entries: 0,
    hostcountry: '',
    hostuser: '',
    slogan: '',
  };
  id: string;
  user: string;

  songs: Song[] = [];
  sortedData: Song[];

  numEntries: number = 0;
  numQualifiers: number = 0;

  songlist: any[] = []

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.user = params.user;
    });

    this.database
      .collection<Contest>('contests', ref => ref.where('id', '==', this.id))
      .get()
      .subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.con = doc.data();
          console.log(doc.data());
        });
      });

    //gets the info on the user
    this.database
      .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
      .collection<Edition>('users', ref => ref.where('user', '==', this.user))
      .get()
      .subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.edition = doc.data();
        });
      });

    //get all the songs sent for that user
    this.database
      .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
      .collection<Song>('songs', ref => ref.where('user', '==', this.user))
      .get()
      .subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.songs.push(doc.data());
          console.log(doc.data());
          this.songs = this.songs.sort((a, b) => (a.edition > b.edition) ? 1 : -1);
          this.numEntries = this.songs.length;
          this.numQualifiers = this.songs.filter(function (song) {
            return song.qualifier !== 'NQ';
          }).length;
        });
      });

    this.database.collection<Contest>('contests', ref => ref.where('id', '==', this.id))
      .doc(this.id).collection<Song>('songs').get().subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.songlist.push({ id: doc.id, ...doc.data() });
          console.log(this.songlist);
        });
      });
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
        case 'country': return compare(a.country, b.country, isAsc);
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
    let data = { }

    for(let i = 0; i < parsedString.length; ++i){

      pointsarray[this.pointset.indexOf(parsedString[i][7])] = parsedString[i][5];
      console.log('foo');
      if(i + 1 === parsedString.length || parsedString[i][4] != parsedString[i+1][4]) {
        data[parsedString[i][1].toLowerCase()+'pointset'] = {};
        data[parsedString[i][1].toLowerCase()+'pointset']['points'] = [...pointsarray];

        if(parsedString[i][1] != 'F') {
          data[parsedString[i][1].toLowerCase()+'pointset']['cv'] = false;
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

  deleteSongs() {
      this.songlist.filter(song => { return song.edition === '14' }).forEach(toDelete => {
        this.database.collection<Contest>('contests', ref => ref.where('id', '==', this.id))
       .doc(this.id).collection<Song>('songs').doc(toDelete.id).delete();
      })
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

interface Contest {
  id: string;
  name: string;
}

interface Edition {
  edition: string;
  entries: number;
  hostcountry: string;
  hostuser: string;
  slogan: string;
}

interface Song {
  artist: string;
  country: string;
  disqualified: string;
  edition: string;
  fpointset: {
    points: string[10];
  };
  fplace: number;
  fpoints: number;
  fro: number;
  language: string;
  qualifier: string;
  sf1pointset: {
    cv: boolean;
    points: string[10];
  };
  sf2pointset: {
    cv: boolean;
    points: string[10];
  };
  sf3pointset: {
    cv: boolean;
    points: string[10];
  };
  sfnum: string;
  sfplace: number;
  sfpoints: number;
  sfro: number;
  song: string;
  user: string;
}