import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http";
import { DecimalPipe } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';

// *************  firebase ******************* //
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
// ****************************************** //

import { AppRoutingModule } from './app-routing.module';

import { environment } from '@app/environment';

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
  ToastComponent,
  CPanelComponent,
  ModalComponent
} from '@app/components';

import {
  ObserveVisibilityDirective,
  DelayedHoverDirective
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
    CPanelComponent,
    ModalComponent,

    // Directives
    ObserveVisibilityDirective,
    DelayedHoverDirective
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
    MatTableModule,
    MatDialogModule,

    // firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore())
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    // NOTE: position for mobile set in css
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 2500
      }
    },
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
