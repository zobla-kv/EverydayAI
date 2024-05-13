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

module.exports = aiRouter;
