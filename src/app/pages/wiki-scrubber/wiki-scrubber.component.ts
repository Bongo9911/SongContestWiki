import { Component, OnInit } from '@angular/core';
import { Song } from 'src/app/shared/datatypes';

@Component({
  selector: 'app-wiki-scrubber',
  templateUrl: './wiki-scrubber.component.html',
  styleUrls: ['./wiki-scrubber.component.css']
})
export class WikiScrubberComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  scrub(text: string) {
    //console.log(text);

    let lines = text.split('\n');

    let i = 0;
    let seminum = 0;

    let songs: Song[] = [];
    let countries: string[] = [];
    //Semi-final loop
    while(i < lines.length) {
      //console.log(split[i]);
      if(lines[i].includes("Semi-final ")) {
        seminum = parseInt(lines[i].split("Semi-final ")[1][0]);
        console.log(seminum);
      }
      if(lines[i].startsWith("{|") && seminum != 0) {
        i+= 10;
        while(!lines[i].startsWith("|}")) {
          let ro = parseInt(lines[i].split("| ")[1]);
          let country = lines[i+1].split("[[")[2].split("]]")[0];
          let user = lines[i+2].split("u/")[1].split("]]")[0];
          let language = lines[i+3].split("|")[1].trim();
          let artist = lines[i+4].split("|")[1].trim();
          let song = lines[i+5].split("\"")[1].trim();


          let sentSong: Song = {
            artist: artist,
            country: country,
            draws: [{
              ro: ro,
              num: seminum,
            }],
            dqphase: -1,
            edition: "42",
            edval: 46,
            language: language,
            phases: 2,
            pointsets: [],
            song: song,
            user: user
          }
          if(lines[i+6].startsWith("| colspan")) {
            sentSong.dqphase = 0;
            if(lines[i+6].split("{{")[1].split("|")[1] == "Disqualifed}}") {
              sentSong.dqreason = "DQ";
            }
            else {
              sentSong.dqreason = "WD";
            }
            i += 8;
          }
          else {
            let place = parseInt(lines[i+6].split("|")[1]);
            let points = parseInt(lines[i+7].split("|")[1]);
            sentSong.draws[0].place = place;
            sentSong.draws[0].points = points;
            i += 9;
          }

          songs.push(sentSong);
          countries.push(country);

          console.log(country);
        }
      }

      if(lines[i].includes("Grand final")) {
        break;
      }
      ++i;
    }

    console.log(songs);
    console.log(countries);

    while(i < lines.length) {
      if(lines[i].startsWith("{|")) {
        i += 10;

        while(!lines[i].startsWith("|}")) {

          let sentSong: Song;
          let ro = parseInt(lines[i].split("| ")[1]);
          let country = lines[i+1].split("[[")[2].split("]]")[0];

          if(countries.includes(country)) {
            sentSong = songs[countries.indexOf[country]];
            console.log(sentSong);
            sentSong.draws.push({
              ro: ro,
              num: 1
            })
          }
          else {
            let user = lines[i+2].split("u/")[1].split("]]")[0];
            let language = lines[i+3].split("|")[1].trim();
            let artist = lines[i+4].split("|")[1].trim();
            let song = lines[i+5].split("\"")[1].trim();

            sentSong = {
              artist: artist,
              country: country,
              draws: [
              {
                //figure out what semi AQ voted in :)
              }, 
              {
                ro: ro,
                num: 1,
              }],
              dqphase: -1,
              edition: "42",
              edval: 46,
              language: language,
              phases: 2,
              pointsets: [],
              song: song,
              user: user
            }
          }

          console.log(sentSong);


          if(lines[i+6].startsWith("| colspan")) {
            sentSong.dqphase = 1;
            if(lines[i+6].split("{{")[1].split("|")[1] == "Disqualifed}}") {
              sentSong.dqreason = "DQ";
            }
            else {
              sentSong.dqreason = "WD";
            }
            i += 8;
          }
          else {
            let place = parseInt(lines[i+6].split("|")[1]);
            let points = parseInt(lines[i+7].split("|")[1]);
            sentSong.draws[1].place = place;
            sentSong.draws[1].points = points;
            i += 9;
          }
        }
      }
      ++i;
    }

    console.log(songs);
  }
}
