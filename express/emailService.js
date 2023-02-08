const nodemailer = require('nodemailer');
// const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.sendEmail = async function (email, user, type) {
  type = type.toLowerCase();
  if (type !== 'activation' && type !== 'reset password') {
    return false;
  }

  // const token = jwt.sign({ user }, process.env.JWT_SECRET);
  const token = 'test-test-test-test';

  const host = 'https://www.house-of-dogs.com'

  // capitalize first letter
  const subject = `${type[0].toUpperCase() + type.slice(1)} 🐕`; 

  type = type.replace(/ /g, '_');

  const message = 
  `
    <h2 style="margin-left: 250px;color:black;">
      Verify your email by clicking link below
    </h2>
    <a href="${host}/${type}/${token}">
      ${host}/${type}/${token}
    </a>
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
  .then(() => isSent = true)
  
  return isSent;
};