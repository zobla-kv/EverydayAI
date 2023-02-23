import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';


/**
 * Unrelated utility methods.
 *
 *
 */
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  // log/reg buttons
  authButtonClick$ = new Subject<string>();

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) { }

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

}
