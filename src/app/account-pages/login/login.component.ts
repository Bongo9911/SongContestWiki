import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Firestore, getFirestore, getDoc, doc } from "firebase/firestore";
import { initializeApp, FirebaseApp } from "firebase/app"
import { firebaseConfig } from '../../credentials';

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

  firebaseApp: FirebaseApp;
  db: Firestore;

  constructor(private authService: AuthService, private router: Router) { 
    //if (authService.isLoggedIn()) this.router.navigate(['']);
    console.log(authService.isLoggedIn());
    //authService.logout();

    this.firebaseApp = initializeApp(firebaseConfig);
    this.db = getFirestore(this.firebaseApp);
  }

  ngOnInit(): void {
  }

  async loginUser(): Promise<void> {
    if (this.username != "" && this.password != "") {
      this.error_message = "";
      let email = this.username;
      if(this.username.indexOf('@') === -1) {
        let userdoc = await getDoc(doc(this.db, 'users', this.username))
        if(userdoc.exists) {
          let data = userdoc.data() as {email: string}
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
