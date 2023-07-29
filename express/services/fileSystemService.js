
const fs = require('fs');
const uploadService = require('./uploadFileService');
// NOTE: this is relative route (update if changed)
const { folder } = uploadService;

// retrieve image from FS by imgPath from FE
// used as middleware
function getImage(req, res, next) {
  const buffer = fs.readFileSync(folder + req.params.name);
  res.body = { buffer };
  res.responseType = req.params.name.split('.')[1];
  next();
}

module.exports = {
  getImage
}