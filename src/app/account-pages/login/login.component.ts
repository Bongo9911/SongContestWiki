import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  name: string = '';
  error_message: string = '';
  num: any = null;

  constructor(private authService: AuthService, private router: Router,
    private database: AngularFirestore) { 
    //if (authService.isLoggedIn()) this.router.navigate(['']);
    console.log(authService.isLoggedIn());
    //authService.logout();
  }

  ngOnInit(): void {
  }

  async loginUser(): Promise<void> {
    if (this.username != "" && this.password != "") {
      this.error_message = "";
      let email = this.username;
      if(this.username.indexOf('@') === -1) {
        let doc = await this.database.firestore.collection('users').doc(this.username).get();
        if(doc.exists) {
          let data = doc.data() as {email: string}
          email = data.email;
        }
        else {
          email = null;
        }
      }
      if(email) {
        await this.authService.login(email, this.password).then(async num => {
          await num;
          if (num == 0) {
            this.error_message = "Credentials not found in our records. Try again.";
          } else {
          }
        })
      }
    } else {
      this.error_message = "Please input email and password"
    }
  }
}
