import { Component, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { initializeApp } from "firebase/app"
import { firebaseConfig } from './credentials';
import { getFirestore, collection, query, where, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { SubscriptionLike } from 'rxjs';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import * as fuzzysort from 'fuzzysort';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'Song Contest Wiki';
  logo = "";
  link = "";
  sub: SubscriptionLike = null;
  countrieslower: any = {};
  countries: any = {};
  userslower: any = {};
  users: any = {};
  searchval: string = "";

  constructor(private location: Location, private router: Router) {
    console.log(this.location.path().split('/'));
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp)

    this.sub = router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        let split = this.location.path().split('/');
        if (split.length >= 3 && split[1] === 'contest') {
          if ("/contest/" + split[2] !== this.link) {
            getDownloadURL(ref(storage, 'contests/' + split[2] + '/logo.png')).then(url => {
              this.logo = url;
            })
            this.link = "/contest/" + split[2];
            getDoc(doc(db, 'contests', split[2], 'lists', 'users')).then(doc => {
              this.users = doc.data();
              console.log(fuzzysort.go('Bon', this.users["list"]))
            })
          }
        }
        else if(split.length > 1) {
          this.link = "/";
        }
        else {
          this.link = "";
          this.logo = "";
        }
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  search() {
    console.log(fuzzysort.go(this.searchval, this.users["list"]));
  }
}
