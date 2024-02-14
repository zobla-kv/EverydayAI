const emailRouter = require('express').Router();
const emailService = require('../services/emailService');
const { ACTIVATION, RESET_PASSWORD, TRANSACTION } = emailService.emailType;
const validators = require('../middleware/validators');

emailRouter.post([`/${ACTIVATION}`, `/${RESET_PASSWORD}`], async (req, res) => {
  const endpoint = req.path.substring(1);
  const email = req.body.email;

  try {
    // NOTE: if sending to multiple some can fail some can go through. Check response
    await emailService.sendEmail(email, endpoint);
    res.sendStatus(200);
  }
  catch (err) {
    res.sendStatus(500);
  }
});

emailRouter.post(`/${TRANSACTION}`, [validators.order], async (req, res) => {
  const endpoint = req.path.substring(1);
  const email = req.body.email;
  const orderDetails = req.body.orderDetails;

  try {
    await emailService.sendEmail(email, endpoint, orderDetails);
    res.sendStatus(200);
  }
  catch (err) {
    res.sendStatus(500);
  }
});

module.exports = emailRouter;
