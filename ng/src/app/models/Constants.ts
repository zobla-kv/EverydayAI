export class AppConstants {

}

// TODO: remove auth/ ?
export class FirebaseConstants {

  static REGISTRATION_SUCCESSFUL = 'registration-successful';
  static REGISTRATION_WRITE_FAILED = 'registration-write-failed'
  static REGISTRATION_VERIFICATION_EMAIL_FAILED = 'verification-email-sending-failed';
  static REGISTRATION_EMAIL_ALREADY_USED = 'email-already-in-use';

  static LOGIN_USER_NOT_FOUND = 'user-not-found';
  static LOGIN_WRONG_PASSWORD = 'wrong-password';
  static LOGIN_TOO_MANY_REQUESTS = 'too-many-requests';
}
