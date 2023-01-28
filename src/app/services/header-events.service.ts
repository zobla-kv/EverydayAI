import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderEventsService {

  // log/reg buttons
  authButton$ = new Subject<string>();

  constructor() { }

  fireAuthButtonClicked(type: string) {
    this.authButton$.next(type);
  }
}
