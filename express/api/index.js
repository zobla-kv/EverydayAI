const router = require('express').Router();
const emailRouter = require('./email');
const userRouter = require('./user');
const productsRouter = require('./products');
const paypalRouter = require('./paypal');
const validators = require('../middleware/validators');
const bodyParser = require('body-parser'); // TODO: unused dependency

// TODO: protect routes, validate params, protect from postman
router.use('/email', [validators.email, validators.emailExists], emailRouter);
router.use('/user', userRouter);
router.use('/products', productsRouter);
router.use('/paypal', paypalRouter);

// disabled
// router.get('/news', async (req, res) => {
//   const url =`https://newsapi.org/v2/everything?q=+ai&pageSize=2&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;
//   fetch(url)
//   .then(async response => {
//     const data = await response.json();
//     if (data.status === 'error') {
//       return res.sendStatus(400);
//     }
//     res.status(200).send(data);
//   })
//   .catch(err => {
//     return res.sendStatus(500);
//   })
// });

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



// /* stripe */
// router.post('/stripe-create-payment-intent', async (req, res) => {
//   const user = req.body.user;
//   const card = user.card;
//   try {
//     const response = await paymentService.initiatePayment(user, card);

//     res.json({ paymentStatus: response });

//   } catch (err) {
//     console.log('error payment response: ', err.message);
//     res.status(500).json({ paymentStatus: 'failed' });
//   }
// })


// // push notifications from stripe
// router.post('/stripe-webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
//   const signature = req.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

//     // Handle the event
//     switch (event.type) {
//       case 'payment_intent.created':
//         paymentIntent = event.data.object;
//         console.log('payment_intent.created: ', `[${event.id}] created (${paymentIntent.id}): ${paymentIntent.status}`);
//       case 'payment_intent.succeeded':
//         paymentIntent = event.data.object;
//         console.log('payment_intent.succeeded: ', `[${event.id}] succeeded (${paymentIntent.id}): ${paymentIntent.status}`);
//         break;
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     res.json({ message: event.data });

//   } catch (err) {
//     console.log('webhook err: ', err);
//     res.status(400).json({ message: err.message });
//   }
// });
