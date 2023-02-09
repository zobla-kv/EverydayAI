const router = require('express').Router();

// services
const emailService = require('./services/emailService');

// TODO: can be misused from postman, protect!!
router.post('/send-verification-email', async (req, res) => {
  const isEmailSent = await emailService.sendEmail(req.body.email, 'blabla', req.body.email_type);
  if (!isEmailSent) {
    return res.status(500).send({ response: 'Failed to send verification email' })
  }
  res.status(200).send({ response: 'Email sent succesfully' });
})

module.exports = router;
