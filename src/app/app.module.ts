import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ContestScreenComponent } from './pages/contest-screen/contest-screen.component';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { EditionScreenComponent } from './pages/edition-screen/edition-screen.component';
import { ReallocatorScreenComponent } from './pages/reallocator-screen/reallocator-screen.component';
import { PotGeneratorComponent } from './pages/pot-generator/pot-generator.component';
import { LoginComponent } from './account-pages/login/login.component';
import { RegisterComponent } from './account-pages/register/register.component';
import { ImportScreenComponent } from './pages/import-screen/import-screen.component';
import { CountryUserScreenComponent } from './pages/country-user-screen/country-user-screen.component';
import { WikiScrubberComponent } from './pages/wiki-scrubber/wiki-scrubber.component';
import { HostScreenComponent } from './pages/host-screen/host-screen.component';
import { SubmitScreenComponent } from './pages/submit-screen/submit-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    ContestScreenComponent,
    StartScreenComponent,
    EditionScreenComponent,
    ReallocatorScreenComponent,
    PotGeneratorComponent,
    LoginComponent,
    RegisterComponent,
    ImportScreenComponent,
    CountryUserScreenComponent,
    WikiScrubberComponent,
    HostScreenComponent,
    SubmitScreenComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    MatSortModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatCheckboxModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
