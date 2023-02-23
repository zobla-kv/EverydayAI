import { RegisterUser, User } from './User.model';

import { FirebaseConstants } from './Constants';

// customized response, not real one
// TODO: change RegisterUser -> User later
export class FirebaseAuthResponse {
  private _error: FirebaseError | null;

  constructor(
    private _user: RegisterUser | null | any,
    errCode: string | null
  ) {

    if (errCode) {
      this._error = {
        error: errCode,
        errorMessage: FirebaseAuthResponse.getMessage(errCode)
      }
    }
  }

  get user() {
    return this._user;
  }

  get error() {
    return this._error;
  }

  // auth/email-already-in-use -> email-already-in-use
  public static formatError(error: string): string {
    return error.split('/')[1];
  }

  // updates messages that aren't fit to be displayed on front end
  // TODO: remove auth/ and formatError?
  public static getMessage(key: string): string {
    return responseMessages[key];
  }

}

const responseMessages: messageObject = {
  [FirebaseConstants.REGISTRATION_SUCCESSFUL]:
  'Registration succcessful. Verification mail is sent to your email address.',
  [FirebaseConstants.REGISTRATION_WRITE_FAILED]:
  'Registration failed. Please try again.',
  [FirebaseConstants.REGISTRATION_VERIFICATION_EMAIL_FAILED]:
  'Failed to send verification email. Resend by clicking below button.',
  [FirebaseConstants.REGISTRATION_EMAIL_ALREADY_USED]:
  'The email address is already in use by another account',
  [FirebaseConstants.LOGIN_USER_NOT_FOUND]:
  'User does not exist',
  [FirebaseConstants.LOGIN_WRONG_PASSWORD]:
  'Password incorrect',
  [FirebaseConstants.LOGIN_TOO_MANY_REQUESTS]:
  `Access to this account has been temporarily disabled due to many failed login attempts.
  You can immediately restore it by resetting your password or you can try again later`,
  [FirebaseConstants.LOGIN_EMAIL_NOT_VERIFIED]:
  'Email not verified. Please verify your email before loggin in',
  [FirebaseConstants.INVALID_CODE]:
  'Invalid code. This can happen if the code is malformed, expired, or has already been used. Please request a new one.'
}

export interface FirebaseError {
  error: string;
  errorMessage: string;
}

type messageObject = {
  [key: string]: string
}

export interface Email {
  email: string;
  email_type: EmailType;
}

export enum EmailType {
  ACTIVATION = 'activation',
  RESET_PASSWORD = 'reset password'
}
