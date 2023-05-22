import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { getAuth, applyActionCode, verifyPasswordResetCode } from '@angular/fire/auth';

import * as CryptoJS from 'crypto-js';

import {
  HttpService,
  UtilService
} from '@app/services';

import { 
  EmailType,
  FirebaseError
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

  // TODO: verification link redirected to login form
  // THIS SHOULD HAPPEN IF CODE IS VERIFIED WELL BUT PRELOADER FROM EMAIl MAKES IT LOOK LIKE A BUG

  message: string = '';

  // for firebase functionality (email verification etc.)
  mode: string | null = null;

  // enctypted email
  encryptedEmail: string | null;

  // user email
  email: string | null;

  // show resend button
  showResendButton = false;

  // show button spinner
  showSpinner = false;

  constructor(
    private _utilService: UtilService,
    private _router: Router,
    private _http: HttpService
  ) {}

  // TODO: block /verify route
  ngOnInit() {
    const message = window.history.state.message;
    message && (this.message = message);

    this.mode = this._utilService.getParamFromUrl('mode');
    if (this.mode) {
      this.handleMode(this.mode)
    }

    this.encryptedEmail = this._utilService.getParamFromUrl('type');

  }

  handleMode(mode: string) {
    switch(mode) {
      case 'verifyEmail':
        return this.handleEmailVerificationLink();
      case 'resetPassword':
        return this.handlePasswordResetLink();
      default:
        this.message = 'Invalid mode.';
    }
  }

  // read verification code and verify email
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
      this.message = FirebaseError.getMessage(err.code);
      this.showResendButton = true;
    })
  }

  // read verification code and go to reset form
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
      this.message = FirebaseError.getMessage(err.code);
      this.showResendButton = true;
    })
  }

  // sends new code to email
  async handleResendCode() {
    this.showSpinner = true;
    this.message = 'Sending email...';

    const email = await this.getDecryptedEmail();
    if (!email) {
      this.handleResendCodeFailed();
      return;
    };

    const isSent = await this._http.sendEmail({ 
      email, 
      email_type: this.mode === 'verifyEmail' ? EmailType.ACTIVATION : EmailType.RESET_PASSWORD 
    });

    if (!isSent) {
      this.handleResendCodeFailed();
      return;
    };

    this.handleResendCodeSucceded();
  }

  // actions after resend code was send succesfully to email
  handleResendCodeSucceded() {
    this.showResendButton = false;
    this.showSpinner = false;
    this.message = 'Email sent succesfully.'
  }
  // actions after resend code failed to be sent to email
  handleResendCodeFailed() {
    this.showSpinner = false;
    this.message = 'Failed to send email. Please try again.'
  }

  // gets key and decrypts email
  async getDecryptedEmail() {
    return this._http.getPrivateKey()
    .then(key => {
      const bytes  = CryptoJS.AES.decrypt(this.encryptedEmail as string, key);
      const decryptedEmail = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedEmail;
    })
    .catch(err => err);
  }

}
