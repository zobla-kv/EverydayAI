import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomePageComponent,
  ProductPageComponent,
  AuthFormComponent,
  InformationComponent,
  XFormComponent,
  ShoppingCartComponent
} from '@app/components';


import { LoginGuardService } from './services/login-guard.service';
import { LogoutGuardService } from './services/logout-guard.service';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    // pathMatch: 'full'
  },
  {
    path: 'products',
    component: ProductPageComponent
  },
  {
    path: 'auth',
    component: AuthFormComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', component: AuthFormComponent },
      { path: 'register', component: AuthFormComponent }
    ],
    canActivate: [LogoutGuardService]
  },
  {
    // TODO: kako da svaki auth/veirfy bude redirected na auth ako nema mode ili neki parametar
    path: 'auth/verify',
    component: InformationComponent,
    canActivate: [LogoutGuardService]
  },
  { 
    path: 'reset-password', 
    component: XFormComponent,
    canActivate: [LogoutGuardService]
  },
  { 
    path: 'cart', 
    component: ShoppingCartComponent,
    canActivate: [LoginGuardService]
  },
  // TODO: 404
  { 
    path: '**', 
    redirectTo: '' 
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
