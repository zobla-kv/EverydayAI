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
        error: this.formatError(errCode),
        errorMessage: this.getErrorMessage(errCode)
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
  private getErrorMessage(error: string): string {
    switch(error) {
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