const { appConstants, labels } = require('../constants');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.PROJECT_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL
  })
});

const auth = require('firebase-admin/auth').getAuth();
const db = require('firebase-admin/firestore').getFirestore();
const { FieldValue } = require('firebase-admin/firestore')

// must pass something but is overriden later
// can stay for prod
const actionCodeSettings = {
  url: appConstants.APP_URL
};

async function generateEmailLink(email, type) {
  let link = null;

  const that = auth;

  const cb = type === labels.ACTIVATION ?
    auth.generateEmailVerificationLink.bind(that) : auth.generatePasswordResetLink.bind(that);

  try {
    link = await cb(email, actionCodeSettings);
  } catch(err) {
    console.log('failed to generate email link: ', err);
  }

  return link;
}

// recalculate prices of items on the BE to prevent making purchase with user modified price
// itemIds: String[]
async function getPrice(items) {
  // TODO: !important remove conversion to number once product item ids become a string in db
  const tempItemIds = items.map(item => Number(item.id))
  return db.collection('Products').where('id', 'in', tempItemIds).get()
  .then(products => {
    let price = 0;
    products.docs.forEach(productDoc => {
      const product = productDoc.data();
      // NOTE: rejects 0 if no typeof check
      if (product.information.discount && (typeof product.information.discount.discountedPrice === 'number')) {
        // TODO: original price is string, discounted price is a number in db at the moment
        price += product.information.discount.discountedPrice
      } else {
        price += Number(product.information.price);
      }
    })
    // TODO: price is a string in db, change to number?
    return price * 100; // 500 = 5$ in stripe
  })
  .catch(err => err);
}

// update user in db with info about the payment
// TODO: itemIds is now String[] check this also above
// TODO: !important what if write is failed but payment succeeds
// suggestion: on FE get owned items from stripe.payments 
// single source of truth - can still differ from payments in stripe if it fails to write to db
async function addPaymentToUser(user, paymentIntent) {
  return db.collection('Users').doc(user.id).update({
    'stripe.id': paymentIntent.customer,
    'stripe.payments': FieldValue.arrayUnion({
      id: paymentIntent.id,
      items: user.shopping_cart_items,
      // NOTE: second call, not really an issue?
      amount: '$' + await getPrice(user.shopping_cart_items) / 100 // to get real price
    }),
    'cart.items': [],
    'cart.totalSum': 0
  })
  .catch (err => {
    console.log('error writing: ', err);
  })
} 

module.exports = { 
  generateEmailLink,
  getPrice,
  addPaymentToUser
};
