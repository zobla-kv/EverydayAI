import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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
    private _router: Router
  ) { }

  fireAuthButtonClicked(type: string) {
    this.authButtonClick$.next(type);
  }

  navigateToInformationComponent(message: string) {
    this._router.navigate(['auth', 'verify'], { state: { message } });
  }
}
