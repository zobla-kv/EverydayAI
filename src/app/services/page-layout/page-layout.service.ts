import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageLayoutService {

  constructor() {}

  private _currentScreenSize = 'large';
  currentScreenSize$ = new Subject<string>();

  get currentScreenSize() {
    return this._currentScreenSize;
  }

  set currentScreenSize(size: string) {
    this._currentScreenSize = size;
    this.currentScreenSize$.next(this._currentScreenSize);
  }

}
