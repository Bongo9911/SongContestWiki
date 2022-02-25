import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StartScreenComponent } from './pages/start-screen/start-screen.component';
import { ContestScreenComponent } from './pages/contest-screen/contest-screen.component';
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

const routes: Routes = [
  { path: "", component: StartScreenComponent },
  { path: "contest/:id", component: ContestScreenComponent },
  { path: "contest/:id/ed/:num", component: EditionScreenComponent },
  { path: "contest/:id/edition/:num", redirectTo: "/contest/:id/ed/:num"},
  { path: "contest/:id/user/:name", component: CountryUserScreenComponent },
  { path: "contest/:id/country/:name", component: CountryUserScreenComponent },
  { path: "contest/:id/host", component: HostScreenComponent },
  { path: "contest/:id/submit", component: SubmitScreenComponent },
  { path: "contest/:id/pot-generator", component: PotGeneratorComponent },
  { path: "tools/reallocator", component: ReallocatorScreenComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "contest/:id/import", component: ImportScreenComponent },
  { path: "contest/:id/wikiscrubber", component: WikiScrubberComponent },
  { path: "**", redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
