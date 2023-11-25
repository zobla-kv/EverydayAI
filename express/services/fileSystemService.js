// const fs = require('fs');

/* OLD WAY - saved for ref */

// // NOTE: this is relative route (update if changed)
// const folder = path.join(__dirname, '..', 'private/product-images/');

// const storage = multer.diskStorage(
//   {
//     destination: folder,
//     filename: (req, file, cb) => cb(null, file.originalname)
//   }
// );

// // single(name of the FormData field on FE) - store uploaded file locally
// const uploadOld = multer({ storage }).single('image');

// // NOTE: cause error
// // const upload = multer({ storage, limits: { fileSize: 1 } }).single('image');

// module.exports = {
//   folder,
//   uploadOld
// }

// // retrieve image from FS by imgPath from FE
// async function getImageOld(fileName) {
//   try {
//     const file = fs.readFileSync(folder + fileName, 'base64');
//     if (file.length === 0) {
//       throw new Error('Empty file');
//     }
//     return file;
//   } catch (err) {
//     return null;
//   }
// }

// // get multiple images from fs as buffer[]
// async function getImagesOld(fileNames) {
//   const images = [];
//   fileNames.forEach(name => {
//     try {
//       const file = fs.readFileSync(folder + name, 'base64');
//       images.push(file);
//     } catch (err) {
//       images.push(null);
//     }
//   })
//   return images;
// }



