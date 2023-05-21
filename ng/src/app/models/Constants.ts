export class AppConstants {
  static STORAGE_USER_KEY = 'user_hash';
  static STORAGE_USER_VALUE = 'cdf5a81aef0796bcb17d68d58436c4cc';
  static STORAGE_NUM_OF_ITEMS_IN_CART_KEY = 'xAgketmaT';
}

// TODO: remove auth/ ?
export class FirebaseConstants {

  static REGISTRATION_SUCCESSFUL = 'registration-successful';
  static REGISTRATION_FAILED = 'verification-email-sending-failed';
  static REGISTRATION_EMAIL_ALREADY_USED = 'email-already-in-use';

  static LOGIN_WRONG_CREDENTIALS = 'wrong-credentials';
  static LOGIN_TOO_MANY_REQUESTS = 'too-many-requests';
  static LOGIN_EMAIL_NOT_VERIFIED = 'email-not-verified'

  static USER_NOT_FOUND = 'user-not-found';

  static INVALID_CODE = 'invalid-action-code'
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
