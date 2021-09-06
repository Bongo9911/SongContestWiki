import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { firebaseConfig } from './credentials';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { ContestScreenComponent } from './pages/contest-screen/contest-screen.component';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { EditionScreenComponent } from './pages/edition-screen/edition-screen.component';
import { UserScreenComponent } from './pages/user-screen/user-screen.component';
import { ReallocatorScreenComponent } from './pages/reallocator-screen/reallocator-screen.component';
import { CountryScreenComponent } from './pages/country-screen/country-screen.component';
import { PotGeneratorComponent } from './pages/pot-generator/pot-generator.component';
import { LoginComponent } from './account-pages/login/login.component';
import { RegisterComponent } from './account-pages/register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    ContestScreenComponent,
    StartScreenComponent,
    EditionScreenComponent,
    UserScreenComponent,
    ReallocatorScreenComponent,
    CountryScreenComponent,
    PotGeneratorComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    MatSortModule,
    MatButtonModule,
    MatInputModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
