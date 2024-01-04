import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';

// service for accessing previous and current route
@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {

  private _previousUrl: string;

  constructor(private router: Router) {

  this.router.events
    .pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
    .subscribe((events: RoutesRecognized[]) => {
      this._previousUrl = events[0].urlAfterRedirects;
    });
   }

   public getPreviousUrl() {
    return this._previousUrl;
   }
}
