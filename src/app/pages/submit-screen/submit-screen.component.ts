import { Component, OnDestroy, OnInit } from '@angular/core';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { getFirestore, collection, query, getDocs, onSnapshot, doc, getDoc, Firestore, addDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { HostEdition } from 'src/app/shared/datatypes';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-submit-screen',
  templateUrl: './submit-screen.component.html',
  styleUrls: ['./submit-screen.component.css']
})
export class SubmitScreenComponent implements OnInit {

  authSubscription: Unsubscribe;
  routerSub: Subscription;

  id: string = "";
  displayName: string = "";
  stage: string = "";

  countryControl = new FormControl('', [Validators.required]);
  countryOptions: string[] = ['Aruba', 'Barbados', 'Cambodia', 'Denmark', 'Egypt', 'England', 'Finland',
    'Greenland', 'Hungary', 'Indonesia', 'Jamaica', 'Kazakhstan', 'Laos', 'Mongolia', 'Nepal', 'Oman',
    'Portugal', 'Qatar', 'Russia', 'Saint Vincent and the Grenadines', 'Sweden', 'Turkey', 'Ukraine', 'United States', 'Vanuatu', 'Wales',
    'Yemen', 'Zambia'];
  filteredCountryOptions: Observable<string[]>;
  errorMsg: string = "";

  db: Firestore;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => this.id = params.id);

    const firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    const storage = getStorage(firebaseApp);

    this.routerSub = this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.authSubscription = onAuthStateChanged(auth, user => {
          if (user && !user.isAnonymous) {
            this.displayName = user.displayName;

            getDoc(doc(this.db, "contests", this.id, "hosting", "currented")).then(doc => {
              let data = doc.data() as HostEdition;
              this.stage = data.stage;
            });
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.filteredCountryOptions = this.countryControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.countryOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  claimCountry(): void {
    console.log(this.countryControl.value);
    if(this.countryOptions.indexOf(this.countryControl.value) !== -1) {
      addDoc(collection(this.db, "countryclaims"), {
        contestid: this.id,
        country: this.countryControl.value,
        user: this.authService.user.displayName
      }).then(countrydoc => {
        console.log(countrydoc.id);
        let countrySub = onSnapshot(doc(this.db, "countryclaims", countrydoc.id), (statusdoc) => {
          console.log("data: ", statusdoc.data());
          if("status" in statusdoc.data()) {
            countrySub();
            if(statusdoc.data().status == "taken") {
              this.countryControl.setErrors({claimed: true});
              this.errorMsg = "Country already claimed";
            } 
          }
        });
      })
    }
    else {
      this.countryControl.setValue("");
      this.errorMsg = "Invalid country";
    }
  }

}
