import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatGridListModule } from '@angular/material/grid-list';

import { AppRoutingModule } from './app-routing.module';

import {
  AppComponent,
  HeaderComponent,
  FooterComponent,
  SpinnerComponent,
  HomePageComponent,
  NavigationComponent
} from '@app/components';

import {
  HighlightDirective
} from '@app/directives';

@NgModule({
  declarations: [
    // Components
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SpinnerComponent,
    HomePageComponent,
    NavigationComponent,

    // Directives
    HighlightDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,

    // material
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
