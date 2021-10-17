import { Component, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { initializeApp } from "firebase/app"
import { firebaseConfig } from './credentials';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { SubscriptionLike } from 'rxjs';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'Song Contest Wiki';
  logo = "";
  link = "/";
  sub: SubscriptionLike = null;

  constructor(private location: Location, private router: Router) {
    console.log(this.location.path().split('/'));
    const firebaseApp = initializeApp(firebaseConfig);
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
          }
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
}
