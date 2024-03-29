import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as math from 'mathjs';
import { Song } from '../../shared/datatypes';
import { Firestore, getFirestore, collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { initializeApp, FirebaseApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-pot-generator',
  templateUrl: './pot-generator.component.html',
  styleUrls: ['./pot-generator.component.css']
})
export class PotGeneratorComponent implements OnInit {

  id: string;
  invalid: string[] = [];
  pots: number = 1;

  potList: string[][] = [];

  firebaseApp: FirebaseApp;
  db: Firestore;

  constructor(private route: ActivatedRoute, private authService: AuthService) {
    this.route.params.subscribe(params => {
      this.id = params.id;
    });

    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);

    // getDocs(query(collection(this.db, "contests", 'RSC', 'newsongs'))).then(docs => {
    //   docs.forEach(songDoc => {
    //     let data = songDoc.data() as Song;
    //     setDoc(doc(this.db, 'contests', 'RSC', 'users', data.user), {
    //       username: data.user,
    //       aliases: [data.user],
    //       lower: data.user.toLowerCase(),
    //     })
    //   })
    // })
  }

  ngOnInit(): void {
  }

  //Generates pots based on the list of inputted users, and specified edition range.
  async generate(users: string, editions: string) {
    let usersArray: string[] = users.split('\n');
    let edArray: string[] = editions.split('\n');
    this.invalid = [];
    this.potList = [];

    for (let i = 0; i < usersArray.length; ++i) {
      usersArray[i] = usersArray[i].trim();
    }

    for (let i = 0; i < usersArray.length; ++i) {
      let docs = await getDocs(query(collection(this.db, 'contests', this.id, 'users'), 
        where('lower', '==', usersArray[i].toLowerCase())))
      if (!docs.docs.length) {
        //this.invalid.push(usersArray[i]);
      }
      else {
        usersArray[i] = docs.docs[0].data()['username'];
      }
    }

    let sansInvalidUsers: string[] = [...usersArray]
    for (let i = 0; i < this.invalid.length; ++i) {
      let index = sansInvalidUsers.indexOf(this.invalid[i]);
      sansInvalidUsers.splice(index, 1)
    }

    console.log(sansInvalidUsers)


    if (sansInvalidUsers.length >= this.pots && this.pots > 1) {

      let pointsets: string[][][] = [];

      //Get all the pointsets from the grand final for each user
      for (let i = 0; i < sansInvalidUsers.length; ++i) {
        pointsets.push([]);
        for (let j = 0; j < edArray.length; ++j) {
          let docs = await getDocs(query(collection(this.db, 'contests', this.id, 'newsongs'),
            where('edition', '==', edArray[j]), where('user', '==', sansInvalidUsers[i])));

          if (docs.docs.length) {
            let data = docs.docs[0].data() as Song;
            if (data.phases === data.pointsets.length) {
              pointsets[i].push(data.pointsets[data.phases - 1][1].points);
            }
            else {
              pointsets[i].push(null);
            }
          }
          else {
            pointsets[i].push(null);
          }
        }
      }
      console.log(pointsets);

      let filteredUsers: string[] = [...sansInvalidUsers]
      for(let i = 0; i < filteredUsers.length; ++i) {
        //Check if there are any non-null pointsets
        if(pointsets[i].filter(x => x).length === 0) {
          this.invalid.push(filteredUsers[i])
          let index = filteredUsers.indexOf(filteredUsers[i]);
          filteredUsers.splice(index, 1);
          pointsets.splice(index, 1)
          --i;
          console.log(i);
        }
      }

      let similarities: number[][] = [];
      let sharededs: number[][] = [];

      for (let i = 0; i < pointsets.length; ++i) {
        similarities.push([]);
        sharededs.push([]);
        //Copies already calculated values so they don't need to be calculated twice
        for (let j = 0; j < i; ++j) {
          similarities[i][j] = similarities[j][i];
          sharededs[i][j] = sharededs[j][i];
        }
        //Calculates remaining similarities
        for (let j = i; j < pointsets.length; ++j) {
          if (i === j) {
            similarities[i][j] = 0;
            sharededs[i][j] = 1;
          }
          else {
            //Set similarities to a really small number in case the 2 users have no similarities
            //so the pot generation doesn't get stuck
            similarities[i][j] = 1e-80;
            sharededs[i][j] = 0;
            for (let ed = 0; ed < pointsets[i].length; ++ed) {
              if (pointsets[i][ed] && pointsets[j][ed]) {
                sharededs[i][j]++;
                for (let p = 0; p < pointsets[i][ed].length; ++p) {
                  //Checks if user j has given points to a song that user i gave points to
                  if (pointsets[j][ed].indexOf(pointsets[i][ed][p]) !== -1) {
                    //Adds the minimum number of points given between the 2 users
                    similarities[i][j] += Math.min(this.indexToPoints(p),
                      pointsets[j][ed].indexOf(pointsets[i][ed][p]));
                  }
                }
              }
            }
            if (sharededs[i][j] === 0) {
              sharededs[i][j] = 1e-40;
            }
          }
        }
      }

      similarities = math.dotDivide(similarities, math.multiply(sharededs, 52)) as number[][];

      console.log(similarities);
      let potheads: number[] = [];

      if (this.pots <= filteredUsers.length) {

        let rand = this.getRandomInt(filteredUsers.length);
        potheads.push(rand);

        let potsim = [...similarities[rand]];
        let removed = [];

        for (let i = 0; i < this.pots - 1; ++i) {
          let index = potsim.indexOf(Math.min(...potsim));
          let fixedIndex = index;
          for(let r = 0; r < removed.length; ++r) {
            if(removed[r] >= index) {
              fixedIndex++;
            }
          }
          if (potheads.indexOf(fixedIndex) === -1) {
            potheads.push(fixedIndex);
            potsim = [...similarities[fixedIndex]];
            removed = [];
          }
          else {
            potsim.splice(index, 1);
            removed.push(index);
            --i;
          }
        }

        console.log(potheads);

        let claimedUsers: number[] = [...potheads];
        let pots: number[][] = new Array(potheads.length);

        for (let i = 0; i < pots.length; ++i) {
          pots[i] = [potheads[i]];
        }

        let iter = 0; //no. of iterations
        while (claimedUsers.length !== filteredUsers.length) {
          for (let i = 0; i < potheads.length; ++i) {
            let added = false;
            let userSim = similarities[pots[i][iter]];
            while (!added && claimedUsers.length !== filteredUsers.length) {
              let index = userSim.indexOf(Math.max(...userSim));
              if (claimedUsers.indexOf(index) === -1) {
                claimedUsers.push(index);
                pots[i].push(index);
                added = true;
              }
              else {
                userSim[index] = 0;
              }
            }
          }
          iter++;
        }

        for (let i = 0; i < pots.length; ++i) {
          this.potList.push([]);
          for (let j = 0; j < pots[i].length; ++j) {
            this.potList[i].push(filteredUsers[pots[i][j]]);
          }
        }

        let potNum: number = this.potList.length - 1;
        for (let i = 0; i < this.invalid.length; ++i) {
          this.potList[potNum].push(this.invalid[i]);
          potNum--;
          if (potNum < 0) {
            potNum = this.potList.length - 1;
          }
        }

        console.log(pots);

        let result: string = "";

        for(let i = 0; i < similarities.length; ++i) {
          console.log(filteredUsers[i]);
          console.log(similarities[i].indexOf(Math.max(...similarities[i])));

          result += filteredUsers[i] + " - " + filteredUsers[similarities[i].indexOf(Math.max(...similarities[i]))] + "\n";
        }

        console.log(result);
      }
      else {
        console.error("Error: number of pots is greater than number of users")
      }
    }
    else {
      console.error("Error: not enough users to fill pots");
    }
  }

  //Converts an array index to a point value from [1, 2, 3, 4, 5, 6, 7, 8, 10, 12]
  indexToPoints(index: number): number {
    return index < 8 ? index + 1 : (index - 8) * 2 + 10;
  }

  //Returns a random integer 
  getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }
}