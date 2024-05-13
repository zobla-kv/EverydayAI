const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, NG_URL, SERVER_URL, SERVER_PORT } = process.env;
const admin = require('firebase-admin');
const { Decimal } = require('decimal.js');
const utilService = require('./utilService');

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
  url: NG_URL
};

async function generateEmailLink(email, type) {
  let link = null;
  const that = auth;

  const cb = type === 'activation' ?
    auth.generateEmailVerificationLink.bind(that) : auth.generatePasswordResetLink.bind(that);

  link = await cb(email, actionCodeSettings);

  return link;
}

// get all documents from a collection - collection - string
async function getDocumentsFromCollection(collection) {
  return db.collection(collection).get().then(documents => documents.docs.map(doc => doc.data()));
}

// add multiple documents to a collection
// documents - ProductResponse[], collection - string
async function addBulkDocumentsToCollection(documents, collection) {
  const batch = admin.firestore().batch();

  documents.forEach(doc => {
    const docRef = db.collection(collection).doc();
    batch.set(docRef, doc);
  })

  return batch.commit();
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

  return price.toDecimalPlaces(2, Decimal.ROUND_UP).toString();
}

// without fetch
// product - ProductResponse
function getPriceSync(products) {
  let price = new Decimal(0);
  products.forEach(product => (price = price.plus(calculatePrice(product))));

  return price.toDecimalPlaces(2, Decimal.ROUND_UP).toString();
}

// calculate price with included discount - intenal use only (private)
// product - ProductResponse
function calculatePrice(product) {
  if (product.discount > 0) {
    return new Decimal(product.price * (100 - product.discount) / 100).toDecimalPlaces(2, Decimal.ROUND_UP);
  }
  return new Decimal(product.price).toDecimalPlaces(2, Decimal.ROUND_UP);
}

// get user by id
async function getUserById(id) {
  return db.collection('Users').doc(id).get()
  .then(doc => doc.data())
  .catch(err => null)
}

// get user by email
async function getUserByEmail(email) {
  return db.collection('Users').where('email', '==', email).get();
}

// get product by id
async function getProductById(id) {
  return db.collection('Products').doc(id).get()
  .then(doc => doc.data())
  .catch(err => null)
}

// TODO: remove catch blocks from all fns here and implement try catch in callers
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

// do all actions after succesful payment
// if isGenerated, cartItems will have imageUrl instead and cb will be available
async function handlePaymentSucceded(userId, order, cartItems, isGenerated, cb) {
  // if image bought from generated page
  if (isGenerated) {
    // Fetch the user concurrently with cloudinary upload (cb)
    const [cloudinaryResponse, user] = await Promise.all([
        cb(cartItems[0]),
        getUserById(userId)
    ]);
    const product = await addGeneratedProduct(cloudinaryResponse);
    const updatedOwnedItemsTimeMap = _getUpdatedOwnedItemsTimeMap(user.ownedItemsTimeMap, [product.id]);
    const orderDetails = _getOrderDetailsForGenerated(order, product);
    return Promise.all([
        _updateUserAfterPayment(user, order, [product.id], updatedOwnedItemsTimeMap, true),
        _sendTransactionEmail(user.email, orderDetails)
    ]);
  };

  // if bought from cart
  const user = await getUserById(userId);
  const updatedOwnedItemsTimeMap = _getUpdatedOwnedItemsTimeMap(user.ownedItemsTimeMap, cartItems);
  const orderDetails = await _getOrderDetails(order, cartItems);

  return Promise.all([
    _incrementProductSoldTimes(cartItems),
    _updateUserAfterPayment(user, order, cartItems, updatedOwnedItemsTimeMap, false),
    _sendTransactionEmail(user.email, orderDetails)
  ]);
}

// get updated ownedItemsTimeMap object
function _getUpdatedOwnedItemsTimeMap(ownedItemsTimeMap, cartItems) {
  return cartItems.reduce((prev, curr) => ({ ...prev, [curr]: new Date() }), ownedItemsTimeMap);
}

// get order details object
// order - capture payment response object
async function _getOrderDetails(order, cartItems) {
  const products = await getProductsById(cartItems);
  const items = products.map(product => ({
    id: product.id,
    title: product.title,
    img: product.watermarkImgPath,
    price: calculatePrice(product)
  }));
  const totalAmount = +order.purchase_units[0].payments.captures[0].amount.value;

  return { id: order.id, items, totalAmount };
}

// get order details object for generated
// order - capture payment response object
function _getOrderDetailsForGenerated(order, product) {
  const items = [{
    id: product.id,
    title: product.title,
    img: product.imgPath,
    price: product.price
  }];
  const totalAmount = +order.purchase_units[0].payments.captures[0].amount.value;

  return { id: order.id, items, totalAmount };
}

// send transaction email
function _sendTransactionEmail(email, orderDetails) {
  fetch(`${SERVER_URL}:${SERVER_PORT}/api/email/transaction`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ email, orderDetails })
  });
}

// update user with information about payment
async function _updateUserAfterPayment(user, order, cartItems, updatedOwnedItemsTimeMap, isGenerated) {
  const totalAmount = +order.purchase_units[0].payments.captures[0].amount.value;
  let totalSpent = new Decimal(user.totalSpent);
  totalSpent = totalSpent.plus(totalAmount);

  const updateData = {
    payments: FieldValue.arrayUnion({
      orderId: order.id,
      items: cartItems,
      amount: totalAmount,
      date: new Date()
    }),
    totalSpent: totalSpent.toNumber(),
    ...(!isGenerated && { cart: [] }),
    ownedItems: FieldValue.arrayUnion(...cartItems),
    ownedItemsTimeMap: updatedOwnedItemsTimeMap
  };

  return db.collection('Users').doc(user.id).update(updateData);
}

// increment how many times a product was sold
async function _incrementProductSoldTimes(cartItems) {
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

// add generated image product to db
async function addGeneratedProduct(cloudinaryResponse) {
  // TODO: add model to FE
  const product = {
    // set later
    id: '',
    imgPath: cloudinaryResponse.secure_url,
    creationDate: new Date(),
    title: 'AI generated',
    description: 'Generated image',
    price: 5,
    metadata: {
      fileSize: cloudinaryResponse.bytes,
      fileSizeInMb: utilService.getFileSizeInMb(cloudinaryResponse.bytes),
      resolution: `${cloudinaryResponse.width}x${cloudinaryResponse.height}`,
      extension: cloudinaryResponse.format,
      orientation: utilService.getImageOrientation(cloudinaryResponse.width, cloudinaryResponse.height)
    },
  };

  const docRef = await db.collection('Products_gen').add(product);
  const productId = docRef.id;

  product.id = 'gen_' + productId;

  await db.collection('Products_gen').doc(productId).update({
    id: product.id,
  });


  return product;
}


module.exports = {
  generateEmailLink,
  getDocumentsFromCollection,
  addBulkDocumentsToCollection,
  getPriceAsync,
  getPriceSync,
  getUserById,
  getUserByEmail,
  getProductById,
  getProductsById,
  getAllProducts,
  handlePaymentSucceded,
  addGeneratedProduct
};
