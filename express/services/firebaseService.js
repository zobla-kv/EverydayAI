const admin = require('firebase-admin');
const { labels } = require('../constants');
const { Decimal } = require('decimal.js');

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL
  })
});

const auth = require('firebase-admin/auth').getAuth();
const db = require('firebase-admin/firestore').getFirestore();
const { FieldValue } = require('firebase-admin/firestore')

// must pass something but is overriden later
// can stay for prod
const actionCodeSettings = {
  url: process.env.HOST_URL
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
async function getPrice(items) {
  // TODO: !important remove conversion to number once product item ids become a string in db
  const tempItemIds = items.map(item => item.id)
  return db.collection('Products').where('id', 'in', tempItemIds).get()
  .then(products => {
    let price = new Decimal(0);
    products.docs.forEach(productDoc => {
      const product = productDoc.data();
      if (product.discount > 0) {
        const priceAsNumber = Number(product.price);
        const tempPrice = priceAsNumber  * (100 - product.discount) / 100;
        price = price.plus(new Decimal(tempPrice));
      } else {
        price = price.plus(new Decimal(Number(product.price)))
      }
    })
    return price.times(100).toString(); // 500 = 5$ in stripe
  })
  .catch(err => err);
}

// update user in db with info about the payment
// TODO: !important what if write is failed but payment succeeds
async function addPaymentToUser(user, paymentIntent) {
  // read first to store later updated object
  const ownedItemsTimeMap = (await db.collection('Users').doc(user.id).get()).get('ownedItemsTimeMap');
  const newItems = user.shopping_cart_items.map(item => item.id);
  // combine ownedItemsTimeMap object and newItems array into single object
  const updated = newItems.reduce(
    (prev, curr) => {
        return {
            ...prev,
            [curr]: new Date()
        };
    },
    ownedItemsTimeMap
  );
  await db.collection('Users').doc(user.id).update({
    'stripe.id': paymentIntent.customer,
    'stripe.payments': FieldValue.arrayUnion({
      id: paymentIntent.id,
      items: user.shopping_cart_items,
      amount: '$' + await getPrice(user.shopping_cart_items) / 100, // to get real price
      date: new Date()
    }),
    'cart.items': [],
    'cart.totalSum': 0,
    'ownedItems': FieldValue.arrayUnion(...user.shopping_cart_items.map(item => item.id)),
    'ownedItemsTimeMap': updated
  })
} 

module.exports = { 
  generateEmailLink,
  getPrice,
  addPaymentToUser
};
