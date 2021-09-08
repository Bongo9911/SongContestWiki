import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('password').value === formGroup.get('confirmpassword').value)
    return null;
  else
    return { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  minPw = 8; //Minimum password length
  minUn = 3; //Minimum username length
  maxUn = 20; //Maximum username length

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$'),
    Validators.minLength(this.minUn), Validators.maxLength(this.maxUn)]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [Validators.required, Validators.minLength(this.minPw)]),
    confirmpassword: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator })
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

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

  /* Called on each input in either password field */
  onPasswordInput() {
    if (this.registerForm.hasError('passwordMismatch'))
      this.registerForm.controls['confirmpassword'].setErrors([{ 'passwordMismatch': true }]);
    else
      this.registerForm.controls['confirmpassword'].setErrors(null);
  }

  /* Called on each input in the username field */
  onUsernameInput() {
    if (this.registerForm.hasError('usernameTaken'))
      this.registerForm.controls['username'].setErrors(null);
  }

  async registerUser(): Promise<void> {
    this.database.firestore.collection('users').doc(this.registerForm.controls['username'].value)
      .get().then(doc => {
        if (!doc.exists) {
          //Username available
          this.authService.register(this.registerForm.controls['email'].value,
          this.registerForm.controls['password'].value, this.registerForm.controls['username'].value);
        }
        else {
          //Username unavailable
          this.registerForm.controls['username'].setErrors([{ 'usernameTaken': true }]);
        }
      })
  }
}
