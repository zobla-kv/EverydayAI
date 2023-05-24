import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { ToastConstants } from '../models/Constants';

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
  // block route if user is logged IN
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const isLoadedFromAnotherRoute = Boolean(this._router.getCurrentNavigation()?.previousNavigation);
    if (isLoadedFromAnotherRoute) {
      return this._authService.getUser() ? this._router.navigate(['/']) : true;
    }

    return this._authService.userState$
    .pipe(
      map(user => {
        if (user) {
          this._router.navigate(['/']);
          this._toast.open(ToastConstants.MESSAGES.CANNOT_OPEN_PAGE, ToastConstants.TYPE.ERROR.type);
          return false;
        }
        return true;
      })
    );

  }
    
}
