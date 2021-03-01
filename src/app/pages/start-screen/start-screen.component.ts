import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.css']
})
export class StartScreenComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) { 
    this.route.params.subscribe(params => console.log(params));
  }

  ngOnInit(): void {
  }

}

