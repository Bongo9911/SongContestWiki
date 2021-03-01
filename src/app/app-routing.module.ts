import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { ContestScreenComponent } from './pages/contest-screen/contest-screen.component';
import { EditionScreenComponent } from './pages/edition-screen/edition-screen.component';

const routes: Routes = [
  { path: "start-screen", component: StartScreenComponent },
  { path: "contest/:id", component: ContestScreenComponent },
  { path: "contest/:id/ed/:num", component: EditionScreenComponent },
  { path: "**", redirectTo: 'start-screen'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule]
})
export class AppRoutingModule { }
