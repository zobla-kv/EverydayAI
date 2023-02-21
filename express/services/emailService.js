const nodemailer = require('nodemailer');
const firebaseService = require('./firebaseService');
const path = require('path');

const { appConstants, labels } = require('../constants');
const styles = require('../assets/styles');

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

  // prevent gmail from trimming content
  const random = Date.now();

  // TODO: figure out what was this for
  // type = type.replace(/ /g, '_');

  // TODO: doesn't look good in ct email, try using inline styles
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
      <span style="${styles.followUs}">Follow us on</span>
      <a href="${appConstants.INSTAGRAM_URL}" style="${styles.instagramLogoWrapper}">
        <img src="cid:instagram" style="${styles.instagramLogo}">
      </a>
    </div>
    <div style="opacity: 0">${random}</div>
  `;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
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
  const content = { emailText: '', buttonText: '' };
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
