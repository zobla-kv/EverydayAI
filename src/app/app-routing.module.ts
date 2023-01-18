import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomePageComponent,
  FooterComponent,
  CategorySelectorComponent
} from '@app/components';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    // pathMatch: 'full'
  },
  {
    path: 'products',
    component: CategorySelectorComponent
  },
  {
    path: 'about',
    component: CategorySelectorComponent
  },
  {
    path: 'contact-us',
    component: CategorySelectorComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
