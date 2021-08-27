import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Contest, Draw, Edition, Pointsets, Song } from 'src/app/shared/datatypes';
import { AngularFireStorage } from '@angular/fire/storage'

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
  eds: EditionWithUrl[] = [];
  id: string;

  winners: SongWithUrl[] = [];
  winnerEds: EditionWithUrl[] = [];

  logos: string[] = []; //For edition logo urls
  edflags: string[][] = []; //Flags for each ed host
  mainLogo: string = ""; //For the contest logo

  constructor(private database: AngularFirestore, storage: AngularFireStorage, private router: Router,
    private route: ActivatedRoute) {
    this.route.params.subscribe(params => this.id = params.id);

    storage.storage.ref('contests/' + this.id + '/logo.png')
      .getDownloadURL().then(url => {
        this.mainLogo = url;
      })

    this.database.firestore.collection('contests').doc(this.id)
      .get().then((doc) => {
        this.con = doc.data() as Contest;
        console.log(doc.data());
      });

    this.database.firestore.collection('contests').doc(this.id).collection('editions').get()
      .then(docs => {
        docs.forEach((doc) => {
          this.eds.push(doc.data() as EditionWithUrl);
          console.log(doc.data());
        });
        this.eds.sort((a, b) => a.edval > b.edval ? 1 : -1);
        this.logos = new Array(this.eds.length);
        this.edflags = new Array(this.eds.length)
        for (let i = 0; i < this.eds.length; ++i) {
          storage.storage.ref('contests/' + this.id + '/logos/' + this.eds[i].edition + '.png')
            .getDownloadURL().then(url => {
              this.logos[i] = url;
            })
          this.eds[i].flagurls = new Array(this.eds[i].hostcountries.length);
          for (let j = 0; j < this.eds[i].flagurls.length; ++j) {
            storage.storage.ref('contests/' + this.id + '/flags/' + this.eds[i].hostcountries[j]
              + ' Flag.png')
              .getDownloadURL().then(url => {
                this.eds[i].flagurls[j] = url;
              })
          }
        }
      });

    this.database.firestore.collection('contests').doc(this.id).collection('newsongs')
      .where('winner', '==', true).get().then(docs => {

        for (let i = 0; i < docs.docs.length; ++i) {
          let data = docs.docs[i].data() as Song;
          this.winners.push({ flagurl: "", ...data });
        }
        this.winners.sort((a, b) => a.edval > b.edval ? 1 : -1);
        for (let i = 0; i < this.winners.length; ++i) {
          storage.storage.ref('contests/' + this.id + '/flags/' + this.winners[i].country + ' Flag.png')
            .getDownloadURL().then(url => {
              this.winners[i].flagurl = url;
            })
        }
        this.winners.forEach(w => {
          this.winnerEds.push(this.eds.filter(ed => ed.edition == w.edition)[0])
        })

        // for (let i = 0; i < this.winnerEds.length; ++i) {
        //   this.winnerEds[i].flagurls = new Array(this.winnerEds[i].hostcountries.length);
        //   for (let j = 0; j < this.winnerEds[i].flagurls.length; ++j) {
        //     storage.storage.ref('contests/' + this.id + '/flags/' + this.winnerEds[i].hostcountries[j]
        //       + ' Flag.png')
        //       .getDownloadURL().then(url => {
        //         this.winnerEds[i].flagurls[j] = url;
        //       })
        //   }
        // }
      })
  }

  ngOnInit(): void {
  }

}

interface SongWithUrl {
  artist: string;
  country: string;
  edition: string;
  edval: number;
  flagurl: string; //for the url of the country's flag
  language: string;
  song: string;
  user: string;
}

interface EditionWithUrl {
	edition: string;
	edval: number;
  hostcountries: string[];
  flagurls: string[];
}