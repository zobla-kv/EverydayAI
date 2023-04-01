import { Component, HostListener } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import {
  IconService,
  AuthService
} from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @HostListener('window:unload')
  unloadHandler() {
    // used for animations prevention after first page visit if new browser session
    // TODO: open app in new tab without closing first will cause animation to run again
    !sessionStorage.getItem('new_session') && sessionStorage.setItem('new_session', 'true');
  }

  title = 'house-of-dogs';

  constructor(
    private _iconService: IconService,
    private _fireAuth: AngularFireAuth,
    private _authService: AuthService
  ) {
    this._iconService.addCustomIcons();

    this._fireAuth.onAuthStateChanged(user => {
      user ? this._authService.setUser(<User>user) : this._authService.setUser(null);
    });
  }

}
