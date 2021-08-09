import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { ContestScreenComponent } from './pages/contest-screen/contest-screen.component';
import { EditionScreenComponent } from './pages/edition-screen/edition-screen.component';
import { UserScreenComponent } from './pages/user-screen/user-screen.component';
import { ReallocatorScreenComponent } from './pages/reallocator-screen/reallocator-screen.component';
import { CountryScreenComponent } from './pages/country-screen/country-screen.component';

const routes: Routes = [
  { path: "", component: StartScreenComponent },
  { path: "contest/:id", component: ContestScreenComponent },
  { path: "contest/:id/ed/:num", component: EditionScreenComponent },
  { path: "contest/:id/user/:user", component: UserScreenComponent },
  { path: "contest/:id/country/:country", component: CountryScreenComponent },
  { path: "tools/reallocator", component: ReallocatorScreenComponent },
  { path: "**", redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule]
})
export class AppRoutingModule { }
