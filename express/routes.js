const router = require('express').Router();
const { labels } = require('./constants');
const bodyParser = require('body-parser');
const emailService = require('./services/emailService');
const paymentService = require('./services/paymentService');
const cloudinaryService = require('./services/cloudinaryService');
const elasticService = require('./services/elasticService');
const multer = require('multer');

router.get('/news', async (req, res) => {
  const url =`https://newsapi.org/v2/everything?q=+ai&pageSize=2&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;
  fetch(url)
  .then(async response => {
    const data = await response.json();
    if (data.status === 'error') {
      return res.sendStatus(400);
    }
    res.status(200).send(data);
  })
  .catch(err => {
    return res.sendStatus(500);
  })
});

// TODO: can be misused from postman, protect!!
router.post('/send-email', async (req, res) => {
  const isEmailSent = await emailService.sendEmail(req.body.email, req.body.email_type);
  if (!isEmailSent) {
    return res.status(500).send({ response: labels.EMAIL_SEND_FAILED });
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

    res.json({ paymentStatus: response });

  } catch (err) {
    console.log('error payment response: ', err.message);
    res.status(500).json({ paymentStatus: 'failed' });
  }
})

router.post('/upload-file', multer().single('image'), cloudinaryService.upload, (req, res) => {
  if (res.error) {
    return res.status(res.error['http_code']).json(res.error.message);
  }
  res.status(200).json({ imgPath: res.imgPath });
})

router.put('/products/ingest/:id?', elasticService.ingest, (req, res) => {
  if (res.error) {
    return res.status(500).json(res.error.message);
  }
  res.status(200).json(res.result);
})

router.get('/products/search/:text', elasticService.search, (req, res) => {
  if (res.error) {
    return res.status(500).json(res.error.message);
  }
  res.status(200).json(res.ids);
})


// TODO: validate input params id and uid (check others places for this on server side)
router.get('/download/:id', cloudinaryService.get);

// push notifications from firebase
router.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

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




/* OLD WAY - saved for ref */

// router.post('/upload-file-old', (req, res) => {
//   fileSystemService.uploadOld(req, res, (err) => {
//     if (err) {
//       return res.status(500).json(false);
//     }
//     res.status(200).json(true);
//   })
// })

// router.get('/product-images', async (req, res) => {
//   const images = await fileSystemService.getImagesOld(req.query.fileNames);
//   res.status(200).json(images);
// })

