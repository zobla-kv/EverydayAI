import { Injectable } from '@angular/core';

// service for accessing previous and current route
@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {

  private _previousUrl: string | null = null;

  public setPreviousUrl(url: string | null): void {
    this._previousUrl = url;
  }

  public getPreviousUrl(): string | null {
   return this._previousUrl;
  }
}
