import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  HomePageComponent,
  FooterComponent
} from '@app/components';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    // pathMatch: 'full'
  },
  {
    path: 'test',
    component: FooterComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
