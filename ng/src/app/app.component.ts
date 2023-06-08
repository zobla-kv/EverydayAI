import { Component, ViewEncapsulation } from '@angular/core';
import { animate, group, query, state, style, transition, trigger, AnimationEvent } from '@angular/animations';

import { first } from 'rxjs';

import {
  IconService,
  AuthService,
  UtilService,
  FirebaseService
} from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // svg inside mat-icon does not have css selector for encapsulation added
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('appLoad', [
    state('true', style({ 'transform': 'translateY(-100vh)' })),
    transition('false => true', [
      group([ 
        query(':self', [ animate('420ms 500ms', style({ 'transform': 'translateY(-100vh)' }))]),
        query('mat-spinner', [ animate('500ms ease-in-out', style({ 'opacity': '0' }))])
      ])
    ]),
  ]),
  trigger('liftOnHeaderCollapse', [
    state('false', style({
      'transform': 'translateY(0px)'
    })),
    state('true', style({
      'transform': 'translateY(-25px)'
    })),
    transition('false <=> true', animate(300))
  ])
]
})
export class AppComponent {

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // run preload animation?
  runPreloadAnimation = false;

  // is preload animation done
  isPreloadAnimationDone = false;

  // follow header animation
  liftPage = true;

  constructor(
    private _iconService: IconService,
    private _authService: AuthService,
    private _utilService: UtilService,
    private _firebaseService: FirebaseService
  ) {
    this._iconService.addCustomIcons();
    
    // custom user set
    // for now this is only deteremining factor for app load
    this._authService.userState$.pipe(first()).subscribe(user => {
      if (this.isFirstVisit) {
        setTimeout(() => this.runPreloadAnimation = true, 2000);
        return;
      }
      this._utilService.appLoaded();

      if (user) {
        // doesn't matter if it succeeded
        this._firebaseService.updateLastActiveTime(user);
      }
    })

    this._utilService.screenSizeChange$.subscribe(size => {
      if (['xl','lg', 'md'].includes(size)) {
        // animate only on larger screens
        this._utilService.scrolledToTop$.subscribe(scrolledToTop => 
          scrolledToTop ? this.animateUp() : this.animateDown()
        );
      } else {
        // clear sub if resize from large to small
        this._utilService.scrolledToTop$.complete();
      }
    });
    
  }

  // methods for following header animation
  animateUp() {
    this.liftPage = true;
  }
  animateDown() {
    this.liftPage = false;
  }

  // app loaded and preloader animation started
  handleLoadAnimationStarted(event: AnimationEvent) {
    if (event.toState == '1') {
      this._utilService.appLoaded();
    }
  }

  // app loaded and preloader animation done
  handleLoadAnimationDone(event: AnimationEvent) {
    // NOTE: lift up determines load finish, be careful to make this last animation
    // event.toState == 'true' not working ??
    if (event.toState == '1') {
      this.isPreloadAnimationDone = true;
      this._utilService.appLoadedAnimationComplete$.next();
    }
  }

}
