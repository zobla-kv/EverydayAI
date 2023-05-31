const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function initiatePayment(customer, card) {

  const stripeCustomer = await createCustomer(customer.email);
//   console.log('stripeCustomer: ', stripeCustomer);     

  const paymentMethod = await createPaymentMethod(card);
//   console.log('paymentMethod: ', paymentMethod);      
   
  const paymentIntent = await createPaymentIntent(paymentMethod, customer);
//   console.log('paymentIntent: ', paymentIntent);   

  const paymentConfirm = await confirmPayment(paymentIntent);
//   console.log('paymentConfirm: ', paymentConfirm);     

  return 'SUCCESFUL RETURN';
}

// does customer exist 
// boolean
async function customerExist() {
  
}

// create new customer
async function createCustomer(email) {
  return stripe.customers.create({
    email,
    description: 'standard customer',
  });
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
    amount: getPrice(customer.shopping_cart_item_ids),
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

// recalculate prices of items on the BE 
// to prevent making purchase with user modified data
function getPrice(items) {
    console.log('shopping_cart_item_ids: ', items);
  return '4200';
}

module.exports = { initiatePayment };