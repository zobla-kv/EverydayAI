const Https = require('https');
const cloudinary = require('cloudinary');
const { Readable } = require('stream');
const { getUserById, getProductById } = require('./firebaseService');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// upload image to cloudinary
async function upload(req, res, next) {
  Readable.from(req.file.buffer).pipe(
    cloudinary.v2.uploader.upload_stream({
      folder: 'hod' + '/' + process.env.NODE_ENV.toLowerCase()[0],
      public_id: req.file.originalname,
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'svg'],
      type: 'private'
    }, (error, response) => {
      if (error) {
        res.error = error;
        next();
        return;
      }
      // NOTE: cloudinary response contains image metadata (width, height, type, size)
      // res.cloudinary = response; // unused - this because calculated on FE
      res.imgPath = response.secure_url;
      next();
    })
  );
}

// get single image
async function get(req, res, next) {

  // block different host other than FE from accessing endpoint
  // PRODUCTION: check what is host in production
  // TODO: can be made top level middleware for all
  if (process.env.NODE_ENV === 'production') {
    if (req.headers.host !== process.env.HOST_URL) {
      return res.sendStatus(403);
    }
  }

  const product = await getProductById(req.params.id);

  if (!product) {
    return res.sendStatus(404);
  }

  // if price is above 0 check wheather user owns product
  if (Number(product.price) > 0 && product.discount < 100) {
    const userId = req.query.uid;

    if (!userId) {
      return res.sendStatus(403);
    }

    const user = await getUserById(userId);

    if (!user || !user.ownedItems.includes(product.id)) {
      return res.sendStatus(403);
    }
  }

  const url = product.imgPath;
  const fileName = product.title + '.' + product.metadata.extension;

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', product.metadata.fileSize);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  Https.get(url, (imgResponse) => imgResponse.pipe(res));

  // does the same but can include more actions
  // Http.get(url, (imgResponse) => {
  //   imgResponse.on('data', (chunk) =>  res.write(chunk));
  //   imgResponse.on('end', () => res.end());
  // })

}


module.exports = {
  upload,
  get
}
