import { FirebaseConstants } from './Constants';

// customized response, not real one
// TODO: change RegisterUser -> User later
export class FirebaseError {

  private _errorCode: string;
  private _errorMessage: string;

  constructor(errCode: string) {
    this._errorCode = errCode,
    this._errorMessage = FirebaseError.getMessage(errCode)
  }

  get errorCode() {
    return this._errorCode;
  }

  get errorMessage() {
    return this._errorMessage;
  }

  // updates messages that aren't fit to be displayed on front end
  public static getMessage(key: string): string {
    const message = responseMessages[key];
    console.log('message: ', message);
    // TODO: failure is sent to information component after register CHECK IT !!
    return message ? message : 'Something went wrong. Please try again.';
  }

}

const responseMessages: messageObject = {
  [FirebaseConstants.REGISTRATION_SUCCESSFUL]:
  'Registration succcessful. Verification mail is sent to your email address.',
  [FirebaseConstants.REGISTRATION_FAILED]:
  'Registration failed. Please try again.',
  [FirebaseConstants.REGISTRATION_EMAIL_ALREADY_USED]:
  'The email address is already in use by another account',
  [FirebaseConstants.LOGIN_USER_NOT_FOUND]:
  'User does not exist',
  [FirebaseConstants.LOGIN_WRONG_CREDENTIALS]:
  'Wrong credentials',
  [FirebaseConstants.LOGIN_TOO_MANY_REQUESTS]:
  `Access to this account has been temporarily disabled due to many failed login attempts.
  You can immediately restore it by resetting your password or you can try again later.`,
  [FirebaseConstants.LOGIN_EMAIL_NOT_VERIFIED]:
  'Email not verified. Please verify your email before loggin in',
  [FirebaseConstants.EMAIL_VERIFY_INVALID_CODE]:
  'Invalid code. This can happen if the code is malformed, expired, or has already been used. Please request a new one.'
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
