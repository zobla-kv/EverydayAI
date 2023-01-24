import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomePageComponent,
  ProductPageComponent,
  CategorySelectorComponent,
  FormComponent
} from '@app/components';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    // pathMatch: 'full'
  },
  {
    path: 'products',
    component: ProductPageComponent,
  },
  {
    path: 'about',
    component: CategorySelectorComponent
  },
  {
    path: 'contact-us',
    component: CategorySelectorComponent
  },
  {
    path: 'auth',
    component: FormComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', component: FormComponent },
      { path: 'register', component: FormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
