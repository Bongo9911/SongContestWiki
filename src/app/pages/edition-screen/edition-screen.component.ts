import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { Contest, Edition, Song } from 'src/app/shared/datatypes';
import { AuthService } from 'src/app/auth/auth.service';
import { Firestore, getFirestore, collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { initializeApp, FirebaseApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { FirebaseStorage, getStorage, ref, getDownloadURL } from "firebase/storage";
import { SubscriptionLike } from 'rxjs';
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";

@Component({
  selector: 'app-edition-screen',
  templateUrl: './edition-screen.component.html',
  styleUrls: ['./edition-screen.component.scss']
})
export class EditionScreenComponent implements OnInit, OnDestroy {
  readonly pointset: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12'];

  con: Contest = {
    name: '',
    id: ''
  };
  edition: Edition = {
    edition: '0',
    edval: 0,
    entries: 0,
    hostcities: [],
    hostcountries: [],
    hostusers: [],
    phases: [],
    slogan: '',
    aqnum: 6,
  };
  id: string;
  num: string;
  entries: number;
  logourl: string;

  nexted: string = "";
  preved: string = "";

  songsbyphase: Song[][][] = [];
  aqsbyphase: Song[][][] = [];
  votersbyphase: Song[][][] = [];
  crossvotersbyphase: Song[][][] = [];
  songtablesbyphase: Song[][][] = [];
  pointtablesbyphase: Song[][][] = [];

  winningSongs: Song[] = [];

  flagUrls: any = {};

  firebaseApp: FirebaseApp;
  db: Firestore;
  storage: FirebaseStorage;

  authSubscription: Unsubscribe;
  sub: SubscriptionLike = null;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.num = params.num;
    });
    console.log(this.id)

    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
    this.storage = getStorage(this.firebaseApp)
    let auth = getAuth(this.firebaseApp);
    this.sub = router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authSubscription = onAuthStateChanged(auth, user => {
          if (user) {
            getDoc(doc(this.db, 'contests', this.id)).then(doc => {
              this.con = doc.data() as Contest;
            });
            
            this.updateData(this.num);
          }
        });
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.authSubscription();
  }

  async updateData(edition: string) {
    this.num = edition;
    this.preved = "";
    this.nexted = "";
    this.logourl = "";

    this.songsbyphase = [];
    this.votersbyphase = [];
    this.crossvotersbyphase = [];
    this.songtablesbyphase = [];
    this.pointtablesbyphase = [];

    //gets the info on the edition
    getDoc(doc(this.db, 'contests', this.id, 'editions', this.num)).then(doc => {
      this.edition = doc.data() as Edition;
      console.log(this.edition);

      this.edition.hostcountries.forEach(country => {
        if (!(country in this.flagUrls)) {
          getDownloadURL(ref(this.storage, 'contests/' + this.id + '/flagicons/' + country + '.png'))
            .then(url => {
              this.flagUrls[country] = url;
            }).catch(() => {
              //Set it to a string so that it shows the image not found image
              this.flagUrls[country] = "/"
            })
        }
      })
      
      getDownloadURL(ref(this.storage, 'contests/' + this.id + '/logos/' + this.edition.edition + '.png'))
        .then(url => {
          this.logourl = url;
        })

      getDocs(query(collection(this.db, 'contests', this.id, 'editions'),
        where('edval', '==', this.edition.edval + 1))).then(docs => {
          if (docs.docs.length) {
            let data = docs.docs[0].data() as Edition;
            console.log(data)
            this.nexted = data.edition
          }
        })
      getDocs(query(collection(this.db, 'contests', this.id, 'editions'),
        where('edval', '==', this.edition.edval - 1))).then(docs => {
          if (docs.docs.length) {
            let data = docs.docs[0].data() as Edition;
            this.preved = data.edition
          }
        })

      //get all the songs sent to that edition
      getDocs(query(collection(this.db, 'contests', this.id, 'newsongs'), where('edition', '==', this.num)))
        .then(docs => {
          let songs: Song[] = []
          docs.forEach((doc) => {
            songs.push(doc.data() as Song);
          });
          this.entries = songs.filter(song => "draws" in song).length;

          console.log(songs.filter(song => "winner" in song && song.winner));
          this.winningSongs = songs.filter(song => "winner" in song && song.winner);

          songs.forEach(song => {
            if (!(song.country in this.flagUrls)) {
              getDownloadURL(ref(this.storage, 'contests/' + this.id + '/flagicons/' + song.country + '.png'))
                .then(url => {
                  this.flagUrls[song.country] = url;
                }).catch(() => {
                  //Set it to a string so that it shows the image not found image
                  this.flagUrls[song.country] = "/"
                })
            }
          })

          for (let i = 0; i < this.edition.phases.length; ++i) {
            if(!("cvscaling" in this.edition.phases[i])){
              this.edition.phases[i].cvscaling = true;
            }
            this.songsbyphase.push(new Array(this.edition.phases[i].num));
            this.aqsbyphase.push(new Array(this.edition.phases[i].num));
            this.votersbyphase.push(new Array(this.edition.phases[i].num));
            this.crossvotersbyphase.push(new Array(this.edition.phases[i].num));
            this.songtablesbyphase.push(new Array(this.edition.phases[i].num));
            this.pointtablesbyphase.push(new Array(this.edition.phases[i].num));
            for (let j = 0; j < this.edition.phases[i].num; ++j) {
              this.songsbyphase[i][j] = songs.filter(x =>
                (!('participant' in x) || x.participant) && x.draws.length > i &&
                (x.draws[i].num === j + 1 || (!('num' in x.draws[i]) && j === 0)) &&
                (!('qualifier' in x.draws[i]) || x.draws[i].qualifier !== 'AQ')
              ).sort((a, b) => a.draws[i].ro > b.draws[i].ro ? 1 : -1);
              this.aqsbyphase[i][j] = songs.filter(x =>
                (!('participant' in x) || x.participant) && x.draws.length > i && x.draws[i].num === j + 1 &&
                'qualifier' in x.draws[i] && x.draws[i].qualifier === 'AQ')
                .sort((a, b) => a.country > b.country ? 1 : -1);
              this.songtablesbyphase[i][j] = [...this.songsbyphase[i][j]]
              this.pointtablesbyphase[i][j] = [...this.songsbyphase[i][j]]
                .filter(x => 'place' in x.draws[i])
                .sort((a, b) => a.draws[i].place > b.draws[i].place ? 1 : -1)
              this.votersbyphase[i][j] = songs.filter(x =>
                (!('participant' in x) || x.participant) && 
                x.draws.length > i && 'ro' in x.draws[i] && x.draws[i].ro !== -1 &&
                x.pointsets.length > i && (j + 1).toString() in x.pointsets[i]
                && !x.pointsets[i][(j + 1).toString()].cv
              ).sort((a, b) => a.draws[i].ro > b.draws[i].ro ? 1 : -1).concat(
                songs.filter(x =>
                  (!('participant' in x) || x.participant) && 
                  (x.draws.length <= i || (!('ro' in x.draws[i]) || x.draws[i].ro === -1)) &&
                  x.pointsets.length > i && (j + 1).toString() in x.pointsets[i]
                  && !x.pointsets[i][(j + 1).toString()].cv
                ).sort((a, b) => a.country > b.country ? 1 : -1)
              );
              if (this.edition.phases[i].cv) {
                this.crossvotersbyphase[i][j] = songs.filter(x =>
                  x.pointsets.length > i && (j + 1).toString() in x.pointsets[i]
                  && x.pointsets[i][(j + 1).toString()].cv
                ).sort((a,b) => a.country > b.country ? 1 : -1)
              }
            }
          }

          console.log(this.songsbyphase);
          console.log(this.votersbyphase);
          console.log(this.aqsbyphase);
        });
    });
  }

  //Returns the styling for rows in the song tables
  getRowStyle(phase: number, dqphase: number, place: number, qualifier?: string) {
    if (dqphase === phase) {
      return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
    }
    //Grand final styling
    if (phase + 1 === this.edition.phases.length) {
      if (place === 1) {
        return { 'background-color': '#ffd700', 'font-weight': 'bold' };
      }
      else if (place === 2) {
        return { 'background-color': '#c0c0c0' };
      }
      else if (place === 3) {
        return { 'background-color': '#cc9966' };
      }
      else if (qualifier === 'FAQ') {
        return { 'background-color': '#bae8ff' };
      }
    }
    //All other styling
    else {
      if (qualifier === 'Q') {
        return { 'background-color': '#ffdead', 'font-weight': 'bold' };
      }
      else if (qualifier === 'XAQ') {
        return { 'background-color': '#bae8ff' };
      }
    }

    return { 'background-color': 'ghostwhite' }; //default return
  }

  getDQReason(reason: string) {
    if (reason === 'DQ') {
      return 'Disqualified'
    }
    else if (reason === 'WD') {
      return 'Withdrawn'
    }
    else {
      return reason;
    }
  }

  //Temporary function to upload a list of songs to the database
  uploadSong(song: string): void {
    // console.log(song);
    // const parsedString = song.split('\n').map((line) => line.split('\t'))
    // console.log(parsedString);
    // parsedString.forEach(song => {
    //   this.database.firestore
    //     .collection('contests').doc(this.id).collection('songs').add({
    //       edition: song[0],
    //       edval: parseInt(song[0]) + Math.floor((parseInt(song[0]) - 1) / 10),
    //       qualifier: song[1],
    //       disqualified: song[2],
    //       sfnum: song[3],
    //       user: song[4],
    //       country: song[5],
    //       language: song[6],
    //       artist: song[7],
    //       song: song[8],
    //       fro: parseInt(song[9]),
    //       fplace: parseInt(song[10]),
    //       fpoints: parseInt(song[11]),
    //       sfro: parseInt(song[12]),
    //       sfplace: parseInt(song[13]),
    //       sfpoints: parseInt(song[14])
    //     })
    // })
  }

  // uploadSongNew(song: string): void {
  //   console.log(song);
  //   const parsedString = song.split('\n').map((line) => line.split('\t'))
  //   console.log(parsedString);
  //   parsedString.forEach(song => {
  //     let songObj: Song = {
  //       edition: song[0],
  //       edval: parseInt(song[0]) + Math.floor((parseInt(song[0]) - 1) / 10),
  //       dqphase: parseInt(song[1]),
  //       user: song[3],
  //       country: song[4],
  //       language: song[5],
  //       artist: song[6],
  //       song: song[7],
  //       draws: [
  //         {
  //           ro: parseInt(song[8]),
  //           place: parseInt(song[9]),
  //           points: parseInt(song[10]),
  //           qualifier: parseInt(song[9]) <= 6 ? 'FAQ' : 'NAQ'
  //         }
  //       ],
  //       pointsets: [],
  //       phases: 1
  //     }
  //     this.database.firestore
  //       .collection('contests').doc(this.id).collection('newsongs').add(songObj)
  //   })
  // }

  uploadSongNew(song: string): void {
    // console.log(song);
    // const parsedString = song.split('\n').map((line) => line.split('\t'))
    // console.log(parsedString);
    // parsedString.forEach(song => {
    //   let songObj: Song = {
    //     edition: song[0],
    //     edval: parseInt(song[0]) + Math.floor((parseInt(song[0]) - 1) / 10),
    //     dqphase: parseInt(song[3]),
    //     user: song[6],
    //     country: song[7],
    //     language: song[8],
    //     artist: song[9],
    //     song: song[10],
    //     draws: [],
    //     pointsets: [],
    //     phases: 2
    //   }

    //   if (songObj.dqphase !== -1) {
    //     songObj.dqreason = song[4]
    //   }
    //   songObj.draws.push({
    //     num: parseInt(song[5]),
    //     qualifier: song[1]
    //   })
    //   if (song[14] !== "-1") {
    //     songObj.draws[0].ro = parseInt(song[14])
    //     if (song[15] !== "-1") {
    //       songObj.draws[0].place = parseInt(song[15])
    //       songObj.draws[0].points = parseInt(song[16])
    //     }
    //   }

    //   if (song[11] !== "-1") {
    //     songObj.draws.push({
    //       num: 1,
    //       ro: parseInt(song[11]),
    //       qualifier: song[2]
    //     })
    //     if (song[12] !== "-1") {
    //       songObj.draws[1].place = parseInt(song[12])
    //       songObj.draws[1].points = parseInt(song[13])
    //     }
    //     if (songObj.draws[1].place === 1) {
    //       songObj.winner = true;
    //     }
    //   }


    //   this.database.firestore
    //     .collection('contests').doc(this.id).collection('newsongs').add(songObj)
    // })
  }

  deleteSongs(song: string) {
    // const parsedString = song.split('\n');
    // parsedString.forEach(s => {
    //   this.database.firestore.collection('contests').doc('RSC').collection('songs')
    //     .where('song', '==', s).get().then(docs => {
    //       docs.forEach(doc => {
    //         console.log(doc.id);
    //         this.database.firestore.collection('contests').doc('RSC').collection('songs')
    //           .doc(doc.id).delete();
    //       })
    //     })
    // })
  }

  //Returns the semi-final points given from voter to receiver, returns nothing if no points given.
  getPoints(voter: Song, receiver: string, phase: number, num: number) {
    let index = voter.pointsets[phase][(num + 1).toString()].points.indexOf(receiver);
    if (index != -1) {
      if (index < 8) {
        return (index + 1).toString();
      }
      else {
        return ((index - 8) * 2 + 10).toString();
      }
    }
  }

  //Returns the styling for scoreboards based on qualification and disqualification status
  getPointStyle(song: Song, phase: number) {
    if (song.dqphase === phase) {
      return { 'background-color': '#cdb8d8' };
    }
    if (phase + 1 === this.edition.phases.length) {
      if (song.draws[phase].place === 1) {
        return { 'background-color': '#ffd700' };
      }
      else if (song.draws[phase].place === 2) {
        return { 'background-color': '#c0c0c0' };
      }
      else if (song.draws[phase].place === 3) {
        return { 'background-color': '#cc9966' };
      }
      else if (song.draws[phase].qualifier === "FAQ") {
        return { 'background-color': '#bae8ff' };
      }
    }
    else {
      if (song.draws[phase].qualifier === 'Q') return { 'background-color': '#fbdead' };
      else if (song.draws[phase].qualifier === 'XAQ') return { 'background-color': '#bae8ff' };
      else return {};
    }
  }

  //Sorts the data in the song list tables
  sortData(sort: Sort, phase: number, num: number) {
    let data = [...this.songtablesbyphase[phase][num]];

    let sortedData = []

    if (!sort.active || sort.direction === '') {
      // sortedData = data;
      return;
    }

    sortedData = data.sort((a, b) => {
      let isAsc = sort.direction === 'asc';

      switch (sort.active) {
        case 'draw':
          return compare(a.draws[phase].ro, b.draws[phase].ro, isAsc);
        case 'country': return compare(a.country, b.country, isAsc);
        case 'user': return compare(a.user, b.user, isAsc);
        case 'language': return compare(a.language, b.language, isAsc);
        case 'artist': return compare(a.artist.toLowerCase(), b.artist.toLowerCase(), isAsc);
        case 'song': return compare(a.song.toLowerCase(), b.song.toLowerCase(), isAsc);
        case 'place':
          return compare(
            'place' in a.draws[phase] ? a.draws[phase].place : Number.MAX_VALUE,
            'place' in b.draws[phase] ? b.draws[phase].place : Number.MAX_VALUE, isAsc);
        case 'points':
          return compare(
            'points' in a.draws[phase] ? a.draws[phase].points : Number.MIN_VALUE,
            'points' in b.draws[phase] ? b.draws[phase].points : Number.MIN_VALUE, isAsc);
        default: return 0;
      }
    });

    this.songtablesbyphase[phase][num] = [...sortedData]
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
}

//Compares 2 strings or integers and returns if a < b, the result is flipped if isAsc is false
function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}