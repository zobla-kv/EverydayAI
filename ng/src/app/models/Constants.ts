export class AppConstants {
  // TODO: unused
  static STORAGE_USER_KEY = 'user_hash';
  static STORAGE_USER_VALUE = 'cdf5a81aef0796bcb17d68d58436c4cc';
}

// TODO: remove auth/ ?
export class FirebaseConstants {

  static REGISTRATION_SUCCESSFUL = 'registration-successful';
  static REGISTRATION_WRITE_FAILED = 'registration-write-failed'
  static REGISTRATION_VERIFICATION_EMAIL_FAILED = 'verification-email-sending-failed';
  static REGISTRATION_EMAIL_ALREADY_USED = 'email-already-in-use';

  static LOGIN_WRONG_CREDENTIALS = 'wrong-credentials';
  static LOGIN_TOO_MANY_REQUESTS = 'too-many-requests';
  static LOGIN_EMAIL_NOT_VERIFIED = 'email-not-verified'

  static USER_NOT_FOUND = 'user-not-found';

  static INVALID_CODE = 'invalid-action-code'
}
