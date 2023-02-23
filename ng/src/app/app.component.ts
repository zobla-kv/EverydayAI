import { Component, OnInit, HostListener } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';

import {
  IconService,
  AuthService
} from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @HostListener('window:unload')
  unloadHandler() {
    // used for animations prevention after first page visit it new browser session
    !sessionStorage.getItem('new_session') && sessionStorage.setItem('new_session', 'true');
  }

  title = 'house-of-dogs';

  // user sub
  userSub$: Subscription;

  constructor(
    private _iconService: IconService,
    private _fireAuth: AngularFireAuth,
    private _authService: AuthService
  ) {
    this._iconService.addCustomIcons();

    this.userSub$ = this._fireAuth.authState.subscribe(user => {
      console.log('fire 1')
      user ? this._authService.setUser() : this._authService.removeUser();
    })
  }

  ngOnInit(): void {
    this.userSub$.unsubscribe();
  }

}
