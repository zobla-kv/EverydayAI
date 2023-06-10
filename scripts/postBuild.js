// run after 'ng build'
const fse = require('fs-extra');
const path = require('path');

const currentDir = path.resolve(__dirname, '../');
const ngDir = path.join(currentDir, 'ng');
const expressDir = path.join(currentDir, 'express');

/* Copy ng/dist -> express/public */
const ngDistDir = path.join(ngDir, 'dist');
const expressPublicDir = path.join(expressDir, 'public');
try {
  fse.copySync(ngDistDir, expressPublicDir, { overwrite: true })
} catch (err) {
  throw new Error('postBuild.js failed. New build not copied to express')
}

/* Copy shared package.json into express */
// const sharedPackageJson = path.join(currentDir, 'package.json');
// const expressPackageJson = path.join(currentDir, 'express', 'package.json');
// try {
//   fse.copySync(sharedPackageJson, expressPackageJson, { overwrite: true })
// } catch (err) {
//   throw new Error('postBuild.js failed. New package.json not copied to express')
// }