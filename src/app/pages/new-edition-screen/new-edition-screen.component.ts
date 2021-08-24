import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { Contest, Edition, NewEdition, NewSong } from 'src/app/shared/datatypes';

@Component({
  selector: 'app-new-edition-screen',
  templateUrl: './new-edition-screen.component.html',
  styleUrls: ['./new-edition-screen.component.css']
})
export class NewEditionScreenComponent implements OnInit {
  readonly pointset: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12'];

  con: Contest = {
    name: '',
    id: ''
  };
  edition: NewEdition = {
    edition: '0',
    edval: 0,
    entries: 0,
    hostcountries: [],
    hostusers: [],
    phases: [],
    slogan: '',
    aqnum: 6,
  };
  id: string;
  num: string;
  entries: number;

  nexted: string = "";
  preved: string = "";

  songs: NewSong[] = [];

  sfsongs: NewSong[][] = new Array(3);
  fsongs: NewSong[] = [];

  sfsongtables: any[] = new Array(3);

  sbsfsongs: NewSong[][] = new Array(3);
  sbfsongs: NewSong[] = [];

  sfvoters: NewSong[][] = new Array(3);
  fvoters: NewSong[] = [];

  sfcrossvoters: NewSong[][] = new Array(3);

  sfptsongs: NewSong[][] = new Array(3); //for the point tables in scoreboard section

  sortedData: NewSong[] = [];

  songsbyphase: NewSong[][][] = [];
  votersbyphase: NewSong[][][] = [];
  crossvotersbyphase: NewSong[][][] = [];
  sbsongsbyphase: NewSong[][][] = [] //Song arrays for the scoreboards
  songtablesbyphase: NewSong[][][] = [];

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.num = params.num;
    });
    console.log(this.id)

    this.database.firestore.collection('contests').doc(this.id).get()
      .then(doc => {
        this.con = doc.data() as Contest;
      });

    // this.database.firestore
    //   .collection('contests').doc(this.id)
    //   .collection('newsongs').where('edition', '==', this.num).get().then(docs => {
    //     docs.forEach(doc => {
    //       let data = doc.data() as NewSong;
    //       for (let i = 0; i < data.draws.length; ++i) {
    //         data.draws[i].num = parseInt(data.draws[i].num.toString())
    //       }
    //       this.database.firestore
    //         .collection('contests').doc(this.id)
    //         .collection('newsongs').doc(doc.id).set(data);
    //     })
    //   })

    // this.database.firestore.collection('contests').doc(this.id)
    //    .collection('newsongs').where('edition', '==', this.num).get().then(docs => {
    //     docs.forEach(doc => {
    //       let data = doc.data() as any;
    //       if(data.pointsets.length === 2) {
    //         data.pointsets[1] = {1: data.pointsets[1]}
    //         this.database.firestore.collection('contests').doc(this.id)
    //         .collection('newsongs').doc(doc.id).set(data);
    //       }
    //     })
    //   })

    this.updateData(this.num);

    // let str = "English, Korean"
    // console.log(str.split(/\s*,\s*/))
  }

  ngOnInit(): void {
  }

  async updateData(edition: string) {
    this.num = edition;
    this.preved = "";
    this.nexted = "";
    this.songs = [];
    this.sfsongs = new Array(3);
    this.fsongs = [];
    this.sfsongtables = new Array(3);
    this.sbsfsongs = new Array(3);
    this.sbfsongs = [];
    this.sfvoters = new Array(3);
    this.fvoters = [];
    this.sfcrossvoters = new Array(3);
    this.sfptsongs = new Array(3);
    this.sortedData = [];

    //gets the info on the edition
    this.database.firestore.collection('contests').doc(this.id)
      .collection('editions').doc(this.num).get().then(doc => {
        this.edition = doc.data() as NewEdition;

        this.database.firestore.collection('contests').doc(this.id)
          .collection('editions').where('edval', '==', this.edition.edval + 1).get().then(docs => {
            if (docs.docs.length) {
              let data = docs.docs[0].data() as Edition;
              console.log(data)
              this.nexted = data.edition
            }
          })
        this.database.firestore.collection('contests').doc(this.id)
          .collection('editions').where('edval', '==', this.edition.edval - 1).get().then(docs => {
            if (docs.docs.length) {
              let data = docs.docs[0].data() as Edition;
              this.preved = data.edition
            }
          })

        //get all the songs sent to that edition
        this.database.firestore
          .collection('contests').doc(this.id)
          .collection('newsongs').where('edition', '==', this.num).get().then(docs => {
            docs.forEach((doc) => {
              this.songs.push(doc.data() as NewSong);
              this.entries = this.songs.length;
            });

            for (let i = 0; i < this.edition.phases.length; ++i) {
              this.songsbyphase.push(new Array(this.edition.phases[i].num));
              this.votersbyphase.push(new Array(this.edition.phases[i].num));
              this.crossvotersbyphase.push(new Array(this.edition.phases[i].num));
              this.sbsongsbyphase.push(new Array(this.edition.phases[i].num));
              this.songtablesbyphase.push(new Array(this.edition.phases[i].num));
              for (let j = 0; j < this.edition.phases[i].num; ++j) {
                this.songsbyphase[i][j] = this.songs.filter(x =>
                  x.draws.length > i && x.draws[i].num === j + 1 &&
                  (!('qualifier' in x.draws[i]) || x.draws[i].qualifier !== 'AQ')
                ).sort((a, b) => a.draws[i].ro > b.draws[i].ro ? 1 : -1);
                this.sbsongsbyphase[i][j] = [...this.songsbyphase[i][j]]
                this.votersbyphase[i][j] = this.songs.filter(x =>
                  x.draws.length > i && 'ro' in x.draws[i] &&
                  x.pointsets.length > i && (j + 1).toString() in x.pointsets[i]
                  && !x.pointsets[i][(j + 1).toString()].cv
                ).sort((a, b) => a.draws[i].ro > b.draws[i].ro ? 1 : -1).concat(
                  this.songs.filter(x =>
                    (x.draws.length <= i || !('ro' in x.draws[i])) &&
                    x.pointsets.length > i && (j + 1).toString() in x.pointsets[i]
                    && !x.pointsets[i][(j + 1).toString()].cv
                  ).sort((a, b) => a.country > b.country ? 1 : -1)
                );
                if (this.edition.phases[i].cv) {
                  this.crossvotersbyphase[i][j] = this.songs.filter(x =>
                    x.pointsets.length > i && (j + 1).toString() in x.pointsets[i]
                    && x.pointsets[i][(j + 1).toString()].cv
                  )
                }
              }
            }

            console.log(this.songsbyphase);
            console.log(this.votersbyphase);

            // //Populates the arrays for each semi-finals respective arrays
            // for (let i = 1; i <= 3; ++i) {
            //   //Separates songs into their respective semi-finals
            //   this.sfsongs[i - 1] = this.songs.filter(x => x.sfnum == i.toString())
            //     .filter(x => x.qualifier !== 'AQ').sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);

            //   //I have no idea why, but this makes table sorting work in an ngFor
            //   this.sfsongtables[i - 1] = {
            //     songs: [...this.sfsongs[i - 1]],
            //   }

            //   //Gets all users who succesfully internally voted in the semi-final
            //   this.sfvoters[i - 1] = this.songs.filter(x => x.sfnum == i.toString())
            //     .filter(x => x.disqualified !== 'SFDQ' && x.disqualified !== 'SFWD' &&
            //     'sf' + i.toString() + 'pointset' in x && !x['sf' + i.toString() + 'pointset'].cv)
            //     .sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);

            //   if (this.edition.crossvoting) {
            //     //Gets all users who cross-voted into that semi-final
            //     this.sfcrossvoters[i - 1] =
            //       this.songs.filter(x => 'sf' + i.toString() + 'pointset' in x)
            //         .filter(x => x.disqualified !== 'SFDQ' && x.disqualified !== 'SFWD' &&
            //           x['sf' + i.toString() + 'pointset'].cv)
            //         .sort((a, b) => (a.country > b.country) ? 1 : -1);
            //   }

            //   //Separate arrays so that the arrays are not effected by sorting of the song table
            //   this.sbsfsongs[i - 1] = [...this.sfsongs[i - 1]];

            //   this.sfptsongs[i - 1] = [...this.sfsongs[i - 1]];
            //   this.sfptsongs[i - 1].sort((a, b) => (a.sfplace > b.sfplace) ? 1 : -1);
            // }
            // //Counts the number of entries to display in the infobox
            // this.entries = this.songs.length;

            // //Filters out all the songs that qualified for the finals
            // this.fsongs = this.songs.filter(x => x.fro !== -1).sort((a, b) => (a.fro > b.fro) ? 1 : -1);

            // //Filters out all the users who succesfully voted in the final
            // this.fvoters = this.songs.filter(x => 'fpointset' in x && x.qualifier !== 'NQ')
            //   .sort((a, b) => (a.fro > b.fro) ? 1 : -1).concat(
            //     this.songs.filter(x => 'fpointset' in x && x.qualifier === 'NQ')
            //       .sort((a, b) => (a.country > b.country) ? 1 : -1)
            //   );

            // //Copies the final songs array for the scoreboard so it isn't effected by table sorting
            // this.sbfsongs = [...this.fsongs];
          });
      });
  }

  //Returns the styling for rows in the song tables
  getRowStyle(phase: number, dqphase: number, place: number, qualifier?: string) {
    //Grand final styling
    if (phase + 1 === this.edition.phases.length) {
      if (dqphase === phase) {
        return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
      }
      else if (place === 1) {
        return { 'background-color': '#ffd700', 'font-weight': 'bold' };
      }
      else if (place === 2) {
        return { 'background-color': '#c0c0c0' };
      }
      else if (place === 3) {
        return { 'background-color': '#cc9966' };
      }
      else if (place <= this.edition.aqnum) {
        return { 'background-color': '#bae8ff' };
      }
    }
    //All other styling
    else {
      if (dqphase === phase) {
        return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
      }
      else if (qualifier === 'Q') {
        return { 'background-color': '#ffdead', 'font-weight': 'bold' };
      }
    }

    return { 'background-color': 'ghostwhite' }; //default return
  }

  getDQReason(reason: string) {
    if (reason === 'DQ') {
      return 'Disqualified'
    }
    else if (reason === 'WD') {
      return 'Withdrawn'
    }
    else {
      return reason;
    }
  }

  //Temporary function to upload a list of songs to the database
  uploadSong(song: string): void {
    console.log(song);
    const parsedString = song.split('\n').map((line) => line.split('\t'))
    console.log(parsedString);
    parsedString.forEach(song => {
      this.database.firestore
        .collection('contests').doc(this.id).collection('songs').add({
          edition: song[0],
          edval: parseInt(song[0]) + Math.floor((parseInt(song[0]) - 1) / 10),
          qualifier: song[1],
          disqualified: song[2],
          sfnum: song[3],
          user: song[4],
          country: song[5],
          language: song[6],
          artist: song[7],
          song: song[8],
          fro: parseInt(song[9]),
          fplace: parseInt(song[10]),
          fpoints: parseInt(song[11]),
          sfro: parseInt(song[12]),
          sfplace: parseInt(song[13]),
          sfpoints: parseInt(song[14])
        })
    })
  }

  deleteSongs(song: string) {
    const parsedString = song.split('\n');
    parsedString.forEach(s => {
      this.database.firestore.collection('contests').doc('RSC').collection('songs')
        .where('song', '==', s).get().then(docs => {
          docs.forEach(doc => {
            console.log(doc.id);
            this.database.firestore.collection('contests').doc('RSC').collection('songs')
              .doc(doc.id).delete();
          })
        })
    })
  }

  //Returns the semi-final points given from voter to receiver, returns nothing if no points given.
  getPoints(voter: NewSong, receiver: string, phase: number, num: number) {
    let index = voter.pointsets[phase][(num + 1).toString()].points.indexOf(receiver);
    if (index != -1) {
      if (index < 8) {
        return (index + 1).toString();
      }
      else {
        return ((index - 8) * 2 + 10).toString();
      }
    }
  }

  //Returns the styling for scoreboards based on qualification and disqualification status
  getPointStyle(song: NewSong, phase: number) {
    if (phase + 1 === this.edition.phases.length) {
      if (song.dqphase === phase) {
        return { 'background-color': '#cdb8d8' };
      }
      else if (song.draws[phase].place === 1) {
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
      else if (song.dqphase === phase) {
        return { 'background-color': '#cdb8d8' };
      }
      else return {};
    }
  }

  //Sorts the data in the song list tables
  sortData(sort: Sort, sfnum: number, isSf: boolean) {
    let data = [];

    data = isSf ? [...this.sfsongtables[sfnum].songs] : [...this.fsongs];

    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      let isAsc = sort.direction === 'asc';

      switch (sort.active) {
        case 'draw':
          if (!isSf) {
            return compare(a.fro, b.fro, isAsc);
          }
          else {
            return compare(a.sfro, b.sfro, isAsc);
          }
        case 'country': return compare(a.country, b.country, isAsc);
        case 'user': return compare(a.user, b.user, isAsc);
        case 'language': return compare(a.language, b.language, isAsc);
        case 'artist': return compare(a.artist.toLowerCase(), b.artist.toLowerCase(), isAsc);
        case 'song': return compare(a.song.toLowerCase(), b.song.toLowerCase(), isAsc);
        case 'place':
          if (!isSf) {
            return compare(a.fplace, b.fplace, isAsc);
          }
          else {
            return compare(a.sfplace, b.sfplace, isAsc);
          }
        case 'points':
          if (!isSf) {
            return compare(a.fpoints, b.fpoints, isAsc);
          }
          else {
            return compare(a.sfpoints, b.sfpoints, isAsc);
          }
        default: return 0;
      }
    });

    isSf ? this.sfsongtables[sfnum].songs = this.sortedData : this.fsongs = this.sortedData;
  }
}

//Compares 2 strings or integers and returns if a < b, the result is flipped if isAsc is false
function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}