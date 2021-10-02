import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { Contest } from 'src/app/shared/datatypes';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.css']
})
export class StartScreenComponent implements OnInit {

  contests: Contest[] = [];

  constructor(private router: Router, private route: ActivatedRoute) { 
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    getDocs(query(collection(db, 'contests'))).then(docs => {
      docs.forEach(doc => {
        this.contests.push(doc.data() as Contest);
      })
      this.contests.sort((a,b) => a.name > b.name ? 1 : -1)
    })
  }

  ngOnInit(): void {
  }

}

