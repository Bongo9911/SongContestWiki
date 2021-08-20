import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { Contest, Edition, Song } from 'src/app/shared/datatypes';

@Component({
  selector: 'app-edition-screen',
  templateUrl: './edition-screen.component.html',
  styleUrls: ['./edition-screen.component.css']
})
export class EditionScreenComponent implements OnInit {
  readonly pointset: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12'];

  con: Contest = {
    name: '',
    id: ''
  };
  edition: Edition = {
    crossvoting: false,
    edition: '0',
    entries: 0,
    hostcountries: [],
    hostusers: [],
    slogan: '',
  };
  id: string;
  num: string;
  entries: number;

  songs: Song[] = [];
  sfsongs: Song[][] = new Array(3);
  fsongs: Song[] = [];

  sfsongtables: any[] = new Array(3);

  sbsfsongs: Song[][] = new Array(3);
  sbfsongs: Song[] = [];

  sfvoters: Song[][] = new Array(3);
  fvoters: Song[] = [];

  sfcrossvoters: Song[][] = new Array(3);

  sfptsongs: Song[][] = new Array(3); //for the point tables in scoreboard section

  sortedData: Song[];

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.num = params.num;
    });

    this.database.firestore.collection('contests').where('id', '==', this.id).get()
      .then(docs => {
        docs.forEach((doc) => {
          this.con = doc.data() as Contest;
        });
      });

    //gets the info on the edition
    this.database.firestore.collection('contests').doc(this.id)
      .collection('editions').where('edition', '==', this.num).get().then(docs => {
        docs.forEach((doc) => {
          this.edition = doc.data() as Edition;
        });
      });

    //get all the songs sent to that edition
    this.database.firestore
      .collection('contests').doc(this.id)
      .collection('songs').where('edition', '==', this.num).get().then(docs => {
        docs.forEach((doc) => {
          this.songs.push(doc.data() as Song);
        });
        //Populates the arrays for each semi-finals respective arrays
        for (let i = 1; i <= 3; ++i) {
          //Separates songs into their respective semi-finals
          this.sfsongs[i - 1] = this.songs.filter(x => x.sfnum == i.toString())
            .filter(x => x.qualifier !== 'AQ').sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);

          //I have no idea why, but this makes table sorting work in an ngFor
          this.sfsongtables[i - 1] = {
            songs: [...this.sfsongs[i-1]],
          }

          //Gets all users who succesfully internally voted in the semi-final
          this.sfvoters[i - 1] = this.songs.filter(x => x.sfnum == i.toString())
            .filter(x => x.disqualified !== 'SFDQ' && x.disqualified !== 'SFWD')
            .filter(x => x['sf' + i.toString() + 'pointset'].cv === false)
            .sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);

          //Gets all users who cross-voted into that semi-final
          this.sfcrossvoters[i - 1] =
            this.songs.filter(x => 'sf' + i.toString() + 'pointset' in x)
              .filter(x => x.disqualified !== 'SFDQ' && x.disqualified !== 'SFWD')
              .filter(x => x['sf' + i.toString() + 'pointset'].cv === true)
              .sort((a, b) => (a.country > b.country) ? 1 : -1);

          //Separate arrays so that the arrays are not effected by sorting of the song table
          this.sbsfsongs[i - 1] = [...this.sfsongs[i - 1]];

          this.sfptsongs[i - 1] = [...this.sfsongs[i - 1]];
          this.sfptsongs[i - 1].sort((a, b) => (a.sfplace > b.sfplace) ? 1 : -1);
        }
        //Counts the number of entries to display in the infobox
        this.entries = this.songs.length;

        //Filters out all the songs that qualified for the finals
        this.fsongs = this.songs.filter(x => x.fro !== -1).sort((a, b) => (a.fro > b.fro) ? 1 : -1);

        //Filters out all the users who succesfully voted in the final
        this.fvoters = this.songs.filter(x => x.disqualified === 'N').filter(x => x.qualifier !== 'NQ')
          .sort((a, b) => (a.fro > b.fro) ? 1 : -1).concat(
            this.songs.filter(x => x.disqualified == 'N').filter(x => x.qualifier === 'NQ')
              .sort((a, b) => (a.country > b.country) ? 1 : -1)
          );

        //Copies the final songs array for the scoreboard so it isn't effected by table sorting
        this.sbfsongs = [...this.fsongs];
      });
  }

  ngOnInit(): void {
  }

  //Returns the style for a semi row based on whether the song qualified and if it was disqualified.
  getSFStyle(dq: string, qualifier: string): object {
    switch (dq) {
      case 'SFDQ':
      case 'SFWD':
        return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
      default:
        if (qualifier === 'Q') return { 'background-color': '#ffdead', 'font-weight': 'bold' };
        else return { 'background-color': 'ghostwhite' };
    }
  }

  //Returns the style for a final row based on the song's placement and disqualification status
  getFStyle(place: number, dq: string): object {
    switch (place) {
      case 1:
        return { 'background-color': '#ffd700', 'font-weight': 'bold' };
      case 2:
        return { 'background-color': '#c0c0c0' };
      case 3:
        return { 'background-color': '#cc9966' };
      case 4:
      case 5:
      case 6:
        return { 'background-color': '#bae8ff' };
      default:
        if (dq === 'FWD' || dq == 'FDQ') return { 'background-color': '#cdb8d8', 'font-style': 'italic' };
        else return { 'background-color': 'ghostwhite' };
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
  getSFPoints(voter: Song, receiver: string, sfnum: number) {
    let index = voter['sf' + (sfnum + 1).toString() + 'pointset'].points.indexOf(receiver);
    if (index != -1) {
      if (index < 8) {
        return (index + 1).toString();
      }
      else {
        return ((index - 8) * 2 + 10).toString();
      }
    }
  }

  //Returns the styling for semi-final scoreboards based on qualification and disqualification status
  getSFPointStyle(song: Song) {
    if (song.qualifier === 'Q') return { 'background-color': '#fbdead' };
    else if (song.disqualified === 'SFDQ' || song.disqualified === 'SFWD') {
      return { 'background-color': '#cdb8d8' };
    }
    else return {};
  }

  //Returns the final points given from voter to receiver, returns nothing if no points given.
  getFPoints(voter: Song, receiver: string) {
    let index = voter.fpointset.points.indexOf(receiver);
    if (index != -1) {
      if (index < 8) {
        return (index + 1).toString();
      }
      else {
        return ((index - 8) * 2 + 10).toString();
      }
    }
  }

  //Returns the styling for final scoreboards based on placement and disqualification status
  getFPointStyle(song: Song) {
    switch (song.fplace) {
      case 1:
        return { 'background-color': '#ffd700' }
      case 2:
        return { 'background-color': '#c0c0c0' };
      case 3:
        return { 'background-color': '#cc9966' };
      default:
        if (song.disqualified != 'N') return { 'background-color': '#cdb8d8' };
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