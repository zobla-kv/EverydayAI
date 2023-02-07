import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http";

// TODO: remove gridlist
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// *************  firebase ******************* //
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
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
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// import * as firebaseConfig from '../../firebase.json';

// ****************************************** //

import { AppRoutingModule } from './app-routing.module';

import {
  AppComponent,
  HeaderComponent,
  FooterComponent,
  HomePageComponent,
  CategorySelectorComponent,
  ProductPageComponent,
  FormComponent
} from '@app/components';

import {
  HighlightDirective
} from '@app/directives';
import { InformationComponent } from './components/information/information.component';

@NgModule({
  declarations: [
    // Components
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    CategorySelectorComponent,
    ProductPageComponent,
    FormComponent,
    InformationComponent,

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
    MatIconModule,
    MatProgressSpinnerModule,

    // firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ],
  providers: [{ provide: FIREBASE_OPTIONS, useValue: firebaseConfig }],
  bootstrap: [AppComponent]
})
export class AppModule { }
