import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchFormComponent } from "./search-form/search-form.component";
import { BackendService } from './backend.service';
import { WeatherComponent } from './weather/weather.component';

const routes: Routes = [
  { path: '../', component: SearchFormComponent},
  { path: 'weather/:loc', component: WeatherComponent, pathMatch: 'full' },
  { path: 'weather', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
