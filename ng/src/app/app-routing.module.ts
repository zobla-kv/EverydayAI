import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomePageComponent,
  ProductPageComponent,
  CategorySelectorComponent,
  AuthFormComponent,
  InformationComponent,
  XFormComponent
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
    component: AuthFormComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', component: AuthFormComponent },
      { path: 'register', component: AuthFormComponent }
    ]
  },
  {
    path: 'auth/verify',
    component: InformationComponent
  },
  { 
    path: 'reset-password', 
    component: XFormComponent 
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
