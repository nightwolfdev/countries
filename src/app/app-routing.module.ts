import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
    title: 'About'
  },
  {
    path: 'country',
    loadChildren: () => import('./country/country.module').then(m => m.CountryModule),
    title: 'View Country'
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then(m => m.SearchModule),
    title: 'Search'
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'search'
  },
  {
    path: '**',
    redirectTo: 'search'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
