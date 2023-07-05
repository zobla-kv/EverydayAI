import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http";

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs'

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
  ProductPageComponent,
  ProductListComponent,
  ProductItemComponent,
  AuthFormComponent,
  XFormComponent,
  AuthVerify,
  ShoppingCartComponent,
  ToastComponent
} from '@app/components';

import {
  ObserveVisibilityDirective
} from '@app/directives';

@NgModule({
  declarations: [
    // Components
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    ProductPageComponent,
    ProductItemComponent,
    AuthFormComponent,
    XFormComponent,
    AuthVerify,
    ToastComponent,
    ShoppingCartComponent,
    ProductListComponent,

    // Directives
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
    MatSnackBarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatTabsModule,

    // firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: firebaseConfig },
    // NOTE: position for mobile set in css
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 2500
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
