export class AppConstants {
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

// messages for toast
export class ToastMessages {
  // general
  static SOMETHING_WENT_WRONG = 'Something went wrong. Please try again.';
  static PRODUCT_ADDED_TO_OWNED_ITEMS = 'Download started and image is now owned.';

  // auth
  static AUTH_FAILED = 'Failed to authenticate. Please try again.';

  // cart
  static CART_PRODUCT_ADDED = 'Image added to cart succesfuly.';
  static CART_PRODUCT_REMOVED = 'Image removed from cart succesfuly.';

  // payment
  static PAYMENT_SCRIPT_FAILED_TO_LOAD = 'There is a problem with payment. Please refresh the page.';
  static PAYMENT_PAYMENT_TERMINATED = 'Payment terminated.';
  static PAYMENT_FAILED_TO_INITIALIZE_PAYMENT = 'Failed to initialize payment. Please try again.';
  static PAYMENT_FAILED_TO_PROCESS_PAYMENT = 'Failed to process payment. Please try again.';
  static PAYMENT_SUCCESSFUL = 'Payment sucessful. Enjoy your new image(s)!';

  // control panel
  static CPANEL_PRODUCT_ADDED = 'New product added successfuly.';
  static CPANEL_PRODUCT_UPDATED = 'Product updated successfuly.';
  static CPANEL_PRODUCT_REMOVED = 'Product removed successfuly.';

  // product list
  static PRODUCT_FILTER_SPAM = 'Please wait for the current operation to finish.';
  static PRODUCT_FAILED_TO_LOAD_DETAILS = 'Failed to load image details.';
  static PRODUCT_FAILED_TO_LOAD_PAGINATION = 'Failed to load images. Please try again.';
  static PRODUCT_DOWNLOAD_FAILED = 'Failed to start a download. Please try again.';
  static PRODUCT_NOT_FOUND = 'Image not found.';
  static SEARCH_INPUT_VALIDATION_ERROR = 'Use alphanumeric characters only.';

}
