import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Contest, Song } from 'src/app/shared/datatypes';
import { AuthService } from 'src/app/auth/auth.service';
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { SubscriptionLike } from 'rxjs';
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";

@Component({
  selector: 'app-contest-screen',
  templateUrl: './contest-screen.component.html',
  styleUrls: ['./contest-screen.component.css']
})

export class ContestScreenComponent implements OnInit, OnDestroy {

  con: Contest = {
    name: '',
    id: ''
  };
  eds: SmallEdition[] = [];
  id: string;

  winners: SmallSong[] = [];

  logos: string[] = []; //For edition logo urls
  edflags: string[][] = []; //Flags for each ed host
  mainLogo: string = ""; //For the contest logo

  flagUrls: any = {};

  authSubscription: Unsubscribe;
  sub: SubscriptionLike = null;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => this.id = params.id);

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp)
    let auth = getAuth(firebaseApp);

    this.sub = this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authSubscription = onAuthStateChanged(auth, user => {
          console.log(user)
          if (user) {
            this.eds = [];
            this.winners = [];
            this.logos = [];
            this.edflags = [];
            getDownloadURL(ref(storage, 'contests/' + this.id + '/logo.png')).then(url => {
              this.mainLogo = url;
            })

            getDoc(doc(db, 'contests', this.id)).then((doc) => {
              this.con = doc.data() as Contest;
            });

            getDocs(query(collection(db, 'contests', this.id, 'editions'))).then(docs => {
              docs.forEach((doc) => {
                this.eds.push(doc.data() as SmallEdition);
              });
              this.eds.sort((a, b) => a.edval > b.edval ? 1 : -1);
              this.logos = new Array(this.eds.length);
              this.edflags = new Array(this.eds.length)
              for (let i = 0; i < this.eds.length; ++i) {
                getDownloadURL(ref(storage, 'contests/' + this.id + '/logos/' + this.eds[i].edition + '.png'))
                  .then(url => {
                    this.logos[i] = url;
                  }).catch(() => {
                    console.error("Logo for edition " + this.eds[i].edition + " does not exist.");
                  })
              }

              getDocs(query(collection(db, 'contests', this.id, 'newsongs'), where('winner', '==', true))).then(docs => {
                let winners: SmallSong[] = []
                for (let i = 0; i < docs.docs.length; ++i) {
                  winners.push(docs.docs[i].data() as Song);
                }

                for (let i = 0; i < this.eds.length; ++i) {
                  let filtered = winners.filter(w => w.edition === this.eds[i].edition)
                  if (filtered.length) {
                    this.winners.push(filtered[0])
                  }
                  else {
                    this.winners.push({
                      edition: this.eds[i].edition,
                      edval: this.eds[i].edval,
                    })
                  }
                }

                for (let i = 0; i < this.eds.length; ++i) {
                  for (let j = 0; j < this.eds[i].hostcountries.length; ++j) {
                    if (!(this.eds[i].hostcountries[j] in this.flagUrls)) {
                      this.flagUrls[this.eds[i].hostcountries[j]] = "";
                      getDownloadURL(
                        ref(storage, 'contests/' + this.id + '/flagicons/' + this.eds[i].hostcountries[j] + '.png'))
                        .then(url => {
                          this.flagUrls[this.eds[i].hostcountries[j]] = url;
                        })
                    }
                  }
                }

                for (let i = 0; i < winners.length; ++i) {
                  this.flagUrls[winners[i].country] = "";
                  getDownloadURL(ref(storage, 'contests/' + this.id + '/flagicons/' + winners[i].country + '.png'))
                    .then(url => {
                      this.flagUrls[winners[i].country] = url;
                    })
                }
              })
            });
          }
        })
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // this.sub.unsubscribe();
    this.authSubscription();
  }

}

interface SmallSong {
  artist?: string;
  country?: string;
  edition: string;
  edval: number;
  language?: string;
  song?: string;
  user?: string;
}

interface SmallEdition {
  edition: string;
  edval: number;
  hostcountries: string[];
}