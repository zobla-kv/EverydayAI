import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomePageComponent,
  ProductPageComponent,
  AuthFormComponent,
  AuthVerify,
  XFormComponent,
  ShoppingCartComponent,
  CPanelComponent,
  ProductDetailsComponent,
  HomePageNewComponent,
  GenerateImageComponent
} from '@app/components';

import {
  LoginGuard,
  LogoutGuard,
  AdminGuard
} from './app.guard';

const routes: Routes = [
  // {
  //   path: '',
  //   title: 'Best AI images',
  //   component: HomePageComponent
  // },
  {
    path: '',
    title: 'Generate custom wallpaper images with AI, instantly',
    component: HomePageNewComponent
  },
  {
    path: 'generate',
    title: 'AI Wallpaper Generator',
    component: GenerateImageComponent
  },
  {
    path: 'images',
    component: ProductPageComponent,
    children: [
      { path: ':id', component: ProductDetailsComponent }
    ]
  },
  {
    path: 'auth',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login',    component: AuthFormComponent, canActivate: [LogoutGuard], title: 'Login'    },
      { path: 'register', component: AuthFormComponent, canActivate: [LogoutGuard], title: 'Register' },
      { path: 'verify',   component: AuthVerify, title: 'Verify' }
    ],
  },
  {
    path: 'reset-password',
    title: 'Reset password',
    component: XFormComponent,
    canActivate: [LogoutGuard]
  },
  {
    path: 'cart',
    title: 'Cart',
    component: ShoppingCartComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'control-panel',
    title: 'Control panel',
    component: CPanelComponent,
    canActivate: [AdminGuard]
  },
  // TODO: 404
  {
    path: '**',
    redirectTo: ''
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
