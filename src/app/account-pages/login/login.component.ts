import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  name: string = '';
  error_message: string = '';
  num: any = null;

  constructor(private authService: AuthService, private router: Router) { 
    //if (authService.isLoggedIn()) this.router.navigate(['']);
    console.log(authService.isLoggedIn());
    //authService.logout();
    //this.authService.register('dawsonbuist@gmail.com','WhoWant$Love13','Bongo9911')
  }

  ngOnInit(): void {
  }

  async loginUser(): Promise<void> {
    if (this.email != "" && this.password != "") {
      this.error_message = "";
      await this.authService.login(this.email, this.password).then(async num => {
        await num;
        if (num == 0) {
          this.error_message = "Credentials not found in our records. Try again.";
        } else {
        }
      })
    } else {
      this.error_message = "Please input email and password"
    }
  }
}
