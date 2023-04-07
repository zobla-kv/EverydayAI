import { Component, ViewEncapsulation } from '@angular/core';
import { animate, group, query, state, style, transition, trigger, AnimationEvent } from '@angular/animations';
import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { first } from 'rxjs';

import {
  IconService,
  AuthService,
  UtilService
} from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
  trigger('appLoadSpinner', [
    state('true', style({ 'opacity': '0' })),
  ])
]
})
export class AppComponent {
  // app title
  title = 'house-of-dogs';

  // is first visit
  isFirstVisit = this._utilService.isFirstVisit();

  // run preload animation?
  runPreloadAnimation = false;

  // is preload animation done
  isPreloadAnimationDone = false;

  constructor(
    private _iconService: IconService,
    private _fireAuth: AngularFireAuth,
    private _authService: AuthService,
    private _utilService: UtilService,
  ) {
    this._iconService.addCustomIcons();

    // auth coming from firebase
    this._fireAuth.onAuthStateChanged(user => {
      user ? this._authService.setUser(<User>user) : this._authService.setUser(null);
    });
    
    // custom user set
    // for now this is only deteremining factor for app load
    this._authService.userState$.pipe(first()).subscribe(user => {
      if (this.isFirstVisit) {
        setTimeout(() => this.runPreloadAnimation = true, 2000);
        return;
      }
      this._utilService.appLoaded();
    })

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
