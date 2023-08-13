
const fs = require('fs');
const uploadService = require('./uploadFileService');
// NOTE: this is relative route (update if changed)
const { folder } = uploadService;

const { db } = require('./firebaseService');

// get multiple images from fs as buffer
async function getImages(fileNames) {
  const images = [];
  fileNames.forEach(name => {
    try {
      const file = fs.readFileSync(folder + name, 'base64');
      images.push(file);
    } catch (err) {
      images.push(null);
    }
  })
  return images;
}

// retrieve image from FS by imgPath from FE
async function getImage(fileName) {
  try {
    const file = fs.readFileSync(folder + fileName, 'base64');
    if (file.length === 0) {
      throw new Error('Empty file');
    }
    return file;
  } catch (err) {
    return null;
  }
}

// delete image (delete file?)
async function deleteImage(fileName) {
  try {
    fs.unlinkSync(folder + fileName);
  } catch (err) {
    db.collection('FailedImageDeletes').doc(fileName).set({ reason: err.message });
  }
}

module.exports = {
  getImages,
  getImage,
  deleteImage
}