const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { appConstants, labels } = require('../constants');

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.PROJECT_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL
  })
});

// must pass something but is overriden later
// can stay for prod
const actionCodeSettings = {
  url: appConstants.APP_URL
};

async function generateEmailLink(email, type) {
  let link = null;

  const that = getAuth();

  const cb = type === labels.ACTIVATION ? 
    getAuth().generateEmailVerificationLink.bind(that) : getAuth().generatePasswordResetLink.bind(that);

  try {
    link = await cb(email, actionCodeSettings);
  } catch(err) {
    console.log('err is: ', err);
  }

  return link;
}

module.exports = { generateEmailLink };
