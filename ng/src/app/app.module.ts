import { NgModule, Injector } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// *************  firebase ******************* //
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
// ****************************************** //

import { NgxPageScrollModule } from 'ngx-page-scroll';

import { AppRoutingModule } from './app-routing.module';
import { RouteReuseStrategy } from '@angular/router';
import { ReuseStrategy } from './app-routing.reuse-strategy';

import environment from '@app/environment';

import {
  AppComponent,
  HeaderComponent,
  FooterComponent,
  HomePageComponent,
  ProductPageComponent,
  ProductListComponent,
  ProductFiltersComponent,
  ProductItemComponent,
  AuthFormComponent,
  XFormComponent,
  AuthVerify,
  ShoppingCartComponent,
  ToastComponent,
  CPanelComponent,
  ModalComponent,
  LoadingComponent,
  ProductDetailsComponent,
  ProductPriceComponent,
  StarBackgroundComponent,
  GradientContainerComponent,
  GradientCheckboxComponent
} from '@app/components';

import {
  ObserveVisibilityDirective,
  DelayedHoverDirective,
  InfiniteScrollDirective,
  ScrollSpyDirective
} from '@app/directives';


// doesn't work well with barrel
import { FormatPipe } from './pipes/format.pipe';

@NgModule({
  declarations: [
    // Components
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    ProductPageComponent,
    ProductFiltersComponent,
    ProductItemComponent,
    AuthFormComponent,
    XFormComponent,
    AuthVerify,
    ToastComponent,
    ShoppingCartComponent,
    ProductListComponent,
    CPanelComponent,
    ModalComponent,
    LoadingComponent,
    ProductDetailsComponent,
    ProductPriceComponent,
    StarBackgroundComponent,
    GradientContainerComponent,
    GradientCheckboxComponent,

    // Directives
    ObserveVisibilityDirective,
    DelayedHoverDirective,
    InfiniteScrollDirective,
    ScrollSpyDirective,

    // Pipes
    FormatPipe
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
    MatTableModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,

    // page scroll
    NgxPageScrollModule,

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
    { provide: RouteReuseStrategy, useClass: ReuseStrategy },
    FormatPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private _injector: Injector) {
    ReuseStrategy.injector = this._injector;
  }
}
