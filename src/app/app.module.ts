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
  SpinnerComponent
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

    // Directives
    HighlightDirective

    // Services
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
