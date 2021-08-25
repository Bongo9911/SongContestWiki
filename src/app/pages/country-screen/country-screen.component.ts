import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { firestore } from 'firebase';
import { Contest, Song, NewSong } from 'src/app/shared/datatypes';

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

  songs: NewSong[] = [];
  sortedData: NewSong[];

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
      .collection('newsongs').where('country', '==', this.country).get().then(docs => {
        docs.forEach((doc) => {
          this.songs.push(doc.data() as NewSong);
          this.songs = this.songs.sort((a, b) => (a.edval > b.edval) ? 1 : -1);
          this.numEntries = this.songs.length;
          this.numQualifiers = this.songs.filter(function (song) {
            return song.draws.length === song.phases;
          }).length;

          this.phases = [...this.songs].sort((a,b) => a.phases > b.phases ? 1 : -1)[0].phases
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

        // let songsort = [...this.songs].filter(song => song.fplace !== -1)
        // if (songsort.length) {
        //   songsort.sort((a, b) => a.fplace > b.fplace ? 1 : -1)
        //   this.bestPlace = this.numToRankString(songsort[0].fplace);
        //   this.bestEd = songsort[0].edition;
        // }
        // else {
        //   let songsort = [...this.songs].filter(song => song.sfplace !== -1)
        //   songsort.sort((a, b) => a.sfplace > b.sfplace ? 1 : -1)
        //   this.bestPlace = this.numToRankString(songsort[0].sfplace) + " (SF)";
        //   this.bestEd = songsort[0].edition;
        // }

        // songsort = [...this.songs].filter(song => song.sfplace !== -1 && song.fplace === -1)
        // if (songsort.length) {
        //   songsort.sort((a, b) => a.sfplace < b.sfplace ? 1 : -1)
        //   this.worstPlace = this.numToRankString(songsort[0].sfplace) + " (SF)";
        //   this.worstEd = songsort[0].edition;
        // }
        // else {
        //   let songsort = [...this.songs].filter(song => song.fplace !== -1)
        //   songsort.sort((a, b) => a.fplace < b.fplace ? 1 : -1)
        //   this.worstPlace = this.numToRankString(songsort[0].fplace);
        //   this.worstEd = songsort[0].edition;
        // }
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

  getStyle(song: NewSong): object {
    if(song.dqphase + 1 === song.draws.length) {
      return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
    }
    else {
      if(song.phases === song.draws.length) {
        if(song.draws[song.phases - 1].place === 1) return { 'background-color': '#ffd700' };
        else if(song.draws[song.phases - 1].place === 2) return { 'background-color': '#c0c0c0' };
        else if(song.draws[song.phases - 1].place === 3) return { 'background-color': '#cc9966' };
        else if(song.draws[song.phases - 1].qualifier === 'FAQ') 
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

  sortData(sort: Sort, sf: string) {
    let data = this.songs;

    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    // this.sortedData = data.sort((a, b) => {
    //   const isAsc = sort.direction === 'asc';
    //   switch (sort.active) {
    //     case 'draw':
    //       if (sf === 'f') {
    //         return compare(a.fro, b.fro, isAsc);
    //       }
    //       else {
    //         return compare(a.sfro, b.sfro, isAsc);
    //       }
    //     case 'edition': return compare(a.edition, b.edition, isAsc);
    //     case 'user': return compare(a.user, b.user, isAsc);
    //     case 'language': return compare(a.language, b.language, isAsc);
    //     case 'artist': return compare(a.artist.toLowerCase(), b.artist.toLowerCase(), isAsc);
    //     case 'song': return compare(a.song.toLowerCase(), b.song.toLowerCase(), isAsc);
    //     case 'fplace': return compare(a.fplace, b.fplace, isAsc);
    //     case 'fpoints': return compare(a.fpoints, b.fpoints, isAsc);
    //     case 'sfplace': return compare(a.sfplace, b.sfplace, isAsc);
    //     case 'sfpoints': return compare(a.sfpoints, b.sfpoints, isAsc);
    //     default: return 0;
    //   }
    // });

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