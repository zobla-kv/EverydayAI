const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const firebaseService = require('./firebaseService');

// NOTE: Unused, saved for ref

async function initiatePayment(user, card) {
  let stripeCustomer;

  // use existing or create new stripe customer
  if (user.stripeId) {
    stripeCustomer = await getCustomer(user.stripeId);
  } else {
    stripeCustomer = await createCustomer(user.email);
  }

  const paymentMethod = await createPaymentMethod(card);
  const paymentIntent = await createPaymentIntent(paymentMethod, user, stripeCustomer);
  const paymentConfirm = await confirmPayment(paymentIntent);

  // NOTE: doesn't matter if it succeded for now
  // await because FE reads it after
  // await firebaseService.addPaymentToUser(user, paymentIntent) - before
  await addPaymentToUser(user, paymentIntent)

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
// not used
async function deleteCustomer(id) {
  return stripe.customers.del(id);
}

// create payment method object
// returns paymentMethod
async function createPaymentMethod(card) {
  return stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: card.number,
      exp_month: Number(card.expiration_date_month),
      exp_year: Number(card.expiration_date_year),
      cvc: card.cvc
    }
  });
}

// create paymentIntent object
async function createPaymentIntent(paymentMethod, user, stripeCustomer) {
  return stripe.paymentIntents.create({
    payment_method: paymentMethod.id,
    amount: await firebaseService.getPrice(user.shopping_cart_items),
    currency: 'usd',
    payment_method_types: ['card'],
    customer: stripeCustomer.id,
    receipt_email: stripeCustomer.email,
    description: 'Billing for house of dogs services.',
  });
}

// returns confirmPayment object
async function confirmPayment(paymentIntent) {
  return stripe.paymentIntents.confirm(paymentIntent.id);
}


// MOVE FROM FIREBASE SERVICE AND STORED HERE FOR REF
// // update user in db with info about the payment
// // TODO: !important what if write is failed but payment succeeds
// // TODO: nothing on the backed was updated when cart was changed from whole product object to product id
// async function addPaymentToUser(user, paymentIntent) {
//   // read first to store later updated object
//   const ownedItemsTimeMap = (await db.collection('Users').doc(user.id).get()).get('ownedItemsTimeMap');
//   // TODO: shopping_cart_items was changed on FE
//   const newItems = user.shopping_cart_items.map(item => item.id);
//   // combine ownedItemsTimeMap object and newItems array into single object
//   const updated = newItems.reduce(
//     (prev, curr) => {
//         return {
//             ...prev,
//             [curr]: new Date()
//         };
//     },
//     ownedItemsTimeMap
//   );
//   await db.collection('Users').doc(user.id).update({
//     'stripe.id': paymentIntent.customer,
//     'stripe.payments': FieldValue.arrayUnion({
//       id: paymentIntent.id,
//       items: user.shopping_cart_items,
//       amount: '$' + await getPrice(user.shopping_cart_items) / 100, // to get real price
//       date: new Date()
//     }),
//     'cart.items': [],
//     'cart.totalSum': 0,
//     'ownedItems': FieldValue.arrayUnion(...user.shopping_cart_items.map(item => item.id)),
//     'ownedItemsTimeMap': updated
//   })
// }


module.exports = { initiatePayment };
