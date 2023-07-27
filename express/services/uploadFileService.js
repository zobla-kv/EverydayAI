const multer = require('multer');
const fs = require('fs');

const folder = './private/productImages/';

const storage = multer.diskStorage(
  {
    destination: folder,
    filename: (req, file, cb) => cb(null, file.originalname)
  }
);

// single(name of the FormField field on FE)
const upload = multer({ storage }).single('image');

// NOTE: cause error
// const upload = multer({ storage, limits: { fileSize: 1} }).single('image');

function createDirectory() {
  try {
    fs.mkdirSync(folder, { recursive: true });
  } catch(err) {
    // recursion?
    throw new Error('Failed to create product image directory. Please restart app.')
  }
}

module.exports = {
  upload,
  createDirectory
}