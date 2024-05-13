// convert file size from bytes to mb
function getFileSizeInMb(bytes) {
  let fileSize = (bytes / (1024 * 1024)).toFixed(1);
  if (fileSize === '0.0') {
    fileSize = '0.1';
  }
  return fileSize + ' mb';
}

// get image orientation
function getImageOrientation(width, height) {
  return width > height ? 'landscape' : 'portrait';
}

module.exports = {
  getFileSizeInMb,
  getImageOrientation
}
