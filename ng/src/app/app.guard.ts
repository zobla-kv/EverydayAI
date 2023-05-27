import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';

import {
  AuthService,
  ToastService
} from '@app/services';

import { 
  ToastConstants 
} from '@app/models';


// block route if user is logged OUT
@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _toast: ToastService
  ) { }

  // can be executed both sync and async
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this._authService.userState$
    .pipe(
      map(user => {
        if (user) {
          return true;
        }
        this._router.navigate(['/']);
        // TODO: remove this?
        this._toast.open(ToastConstants.MESSAGES.CANNOT_OPEN_PAGE, ToastConstants.TYPE.ERROR.type);
        return false;
      })

    );
  }  

}


// block route if user is logged IN
@Injectable({
  providedIn: 'root'
})
export class LogoutGuard implements CanActivate {

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _toast: ToastService
  ) { }

  // can be executed both sync and async
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this._authService.userState$
    .pipe(
      map(user => {
        if (user) {
          this._router.navigate(['/']);
        // TODO: remove this?
          this._toast.open(ToastConstants.MESSAGES.CANNOT_OPEN_PAGE, ToastConstants.TYPE.ERROR.type);
          return false;
        }
        return true;
      })

    );
  }    

}
