import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

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

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _toast: ToastService
  ) { }

/**
* Handle all stuff needed after app has loaded
*
* @returns void
*/
appLoaded(): void {
  !sessionStorage.getItem('new_session') && sessionStorage.setItem('new_session', 'true');
  this.appLoaded$.next();
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
    this._router.navigate(['auth', 'verify'], { state: { message } });
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
  * Is user first visit in browser session
  * used to track if animation should be triggered etc.
  *
  * @return boolean
  */
   isFirstVisit(): boolean {
    let isFirstVisit = true;
    if (sessionStorage.getItem('new_session')) {
      isFirstVisit = false;
    }
    return isFirstVisit;
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
  * Shows 'Something went wrong. Please try again.' toast message.
  *
  * @param object 
  * @returns void
  */
  showDefaultErrorToast(): void {
    this._toast.open(ToastConstants.MESSAGES.SOMETHING_WENT_WRONG, ToastConstants.TYPE.ERROR.type);
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

}
