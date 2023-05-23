export class AppConstants {
  static STORAGE_USER_KEY = 'user_hash';
  static STORAGE_USER_VALUE = 'cdf5a81aef0796bcb17d68d58436c4cc';
  static STORAGE_NUM_OF_ITEMS_IN_CART_KEY = 'xAgketmaT';
}

// TODO: remove auth/ ?
export class FirebaseConstants {

  /* firebase responses */
  static REGISTRATION_EMAIL_ALREADY_USED = 'auth/email-already-in-use';
  static LOGIN_WRONG_PASSWORD = 'auth/wrong-password'
  static LOGIN_USER_NOT_FOUND = 'auth/user-not-found';
  static LOGIN_TOO_MANY_REQUESTS = 'auth/too-many-requests';
  static EMAIL_VERIFY_INVALID_CODE = 'auth/invalid-action-code'
  
  /* custom responses */
  static REGISTRATION_SUCCESSFUL = 'registration-successful';
  static REGISTRATION_FAILED = 'verification-email-sending-failed';
  static LOGIN_WRONG_CREDENTIALS = 'wrong-credentials';
  static LOGIN_EMAIL_NOT_VERIFIED = 'email-not-verified'

}

// constants used for toast
export class ToastConstants {

  static TYPE = {
    SUCCESS: { type: 'success', cssClass: 'snackbar-success' },
    ERROR: { type: 'error', cssClass: 'snackbar-error' }
  }

  static MESSAGES = {
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
    ADDED_TO_CART: 'Product added to cart succesfuly.',
    REMOVED_FROM_CART: 'Product removed from cart succesfuly.',
    CANNOT_OPEN_PAGE: 'Failed to open page.'
  }
  
}
