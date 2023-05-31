const router = require('express').Router();
const emailService = require('./services/emailService');
const { labels } = require('./constants');
const bodyParser = require('body-parser');

// stripe
// const { fetch } = require('node-fetch');
const paymentService = require('./services/paymentService');

// TODO: can be misused from postman, protect!!
router.post('/send-email', async (req, res) => {
  const isEmailSent = await emailService.sendEmail(req.body.email, req.body.email_type);
  if (!isEmailSent) {
    return res.status(500).send({ response: labels.EMAIL_SEND_FAILED })
  }
  res.status(200).send({ response: labels.EMAIL_SEND_SUCCESFUL });
});

router.get('/crypto', async (req, res) => {
  res.status(200).send({ response: process.env.CRYPT_PRIVATE_KEY });
});

/* stripe */
router.post('/stripe-create-payment-intent', async (req, res) => {
  // TODO: important! add validation for inside req.body
  const user = req.body.user;
  const card = user.card;
  try {
    const response = await paymentService.initiatePayment(user, card);
    console.log('payment service response: ', response);

    res.json({ message: 'payment successful '});

  } catch (err) {
    console.log('error api response: ', err)
    res.status(500).json({ message: 'payment failed' });
  }

})

// push notifications from firebase
router.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  console.log('signature: ', signature);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.created':
        paymentIntent = event.data.object;
        console.log('payment_intent.created: ', `[${event.id}] created (${paymentIntent.id}): ${paymentIntent.status}`);
      case 'payment_intent.succeeded':
        paymentIntent = event.data.object;
        console.log('payment_intent.succeeded: ', `[${event.id}] succeeded (${paymentIntent.id}): ${paymentIntent.status}`);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ message: event.data });
    
  } catch (err) {
    console.log('webhook err: ', err);
    res.status(400).json({ message: err.message });
  }
});



module.exports = router;
