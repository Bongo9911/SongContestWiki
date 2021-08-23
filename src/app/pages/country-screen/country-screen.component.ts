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
  
  con: Contest = {
    name: '',
    id: ''
  };
  id: string;
  country: string;

  songs: Song[] = [];
  sortedData: Song[];

  numEntries: number = 0;
  numQualifiers: number = 0;

  bestPlace: string = "";
  bestEd: string = "";
  worstPlace: string = "";
  worstEd: string = "";

  songlist: any[] = []

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.country = params.country;
    });

    this.database.firestore.collection('contests').where('id', '==', this.id).get()
    .then(docs => {
      docs.forEach((doc) => {
        this.con = doc.data() as Contest;
      });
    });

    //get all the songs sent for that country
    this.database.firestore.collection('contests').doc(this.id)
      .collection('songs').where('country', '==', this.country).get().then(docs => {
        docs.forEach((doc) => {
          this.songs.push(doc.data() as Song);
          this.songs = this.songs.sort((a, b) => (a.edval > b.edval) ? 1 : -1);
          this.numEntries = this.songs.length;
          this.numQualifiers = this.songs.filter(function (song) {
            return song.qualifier !== 'NQ';
          }).length;
        });

        let songsort = [...this.songs].filter(song => song.fplace !== -1)
        if (songsort.length) {
          songsort.sort((a, b) => a.fplace > b.fplace ? 1 : -1)
          this.bestPlace = this.numToRankString(songsort[0].fplace);
          this.bestEd = songsort[0].edition;
        }
        else {
          let songsort = [...this.songs].filter(song => song.sfplace !== -1)
          songsort.sort((a, b) => a.sfplace > b.sfplace ? 1 : -1)
          this.bestPlace = this.numToRankString(songsort[0].sfplace) + " (SF)";
          this.bestEd = songsort[0].edition;
        }

        songsort = [...this.songs].filter(song => song.sfplace !== -1 && song.fplace === -1)
        if (songsort.length) {
          songsort.sort((a, b) => a.sfplace < b.sfplace ? 1 : -1)
          this.worstPlace = this.numToRankString(songsort[0].sfplace) + " (SF)";
          this.worstEd = songsort[0].edition;
        }
        else {
          let songsort = [...this.songs].filter(song => song.fplace !== -1)
          songsort.sort((a, b) => a.fplace < b.fplace ? 1 : -1)
          this.worstPlace = this.numToRankString(songsort[0].fplace);
          this.worstEd = songsort[0].edition;
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

  getStyle(dq: string, q: string, place: number): object {
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
        if ((dq === 'FWD' || dq == 'FDQ') && (q !== 'NQ')) return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
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