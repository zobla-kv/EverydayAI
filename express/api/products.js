const productsRouter = require('express').Router();
const multer = require('multer');
const cloudinaryService = require('../services/cloudinaryService');
const elasticService = require('../services/elasticService');
const firebaseService = require('../services/firebaseService');

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

// // disable it when done because it is not needed for prod, or implement protection
// productsRouter.get('/collection/:id', async (req, res) => {
//   const collection = req.params.id;
//   console.log('collection: ', collection);

//   try {
//     const documents = await firebaseService.getDocumentsFromCollection(collection);
//     res.status(200).json(documents);
//   }
//   catch(err) {
//     console.log('err: ', err);
//     res.sendStatus(400);
//   }
// })
// // disable it when done because it is not needed for prod, or implement protection
// // NOTE: Be extra careful here, need to continiously switch db when doing this to avoid reading and writing to the same db
// // NOTE: does not do exact copy, for example it messes up dates
// productsRouter.post('/collection/:id/bulk', async (req, res) => {
//   const collection = req.params.id;
//   console.log('collection: ', collection);
//   const documents = req.body;
//   console.log('documents: ', documents.length);

//   try {
//     const response = await firebaseService.addBulkDocumentsToCollection(documents, collection);
//     console.log('store db res: ', response)
//     res.sendStatus(200);
//   }
//   catch(err) {
//     console.log('err: ', err);
//     res.sendStatus(400);
//   }
// })

module.exports = productsRouter;
