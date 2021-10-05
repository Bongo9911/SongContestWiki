import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Song } from 'src/app/shared/datatypes';
import * as xlsx from 'xlsx';
import { getFirestore, collection, query, where, getDocs, Firestore, addDoc, deleteDoc, doc } from "firebase/firestore";
import { initializeApp, FirebaseApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { AuthService } from 'src/app/auth/auth.service';

const alphabet: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

@Component({
  selector: 'app-import-screen',
  templateUrl: './import-screen.component.html',
  styleUrls: ['./import-screen.component.css']
})
export class ImportScreenComponent implements OnInit {

  srcResult: any;
  id: string;
  semiSongs: Song[][] = [];
  firebaseApp: FirebaseApp;
  db: Firestore;

  constructor(private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => {
      this.id = params.id;
    });
    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
    //const storage = getStorage(firebaseApp)
    getDocs(query(collection(this.db, "contests", this.id, "newsongs"), where("edition", "==", "46"))).then(docs => {
      docs.forEach(song => {
        deleteDoc(doc(this.db, "contests", this.id, "newsongs", song.id))
      })
    })
  }

  ngOnInit(): void {
  }

  onFileSelected() {
    const inputNode: any = document.querySelector('#file');

    let workBook: xlsx.WorkBook = null;
    let jsonData = null;

    console.log(xlsx)

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const data = reader.result;
        workBook = xlsx.read(data, { type: 'binary' });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = xlsx.utils.sheet_to_json(sheet);
          return initial;
        }, {});
        console.log(jsonData["Semi 1"]);
        console.log(workBook.Sheets)
        console.log(workBook.Sheets["INT+EXT"]);
        for (let s = 0; s < 3; ++s) {
          this.semiSongs.push([]);
          let i = 2;
          while (true) {
            if ("I" + i in workBook.Sheets["Semi " + (s + 1)]) {
              console.log(workBook.Sheets["Semi " + (s + 1)]["I" + i].v);
              let country = workBook.Sheets["Semi " + (s + 1)]["I" + i].v;
              let j = 2;
              let rawextpoints = 0;
              while (j < 30) {
                if ("I" + j in workBook.Sheets["Semi " + (s + 1) + " EXT"]) {
                  if (workBook.Sheets["Semi " + (s + 1) + " EXT"]["I" + j].v == country) {
                    rawextpoints = workBook.Sheets["Semi " + (s + 1) + " EXT"]["J" + j].v
                    break;
                  }
                }
                else {
                  //break;
                }
                ++j;
              }
              j = 3;
              let extpoints = 0;
              let points = 0;
              let place = 0;
              while (j < 30) {
                if (alphabet[3 + s * 7] + j in workBook.Sheets["INT+EXT"]) {
                  // console.log("Error?" + j);
                  if (workBook.Sheets["INT+EXT"][alphabet[3 + s * 7] + j].v == country) {
                    extpoints = workBook.Sheets["INT+EXT"][alphabet[5 + (s * 7)] + j].v;
                    points = workBook.Sheets["INT+EXT"][alphabet[6 + (s * 7)] + j].v;
                    place = workBook.Sheets["INT+EXT"][alphabet[1 + (s * 7)] + j].v
                    break;
                  }
                }
                else {
                  //break;
                }
                ++j;
              }
              j = 3;
              while (j < 80) {
                if ("C" + j in workBook.Sheets["Song submission"]) {
                  if (workBook.Sheets["Song submission"]["C" + j].v == country) {
                    this.semiSongs[s].push({
                      artist: workBook.Sheets["Song submission"]["E" + j].v,
                      country: country,
                      draws: [{
                        ro: workBook.Sheets["Semi " + (s + 1)]["H" + i].v,
                        num: s + 1,
                        place: place,
                        intpoints: workBook.Sheets["Semi " + (s + 1)]["J" + i].v,
                        rawextpoints: rawextpoints,
                        extpoints: extpoints,
                        points: points,
                        qualifier: place <= 8 ? "Q" : "NQ"
                      }],
                      dqphase: -1,
                      edition: "SE4",
                      edval: 44,
                      language: "",
                      phases: 2,
                      pointsets: [],
                      song: workBook.Sheets["Song submission"]["F" + j].v.replace('"', ''),
                      user: workBook.Sheets["Song submission"]["D" + j].v.replace('u/', ''),
                    })
                    break;
                  }
                }
                else {
                  //break;
                }
                ++j;
              }
              ++i;
            }
            else {
              break;
            }
          }
        }
        console.log(this.semiSongs);

        this.srcResult = event.target.result;
      };

      reader.readAsBinaryString(inputNode.files[0]);

      console.log(this.srcResult);

    }
  }

  uploadSongs() {
    this.semiSongs.forEach(semi => {
      semi.forEach(song =>{
        addDoc(collection(this.db, "contests", this.id, "newsongs"), song);
      })
    })
  }
}
