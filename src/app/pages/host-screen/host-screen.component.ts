import { Component, OnDestroy, OnInit } from '@angular/core';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { getFirestore, collection, query, getDocs, onSnapshot, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { HostEdition } from 'src/app/shared/datatypes';

@Component({
  selector: 'app-host-screen',
  templateUrl: './host-screen.component.html',
  styleUrls: ['./host-screen.component.css']
})
export class HostScreenComponent implements OnInit, OnDestroy {

  currentEdSub: Unsubscribe;
  authSubscription: Unsubscribe;
  routerSub: Subscription;

  id: string;

  edData: HostEdition = null;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => this.id = params.id);

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    const storage = getStorage(firebaseApp);

    this.routerSub = this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authSubscription = onAuthStateChanged(auth, user => {
          if (user) {
            this.currentEdSub = onSnapshot(doc(db, "contests", this.id, "hosting", "currented"), (doc) => {
              console.log("data: ", doc.data());

              this.edData = doc.data() as HostEdition;
            });
          }
        });
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.authSubscription();
    this.currentEdSub();
  }

}