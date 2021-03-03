import { NumberSymbol } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edition-screen',
  templateUrl: './edition-screen.component.html',
  styleUrls: ['./edition-screen.component.css']
})
export class EditionScreenComponent implements OnInit {

  con : Contest = {
    name: '',
    id: ''
  };
  id : string;
  num : string;

  songs : Song[] = [];
  edition : Edition = { 
    edition: '0',
    entries: 0,
    hostcountry: '',
    hostuser: '',
    slogan: '',
  };

  fakeArray = new Array(3);

  sfnums : number[] = [1,2,3]

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
      });
    });
  }
  
  ngOnInit(): void {
  }

  filterSongs(sfnum : string) : Song[] {
    return this.songs.filter(x => x.sfnum == sfnum).sort((a, b) => (a.sfro > b.sfro) ? 1 : -1);
  }

  uploadSong(song : string) : void {
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

  //https://www.w3schools.com/howto/howto_js_sort_table.asp
  sortTable(n, id) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(id);
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }

}

interface Contest {
  id: string;
  name: string;
}

interface Edition {
  edition: string;
  entries: number;
  hostcountry: string;
  hostuser: string;
  slogan: string;
}

interface Song {
  artist: string;
  coutnry: string;
  edition: string;
  f1: string;
  f2: string;
  f3: string;
  f4: string;
  f5: string;
  f6: string;
  f7: string;
  f8: string;
  f10: string;
  f12: string;
  fplace: number;
  fpoints: number;
  fro: number;
  language: string;
  qualifier: boolean;
  sf1: string;
  sf2: string;
  sf3: string;
  sf4: string;
  sf5: string;
  sf6: string;
  sf7: string;
  sf8: string;
  sf10: string;
  sf12: string;
  sfnum: string;
  sfplace: number;
  sfpoints: number;
  sfro: number;
  song: string;
  user: string;
}