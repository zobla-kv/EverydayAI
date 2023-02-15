const nodemailer = require('nodemailer');
const firebaseService = require('./firebaseService');
const path = require('path');

const { appConstants, labels } = require('../constants');
const { 
  outterWrapperStyles,
  innerWrapperStyles, 
  logoWrapperStyles, 
  logoStyles, 
  textStyles, 
  buttonStyles 
} = require('../assets/styles');

module.exports.sendEmail = async function (email, type) {
  type = type.toLowerCase();
  if (type !== labels.ACTIVATION && type !== labels.RESET_PASSWORD) {
    return false;
  }

  let verificationLink = await firebaseService.generateEmailLink(email, type);
  verificationLink = verificationLink.replace('oobCode', 'code');

  const modifiedUrl = new URL(verificationLink);
  modifiedUrl.searchParams.delete('apiKey');
  modifiedUrl.searchParams.delete('continueUrl');

  // capitalize first letter
  const subject = `${type[0].toUpperCase() + type.slice(1)} 🐕`;

  const content = getContent(type);

  // TODO: figure out what was this for
  // type = type.replace(/ /g, '_');

  const message =
  ` 
    <div style="${outterWrapperStyles}">
      <div style="${innerWrapperStyles}">
        <a href="${appConstants.APP_URL}" style="${logoWrapperStyles}">
          <img src="cid:logo" style="${logoStyles}">
        </a>
        <h2 style="${textStyles}">
          ${content.emailText}
        </h2>
        <br>
        <a href="${modifiedUrl}" style="${buttonStyles}">
          ${content.buttonText}
        </a>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_AUTH_USERNAME,
      pass: process.env.EMAIL_AUTH_PASSWORD,
    },
  });

  let isSent = false;
  await transporter.sendMail({
    from: '"House of dogs" <houseofdogs.online@gmail.com>',
    to: email,
    subject,
    html: message,
    attachments: [{
      filename: 'main-logo.png',
      path: path.join(__dirname, '..', '/assets/main-logo.png'),
      cid: 'logo'
  }]
  })
  .then(() => isSent = true);

  return isSent;
};

// returns email content based on type
function getContent(type) {
  const content = { emailText: 'test', buttonText: 'test' };
  if (type === labels.ACTIVATION) {
    content.emailText = labels.VERIFY_EMAIL_TEXT;
    content.buttonText = labels.VERIFY_EMAIL_BUTTON_TEXT;
  }
  if (type === labels.RESET_PASSWORD) {
    content.emailText = labels.RESET_PASSWORD_EMAIL_TEXT;
    content.buttonText = labels.RESET_PASSWORD_EMAIL_BUTTON_TEXT;
  }
  return content;
}

// sendEmail('blagoje.kv@gmail.com', 'activation');
