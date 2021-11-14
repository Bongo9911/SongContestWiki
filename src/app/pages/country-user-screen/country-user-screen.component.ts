import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { Contest, Song } from 'src/app/shared/datatypes';
// import firebase from 'firebase';
import { AuthService } from 'src/app/auth/auth.service';
import { getFirestore, collection, query, where, getDocs, setDoc, doc, Firestore } from "firebase/firestore";
import { initializeApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { getStorage, ref, getDownloadURL, FirebaseStorage } from "firebase/storage";
import { SubscriptionLike } from 'rxjs';
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";

@Component({
  selector: 'app-country-user-screen',
  templateUrl: './country-user-screen.component.html',
  styleUrls: ['./country-user-screen.component.css']
})
export class CountryUserScreenComponent implements OnInit, OnDestroy {

  readonly pointset: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12'];

  con: Contest = {
    name: '',
    id: ''
  };
  id: string;
  type: string = "user";
  name: string;
  flagUrl: string = "";
  flagUrls: any = {};

  songs: Song[] = [];

  numEntries: number = 0;
  numQualifiers: number = 0;

  bestPlace: string = "";
  bestEds: string[] = [];
  worstPlace: string = "";
  worstEds: string[] = [];

  songlist: any[] = [];

  phases: number = 2;

  authSubscription: Unsubscribe;
  sub: SubscriptionLike = null;

  db: Firestore;
  storage: FirebaseStorage;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.name = params.name;
    });

    console.log(this.router.url.split('/'));


    const firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(firebaseApp);
    this.storage = getStorage(firebaseApp)

    let auth = getAuth(firebaseApp);
    this.authSubscription = onAuthStateChanged(auth, user => {
      if (user) {
        this.sub = router.events.subscribe((val) => {
          if (val instanceof NavigationEnd) {

            this.bestPlace = "";
            this.bestEds = [];
            this.worstPlace = "";
            this.worstEds = [];
            this.songs = [];

            this.type = this.router.url.split('/')[3].toLowerCase();
            getDocs(query(collection(this.db, 'contests'), where('id', '==', this.id))).then(docs => {
              docs.forEach((doc) => {
                this.con = doc.data() as Contest;
              });
            })

            if (this.type === 'country') {
              getDownloadURL(ref(this.storage, 'contests/' + this.id + '/flags/' + this.name + ' Flag.png')).then(url => {
                this.flagUrl = url;
              })
            }

            // getDocs(query(collection(db, 'contests', this.id, 'newsongs'))).then(docs => {
            //   // let users: {aliases: string[], lower: string, username: string}[] = [];
            //   let users: any = {};
            //   let countries: any = {};
            //   //let countries: {lower: string, country: string}[] = [];
            //   docs.forEach(doc => {
            //     let data = doc.data() as Song;
            //     users[data.user] = {
            //       aliases: [data.user],
            //       lower: data.user.toLowerCase(),
            //       username: data.user
            //     }
            //     countries[data.country] = {
            //       lower: data.country.toLowerCase(),
            //       country: data.country
            //     }
            //   })

            //   let userslower: string[] = []
            //   let countrieslower: string[] = []
            //   let usernames: string[] = []
            //   let countrynames:string[] = [];
            //   for(let user in users) {
            //     console.log(users[user]);
            //     //setDoc(doc(db, 'contests', this.id, 'users', user), users[user])
            //     userslower.push(users[user].lower)
            //     usernames.push(users[user].username)
            //   }
            //   for(let country in countries) {
            //     //setDoc(doc(db, 'contests', this.id, 'countries', country), countries[country])
            //     countrieslower.push(countries[country].lower)
            //     countrynames.push(countries[country].country)
            //   }

            //   console.log(usernames);

            //   setDoc(doc(db, 'contests', this.id, 'lists', "countries"), {list: countrynames})
            //   setDoc(doc(db, 'contests', this.id, 'lists', "users"), {list: usernames})
            //   setDoc(doc(db, 'contests', this.id, 'lists', "countrieslower"), {list: countrieslower})
            //   setDoc(doc(db, 'contests', this.id, 'lists', "userslower"), {list: userslower})
            //   console.log(countries)
            // })

            //get all the songs sent for that user
            getDocs(query(collection(this.db, 'contests', this.id, 'newsongs'), where(this.type, '==', this.name))).then(docs => {
              docs.forEach((doc) => {
                this.songs.push(doc.data() as Song);
              });

              console.log(this.songs)

              this.songs = this.songs.sort((a, b) => (a.edval > b.edval) ? 1 : -1);
              this.numEntries = this.songs.length;
              this.numQualifiers = this.songs.filter(function (song) {
                return song.draws.length === song.phases;
              }).length;

              this.phases = [...this.songs].sort((a, b) => a.phases < b.phases ? 1 : -1)[0].phases

              if (this.type === "user") {
                this.songs.forEach(song => {
                  if (!(song.country in this.flagUrls)) {
                    this.flagUrls[song.country] = "";
                    getDownloadURL(ref(this.storage, 'contests/' + this.id + '/flagicons/' + song.country + '.png')).then(url => {
                      this.flagUrls[song.country] = url;
                    })
                  }
                })
              }

              for (let i = 0; i <= this.phases; ++i) {
                let songsort = [...this.songs].filter(song => song.draws.length === song.phases - i &&
                  'place' in song.draws[song.phases - i - 1] && song.draws[song.phases - i - 1].place > 0)
                if (songsort.length) {
                  songsort.sort((a, b) => a.edval < b.edval ? 1 : -1)
                    .sort((a, b) => a.draws[a.phases - i - 1].place > b.draws[b.phases - i - 1].place ? 1 : -1)
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
                  this.bestEds.push(songsort[0].edition);

                  for (let j = 1; j < songsort.length; ++j) {
                    if (songsort[0].draws[songsort[0].phases - i - 1].place
                      === songsort[j].draws[songsort[j].phases - i - 1].place) {
                      this.bestEds.push(songsort[j].edition)
                    }
                    else {
                      break;
                    }
                  }
                  break;
                }
              }

              for (let i = this.phases - 1; i >= 0; --i) {
                let songsort = [...this.songs].filter(song => song.draws.length === song.phases - i &&
                  'place' in song.draws[song.phases - i - 1] && song.draws[song.phases - i - 1].place > 0)
                console.log(songsort);
                if (songsort.length) {
                  songsort.sort((a, b) => a.edval < b.edval ? 1 : -1)
                    .sort((a, b) => a.draws[a.phases - i - 1].place < b.draws[b.phases - i - 1].place ? 1 : -1)
                  this.worstPlace = this.numToRankString(songsort[0].draws[songsort[0].phases - i - 1].place);
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
                  this.worstEds.push(songsort[0].edition);

                  for (let j = 1; j < songsort.length; ++j) {
                    if (songsort[0].draws[songsort[0].phases - i - 1].place
                      === songsort[j].draws[songsort[j].phases - i - 1].place) {
                      this.worstEds.push(songsort[j].edition)
                    }
                    else {
                      break;
                    }
                  }
                  break;
                }
              }
            });

            // this.database.firestore.collection('contests').doc(this.id)
            //   .collection('newsongs').where('edition', '==', '4').get().then(docs => {
            //     docs.forEach((doc) => {
            //       this.songlist.push({ id: doc.id, ...doc.data() });
            //     });
            //   });

            // this.database.firestore.collection('contests').doc(this.id).collection('newsongs')
            // .where('edition', '==', '41').get().then(docs => {
            //   docs.forEach(doc => {
            //     let data = doc.data() as Song;
            //     data.pointsets = [];
            //     this.database.firestore.collection('contests').doc(this.id).collection('newsongs')
            //     .doc(doc.id).set(data)
            //   })
            // })
          }
        });
      }
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.authSubscription();
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
      return;
    }

    let sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      let num = 0;
      switch (sort.active) {
        case 'edition': return compare(a.edval, b.edval, isAsc);
        case 'country': return compare(a.country, b.country, isAsc);
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

        // this.database.firestore.collection('contests').doc(this.id)
        //   .collection('songs').doc(this.songlist.filter(function (song) {
        //     return song.edition === parsedString[i][0];
        //   }).filter(function (song) {
        //     return song.country === parsedString[i][3];
        //   })[0].id).update(data)

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

          // this.database.firestore.collection('contests').doc(this.id)
          //   .collection('songs').doc(this.songlist.filter(function (song) {
          //     return song.edition === '21';
          //   }).filter(function (song) {
          //     return song.country === parsedString[i][0];
          //   })[0].id).update(data)

          data = {}
          pointsarray = new Array<string>(10); //destroy the old array and make a new empty one
        }

      }
    }
  }

  async uploadPointTotals(points: string) {
    const parsedString = points.split('\n').map((line) => line.split('\t'))

    parsedString.forEach(x => {
      // this.database.firestore.collection('contests').doc(this.id)
      //   .collection('newsongs').where('country', '==', x[0]).where('edition', '==', '41').get().then(docs => {
      //     if (docs.docs.length) {
      //       let song = docs.docs[0].data() as Song;
      //       song.draws[0].intpoints = parseInt(x[1]),
      //         song.draws[0].rawextpoints = parseInt(x[2]),
      //         song.draws[0].extpoints = parseInt(x[3]),
      //         this.database.firestore.collection('contests').doc(this.id)
      //           .collection('newsongs').doc(docs.docs[0].id).update(song);
      //     }
      //   })
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

      // this.database.firestore.collection('contests').doc(this.id)
      //   .collection('newsongs').where('country', '==', parsedString[0][j])
      //   .where('edition', '==', '45').get().then(docs => {
      //     if (docs.docs.length) {
      //       let data = docs.docs[0].data() as Song;
      //       if (data.pointsets.length !== 2) {
      //         data.pointsets.push({});
      //       }
      //       data.pointsets[1][1] = {
      //         cv: false,
      //         points: pointsarray
      //       }

      //       this.database.firestore.collection('contests').doc(this.id)
      //         .collection('newsongs').doc(docs.docs[0].id).set(data)
      //     }
      //     else {
      //       console.log(parsedString[0][j] + " Not Found!")
      //     }
      //   })
    }
  }

  deleteSongs() {
    // this.songlist.filter(song => { return song.edition === '20.5' }).forEach(toDelete => {
    //   this.database.firestore.collection('contests').doc(this.id)
    //     .collection('songs').doc(toDelete.id).delete();
    // })
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}