import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Contest, Song } from 'src/app/shared/datatypes';
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
  eds: SmallEdition[] = [];
  id: string;

  winners: SmallSong[] = [];

  logos: string[] = []; //For edition logo urls
  edflags: string[][] = []; //Flags for each ed host
  mainLogo: string = ""; //For the contest logo

  flagUrls: any = {};

  constructor(private database: AngularFirestore, private storage: AngularFireStorage,
    private router: Router, private route: ActivatedRoute) {
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
          this.eds.push(doc.data() as SmallEdition);
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
        }

        this.database.firestore.collection('contests').doc(this.id).collection('newsongs')
          .where('winner', '==', true).get().then(docs => {

            let winners: SmallSong[] = []
            for (let i = 0; i < docs.docs.length; ++i) {
              winners.push(docs.docs[i].data() as Song);
            }

            for (let i = 0; i < this.eds.length; ++i) {
              let filtered = winners.filter(w => w.edition === this.eds[i].edition)
              if (filtered.length) {
                this.winners.push(filtered[0])
              }
              else {
                this.winners.push({
                  edition: this.eds[i].edition,
                  edval: this.eds[i].edval,
                })
              }
            }

            for (let i = 0; i < this.eds.length; ++i) {
              for (let j = 0; j < this.eds[i].hostcountries.length; ++j) {
                if (!(this.eds[i].hostcountries[j] in this.flagUrls)) {
                  this.flagUrls[this.eds[i].hostcountries[j]] = "";
                  storage.storage.ref('contests/' + this.id + '/flagicons/' + this.eds[i].hostcountries[j] + '.png')
                    .getDownloadURL().then(url => {
                      this.flagUrls[this.eds[i].hostcountries[j]] = url;
                    })
                }
              }
            }

            for (let i = 0; i < winners.length; ++i) {
              this.flagUrls[winners[i].country] = "";
              storage.storage.ref('contests/' + this.id + '/flagicons/' + winners[i].country + '.png')
                .getDownloadURL().then(url => {
                  this.flagUrls[winners[i].country] = url;
                })
            }
          })
      });
  }

  ngOnInit(): void {
  }

}

interface SmallSong {
  artist?: string;
  country?: string;
  edition: string;
  edval: number;
  language?: string;
  song?: string;
  user?: string;
}

interface SmallEdition {
  edition: string;
  edval: number;
  hostcountries: string[];
}