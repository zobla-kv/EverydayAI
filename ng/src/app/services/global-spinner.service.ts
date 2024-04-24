import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// global spinner service
@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private spinnerVisibilitySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  spinnerVisibility$ = this.spinnerVisibilitySubject.asObservable();

  show(): void {
    this.spinnerVisibilitySubject.next(true);
  }

  hide(): void {
    this.spinnerVisibilitySubject.next(false);
  }

}
