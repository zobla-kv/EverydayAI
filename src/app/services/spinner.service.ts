import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  spinner$ = new Subject<null>();

  constructor() { }

  startSpinner() {
    this.spinner$.next(null);
  }
}
