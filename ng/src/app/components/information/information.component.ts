import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { getAuth, applyActionCode, verifyPasswordResetCode } from '@angular/fire/auth';

import {
  UtilService
} from '@app/services';

import { 
  FirebaseAuthResponse
} from '@app/models';

/**
 * Used to display informational message on empty route
 * message is derived from route params
 * 
 * Another functionality is to land from email links like
 * email verification and password reset
 *
 */
@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  message: string = '';

  // **** for firebase functionality (email verification etc.) **** //
  mode: string | null = null;
  // ************************************************************* //

  constructor(
    private _utilService: UtilService,
    private _router: Router
  ) {}

  // TODO: block /verify route
  ngOnInit(): void {
    const message = window.history.state.message;
    message && (this.message = message);

    this.mode = this._utilService.getParamFromUrl('mode');
    if (this.mode) {
      this.handleMode(this.mode)
    }
  }

  handleMode(mode: string) {
    switch(mode) {
      case 'verifyEmail':
        return this.handleEmailVerificationLink();
      case 'resetPassword':
        return this.handlePasswordResetLink();
      default:
        this.message = 'Invalid mode';
    }
  }

  handleEmailVerificationLink() {
    this.message = 'Verifying email address...'
    const auth = getAuth();
    const actionCode = this._utilService.getParamFromUrl('code') as string;
    applyActionCode(auth, actionCode)
    .then(res => {
      this.message = 'Email verified successfuly. Redirecting to login page...'
      setTimeout(() => this._router.navigate(['auth', 'login']), 2000);
    })
    .catch(err => {
      this.message = FirebaseAuthResponse.getMessage(FirebaseAuthResponse.formatError(err.code));
    })
  }

  handlePasswordResetLink() {
    this.message = 'Verifying code...'
    const auth = getAuth();
    const actionCode = this._utilService.getParamFromUrl('code') as string;
    verifyPasswordResetCode(auth, actionCode)
    .then(res => {
      this.message = 'Code verification succesful. Redirecting to password update form...';
      setTimeout(() => this._router.navigate(['reset-password'], { state: { phase: 2, code: actionCode }}), 2000);
    })
    .catch(err => {
      // auth/invalid-code
      this.message = FirebaseAuthResponse.getMessage(FirebaseAuthResponse.formatError(err.code));
    })
  }
}
