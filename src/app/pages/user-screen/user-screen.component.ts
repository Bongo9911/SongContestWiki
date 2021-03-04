import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import {Sort} from '@angular/material/sort';

@Component({
  selector: 'app-user-screen',
  templateUrl: './user-screen.component.html',
  styleUrls: ['./user-screen.component.css']
})
export class UserScreenComponent implements OnInit {

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
  sf1songs: Song[] = [];
  sf2songs: Song[] = [];
  sf3songs: Song[] = [];
  gfsongs: Song[] = [];

  sortedData: Song[];

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

    //gets the info on the edition
    this.database
      .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
      .collection<Edition>('users', ref => ref.where('user', '==', this.user))
      .get()
      .subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.edition = doc.data();
        });
      });

    //get all the songs sent to that edition
    this.database
      .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
      .collection<Song>('songs', ref => ref.where('user', '==', this.user))
      .get()
      .subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.songs.push(doc.data());
          console.log(doc.data());
          this.songs = this.songs.sort((a, b) => (a.edition > b.edition) ? 1 : -1);
        });
      });
  }

  ngOnInit(): void {
  }

  getStyle(dq: string, place: number): object {
    switch (place) {
      case 1:
        return { 'background-color': '#ffd700', 'font-weight': 'bold' };
      case 2:
        return { 'background-color': '#c0c0c0' };
      case 3:
        return { 'background-color': '#cc9966' };
      case 4:
      case 5:
      case 6:
        return { 'background-color': '#bae8ff' };
      default:
        if(dq === 'FWD' || dq == 'FDQ') return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
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

  uploadSong(song: string): void {
    console.log(song);
    const parsedString = song.split('\n').map((line) => line.split('\t'))
    console.log(parsedString);
    parsedString.forEach(song => {
      this.database
        .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
        .collection('songs').add({
          edition: song[0],
          qualifier: song[1],
          disqualified: song[2],
          sfnum: song[3],
          user: song[4],
          country: song[5],
          language: song[6],
          artist: song[7],
          song: song[8],
          fro: parseInt(song[9]),
          fplace: parseInt(song[10]),
          fpoints: parseInt(song[11]),
          sfro: parseInt(song[12]),
          sfplace: parseInt(song[13]),
          sfpoints: parseInt(song[14])
        })
    })
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
          if(sf === 'f') {
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
  edition: string;
  f1: string;
  f2: string;
  f3: string;
  f4: string;
  f5: string;
  f6: string;
  f7: string;
  f8: string;
  f10: string;
  f12: string;
  fplace: number;
  fpoints: number;
  fro: number;
  language: string;
  qualifier: string;
  sf1: string;
  sf2: string;
  sf3: string;
  sf4: string;
  sf5: string;
  sf6: string;
  sf7: string;
  sf8: string;
  sf10: string;
  sf12: string;
  sfnum: string;
  sfplace: number;
  sfpoints: number;
  sfro: number;
  song: string;
  user: string;
}