import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import * as math from 'mathjs';

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

  constructor(private database: AngularFirestore, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.id = params.id;
    });

    // this.database.firestore.collection("contests").doc('RSC').collection('songs').get().then(docs => {
    //   docs.forEach(doc => {
    //     let data = doc.data() as Song;
    //     this.database.firestore.collection('contests').doc('RSC').collection('users').doc(data.user).set({
    //       username: data.user,
    //       aliases: [data.user]
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
      let doc = await this.database.firestore.collection('contests').doc(this.id).collection('users')
        .doc(usersArray[i]).get()
      if (!doc.exists) {
        this.invalid.push(usersArray[i]);
        console.log(usersArray[i])
      }
    }

    let filteredUsers: string[] = [...usersArray]
    for (let i = 0; i < this.invalid.length; ++i) {
      let index = filteredUsers.indexOf(this.invalid[i]);
      filteredUsers.splice(index, 1)
    }

    console.log(filteredUsers)


    if (filteredUsers.length > 1 && this.pots) {

      let pointsets: string[][][] = [];

      //Get all the pointsets from the grand final for each user
      for (let i = 0; i < filteredUsers.length; ++i) {
        pointsets.push([]);
        for (let j = 0; j < edArray.length; ++j) {
          let docs = await this.database.firestore.collection('contests').doc(this.id)
            .collection('songs').where('edition', '==', edArray[j])
            .where('user', '==', filteredUsers[i]).get();

          if (docs.docs.length) {
            let data = docs.docs[0].data() as Song;
            if (data.fpointset && data.fpointset.points) {
              pointsets[i].push(data.fpointset.points);
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
            similarities[i][j] = 1e-40;
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
          }
        }
      }

      similarities = math.dotDivide(similarities, math.multiply(sharededs,52)) as number[][];

      console.log(math.multiply(sharededs,52));
      console.log(similarities);
      let potheads: number[] = [];

      for (let i = 0; i < this.pots; ++i) {
        let rand = this.getRandomInt(filteredUsers.length);
        if (potheads.indexOf(rand) === -1) {
          potheads.push(rand);
        }
        else {
          --i;
        }
      }

      console.log(potheads);

      let claimedUsers: number[] = [...potheads];
      let pots: number[][] = new Array(potheads.length);

      for(let i = 0; i < pots.length; ++i) {
        pots[i] = [potheads[i]];
      }

      while (claimedUsers.length !== filteredUsers.length) {
        for (let i = 0; i < potheads.length; ++i) {
          let added = false;
          let userSim = similarities[potheads[i]];
          while (!added && claimedUsers.length !== filteredUsers.length) {
            let index = userSim.indexOf(math.max(userSim));
            if(claimedUsers.indexOf(index) === -1) {
              claimedUsers.push(index);
              pots[i].push(index);
              added = true;
            }
            else {
              userSim[index] = 0;
            }
          }
        }
      }

      for(let i = 0; i < pots.length; ++i) {
        this.potList.push([]);
        for(let j = 0; j < pots[i].length; ++j) {
          this.potList[i].push(filteredUsers[pots[i][j]]);
        }
      }

      let potNum: number = this.potList.length - 1;
      for(let i = 0; i < this.invalid.length; ++i) {
        this.potList[potNum].push(this.invalid[i]);
        potNum--;
        if(potNum < 0) {
          potNum = this.potList.length - 1;
        }
      }

      console.log(pots);
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