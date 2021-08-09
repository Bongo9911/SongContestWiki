import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contest-screen',
  templateUrl: './contest-screen.component.html',
  styleUrls: ['./contest-screen.component.css']
})

export class ContestScreenComponent implements OnInit {

  con: Contest = {
    name: '',
    id: ''
  };
  eds: Edition[] = [];
  id: string;

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => this.id = params.id);

    this.database.firestore.collection('contests').doc(this.id)
      .get().then((doc) => {
        this.con = doc.data() as Contest;
        console.log(doc.data());
      });

    this.database.firestore.collection('contests').doc(this.id).collection('editions').get()
      .then(docs => {
        docs.forEach((doc) => {
          this.eds.push(doc.data() as Edition);
          console.log(doc.data());
        });
      });
  }

  ngOnInit(): void {
  }

}

interface Contest {
  id: string;
  name: string;
}

interface Edition {
  entries: number;
  hostcountry: string;
  hostuser: string;
  edition: string;
}