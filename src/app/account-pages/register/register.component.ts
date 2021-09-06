import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmpassword: string = '';
  name: string = '';
  error_message: string = '';
  num: any = null;

  constructor(private authService: AuthService, private router: Router,
    private database: AngularFirestore) {
    //if (authService.isLoggedIn()) this.router.navigate(['']);
    console.log(authService.isLoggedIn());
    console.log("Dugly_Uckling".match(/^[a-zA-Z0-9_-]+$/) ? true : false)
  }

  ngOnInit(): void {
  }

  async registerUser(): Promise<void> {
    if (this.displayName.match(/^[a-zA-Z0-9_-]+$/)) {
      //Valid Display Name
      this.database.firestore.collection('users').doc(this.displayName).get().then(doc => {
        if(!doc.exists) {
          //Username available
          if (this.email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            //Valid email under rfc2822 standard
            if(this.password === this.confirmpassword) {
              //Passwords match
              if(this.password.length >= 8) {
                //Password is at least 8 character long
                this.authService.register(this.email, this.password, this.displayName);
              }
              else {
                //Password is too short
              }
            }
            else {
              //Passwords don't match
            }
          }
          else {
            //Invalid email
          }
        }
        else {
          //Username unavailable
        }
      })
    }
    else {
      //Invalid Display Name
    }
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
