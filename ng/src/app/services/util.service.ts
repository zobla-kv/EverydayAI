import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { ReplaySubject, Subject } from 'rxjs';

import { User as FirebaseUser } from '@angular/fire/auth';

import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';

import {
  ToastConstants
} from '@app/models';

import { 
  ToastService 
} from './toast.service';


/**
 * Unrelated utility methods.
 *
 *
 */
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  // app load complete and preload animation started
  appLoaded$ = new Subject<void>();

  // preload animation done
  appLoadedAnimationComplete$ = new Subject<void>();

  // log/reg buttons
  authButtonClick$ = new Subject<string>();

  // scrolled to top of the page
  scrolledToTop$ = new Subject<boolean>();

  // screen size
  screenSizeChange$ = new ReplaySubject<string>();

  // screen size map
  screenSizeMap = new Map([
    [Breakpoints.XSmall, 'xs'],
    [Breakpoints.Small,  'sm'],
    [Breakpoints.Medium, 'md'],
    [Breakpoints.Large,  'lg'],
    [Breakpoints.XLarge, 'xl'],
  ]);

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _toast: ToastService,
    private _bo: BreakpointObserver
  ) { 

    this._bo.observe([
      Breakpoints.XLarge, 
      Breakpoints.Large, 
      Breakpoints.Medium, 
      Breakpoints.Small, 
      Breakpoints.XSmall
    ])
    .subscribe((bs: BreakpointState) => {
      for (const query of Object.keys(bs.breakpoints)) {
        if (bs.breakpoints[query]) {
          const size = this.screenSizeMap.get(query) ?? 'Unknown';
          this.screenSizeChange$.next(size)
        }
      }
    })
  }

/**
  * Handle all stuff needed after app has loaded
  *
  * @returns void
  */
  appLoaded(): void {
    document.cookie = 'new_session';
    this.appLoaded$.next();
  }

/**
  * Is user first visit in browser session
  * used to track if animation should be triggered etc.
  *
  * @return boolean
  */
  isFirstVisit(): boolean {
    let isFirstVisit = true;
    if (document.cookie.includes('new_session')) {
      isFirstVisit = false;
    }
    return isFirstVisit;
  }

/**
  * Emit auth button clicked event
  *
  * @param type string - login/register
  * @returns void
  */
  fireAuthButtonClicked(type: string): void {
    this.authButtonClick$.next(type);
  }

/**
  * Navigates to information component
  * and display passed message
  * no mode trigger for now
  *
  * @param message string
  * @returns void
  */
  navigateToInformationComponent(message: string): void {
    this._router.navigate(['auth', 'verify'], { state: { message }, queryParams: { mode: 'info' } });
  }

/**
  * Gets parameter value from url
  *
  * @param param string
  * @returns string | null
  */
  getParamFromUrl(param: string): string | null {
    let paramValue = null;
    paramValue = this._route.snapshot.queryParamMap.get(param);
    return paramValue;
  }

/**
  * Gets items in range from an array 
  * includes last from range (to)
  *
  * @param message string
  * @returns void
  */
  getFromRange(array: any[], from: number, to: number): any[] {
    // to + 1 because slice doesn't include last
    return array.slice(from, to + 1);
  }

/**
  * Returns deep copy of an object.
  *
  * @param object 
  * @returns object
  */
  getDeepCopy(object: any): any {
    return JSON.parse(JSON.stringify(object));
  }
  

/**
  * Returns value of css style without 'px'.
  *
  * @param object 
  * @returns object
  */
  getStyleValueWithoutPx(value: string): number {
    return parseInt(value.replace(/px/,''));
  }

/**
  * Sleep function.
  *
  * @param number - milliseconds 
  * @returns Promise
  */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

/**
  * Move elements in array to the right.
  *
  * @param Array - array
  * @returns Array - shifted array
  */
  rotateArrayToRight(array: Array<any>): Array<any> {
    array.unshift(array.pop());
    return array;
  }

/**
  * Move elements in array to the left.
  *
  * @param Array - array
  * @returns Array - shifted array
  */
  rotateArrayToLeft(array: Array<any>): Array<any> {
    array.push(array.shift());
    return array;
  }

  /**
  * For dealing with firebase default behaviour of loggin in user automatically 
  * on register
  * on login with unverified email
  *
  * @param user - firebase user
  * @returns boolean - should be logged out?
  */
  reverseFirebaseAutoLogin(user: FirebaseUser): boolean {
    if (!user) {
      return false;
    }
    // check if user is logged by registration by checking if less than 10 seconds passed since registration
    const registrationTime = Date.parse(user.metadata.creationTime as string);
    const timeNow = Date.now();
    if ((timeNow - registrationTime) / 1000 < 10) {
      return true;
    }

    // check if user is logged in by login with unverified email
    if (!user.emailVerified) {
      return true;
    }

    return false;
  }

}
