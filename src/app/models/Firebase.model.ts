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
        errorMessage: FirebaseAuthResponse.getErrorMessage(errCode)
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

  // TODO: update to return all kind of messages, not just errors
  // updates messages that aren't fit to be displayed on front end
  // remove auth and formatError
  public static getErrorMessage(error: string): string {
    switch(error) {
      case 'registration-successful':
        return 'Registration succcessful. Verification mail is sent to your email address.'
      case 'registration-write-failed':
        return 'Registration failed. Please try again.'
      case 'verification-email-sending-failed':
        return 'Failed to send verification email. Resend by clicking below button.'
      case 'auth/email-already-in-use':
        return 'The email address is already in use by another account'
      case 'auth/user-not-found':
        return 'User does not exist'
      case 'auth/wrong-password':
        return 'Password incorrect'
      case 'auth/too-many-requests':
        return `Access to this account has been temporarily disabled due to many failed login attempts.
                You can immediately restore it by resetting your password or you can try again later`
      default:
        return error
    }
  }

}

export interface FirebaseError {
  error: string;
  errorMessage: string;
}
