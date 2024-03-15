const { CRYPT_PRIVATE_KEY, NG_URL, NODE_MAILER_USERNAME, NODE_MAILER_PASSWORD } = process.env;
const path = require('path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const firebaseService = require('../services/firebaseService');
const CryptoJS = require('crypto-js');

// host email
const HOST_EMAIL = 'everydayai.business@gmail.com'

// email types
const ACTIVATION = 'activation';
const RESET_PASSWORD = 'reset-password';
const TRANSACTION = 'transaction';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TODO: update
  auth: {
    user: NODE_MAILER_USERNAME,
    pass: NODE_MAILER_PASSWORD,
  },
  from: NODE_MAILER_USERNAME
});

// send email
// email - string, type - email types
async function sendEmail(email, type, orderDetails = null) {
  const emailData = await getEmailData(email, type, orderDetails);

  const compiledFunction = pug.compileFile(path.join(__dirname, '..', `/email/${type}.pug`));
  const emailHTML = compiledFunction(emailData);

  const response = await transporter.sendMail({
    from: `"EverydayAI" <${HOST_EMAIL}>`,
    to: emailData.receivers,
    subject: emailData.subject,
    html: emailHTML,
    attachments: emailData.attachments
  });

  return response;
};

// gets email data based on email type
async function getEmailData(email, type, orderDetails) {
  const emailData = async (type) => {
    switch (type) {
      case ACTIVATION:
        return {
          subject: 'Activation ✨',
          receivers: [email],
          action_url: await getActionUrl(email, ACTIVATION)
        };
      case RESET_PASSWORD:
        return {
          subject: 'Reset password ✨',
          receivers: [email],
          action_url: await getActionUrl(email, RESET_PASSWORD),
        };
      case TRANSACTION:
        return {
          subject: 'Receipt ✨',
          receivers: [email, `${HOST_EMAIL}`],
          order: {
            transaction_id: orderDetails.id,
            items: orderDetails.items,
            totalAmount: orderDetails.totalAmount
          }
        };
      default:
        throw new Error('Failed to get email data. There is no data key: ' + type);
    }
  };

  const data = await emailData(type);

  // shared
  data.user = email.split('@')[0];
  data.NG_URL = NG_URL;
  data.instagram_url = 'https://www.instagram.com/everydayai.io/';
  data.attachments = [
    {
      filename: 'main-logo.png',
      path: path.join(__dirname, '..', '/email/img/main-logo.png'),
      cid: 'logo'
    },
    {
      filename: 'stars.png',
      path: path.join(__dirname, '..', '/email/img/stars.png'),
      cid: 'stars'
    },
    {
      filename: 'instagram-logo.png',
      path: path.join(__dirname, '..', '/email/img/instagram-logo.png'),
      cid: 'instagram'
    }

  ]

  return data;
}

// TODO: move to firebase service
// get action url
async function getActionUrl(email, type) {
  let verificationLink = await firebaseService.generateEmailLink(email, type);

  verificationLink = verificationLink.replace('oobCode', 'code');

  const modifiedUrl = new URL(verificationLink);
  modifiedUrl.searchParams.delete('apiKey');
  modifiedUrl.searchParams.delete('continueUrl');

  const encryptedEmail = CryptoJS.AES.encrypt(email, CRYPT_PRIVATE_KEY);

  modifiedUrl.searchParams.append('type', encryptedEmail.toString());

  return modifiedUrl;
}


module.exports = {
  sendEmail,
  emailType: { ACTIVATION, RESET_PASSWORD, TRANSACTION }
}

