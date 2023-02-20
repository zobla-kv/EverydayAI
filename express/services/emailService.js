const nodemailer = require('nodemailer');
const firebaseService = require('./firebaseService');
const path = require('path');

require('dotenv').config();

const { appConstants, labels } = require('../constants');

const styles = require('../assets/styles');

async function sendEmail(email, type) {
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
    <div style="${styles.outterWrapper}">
      <div style="${styles.innerWrapper}">
        <a href="${appConstants.APP_URL}" style="${styles.logoWrapper}">
          <img src="cid:logo" style="${styles.logo}">
        </a>
        <h2 style="${styles.text}">
          ${content.emailText}
        </h2>
        <br>
        <a href="${modifiedUrl}" style="${styles.button}">
          ${content.buttonText}
        </a>
      </div>       
      <div style="${styles.followUs}">Follow us on</div>
      <hr style="${styles.underline}">
      <a href="${appConstants.INSTAGRAM_URL}" style="${styles.instagramLogoWrapper}">
        <img src="cid:instagram" style="${styles.instagramLogo}">
      </a> 
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
    attachments: [
      {
        filename: 'main-logo.png',
        path: path.join(__dirname, '..', '/assets/main-logo.png'),
        cid: 'logo'
      },
      {
        filename: 'instagram-logo.png',
        path: path.join(__dirname, '..', '/assets/instagram-logo.png'),
        cid: 'instagram'
      }
    ]
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

sendEmail('blagoje.kv@gmail.com', 'activation');
