export class AppConstants {
  static STORAGE_USER_KEY = 'user_hash';
  static STORAGE_USER_VALUE = 'cdf5a81aef0796bcb17d68d58436c4cc';
  static STORAGE_NUM_OF_ITEMS_IN_CART_KEY = 'xAgketmaT';
}

export class Labels {
  static SOMETHING_WENT_WRONG = 'Something went wrong. Please try again.';
  static PASSWORD_RESET_EMAIL_SENT_SUCCESS = 'Email containing password reset link has been sent to your email address.';
  static PASSWORD_RESET_EMAIL_SENT_FAILED = 'Failed to send email containing password reset link. Please try again.';
  static PASSWORD_UPDATED_SUCCESS = 'Password updated succesfully. Redirecting to login page...';
  static PASSWORD_UPDATED_FAILED = 'Failed to update password. Please try again.';
}

export class FirebaseConstants {

  /* firebase responses */
  static REGISTRATION_EMAIL_ALREADY_USED = 'auth/email-already-in-use';
  static LOGIN_WRONG_PASSWORD = 'auth/wrong-password'
  static LOGIN_USER_NOT_FOUND = 'auth/user-not-found';
  static LOGIN_INVALID_CREDENTIALS = 'auth/invalid-login-credentials';
  static LOGIN_TOO_MANY_REQUESTS = 'auth/too-many-requests';
  static EMAIL_VERIFY_INVALID_CODE = 'auth/invalid-action-code'
  static EMAIL_CODE_EXPIRED = 'auth/expired-action-code';

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
    ERROR:   { type: 'error',   cssClass: 'snackbar-error'   }
  }

  static MESSAGES = {
    // general
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
    PRODUCT_ADDED_TO_OWNED_ITEMS: 'Download started and product added to owned items.',

    // cart
    CART_PRODUCT_ADDED: 'Product added to cart succesfuly.',
    CART_PRODUCT_REMOVED: 'Product removed from cart succesfuly.',

    // payment
    PAYMENT_SUCCESSFUL: 'Payment sucessful. Enjoy your new prints',
    // TODO: add more descriptive message (wrong cvv or something)
    PAYMENT_FAILED: 'Something went wrong with payment. Please try again',

    // control panel
    CPANEL_PRODUCT_ADDED: 'New product added successfuly',
    CPANEL_PRODUCT_UPDATED: 'Product updated successfuly',
    CPANEL_PRODUCT_REMOVED: 'Product removed successfuly',

    // product list
    PRODUCT_FILTER_SPAM: 'Please wait for the current operation to finish.',
    PRODUCT_FAILED_TO_LOAD_DETAILS: 'Failed to load product details.',
    PRODUCT_FAILED_TO_LOAD_PAGINATION: 'Failed to load products. Please try again.',
    PRODUCT_DOWNLOAD_FAILED: 'Failed to start a download. Please try again.',
    PRODUCT_NOT_FOUND: 'Product not found.',
    SEARCH_INPUT_VALIDATION_ERROR: 'Use alphanumeric characters only.'
  }

}
