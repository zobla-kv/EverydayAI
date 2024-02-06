const paypalRouter = require('express').Router();
const paymentService = require('../services/paypalService');
const { UserValidator, PaypalValidator } = require('../services/validator');

paypalRouter.post('/create-order', async (req, res) => {
  const userId = req.body.userId;
  const cartItems = req.body.cartItems;

  try {
    if (!UserValidator.validateUserId(userId) || !UserValidator.validateCartItems(cartItems)) {
      throw new Error('Param validation failed');
    }

    const orderId = await paymentService.createOrder(userId, cartItems);
    res.status(201).json({ orderId });

  } catch (err) {
    // NOTE: same status code 500 returned for validation errors
    console.log('error create order: ', err.message);
    res.status(500).json({ message: err.message });
  }
});

paypalRouter.post('/capture-order', async (req, res) => {
  const userId = req.body.userId;
  const orderId = req.body.orderId;
  const cartItems = req.body.cartItems;

  try {
    if (!UserValidator.validateUserId(userId) || !PaypalValidator.validateOrderId(orderId) || !UserValidator.validateCartItems(cartItems)) {
      throw new Error('Param validation failed');
    }

    await paymentService.captureOrder(userId, orderId, cartItems);
    console.log('sending success response')
    res.status(200).json({ message: 'succeeded'});

  } catch (err) {
    // NOTE: same status code 500 returned for validation errors
    console.log('error capture order response: ', err.message);
    res.status(500).json({ message: 'failed' });
  }
});


module.exports = paypalRouter;
