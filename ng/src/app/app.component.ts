import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription, first } from 'rxjs';
import environment from '@app/environment';

import {
  IconService,
  AuthService,
  UtilService,
  FirebaseService
} from '@app/services';

// this should match scss time
const PRELOAD_ANIMATION_DURATION: { [key: string]: number} = {
  'lg': 6500,
  'xs': 6500
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // svg inside mat-icon does not encapsulated
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnDestroy {

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // access in template
  get window() { return window; }

  // subscibe to screen size change
  screenSizeChangeSub$: Subscription;

  // screen size
  screenSize: string;

  // mobile screen size
  mobileScreenSize = 'xs';

  // is preload animation done?
  preloadAnimationDone = false;

  constructor(
    private _iconService: IconService,
    private _authService: AuthService,
    private _utilService: UtilService,
    private _firebaseService: FirebaseService,
  ) {

    console.log('test for new build')
    console.log('environment: ', environment);
    console.log('api-url: ', environment.API_HOST);

    this.screenSizeChangeSub$ = this._utilService.screenSizeChange$.subscribe(size => this.screenSize = size);


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
        this._firebaseService.updateLastActiveTime(user);
      }
    });

    this._iconService.addCustomIcons();
  }

  // handle preload animation done
  handlePreloadAnimation(timeBetween: number) {
    const screenSize = this.screenSize === 'xs' ? 'xs' : 'lg';
    const animationDuration = PRELOAD_ANIMATION_DURATION[screenSize];
    setTimeout(() => {
      this.preloadAnimationDone = true;
      this._utilService.appLoaded();
    }, animationDuration - timeBetween - 200);
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

  ngOnDestroy() {
    this.screenSizeChangeSub$ && this.screenSizeChangeSub$.unsubscribe();
  }

}
