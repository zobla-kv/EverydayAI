import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomePageComponent,
  ProductPageComponent,
  AuthFormComponent,
  AuthVerify,
  XFormComponent,
  ShoppingCartComponent,
  CPanelComponent
} from '@app/components';

import { 
  LoginGuard, 
  LogoutGuard 
} from './app.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'products',
    component: ProductPageComponent
  },
  {
    path: 'auth',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login',    component: AuthFormComponent, canActivate: [LogoutGuard] },
      { path: 'register', component: AuthFormComponent, canActivate: [LogoutGuard] },
      { path: 'verify',   component: AuthVerify }
    ],
  },
  { 
    path: 'reset-password', 
    component: XFormComponent,
    canActivate: [LogoutGuard]
  },
  { 
    path: 'cart', 
    component: ShoppingCartComponent,
    canActivate: [LoginGuard]
  },
  { 
    // TODO: admin guard
    path: 'control-panel', 
    component: CPanelComponent,
    // canActivate: [AdminGuard]
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
