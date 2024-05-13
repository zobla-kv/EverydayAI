const aiRouter = require('express').Router();
const aiService = require('../services/aiService');
const rateLimit = require('express-rate-limit');

const firebaseService = require('../services/firebaseService');
const cloudinaryService = require('../services/cloudinaryService');

// TODO: make it global or use it where needed
const limiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, // 24 hours
	limit: 10, // number of requests per windowMs (by IP address)
  message: {
    status: 429,
    error: 'Too many requests',
    message: 'You have reached the maximum number of images today. Please try again after 24 hours.'
  }
});

aiRouter.get('/generate-image', limiter, async (req, res) => {
  const { device, prompt } = req.query;

  try {
    const image_url = await aiService.generateImage(device, prompt);
    res.status(201).json(image_url);
  }
  catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});


aiRouter.get('/test', async (req, res) => {
  const image_url = 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-2d64Y12XGUCBPwSHvXaGDWTF/user-b4gNvoAEbZMb18DGoehK7rY6/img-MoEAm3EJ3VtyC1GaVvd0ha8J.png?st=2024-05-13T09%3A44%3A32Z&se=2024-05-13T11%3A44%3A32Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-05-12T20%3A48%3A36Z&ske=2024-05-13T20%3A48%3A36Z&sks=b&skv=2021-08-06&sig=ZI8keN5spVze555IT2k2BjOr2UdxO6PcwoAZQMP9ZsY%3D'
  const userId = 'C73h964kpTSYD7VABf7UW6wDub73';
  const cartItems = [image_url];
  const isGenerated = true;
  const order = {
    id: '1',
    purchase_units: [
      {
        payments: {
          captures: [
            {
              amount: {
                value: 0.12
              }
            }
          ]
        }
      }
    ]
    // order.purchase_units[0].payments.captures[0].amount.value
  }
  try {
    let cb;
    if (isGenerated) {
      cb = cloudinaryService.uploadGenerated;
    }

    await firebaseService.handlePaymentSucceded(userId, order, cartItems, isGenerated, cb)
    .catch(err => err);
    res.status(201).json(image_url);
  }
  catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});

module.exports = aiRouter;
