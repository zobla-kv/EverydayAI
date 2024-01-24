const path = require('path');
const nodemailer = require('nodemailer');
// NOTE: crypto needed so email wont be shown in url (also on FE)
const CryptoJS = require('crypto-js');

const firebaseService = require('./firebaseService');

const { appConstants, labels } = require('../constants');
const styles = require('../assets/styles');

module.exports.sendEmail = async function (email, type) {
  type = type.toLowerCase();
  if (type !== labels.ACTIVATION && type !== labels.RESET_PASSWORD) {
    return false;
  }

  let verificationLink = await firebaseService.generateEmailLink(email, type);
  if (!verificationLink) {
    // in case too many requests in small time
    return false;
  }

  verificationLink = verificationLink.replace('oobCode', 'code');

  const modifiedUrl = new URL(verificationLink);
  modifiedUrl.searchParams.delete('apiKey');
  modifiedUrl.searchParams.delete('continueUrl');

  // encrypt email address
  const encryptedEmail = CryptoJS.AES.encrypt(email, process.env.CRYPT_PRIVATE_KEY);

  modifiedUrl.searchParams.append('type', encryptedEmail.toString());

  // capitalize first letter
  const subject = `${type[0].toUpperCase() + type.slice(1)} ✨`;

  const content = getContent(email, type);

  // prevent gmail from trimming content
  const random = Date.now();

  // TODO: figure out what was this for
  // type = type.replace(/ /g, '_');

  // BUG: doesn't look good in ct email, try using inline styles
  const message =
  `
    <div style="text-align:center">
      <h2>${content.text.header}</h2>
      <span style="${styles.bodyText}">${content.text.body}</span>
    </div>
    <div style="${styles.outterWrapper}">
      <div style="${styles.innerWrapper}">
        <a href="${process.env.HOST_URL}" style="${styles.logoWrapper}">
          <img src="cid:logo" style="${styles.logo}">
        </a>
        <h2 style="${styles.text}">
          ${content.logo.text}
        </h2>
        <br>
        <a href="${modifiedUrl}" style="${styles.button}">
          ${content.logo.buttonText}
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
    from: '"EverydayAI" <everydayai.online@gmail.com>',
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
  .then(() => isSent = true)
  .catch(() => isSent = false);

  return isSent;
};

function getContent(email, type) {
  const content = {
    text: { header: '', body: '' },
    logo: { text:   '', buttonText: ''}
  }
  if (type === labels.ACTIVATION) {
    content.text.header =  `Welcome to EverydayAI, ${email.split('@')[0]}.`;
    content.text.body = `Thank you for becoming a part of the EverydayAI community.
    The integration of AI into our lives should not diminish our humanity. Rather, it should amplify our ability to connect.
    Together, humans and AI can co-create a world that leverages the strengths of both,
    transcending the boundaries of what was once thought possible.
    <br>
    If you did not request this email, please ignore it.`
    content.logo.text = labels.VERIFY_EMAIL_TEXT;
    content.logo.buttonText = labels.VERIFY_EMAIL_BUTTON_TEXT;
  }
  if (type === labels.RESET_PASSWORD) {
    content.text.header =  `Hello ${email.split('@')[0]}. Let us help get back your account.`;
    content.text.body = `You requested password reset. Click button below and follow instructions to get your account back.'
    <br>
    If you did not request this email, please ignore it.`
    content.logo.text = labels.RESET_PASSWORD_EMAIL_TEXT;
    content.logo.buttonText = labels.RESET_PASSWORD_EMAIL_BUTTON_TEXT;
  }
  return content;
}
