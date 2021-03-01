import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edition-screen',
  templateUrl: './edition-screen.component.html',
  styleUrls: ['./edition-screen.component.css']
})
export class EditionScreenComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) { 
    this.route.params.subscribe(params => console.log(params));
  }

  ngOnInit(): void {
  }

}

