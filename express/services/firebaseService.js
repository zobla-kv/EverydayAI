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

// must pass something but is overriden later
// can stay for prod
const actionCodeSettings = {
  url: appConstants.APP_URL
};

async function generateEmailLink(email, type) {
  let link = null;

  // TODO: test new
  // const that = getAuth();

  // const cb = type === labels.ACTIVATION ?
  //   getAuth().generateEmailVerificationLink.bind(that) : getAuth().generatePasswordResetLink.bind(that);

  const cb = type === labels.ACTIVATION ?
    auth.generateEmailVerificationLink.bind(this) : auth.generatePasswordResetLink.bind(this);

  try {
    link = await cb(email, actionCodeSettings);
  } catch(err) {
    console.log('err is: ', err);
  }

  return link;
}

// recalculate prices of items on the BE 
// to prevent making purchase with user modified price
async function getRealPrice() {

}

module.exports = { generateEmailLink };
