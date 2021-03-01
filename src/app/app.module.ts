import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { firebaseConfig } from './credentials';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContestScreenComponent } from './pages/contest-screen/contest-screen.component';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { EditionScreenComponent } from './pages/edition-screen/edition-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    ContestScreenComponent,
    StartScreenComponent,
    EditionScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    FormsModule,
    CommonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
