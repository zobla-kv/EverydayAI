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
  FirebaseError,
  Labels
} from '@app/models';

/**
 * Used to handle email verification and password reset
 * landing from email
 *
 */
@Component({
  selector: 'app-auth-verify',
  templateUrl: './auth-verify.component.html',
  styleUrls: ['./auth-verify.component.scss']
})
export class AuthVerify implements OnInit {

  message: string = '';

  // for firebase functionality (email verification etc.)
  mode: string;

  // firebase validation code
  actionCode: string;

  // enctypted email
  encryptedEmail: string;

  // user email
  email: string;

  // show resend button
  showResendButton = false;

  // show button spinner
  showSpinner = false;

  constructor(
    private _utilService: UtilService,
    private _router: Router,
    private _httpService: HttpService
  ) {}

  async ngOnInit() {
    
    if (!this.validateUrlParams()) {
      // block route if params are missing
      this._router.navigate(['']);
      return;
    }

    if (this.mode !== 'info') {
      this.message = 'Verifying...';
      this.showSpinner = true;
      const isDecrypted = await this.decryptEmail();
      if (!isDecrypted) {
        this.message = Labels.SOMETHING_WENT_WRONG;
        this.showSpinner = false;
        return;
      }
    }
  
    await this.handleMode(this.mode);
    this.showSpinner = false;
  }
  
  // validate existence of 'mode', 'code' and 'type'
  validateUrlParams(): boolean {
    const mode = this._utilService.getParamFromUrl('mode');
    if (mode === 'info') {
      this.mode = mode;
      return true;
    }
    const encryptedEmail = this._utilService.getParamFromUrl('type');
    const code = this._utilService.getParamFromUrl('code');
    if (!mode || !encryptedEmail || !code) {
      return false;
    }
    this.mode = mode;
    this.encryptedEmail = encryptedEmail;
    this.actionCode = code;
    return true;
  }

  // handle different modes
  async handleMode(mode: string) {
    switch(mode) {
      case 'verifyEmail':
        return this.handleEmailVerificationLink();
      case 'resetPassword':
        return this.handlePasswordResetLink();
      case 'info':
        this.message = window.history.state.message;
        return;
      default:
        this.message = 'Invalid mode.';
    }
  }

  // read verification code and verify email
  handleEmailVerificationLink() {
    // NOTE: possible to send verification email if it is already verified
    applyActionCode(getAuth(), this.actionCode)
    .then(res => {
      this.message = 'Email verified successfuly. Redirecting to login page...'
      setTimeout(() => this._router.navigate(['auth', 'login']), 2000);
    })
    .catch(err => {
      this.message = FirebaseError.getMessage(err.code);
      this.showResendButton = true;
    });
  }

  // read verification code and go to reset form
  handlePasswordResetLink() {
    verifyPasswordResetCode(getAuth(), this.actionCode)
    .then(res => {
      this.message = 'Code verification succesful. Redirecting to password update form...';
      setTimeout(() => this._router.navigate(['reset-password'], { state: { phase: 2, code: this.actionCode }}), 2000);
    })
    .catch(err => {
      // auth/invalid-code
      this.message = FirebaseError.getMessage(err.code);
      this.showResendButton = true;
    });
  }

  // sends new code to email
  async handleResendCode() {
    this.showSpinner = true;
    this.message = 'Sending email...';

    const isSent = await this._httpService.sendEmail({ 
      email: this.email, 
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

  // decrypt email and set as property
  async decryptEmail(): Promise<boolean> {
    return this._httpService.getPrivateKey()
    .then(key => {
      const bytes = CryptoJS.AES.decrypt(this.encryptedEmail, key);
      const decryptedEmail = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedEmail) {
        // if altered
        throw new Error('');
      }
      this.email = decryptedEmail;
      return true;
    })
    .catch(err => false);
  }

}
