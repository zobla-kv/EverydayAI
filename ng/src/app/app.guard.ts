import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, first, map } from 'rxjs';

import {
  AuthService
} from '@app/services';


// block route if user is logged OUT
@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  // can be executed both sync and async
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this._authService.userState$
    .pipe(
      first(),
      map(user => {
        if (user) {
          return true;
        }
        this._router.navigate(['/']);
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
    private _router: Router
  ) { }

  // can be executed both sync and async
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this._authService.userState$
    .pipe(
      first(),
      map(user => {
        if (user) {
          this._router.navigate(['/']);
          return false;
        }
        return true;
      })

    );
  }    

}

// block non admin
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  // can be executed both sync and async
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this._authService.userState$
    .pipe(
      first(),
      map(user => {
        if (user && user.role === 'admin') {
          return true;
        }
        this._router.navigate(['/']);
        return false;
      })
    );
  }   
}
