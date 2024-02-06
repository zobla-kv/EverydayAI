const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, HOST_URL } = process.env;
const admin = require('firebase-admin');
const labels = require('../labels/labels');
const { Decimal } = require('decimal.js');

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: FIREBASE_PROJECT_ID,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: FIREBASE_CLIENT_EMAIL
  })
});

const auth = require('firebase-admin/auth').getAuth();
const db = require('firebase-admin/firestore').getFirestore();
const { FieldValue } = require('firebase-admin/firestore')

// must pass something but is overriden later
// can stay for prod
const actionCodeSettings = {
  url: HOST_URL
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
// with fetch
async function getPriceAsync(productIds) {
  const productDocs = await db.collection('Products').where('id', 'in', productIds).get();
  let price = new Decimal(0);

  productDocs.docs.forEach(productDoc => {
    const product = productDoc.data();
    price = price.plus(calculatePrice(product))
  });

  return price.toString();
}

// without fetch
// product - ProductResponse
function getPriceSync(products) {
  let price = new Decimal(0);
  products.forEach(product => (price = price.plus(calculatePrice(product))));

  return price.toString();
}

// calculate price with included discount - intenal use only (private)
// product - ProductResponse
function calculatePrice(product) {
  if (product.discount > 0) {
    return new Decimal(product.price * (100 - product.discount) / 100);
  }
  return new Decimal(product.price);
}

// get user by id
async function getUserById(id) {
  return db.collection('Users').doc(id).get()
  .then(doc => doc.data())
  .catch(err => null)
}

// get product by id
async function getProductById(id) {
  return db.collection('Products').doc(id).get()
  .then(doc => doc.data())
  .catch(err => null)
}

// get mutliple products by id
async function getProductsById(ids) {
  return db.collection('Products').where('id', 'in', ids).get()
  .then(res => {
    const products = res.docs.map(res => ({ ...res.data() }));
    return products;
  })
}

// get all products
async function getAllProducts() {
  return db.collection('Products').get()
  .then(res => {
    const products = res.docs.map(res => ({ ...res.data() }));
    return products;
  })
}

// update user in db with info about the payment and reset cart
async function addPaymentToUser(userId, order, cartItems) {
  // read first to store later updated object
  const ownedItemsTimeMap = (await db.collection('Users').doc(userId).get()).get('ownedItemsTimeMap');
  // combine ownedItemsTimeMap object and newItems array into single object
  const updated = cartItems.reduce(
    (prev, curr) => {
        return {
            ...prev,
            [curr]: new Date()
        };
    },
    ownedItemsTimeMap
  );

  return db.collection('Users').doc(userId).update({
    'payments': FieldValue.arrayUnion({
      orderId: order.id,
      items: cartItems,
      amount: order.purchase_units[0].payments.captures[0].amount.value,
      date: new Date()
    }),
    'cart': [],
    'ownedItems': FieldValue.arrayUnion(...cartItems),
    'ownedItemsTimeMap': updated
  })
}

// increment how many times a product was sold
async function incrementProductSoldTimes(cartItems) {
  // update multiple documents at once
  const batch = admin.firestore().batch();

  const productDocs = await db.collection('Products').where('id', 'in', cartItems).get();

  productDocs.docs.forEach(doc => {
    batch.update(doc.ref, {
      'soldTimes': FieldValue.increment(1)
    })
  })

  return batch.commit();
}


module.exports = {
  generateEmailLink,
  getPriceAsync,
  getPriceSync,
  addPaymentToUser,
  getUserById,
  getProductById,
  getProductsById,
  getAllProducts,
  incrementProductSoldTimes
};
