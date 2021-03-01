import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contest-screen',
  templateUrl: './contest-screen.component.html',
  styleUrls: ['./contest-screen.component.css']
})

export class ContestScreenComponent implements OnInit {

  con : Contest = {
    name: '',
    id: ''
  };
  eds : Edition[] = [];
  id : string;

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) { 
    this.route.params.subscribe(params => this.id = params.id);

    this.database
    .collection<Contest>('contests', ref => ref.where('id', '==', this.id))
    .get()
    .subscribe(async res => {
      await res.docs.forEach((doc) => {
        this.con = doc.data();
        console.log(doc.data());
      });
    });

    this.database
    .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
    .collection<Edition>('editions')
    .get()
    .subscribe(async res => {
      await res.docs.forEach((doc) => {
        this.eds.push(doc.data());
        console.log(doc.data());
      });
    });

    console.log(this.con.name);
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
  id: string;
}