import { Component, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, first, pairwise } from 'rxjs';

import {
  IconService,
  AuthService,
  UtilService,
  FirebaseService,
  SpinnerService,
  PreviousRouteService,
  StorageService
} from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // svg inside mat-icon does not encapsulated
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // access in template
  get window() { return window; }

  // show large screen size loader?
  showLargePreloader = false;

  // show small screen loader?
  showSmallPreloader = false;

  // preloaderDuration
  preloaderDuration = 5000;

  // is preloader animation done?
  preloaderAnimationDone = false;

  constructor(
    private _router: Router,
    private _iconService: IconService,
    private _authService: AuthService,
    private _utilService: UtilService,
    private _firebaseService: FirebaseService,
    public globalSpinner: SpinnerService,
    private _previousRoute: PreviousRouteService,
    private _storageService: StorageService
  ) {

    // trigger spinner immediately if user came from google auth
    if (this._storageService.getFromSessionStorage(this._storageService.storageKey.GOOGLE_AUTH)) {
      this.globalSpinner.show();
      this._storageService.deleteFromSessionStorage(this._storageService.storageKey.GOOGLE_AUTH);
    }

    this._utilService.screenSizeChange$.pipe(first()).subscribe(size => {
      if (this.isFirstVisit) {
        if (['xs', 'sm'].includes(size)) {
          this.showSmallPreloader = true;
          this.preloaderDuration = 3500;
        } else {
          this.showLargePreloader = true;
          this.preloaderDuration = 5000;
        }
      }
    });

    const preloadAnimationStartTime = Date.now();

    // custom user set - only deteremining factor for app load
    this._authService.userState$.pipe(first()).subscribe(user => {
      const userLoadedTime = Date.now();
      const timeBetween = Math.abs(preloadAnimationStartTime - userLoadedTime);
      if (this.isFirstVisit) {
        this.handlePreloadAnimation(timeBetween);
        return;
      }

      this._utilService.appLoaded();

      if (user) {
        // doesn't matter if it succeeded
        this._firebaseService.updateLastActiveTime(user.id);
      }
    });

    this._iconService.addCustomIcons();

    // for storing previous route
    this._router.events
    .pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      pairwise()
    )
    .subscribe(([prevEvent, currentEvent]) => {
      this._previousRoute.setPreviousUrl(prevEvent.url);
    });
  }

  // handle preload animation done
  handlePreloadAnimation(timeBetween: number) {
    setTimeout(() => {
      this.preloaderAnimationDone = true;
      this._utilService.appLoaded();
    }, this.preloaderDuration - timeBetween + 1000);
  }

  // handle global attach after route change
  onAttach(component: any) {
    // components that should react to router attach event
    if (component['onAttach']) {
      component.onAttach();
    }
  }
  // handle global detach after route change
  onDetach(component: any) {
    // components that should react to router attach event
    if (component['onDetach']) {
      component.onDetach();
    }
  }

}
