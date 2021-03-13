import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { ThrowStmt } from '@angular/compiler';

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

  songs: Song[] = [];
  sf1songs: Song[] = [];
  sf2songs: Song[] = [];
  sf3songs: Song[] = [];
  gfsongs: Song[] = [];

  sbsf1songs: Song[] = [];
  sbsf2songs: Song[] = [];
  sbsf3songs: Song[] = [];
  sbgfsongs: Song[] = [];

  sf1voters: Song[] = [];
  sf2voters: Song[] = [];
  sf3voters: Song[] = [];
  fvoters: Song[] = [];

  sf1crossvoters: Song[] = [];
  sf2crossvoters: Song[] = [];
  sf3crossvoters: Song[] = [];

  sf1ptsongs: Song[] = [];
  sf2ptsongs: Song[] = [];
  sf3ptsongs: Song[] = [];

  sortedData: Song[];

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.num = params.num;
    });

    this.database
      .collection<Contest>('contests', ref => ref.where('id', '==', this.id))
      .get()
      .subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.con = doc.data();
          console.log(doc.data());
        });
      });

    //gets the info on the edition
    this.database
      .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
      .collection<Edition>('editions', ref => ref.where('edition', '==', this.num))
      .get()
      .subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.edition = doc.data();
        });
      });

    //get all the songs sent to that edition
    this.database
      .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
      .collection<Song>('songs', ref => ref.where('edition', '==', this.num)/*.orderBy('sfro')*/)
      .get()
      .subscribe(async res => {
        await res.docs.forEach((doc) => {
          this.songs.push(doc.data());
          console.log(doc.data());
          this.sf1songs = this.songs.filter(x => x.sfnum == '1').filter(x => x.qualifier !== 'AQ')
            .sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);
          this.sf2songs = this.songs.filter(x => x.sfnum == '2').filter(x => x.qualifier !== 'AQ')
            .sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);
          this.sf3songs = this.songs.filter(x => x.sfnum == '3').filter(x => x.qualifier !== 'AQ')
            .sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);
          this.gfsongs = this.songs.filter(x => x.fro !== -1).sort((a, b) => (a.fro > b.fro) ? 1 : -1);

          this.sf1voters = this.songs.filter(x => x.sfnum == '1')
            .filter(x => x.disqualified !== 'SFDQ' && x.disqualified !== 'SFWD')
            .filter(x => x.sf1pointset.cv === false)
            .sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);
          this.sf2voters = this.songs.filter(x => x.sfnum == '2')
            .filter(x => x.disqualified !== 'SFDQ' && x.disqualified !== 'SFWD')
            .sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);
          this.sf3voters = this.songs.filter(x => x.sfnum == '3')
            .filter(x => x.disqualified !== 'SFDQ' && x.disqualified !== 'SFWD')
            .sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);
          this.fvoters = this.songs.filter(x => x.disqualified === 'N').filter(x => x.qualifier !== 'NQ')
            .sort((a, b) => (a.fro > b.fro) ? 1 : -1).concat(
              this.songs.filter(x => x.disqualified == 'N').filter(x => x.qualifier === 'NQ')
                .sort((a, b) => (a.country > b.country) ? 1 : -1)
            );

          this.sf1crossvoters = this.songs.filter(x => 'sf1pointset' in x)
            .filter(x => x.disqualified !== 'SFDQ' && x.disqualified !== 'SFWD')
            .filter(x => x.sf1pointset.cv === true)
            .sort((a, b) => (a.country > b.country) ? 1 : -1);

          this.sbgfsongs = [...this.gfsongs];
          this.sbsf1songs = [...this.sf1songs];
          this.sbsf2songs = [...this.sf2songs];
          this.sbsf3songs = [...this.sf3songs];

          this.sf1ptsongs = [...this.sf1songs];
          this.sf1ptsongs.sort((a, b) => (a.sfplace > b.sfplace) ? 1 : -1);
        });
      });
  }

  ngOnInit(): void {
  }

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

  uploadSong(song: string): void {
    console.log(song);
    const parsedString = song.split('\n').map((line) => line.split('\t'))
    console.log(parsedString);
    parsedString.forEach(song => {
      this.database
        .collection<Contest>('contests', ref => ref.where('id', '==', this.id)).doc(this.id)
        .collection('songs').add({
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

  getSFPoints(voter: Song, receiver: string, sfnum: string) {
    let index = voter['sf' + sfnum + 'pointset'].points.indexOf(receiver);
    if (index != -1) {
      if (index < 8) {
        return (index + 1).toString();
      }
      else {
        return ((index - 8) * 2 + 10).toString();
      }
    }
  }

  getSFPointStyle(song: Song) {
    if (song.qualifier === 'Q') return { 'background-color': '#fbdead' };
    else if (song.disqualified === 'SFDQ' || song.disqualified === 'SFWD') {
      return { 'background-color': '#cdb8d8' };
    }
    else return {};
  }

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

  sortData(sort: Sort, sf: string) {
    let data = [];
    if (sf === '1') {
      data = this.sf1songs.slice();
    }
    else if (sf === '2') {
      data = this.sf2songs.slice();
    }
    else if (sf === '3') {
      data = this.sf3songs.slice();
    }
    else {
      data = this.gfsongs.slice();
    }

    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'draw':
          if (sf === 'f') {
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
          if (sf == 'f') {
            return compare(a.fplace, b.fplace, isAsc);
          }
          else {
            return compare(a.sfplace, b.sfplace, isAsc);
          }
        case 'points':
          if (sf == 'f') {
            return compare(a.fpoints, b.fpoints, isAsc);
          }
          else {
            return compare(a.sfpoints, b.sfpoints, isAsc);
          }
        default: return 0;
      }
    });

    if (sf === '1') {
      this.sf1songs = this.sortedData;
    }
    else if (sf === '2') {
      this.sf2songs = this.sortedData;
    }
    else if (sf === '3') {
      this.sf3songs = this.sortedData;
    }
    else {
      this.gfsongs = this.sortedData;
    }
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

interface Contest {
  id: string;
  name: string;
}

interface Edition {
  crossvoting: boolean;
  edition: string;
  entries: number;
  hostcountries: string[];
  hostusers: string[];
  slogan: string;
}

interface Song {
  artist: string;
  country: string;
  disqualified: string;
  edition: string;
  extpoints: number;
  fpointset: {
    points: string[10];
  };
  fplace: number;
  fpoints: number;
  fro: number;
  intpoints: number;
  language: string;
  qualifier: string;
  rawextpoints: number;
  sf1pointset: {
    cv: boolean;
    points: string[10];
  };
  sf2pointset: {
    cv: boolean;
    points: string[10];
  };
  sf3pointset: {
    cv: boolean;
    points: string[10];
  };
  sfnum: string;
  sfplace: number;
  sfpoints: number;
  sfro: number;
  song: string;
  user: string;
}