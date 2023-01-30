import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http";

import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';

import {
  AppComponent,
  HeaderComponent,
  FooterComponent,
  SpinnerComponent,
  HomePageComponent,
  CategorySelectorComponent,
  ProductPageComponent,
  FormComponent
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
    CategorySelectorComponent,
    ProductPageComponent,
    FormComponent,

    // Directives
    HighlightDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // material
    MatGridListModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
