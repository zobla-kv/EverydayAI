const { PAYPAL_CLIENT_ID, PAYPAL_API_SECRET, PAYPAL_REST_API_HOST } = process.env;
const firebaseService = require('./firebaseService');

// token object
let api_access_token_data = null;

// get api access token
async function getAccessToken() {

  if (!isTokenExpired()) {
    return api_access_token_data.access_token;
  }

  const auth = `${PAYPAL_CLIENT_ID}:${PAYPAL_API_SECRET}`;
  const data = 'grant_type=client_credentials';
  return fetch(`${PAYPAL_REST_API_HOST}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(auth).toString('base64')}`
    },
    body: data
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      throw new Error('Unable to generate token');
    }

    api_access_token_data = data;
    return data.access_token;
  })
}

// check if token expired or is about to expire
// NOTE: ideally this should be handled in every bad api response with error token expired by requesting new and then calling same fn
function isTokenExpired() {
  if (!api_access_token_data) {
    return true;
  }
  if (api_access_token_data.expires_in < 900) { // 900s = 15min
    return true;
  }
  return false;
}

// userId - string, cartItems - string[], isGenerated - boolean, is payment coming from generated page or cart
async function createOrder(userId, cartItems, isGenerated) {
  const token = await getAccessToken();

  let products;

  if (isGenerated) {
    // generated product placeholder
    products = [{
      id: '1',
      title: 'AI generated',
      discount: 0,
      price: 0.1 // price of AI generated (needs to match FE)
    }];
  } else {
    products = await firebaseService.getProductsById(cartItems);
  }


  return fetch(`${PAYPAL_REST_API_HOST}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(
      {
        intent: 'CAPTURE',
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'EverydayAI',
              shipping_preference: 'NO_SHIPPING',
              // shipping_preference: 'GET_FROM_FILE',
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED'
            }
          }
        },
        purchase_units: [
          {
            items: products.map(product => ({
              sku: product.id,
              name: product.title,
              quantity: 1,
              category: 'DIGITAL_GOODS',
              unit_amount: {
                currency_code: 'USD',
                value: firebaseService.getPriceSync([product])
              }
            })),
            custom_id: userId,
            amount: {
               currency_code: 'USD',
               value: firebaseService.getPriceSync(products),
               breakdown: {
                 item_total: {
                  currency_code: 'USD',
                  value: firebaseService.getPriceSync(products)
                 }
               }
            }
          }
        ]
     }
    )
  })
  .then(response => response.json())
  .then(order => {
    console.log('create order response: ', order);
    if (order.name === 'INVALID_REQUEST' | order.name === 'UNPROCESSABLE_ENTITY') {
      throw new Error('Unable to create order due to: ' + order.message);
    }
    return order.id;
  })
}

// orderId - string
async function captureOrder(userId, orderId, cartItems, isGenerated) {
  const token = await getAccessToken();

  return fetch(`${PAYPAL_REST_API_HOST}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(async order => {
    console.log('capture order response: ', order);
    // NOTE: payment succeeded at this point, if some of these fail ignore the error.
    // User will not own item if this fails. Same if user is disconnect from internet while processing payment.
    // basically this depends on god's will that it will work

    // pass cloudinary method as callback to avoid circular dependency
    let cb;
    if (isGenerated) {
      cb = cloudinaryService.uploadGenerated;
    }

    return firebaseService.handlePaymentSucceded(userId, order, cartItems, isGenerated, cb)
    .catch(err => err);
  });

}


module.exports = {
  createOrder,
  captureOrder
};
