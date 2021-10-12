import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { Contest, Song, } from 'src/app/shared/datatypes';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

@Component({
  selector: 'app-country-screen',
  templateUrl: './country-screen.component.html',
  styleUrls: ['./country-screen.component.css']
})
export class CountryScreenComponent implements OnInit {

  readonly pointset: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12'];

  con: Contest = {
    name: '',
    id: ''
  };
  id: string;
  country: string;
  flagUrl: string = "";

  songs: Song[] = [];
  sortedData: Song[];

  numEntries: number = 0;
  numQualifiers: number = 0;

  bestPlace: string = "";
  bestEd: string = "";
  worstPlace: string = "";
  worstEd: string = "";

  songlist: any[] = [];

  phases: number = 2;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.country = params.country;
    });

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp)

    getDocs(query(collection(db, 'contests'), where('id', '==', this.id)))
      .then(docs => {
        docs.forEach((doc) => {
          this.con = doc.data() as Contest;
        });
      });

      getDownloadURL(ref(storage, 'contests/' + this.id + '/flags/' + this.country + ' Flag.png')).then(url => {
        this.flagUrl = url;
      })

    //get all the songs sent for that country
    getDocs(query(collection(db, 'contests',this.id,'newsongs'),
      where('country', '==', this.country))).then(docs => {
        docs.forEach((doc) => {
          this.songs.push(doc.data() as Song);
        });

        this.songs = this.songs.sort((a, b) => (a.edval > b.edval) ? 1 : -1);
        this.numEntries = this.songs.length;
        this.numQualifiers = this.songs.filter(function (song) {
          return song.draws.length === song.phases;
        }).length;

        this.phases = [...this.songs].sort((a, b) => a.phases < b.phases ? 1 : -1)[0].phases

        for (let i = 0; i <= this.phases; ++i) {
          let songsort = [...this.songs].filter(song => song.draws.length === song.phases - i &&
            'place' in song.draws[song.phases - i - 1] && song.draws[song.phases - i - 1].place > 0)
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

        for (let i = this.phases; i >= 0; --i) {
          let songsort = [...this.songs].filter(song => song.draws.length === song.phases - i &&
            'place' in song.draws[song.phases - i - 1] && song.draws[song.phases - i - 1].place > 0)
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

    // this.database.firestore.collection('contests')
    //   .doc(this.id).collection('songs').get().then(docs => {
    //     docs.forEach((doc) => {
    //       this.songlist.push({ id: doc.id, ...doc.data() });
    //     });
    //   });
  }

  ngOnInit(): void {
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
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      let num = 0;
      switch (sort.active) {
        case 'edition': return compare(a.edval, b.edval, isAsc);
        case 'user': return compare(a.user, b.user, isAsc);
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

    this.songs = this.sortedData;
  }

  deleteSongs() {
    // this.songlist.filter(song => { return song.edition === '20.5' }).forEach(toDelete => {
    //   this.database.collection<Contest>('contests', ref => ref.where('id', '==', this.id))
    //     .doc(this.id).collection<Song>('songs').doc(toDelete.id).delete();
    // })
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}