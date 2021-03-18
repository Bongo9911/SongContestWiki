import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reallocator-screen',
  templateUrl: './reallocator-screen.component.html',
  styleUrls: ['./reallocator-screen.component.css']
})
export class ReallocatorScreenComponent implements OnInit {
  readonly pointset: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12'];

  output: string = "hey";

  constructor(private database: AngularFirestore, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
  }

  reallocate(points: string, countries: string, ignore: number) {
    let pointsArray = points.split('\n').map((line) => line.split('\t'));
    const countriesArray = countries.split('\n').map((line) => line.split('\t'));

    let countryindex = -1;
    let maxvote = 0;

    countriesArray.forEach(country => {
      countryindex = -1;
      for(let i = 0; i < pointsArray.length; ++i){
        if(pointsArray [i][0] == country[0]){
          countryindex = i;
        }
      }

      for(let i = ignore; i < pointsArray[0].length; ++i) {
        if(pointsArray[countryindex][i] != "") {
          maxvote = parseInt(pointsArray[countryindex][i]);
          if(!pointsArray[countryindex][i].includes("th")) {
            for(let j = 0; j < pointsArray.length; ++j) {
              if(pointsArray[j][i] != "") {
                if(!pointsArray[j][i].includes("th")) {
                  if(parseInt(pointsArray[j][i]) < maxvote) {
                    if(pointsArray[j][i] == "8" || pointsArray[j][i] == "10") {
                      pointsArray[j][i] = (parseInt(pointsArray[j][i]) + 2).toString();
                    }
                    else {
                      pointsArray[j][i] = (parseInt(pointsArray[j][i]) + 1).toString();
                    }
                  }
                }
                else {
                  if(parseInt(pointsArray[j][i]) ==  11) {
                    pointsArray[j][i] = "1";
                  }
                  else {
                    pointsArray[j][i] = (parseInt(pointsArray[j][i]) - 1).toString() + 'th';
                  }
                }
              } 
            }
          }
          else {
            for(let j = 0; j < pointsArray.length; ++j) {
              if(pointsArray[j][i].includes("th")) {
                if(parseInt(pointsArray[j][i]) > maxvote) {
                  pointsArray[j][i] = (parseInt(pointsArray[j][i]) - 1).toString() + 'th';
                }
              }
            }
          }

          pointsArray[countryindex][i] = "";
        }
      }
    });

    let outputtext = ""

    for(let i = 0; i < pointsArray.length; ++i) {
      for(let j = 0; j < pointsArray.length; ++j) {
        outputtext += pointsArray[i][j] + '\t';
      }
      outputtext += '\n'
    }

    this.output = outputtext;
  }
}