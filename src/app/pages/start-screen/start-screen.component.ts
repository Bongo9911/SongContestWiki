import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { Contest } from 'src/app/shared/datatypes';
import { AuthService } from 'src/app/auth/auth.service';
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { SubscriptionLike } from 'rxjs';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.css']
})
export class StartScreenComponent implements OnInit, OnDestroy {

  contests: Contest[] = [];
  logos: any = {};

  authSubscription: Unsubscribe;
  sub: SubscriptionLike = null;
  contentLoaded: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    const storage = getStorage(firebaseApp)

    this.sub = this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authSubscription = onAuthStateChanged(auth, user => {
          if (user) {
            getDocs(query(collection(db, 'contests'))).then(docs => {
              docs.forEach(doc => {
                let data = doc.data() as Contest;
                this.contests.push(data);

                this.logos[data.id] = "";
                getDownloadURL(ref(storage, 'contests/' + data.id + '/logo.png'))
                .then(url => {
                  this.logos[data.id] = url;
                }).catch(() => {
                  console.error("Logo for contest " + data.id + " does not exist.");
                })
              })
              this.contests.sort((a, b) => a.name > b.name ? 1 : -1)
            })
          }
        })
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.authSubscription();
  }

}

