const productsRouter = require('express').Router();
const multer = require('multer');
const cloudinaryService = require('../services/cloudinaryService');
const elasticService = require('../services/elasticService');

productsRouter.post('/upload-image', multer().single('image'), cloudinaryService.upload, (req, res) => {
  if (res.error) {
    return res.status(res.error['http_code']).json(res.error.message);
  }
  res.status(200).json({ imgPaths: res.imgPaths });
});

productsRouter.put('/ingest/:id?', elasticService.ingest, (req, res) => {
  if (res.error) {
    // return res.status(500).json(res.error.message);
    return res.status(500).json(res.error);
  }
  res.status(200).json(res.result);
});

productsRouter.get('/search/:text', elasticService.search, (req, res) => {
  if (res.error) {
    return res.status(500).json(res.error);
  }
  res.status(200).json(res.ids);
});

productsRouter.get('/download/:id', cloudinaryService.get);

module.exports = productsRouter;
