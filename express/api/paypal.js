const paypalRouter = require('express').Router();
const paymentService = require('../services/paypalService');
const validators = require('../middleware/validators');

paypalRouter.post('/create-order', [validators.userId, validators.cartItems], async (req, res) => {
  const userId = req.body.userId;
  const cartItems = req.body.cartItems;

  console.log('create order endpoint')
  console.log('userId: ', userId)
  console.log('cartItems: ', cartItems)

  try {
    const orderId = await paymentService.createOrder(userId, cartItems);
    res.status(201).json({ orderId });
  }
  catch (err) {
    console.log('endpoint err: ', err);
    res.status(500).json({ message: err.message });
  }
});

paypalRouter.post('/capture-order', [validators.userId, validators.orderId, validators.cartItems], async (req, res) => {
  const userId = req.body.userId;
  const orderId = req.body.orderId;
  const cartItems = req.body.cartItems;

  try {
    await paymentService.captureOrder(userId, orderId, cartItems);
    res.sendStatus(200);
  }
  catch (err) {
    res.sendStatus(500);
  }
});


module.exports = paypalRouter;
