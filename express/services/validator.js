// service for validation

// TODO: all services should be classes and single same instance returned on every import

class UserValidator {
  // is alphanumeric?
  static validateUserId = (userId) => typeof userId === 'string' && /^[a-zA-Z0-9]+$/.test(userId);

  // is string[] ?
  static validateCartItems = (cartItems) => Array.isArray(cartItems) && cartItems.every(item => typeof item === 'string');
}

class PaypalValidator {

  // is alphanumeric?
  static validateOrderId = (orderId) => typeof orderId === 'string' && /^[a-zA-Z0-9]+$/.test(orderId);

  // is 'CAPTURE' | 'AUTHORIZE' ?
  static validateIntent = (intent) => {
    let uppercaseIntent = intent.toUpperCase();
    if (uppercaseIntent === 'CAPTURE' || uppercaseIntent === 'AUTHORIZE') {
      return uppercaseIntent;
    }
    return 'CAPTURE';
  }
}

module.exports = {
  UserValidator,
  PaypalValidator
}
