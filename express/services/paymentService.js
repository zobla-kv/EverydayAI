const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const firebaseService = require('./firebaseService');

async function initiatePayment(customer, card) {

  let stripeCustomer;
  // use existing or create new stripe customer
  if (customer.stripeId) {
    stripeCustomer = await getCustomer(customer.stripeId);
  } else {
    stripeCustomer = await createCustomer(customer.email);
    firebaseService.addStripeIdToUser(customer.id, stripeCustomer.id)
    .catch(() => deleteCustomer(stripeCustomer.id));
  }

  const paymentMethod = await createPaymentMethod(card);
  const paymentIntent = await createPaymentIntent(paymentMethod, stripeCustomer);
  const paymentConfirm = await confirmPayment(paymentIntent);

  return paymentConfirm.status;
}

// get customer if one exists
// customer || null
async function getCustomer(id) {
  return stripe.customers.retrieve(id)
  .then(customer => customer)
  .catch(err => null);
}

// create new customer
async function createCustomer(email) {
  return stripe.customers.create({
    email,
    description: 'standard customer',
  });
}

// delete customer
async function deleteCustomer(id) {
  // TODO: error handling
  return stripe.customers.del(id);
}

// create payment method object
// returns paymentMethod
async function createPaymentMethod(card) {
  return stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: card.number,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      cvc: card.cvc
    }
  });
}

// create paymentIntent object
// returns paymentIntent
async function createPaymentIntent(paymentMethod, customer) {
  return stripe.paymentIntents.create({
    payment_method: paymentMethod.id,
    amount: firebaseService.getPrice(customer.shopping_cart_item_ids),
    currency: 'usd',
    payment_method_types: ['card'],
    customer: customer.id,
    receipt_email: customer.email,
    description: 'Billing for house of dogs services.',
  });
}

// returns confirmPayment object
async function confirmPayment(paymentIntent) {
  return stripe.paymentIntents.confirm(paymentIntent.id);
}

module.exports = { initiatePayment };