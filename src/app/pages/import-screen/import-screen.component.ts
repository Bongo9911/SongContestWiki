declare var require: any

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pointsets, Song } from 'src/app/shared/datatypes';
import * as xlsx from 'xlsx';
import { getFirestore, collection, query, where, getDocs, Firestore, addDoc, deleteDoc, doc } from "firebase/firestore";
import { initializeApp, FirebaseApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { AuthService } from 'src/app/auth/auth.service';
// import * as countries from "i18n-iso-countries";

// countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const alphabet: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI',
  'AJ', 'AK', 'AL']

const pointset = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

@Component({
  selector: 'app-import-screen',
  templateUrl: './import-screen.component.html',
  styleUrls: ['./import-screen.component.css']
})
export class ImportScreenComponent implements OnInit {

  srcResult: any;
  id: string;
  semiSongs: Song[][] = [];
  allSongs: Song[] = [];
  finalSongs: Song[] = [];
  semiCountries: string[] = [];
  firebaseApp: FirebaseApp;
  db: Firestore;
  countries = require("i18n-iso-countries");

  countryCodes = {
    BHS: "The Bahamas",
    // BUL: "Bulgaria",
    // CAM: "Cambodia",
    CIV: "Côte d'Ivoire",
    CUR: "Curaçao",
    // CYM: "Wales",
    // DEN: "Denmark",
    ENG: "England",
    FSM: "Micronesia",
    // GUA: "Guatemala",
    ICE: "Iceland",
    // IRE: "Ireland",
    IRN: "Iran",
    LAO: "Laos",
    // LCU: "Saint Lucia",
    MDA: "Moldova",
    MKD: "North Macedonia",
    // MLY: "Malaysia",
    // NIR: "Northern Ireland",
    NLD: "The Netherlands",
    // PLY: "French Polynesia",
    RUS: "Russia",
    SAM: "Samoa",
    SCO: "Scotland",
    SCT: "Scotland",
    // SLV: "Slovenia",
    STP: "São Tomé and Príncipe",
    SVG: "Saint Vincent and the Grenadines",
    SXM: "Sint Maarten",
    USA: "United States",
    VAT: "Vatican City",
    WAL: "Wales",
    WLS: "Wales",
    // ZAM: "Zambia",
  }

  countryNames = {
    "Côte d'Ivoire": "CIV",
    "England": "ENG",
    "Iran": "IRN",
    "Laos": "LAO",
    "Micronesia": "FSM",
    "Moldova": "MDA",
    "North Macedonia": "MKD",
    "Russia": "RUS",
    "São Tomé and Príncipe": "STP",
    "Scotland": "SCO",
    "Sint Maarten": "SXM",
    "The Bahamas": "BHS",
    "The Netherlands": "NLD",
    "United States": "USA",
    "Vatican City": "VAT",
    "Wales": "WLS",
  };

  fixedCountryNames = {
    "Bahamas": "The Bahamas",
    "Bosnia & Herzegovina": "Bosnia and Herzegovina",
    "CAR": "Central African Republic",
    "Cote d'Ivoire": "Côte d'Ivoire",
    "Cote D'Ivoire": "Côte d'Ivoire",
    "Côte D'Ivoire": "Côte d'Ivoire",
    "Curacao": "Curaçao",
    "PNG": "Papua New Guinea",
    "St Kitts & Nevis": "Saint Kitts and Nevis",
    "St Lucia": "Saint Lucia",
    "Saint Vincent": "Saint Vincent and the Grenadines",
    "St Vincent": "Saint Vincent and the Grenadines",
    "St Vincent & The Grenadines": "Saint Vincent and the Grenadines",
    "St Vincent & the Grenadines": "Saint Vincent and the Grenadines",
    "Trinidad & Tobago": "Trinidad and Tobago",
    "Trinida": "Trinidad and Tobago",
    "USA": "United States",
    "United States of America": "United States",
  }

  constructor(private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => {
      this.id = params.id;
    });
    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
    this.countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
    //this.countryNames = this.objectFlip(this.countryCodes)
    //const storage = getStorage(firebaseApp);

    // getDocs(query(collection(this.db, "contests", this.id, "newsongs"), where("edition", "==", "31"))).then(docs => {
    //   docs.forEach(song => {
    //     deleteDoc(doc(this.db, "contests", this.id, "newsongs", song.id))
    //   })
    // })

    console.log(this.getColumnName(50));

    // console.log(this.countries.getName("DZA", "en", { select: "official" }))
    // console.log(this.countries.getAlpha3Code("Algeria", "en"))
  }

  ngOnInit(): void {
  }

  objectFlip(obj) {
    const ret = {};
    Object.keys(obj).forEach(key => {
      ret[obj[key]] = key;
    });
    return ret;
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

        this.readSemiSongs(workBook);
        this.readFinalSongs(workBook);

        this.srcResult = event.target.result;
      };

      reader.readAsBinaryString(inputNode.files[0]);

      console.log(this.srcResult);

    }
  }

  cleanSpreadsheet(workBook: xlsx.WorkBook) {
    //TODO: Create a function to fix any country names like St. Lucia or Curacao and turn them into their
    //proper format with no symbols and with proper accenting
  }

  readSemiSongs(workBook: xlsx.WorkBook) {
    for (let s = 0; s < 3; ++s) {
      this.semiSongs.push([]);
      for (let i = 2; true; ++i) {
        if ("I" + i in workBook.Sheets["Semi " + (s + 1)]) {
          console.log(workBook.Sheets["Semi " + (s + 1)]["I" + i].v);
          let country = workBook.Sheets["Semi " + (s + 1)]["I" + i].v.trim();
          let fixedCountry = country;
          if (country in this.fixedCountryNames) {
            fixedCountry = this.fixedCountryNames[country];
          }
          let pointsArray: string[] = [];
          for (let j = 0; j < 30; ++j) {
            if (alphabet[10 + j] + "1" in workBook.Sheets["Semi " + (s + 1)]) {
              let code = workBook.Sheets["Semi " + (s + 1)][alphabet[10 + j] + "1"].v;
              if (code in this.countryCodes && this.countryCodes[code] === fixedCountry) {
                console.log(code + ": " + this.countryCodes[code]);
                pointsArray = this.readSemiPointset(workBook, s, j);
                break;
              }
              else {
                let codeCountry = this.countries.getName(code, "en", { select: "official" });
                if (codeCountry === fixedCountry) {
                  console.log(code + ": " + codeCountry);
                  pointsArray = this.readSemiPointset(workBook, s, j);
                  break;
                }
              }
            }
          }

          let rawextpoints = 0;
          for (let j = 2; j < 30; ++j) {
            if ("I" + j in workBook.Sheets["Semi " + (s + 1) + " EXT"]) {
              if (workBook.Sheets["Semi " + (s + 1) + " EXT"]["I" + j].v.trim() == country) {
                rawextpoints = workBook.Sheets["Semi " + (s + 1) + " EXT"]["J" + j].v
                break;
              }
            }
            else {
              //break;
            }
          }
          let extpoints = 0;
          let points = 0;
          let place = 0;
          for (let j = 3; j < 30; ++j) {
            if (alphabet[3 + s * 7] + j in workBook.Sheets["INT+EXT"]) {
              // console.log("Error?" + j);
              if (workBook.Sheets["INT+EXT"][alphabet[3 + s * 7] + j].v.trim() == country) {
                extpoints = workBook.Sheets["INT+EXT"][alphabet[5 + (s * 7)] + j].v;
                points = workBook.Sheets["INT+EXT"][alphabet[6 + (s * 7)] + j].v;
                place = workBook.Sheets["INT+EXT"][alphabet[1 + (s * 7)] + j].v
                break;
              }
            }
            else {
              //break;
            }
          }
          for (let j = 3; j < 80; ++j) {
            if ("C" + j in workBook.Sheets["Song submission"]) {
              if (workBook.Sheets["Song submission"]["C" + j].v.trim() == country) {

                let pointsets: Pointsets = {}
                pointsets[s + 1] = {
                  cv: false,
                  points: pointsArray
                };

                let song: Song = {
                  artist: workBook.Sheets["Song submission"]["E" + j].v.toString().trim(),
                  country: fixedCountry,
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
                  edition: "31",
                  edval: 34,
                  language: "",
                  phases: 2,
                  pointsets: [],
                  song: workBook.Sheets["Song submission"]["F" + j].v.toString().replaceAll('"', '').trim(),
                  user: workBook.Sheets["Song submission"]["D" + j].v.toString().replace('u/', '').trim(),
                  //TODO: Fix capitilization of usernames by querying database to see if they exist already
                }
                if (pointsArray.some(s => s.length)) {
                  song.pointsets.push(pointsets);
                }
                this.semiSongs[s].push(song);
                this.semiCountries.push(country);
                this.allSongs.push(song);
                break;
              }
            }
            else {
              //break;
            }
          }
        }
        else {
          break;
        }
      }
    }
    console.log(this.semiSongs);
    console.log(this.semiCountries);
  }

  readSemiPointset(workBook: xlsx.WorkBook, s: number, j: number): string[] {
    let points: string[] = new Array(10);
    for (let p = 2; p < 30; ++p) {
      if (alphabet[10 + j] + p in workBook.Sheets["Semi " + (s + 1)] &&
        "I" + p in workBook.Sheets["Semi " + (s + 1)]) {
        if (pointset.indexOf(workBook.Sheets["Semi " + (s + 1)][alphabet[10 + j] + p].v) !== -1) {
          let fixedCountry = workBook.Sheets["Semi " + (s + 1)]["I" + p].v.trim();
          if (fixedCountry in this.fixedCountryNames) {
            fixedCountry = this.fixedCountryNames[fixedCountry];
          }
          points[pointset.indexOf(workBook.Sheets["Semi " + (s + 1)][alphabet[10 + j] + p].v)] = fixedCountry;
        }
        // console.log(workBook.Sheets["Semi " + (s + 1)][alphabet[10 + j] + p].v + ": " +
        //   workBook.Sheets["Semi " + (s + 1)]["I" + p].v)
      }
    }
    console.log(points);
    return points;
  }

  readFinalSongs(workBook: xlsx.WorkBook) {
    for (let n = 2; true; ++n) {
      if ("H" + n in workBook.Sheets["GF Scoreboard"]
        && workBook.Sheets["GF Scoreboard"]["H" + n].v.trim() !== "Total") {
        let index = this.semiCountries.indexOf(workBook.Sheets["GF Scoreboard"]["H" + n].v.trim())
        let country = workBook.Sheets["GF Scoreboard"]["H" + n].v;
        let fixedCountry = country;
        if (country in this.fixedCountryNames) {
          fixedCountry = this.fixedCountryNames[country];
        }

        //Country was in the semi-finals
        if (index !== -1) {
          this.allSongs[index].draws.push({
            ro: workBook.Sheets["GF Scoreboard"]["G" + n].v,
            num: 1,
            place: workBook.Sheets["GF Scoreboard"]["F" + n].v,
            points: workBook.Sheets["GF Scoreboard"]["I" + n].v,
            qualifier: workBook.Sheets["GF Scoreboard"]["F" + n].v <= 6 ? "FAQ" : "NAQ"
          })
          if (workBook.Sheets["GF Scoreboard"]["F" + n].v === 1) this.allSongs[index].winner = true;
          this.finalSongs.push(this.allSongs[index]);
        }
        //Country was not in the semi-finals (AQ)
        else {
          let sfnum = -1;
          console.log(country)
          for (let i = 0; i < 3; ++i) {
            for (let j = 24; j <= 25; ++j) {
              if (alphabet[2 + (5 * i)] + j in workBook.Sheets["SF RO + Vote Checker"]) {
                if (workBook.Sheets["SF RO + Vote Checker"][alphabet[2 + (5 * i)] + j].v.trim() === country) {
                  sfnum = i + 1;
                  break;
                }
              }
            }
            if (sfnum !== -1) break;
          }

          let pointsArray: string[] = [];
          console.log(sfnum)
          for (let j = 0; j < 30; ++j) {
            if (this.getColumnName(10 + j) + "1" in workBook.Sheets["Semi " + sfnum]) {
              let code = workBook.Sheets["Semi " + sfnum][this.getColumnName(10 + j) + "1"].v;
              if (code in this.countryCodes && this.countryCodes[code] === fixedCountry) {
                console.log(code + ": " + this.countryCodes[code]);
                pointsArray = this.readSemiPointset(workBook, sfnum - 1, j);
                break;
              }
              else {
                let codeCountry = this.countries.getName(code, "en", { select: "official" });
                if (codeCountry === fixedCountry) {
                  console.log(code + ": " + codeCountry);
                  pointsArray = this.readSemiPointset(workBook, sfnum - 1, j);
                  break;
                }
              }
            }
          }

          for (let s = 3; s < 80; ++s) {
            if ("C" + s in workBook.Sheets["Song submission"]) {
              if (workBook.Sheets["Song submission"]["C" + s].v.trim() == country) {
                let song: Song = {
                  artist: workBook.Sheets["Song submission"]["E" + s].w.trim(),
                  country: fixedCountry,
                  draws: [{
                    num: sfnum,
                    qualifier: "AQ"
                  },
                  {
                    ro: workBook.Sheets["GF Scoreboard"]["G" + n].v,
                    num: 1,
                    place: workBook.Sheets["GF Scoreboard"]["F" + n].v,
                    points: workBook.Sheets["GF Scoreboard"]["I" + n].v,
                    qualifier: workBook.Sheets["GF Scoreboard"]["F" + n].v <= 6 ? "FAQ" : "NAQ"
                  }],
                  dqphase: -1,
                  edition: "31",
                  edval: 34,
                  language: "",
                  phases: 2,
                  pointsets: [],
                  song: workBook.Sheets["Song submission"]["F" + s].v.toString().replaceAll('"', '').trim(),
                  user: workBook.Sheets["Song submission"]["D" + s].v.toString().replace('u/', '').trim(),
                }

                //TODO: Add semi pointsets
                song.pointsets.push({});
                song.pointsets[0][sfnum] = {
                  cv: false,
                  points: pointsArray,
                }

                if (workBook.Sheets["GF Scoreboard"]["F" + n].v === 1) song.winner = true;
                this.allSongs.push(song);
                this.finalSongs.push(song);
                break;
              }
            }
            else {
              //break;
            }
          }
        }
      }
      else {
        break;
      }
    }

    //Read in cross-votes
    for (let s = 0; s < 3; ++s) {
      for (let j = 0; j < 30; ++j) {
        let points: string[] = new Array(10);
        if (alphabet[10 + j] + 1 in workBook.Sheets["Semi " + (s + 1) + " EXT"]) {
          let voter = "";
          let code = workBook.Sheets["Semi " + (s + 1) + " EXT"][alphabet[10 + j] + 1].v.trim()
          if (code in this.countryCodes) {
            voter = this.countryCodes[code];
          }
          else {
            voter = this.countries.getName(code, "en", { select: "official" })
          }

          let votersongarray = this.allSongs.filter(song => song.country === voter);
          if (votersongarray.length) {
            let votersong = votersongarray[0];
            for (let p = 2; p < 30; ++p) {
              if (alphabet[10 + j] + p in workBook.Sheets["Semi " + (s + 1) + " EXT"] &&
                "I" + p in workBook.Sheets["Semi " + (s + 1) + " EXT"]) {
                if (pointset.indexOf(workBook.Sheets["Semi " + (s + 1) + " EXT"][alphabet[10 + j] + p].v) !== -1) {
                  let fixedCountry = workBook.Sheets["Semi " + (s + 1) + " EXT"]["I" + p].v.trim();
                  if (fixedCountry in this.fixedCountryNames) {
                    fixedCountry = this.fixedCountryNames[fixedCountry];
                  }
                  points[pointset.indexOf(workBook.Sheets["Semi " + (s + 1) + " EXT"][alphabet[10 + j] + p].v)] = fixedCountry;
                }
                // console.log(workBook.Sheets["Semi " + (s + 1)][alphabet[10 + j] + p].v + ": " +
                //   workBook.Sheets["Semi " + (s + 1)]["I" + p].v)
              }
            }
            votersong.pointsets[0][s + 1] = {
              cv: true,
              points: points
            }
          }
          else {
            console.error("ERROR: " + voter + " WITH CODE " + code + " NOT FOUND");
          }
        }
        else {
          break;
        }
        console.log(points);
      }
    }

    this.allSongs.forEach(song => {

      let fixedCountry = song.country;
      if (song.country in this.fixedCountryNames) {
        fixedCountry = this.fixedCountryNames[song.country];
      }

      let pointsArray: string[] = [];
      for (let j = 0; j < 80; ++j) {
        if (this.getColumnName(9 + j) + "1" in workBook.Sheets["GF Scoreboard"]) {
          let code = workBook.Sheets["GF Scoreboard"][this.getColumnName(9 + j) + "1"].v;
          if (code in this.countryCodes && this.countryCodes[code] === fixedCountry) {
            console.log(code + ": " + this.countryCodes[code]);
            pointsArray = this.readFinalPointset(workBook, j);
            if (pointsArray.some(s => s.length)) {
              song.pointsets.push({
                1: {
                  cv: false,
                  points: pointsArray
                }
              });
            }
            break;
          }
          else {
            let codeCountry = this.countries.getName(code, "en", { select: "official" });
            if (codeCountry === fixedCountry) {
              console.log(code + ": " + codeCountry);
              pointsArray = this.readFinalPointset(workBook, j);
              if (pointsArray.some(s => s.length)) {
                song.pointsets.push({
                  1: {
                    cv: false,
                    points: pointsArray
                  }
                });
              }
              break;
            }
          }
        }
      }

      console.log(song.pointsets);
    });

    console.log(this.allSongs)
  }

  readFinalPointset(workBook: xlsx.WorkBook, j: number): string[] {
    let points: string[] = new Array(10);
    for (let p = 2; p < 40; ++p) {
      if (this.getColumnName(9 + j) + p in workBook.Sheets["GF Scoreboard"] &&
        "H" + p in workBook.Sheets["GF Scoreboard"]) {
        if (pointset.indexOf(workBook.Sheets["GF Scoreboard"][this.getColumnName(9 + j) + p].v) !== -1) {
          let fixedCountry = workBook.Sheets["GF Scoreboard"]["H" + p].v.trim();
          if (fixedCountry in this.fixedCountryNames) {
            fixedCountry = this.fixedCountryNames[fixedCountry];
          }
          points[pointset.indexOf(workBook.Sheets["GF Scoreboard"][this.getColumnName(9 + j) + p].v)] = fixedCountry;
        }
        // console.log(workBook.Sheets["Semi " + (s + 1)][alphabet[10 + j] + p].v + ": " +
        //   workBook.Sheets["Semi " + (s + 1)]["I" + p].v)
      }
    }
    console.log(points);
    return points;
  }

  uploadSongs() {

    // this.allSongs.forEach(song => {
    //   song.draws[0].place = -1;
    //   song.draws[0].points = -1;
    //   song.draws[0].intpoints = 0;
    //   song.draws[0].extpoints = 0;
    //   song.draws[0].rawextpoints = 0;
    //   song.pointsets = [];
    //   if (song.draws.length == 2) {
    //     song.draws[1].place = -1;
    //     song.draws[1].points = -1;
    //     song.draws[1].qualifier = "TBD";
    //   }
    // })

    this.allSongs.forEach(song => {
      addDoc(collection(this.db, "contests", this.id, "newsongs"), song);
    })
  }

  getColumnName(n: number): string {
    if (n < 26) {
      return alphabet[n];
    }
    else {
      return alphabet[Math.floor(n / 26) - 1] + alphabet[n % 26]
    }
  }

  //Returns the styling for rows in the song tables
  getRowStyle(phase: number, dqphase: number, place: number, qualifier?: string) {
    if (dqphase === phase) {
      return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
    }
    //Grand final styling
    if (phase + 1 === 2) {
      if (place === 1) {
        return { 'background-color': '#ffd700', 'font-weight': 'bold' };
      }
      else if (place === 2) {
        return { 'background-color': '#c0c0c0' };
      }
      else if (place === 3) {
        return { 'background-color': '#cc9966' };
      }
      else if (qualifier === 'FAQ') {
        return { 'background-color': '#bae8ff' };
      }
    }
    //All other styling
    else {
      if (qualifier === 'Q') {
        return { 'background-color': '#ffdead', 'font-weight': 'bold' };
      }
      else if (qualifier === 'XAQ') {
        return { 'background-color': '#bae8ff' };
      }
    }

    return { 'background-color': 'ghostwhite' }; //default return
  }

  getPointStyle(song: Song, phase: number) {
    if (song.dqphase === phase) {
      return { 'background-color': '#cdb8d8' };
    }
    if (phase + 1 === 2) {
      if (song.draws[phase].place === 1) {
        return { 'background-color': '#ffd700' };
      }
      else if (song.draws[phase].place === 2) {
        return { 'background-color': '#c0c0c0' };
      }
      else if (song.draws[phase].place === 3) {
        return { 'background-color': '#cc9966' };
      }
    }
    else {
      if (song.draws[phase].qualifier === 'Q') return { 'background-color': '#fbdead' };
      else if (song.draws[phase].qualifier === 'XAQ') return { 'background-color': '#bae8ff' };
      else return {};
    }
  }

  getPoints(voter: Song, receiver: string, phase: number, num: number) {
    let fixedCountry = receiver;
    if (receiver in this.fixedCountryNames) {
      fixedCountry = this.fixedCountryNames[receiver];
    }
    let index = voter.pointsets[phase][(num + 1).toString()].points.indexOf(fixedCountry);
    if (index != -1) {
      if (index < 8) {
        return (index + 1).toString();
      }
      else {
        return ((index - 8) * 2 + 10).toString();
      }
    }
  }
}
