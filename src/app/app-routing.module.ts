import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { ContestScreenComponent } from './pages/contest-screen/contest-screen.component';
import { EditionScreenComponent } from './pages/edition-screen/edition-screen.component';
import { UserScreenComponent } from './pages/user-screen/user-screen.component';
import { ReallocatorScreenComponent } from './pages/reallocator-screen/reallocator-screen.component';
import { CountryScreenComponent } from './pages/country-screen/country-screen.component';
import { PotGeneratorComponent } from './pages/pot-generator/pot-generator.component';
import { LoginComponent } from './account-pages/login/login.component';
import { RegisterComponent } from './account-pages/register/register.component';

const routes: Routes = [
  { path: "", component: StartScreenComponent },
  { path: "contest/:id", component: ContestScreenComponent },
  { path: "contest/:id/ed/:num", component: EditionScreenComponent },
  { path: "contest/:id/edition/:num", redirectTo: "/contest/:id/ed/:num"},
  { path: "contest/:id/user/:user", component: UserScreenComponent },
  { path: "contest/:id/country/:country", component: CountryScreenComponent },
  { path: "contest/:id/pot-generator", component: PotGeneratorComponent },
  { path: "tools/reallocator", component: ReallocatorScreenComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "**", redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
