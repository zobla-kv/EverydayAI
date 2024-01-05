import { FirebaseConstants } from './Constants';

// customized response, not real one
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
    return message ? message : 'Something went wrong. Please try again.';
  }

}

const responseMessages: messageObject = {
  [FirebaseConstants.REGISTRATION_SUCCESSFUL]:
  'Registration succcessful. Verification mail is sent to your email address.',
  [FirebaseConstants.REGISTRATION_FAILED]:
  'Something went wrong. Please try again.',
  [FirebaseConstants.REGISTRATION_EMAIL_ALREADY_USED]:
  'The email address is already in use by another account',
  [FirebaseConstants.LOGIN_USER_NOT_FOUND]:
  'User does not exist',
  [FirebaseConstants.LOGIN_WRONG_CREDENTIALS]:
  'Wrong credentials',
  [FirebaseConstants.LOGIN_INVALID_CREDENTIALS]:
  'Wrong credentials',
  [FirebaseConstants.LOGIN_TOO_MANY_REQUESTS]:
  `Access to this account has been temporarily disabled due to many failed login attempts.
  You can immediately restore it by resetting your password or you can try again later.`,
  [FirebaseConstants.LOGIN_EMAIL_NOT_VERIFIED]:
  'Email not verified. Please verify your email before loggin in',
  [FirebaseConstants.EMAIL_VERIFY_INVALID_CODE]:
  'Invalid code. This can happen if the code is malformed, expired, or has already been used. Please request a new one.',
  [FirebaseConstants.EMAIL_CODE_EXPIRED]:
  'Code expired. Please request new one.'
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

// SCENARIOS THAT ARE TESTED WITH AUTH
// description: is it working?

/* scenarion 1:

  register with express OFF: OK

*/
/* scenarion 2:

  register with express ON: OK

*/
/* scenarion 3:

  register with existing user: OK

*/
/* scenarion 4:

  login with express OFF: N/A - Express not used for this

*/
/* scenarion 5:

  login with wrong password or email: OK

*/
/* scenarion 6:

  login with unverified email: OK

*/
/* scenarion 7:

  email verification: OK

*/
/* scenarion 8:

  login after email verification: OK

*/
/* scenarion 8:

  reset password unexisting user: OK

*/
/* scenarion 10:

  reset password express OFF: OK

*/
/* scenarion 11:

  reset password express ON: OK (whole process)

*/
/* scenarion 12:

  use already existing email verification code: OK

*/
/* scenarion 13:

  use already existing password reset code: OK

*/

// email verification after it is already been verified: allowed (doesn't cause any damage)
