import { RegisterUser, User } from './User.model';

// customized response, not real one
// TODO: change RegisterUser -> User later
export class FirebaseAuthResponse {
  private _error: FirebaseError | null;

  constructor(
    private _user: RegisterUser | null,
    errCode: string | null
  ) {

    if (errCode) {
      this._error = {
        error: errCode.includes('/') ? this.formatError(errCode) : errCode,
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
  private formatError(error: string): string {
    return error.split('/')[1];
  }

  // updates messages that aren't fit to be displayed on front end
  // TODO: remove auth/ and formatError?
  public static getMessage(key: string): string {
    return responseMessages[key];
  }

}

const responseMessages: messageObject = {
  'registration-successful': 'Registration succcessful. Verification mail is sent to your email address.',
  'registration-write-failed': 'Registration failed. Please try again.',
  'verification-email-sending-failed': 'Failed to send verification email. Resend by clicking below button.',
  'auth/email-already-in-use': 'The email address is already in use by another account',
  'auth/user-not-found': 'User does not exist',
  'auth/wrong-password': 'Password incorrect',
  'auth/too-many-requests': `Access to this account has been temporarily disabled due to many failed login attempts.
                             You can immediately restore it by resetting your password or you can try again later`
}

export interface FirebaseError {
  error: string;
  errorMessage: string;
}

type messageObject = {
  [key: string]: string
}
