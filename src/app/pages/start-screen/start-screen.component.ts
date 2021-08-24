import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Contest } from 'src/app/shared/datatypes';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.css']
})
export class StartScreenComponent implements OnInit {

  contests: Contest[] = [];

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) { 
    this.database.firestore.collection('contests').get().then(docs => {
      docs.forEach(doc => {
        this.contests.push(doc.data() as Contest);
      })
    })
  }

  ngOnInit(): void {
  }

}

