import { Injectable } from '@angular/core';

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

  constructor() { }

  fireAuthButtonClicked(type: string) {
    this.authButtonClick$.next(type);
  }
}
