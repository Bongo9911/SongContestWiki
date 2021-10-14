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

import { ContestScreenComponent } from './pages/contest-screen/contest-screen.component';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { EditionScreenComponent } from './pages/edition-screen/edition-screen.component';
import { ReallocatorScreenComponent } from './pages/reallocator-screen/reallocator-screen.component';
import { PotGeneratorComponent } from './pages/pot-generator/pot-generator.component';
import { LoginComponent } from './account-pages/login/login.component';
import { RegisterComponent } from './account-pages/register/register.component';
import { ImportScreenComponent } from './pages/import-screen/import-screen.component';
import { CountryUserScreenComponent } from './pages/country-user-screen/country-user-screen.component';

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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
