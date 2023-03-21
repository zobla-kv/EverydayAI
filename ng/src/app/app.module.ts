import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http";

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator'

// *************  firebase ******************* //
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
const firebaseConfig = {
  apiKey: "AIzaSyBdBGoR3VvzO59rVahX9oGU5XKNLwAAF2Y",
  authDomain: "house-of-dogs-11bfb.firebaseapp.com",
  projectId: "house-of-dogs-11bfb",
  storageBucket: "house-of-dogs-11bfb.appspot.com",
  messagingSenderId: "829869000499",
  appId: "1:829869000499:web:6669cdd8ebf78446ee6046",
  measurementId: "G-66BZM3SHPN"
}
// ****************************************** //

import { AppRoutingModule } from './app-routing.module';

import {
  AppComponent,
  HeaderComponent,
  FooterComponent,
  HomePageComponent,
  CategorySelectorComponent,
  ProductPageComponent,
  AuthFormComponent,
  XFormComponent,
  InformationComponent,
  ShoppingCartComponent
} from '@app/components';

import {
  HighlightDirective,
  ObserveVisibilityDirective
} from '@app/directives';

@NgModule({
  declarations: [
    // Components
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    CategorySelectorComponent,
    ProductPageComponent,
    AuthFormComponent,
    XFormComponent,
    InformationComponent,
    ShoppingCartComponent,

    // Directives
    HighlightDirective,
    ObserveVisibilityDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // material
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,

    // firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ],
  providers: [{ provide: FIREBASE_OPTIONS, useValue: firebaseConfig }],
  bootstrap: [AppComponent]
})
export class AppModule { }
