const firebaseService = require('../services/firebaseService');

const email = (req, res, next) => {
  const email = req.body.email;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validCondition = typeof email === 'string' && regex.test(email);

  if (!validCondition) {
    res.sendStatus(400);
    return;
  }

  next();
};

// This should protect from postman
const emailExists = async (req, res, next) => {
  const email = req.body.email;

  try {
    const querySnapshot = await firebaseService.getUserByEmail(email);
    querySnapshot.empty ? res.sendStatus(400) : next();
  }
  catch (err) {
    res.sendStatus(500);
  }
}

const userId = (req, res, next) => {
  const userId = req.body.userId;
  const validCondition = typeof userId === 'string' && /^[a-zA-Z0-9]+$/.test(userId);

  if (!validCondition) {
    res.sendStatus(400);
    return;
  }

  next();
}

const cartItems = (req, res, next) => {
  const cartItems = req.body.cartItems;
  const validCondition = Array.isArray(cartItems) && cartItems.every(item => typeof item === 'string');

  if (!validCondition) {
    res.sendStatus(400);
    return;
  }

  next();
}

const orderId = (req, res, next) => {
  const orderId = req.body.orderId;
  const validCondition = typeof orderId === 'string' && /^[a-zA-Z0-9]+$/.test(orderId);

  if (!validCondition) {
    res.sendStatus(400);
    return;
  }

  next();
}

const paymentIntent = (req, res, next) => {
  const intent = req.body.intent;
  const validCondition = (intent === 'CAPTURE' || uppercaseIntent === 'AUTHORIZE');

  if (!validCondition) {
    res.sendStatus(400);
    return;
  }

  next();
}

const order = (req, res, next) => {
  const orderDetails = req.body.orderDetails;

  const isValidOrderDetails = (orderDetails) => {
    if (typeof orderDetails.id !== 'string' || !Array.isArray(orderDetails.items) || orderDetails.items.length === 0 ||
      typeof orderDetails.totalAmount !== 'string' || isNaN(parseFloat(orderDetails.totalAmount)) || !isFinite(orderDetails.totalAmount)) {
      return false;
    }

    return orderDetails.items.every(isValidOrderDetailsItem);
  }

  const isValidOrderDetailsItem = (item) => {
    return (typeof item.id === 'string' && typeof item.title === 'string' && typeof item.img === 'string' &&
      !isNaN(parseFloat(item.price)) && isFinite(item.price)
    );
  }

  if (!orderDetails || typeof orderDetails !== 'object' || !isValidOrderDetails(orderDetails)) {
    res.sendStatus(400);
    return;
  }

  next();
}

module.exports = {
  email,
  emailExists,
  userId,
  cartItems,
  orderId,
  order
}
