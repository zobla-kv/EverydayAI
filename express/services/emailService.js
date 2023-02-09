const nodemailer = require('nodemailer');
const firebaseService = require('./firebaseService');

module.exports.sendEmail = async function (email, type) {
  type = type.toLowerCase();
  if (type !== 'activation' && type !== 'reset password') {
    return false;
  }

  let verificationLink = await firebaseService.generateEmailVerificationLink(email);
  verificationLink = verificationLink.replace('oobCode', 'code');

  const modifiedUrl = new URL(verificationLink);
  modifiedUrl.searchParams.delete('apiKey');
  modifiedUrl.searchParams.delete('continueUrl');

  // capitalize first letter
  const subject = `${type[0].toUpperCase() + type.slice(1)} 🐕`;

  type = type.replace(/ /g, '_');

  const message =
  `
    <h2 style="margin-left: 250px;color:black;">
      Verify your email by clicking link below
    </h2>
    <a href="${modifiedUrl}">${modifiedUrl}</a>
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
  })
  .then(() => isSent = true);

  return isSent;
};
