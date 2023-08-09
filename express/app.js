// app
// NOTE: doesn't work with https in production, why?
// const https = require('https');
const http = require('http');
const path = require('path');
const express = require('express');
const app = express();

require('dotenv').config();

// comment out for onrender prod
// require('dotenv').config({
//   path: path.resolve(__dirname, `environments/${process.env.ENV}.env`)
// });

// create directory for product images
const uploadFileService = require('./services/uploadFileService');
uploadFileService.createDirectory();

const PORT = process.env.PORT || 3000;

const currentDir = path.join(__dirname);

// cors
const cors = require('./cors');

// endpoints
const routes = require('./routes');

// app settings
app.use(express.static(__dirname + '/public'));

app.use('/api', cors, express.json(), routes);

// '*' for angular routing to work
app.get('*', (req, res) => {
  console.log('got request')
  res.sendFile(path.join(currentDir, 'public', 'index.html'));
})

// server
// const sslServer = https.createServer({
//   // NOTE: cert folders unused in production
//   key: process.env.CERT_KEY.replace(/\\n/g, '\n'),
//   cert: process.env.CERT.replace(/\\n/g, '\n'),
// }, app);


console.log('starting server...');
console.log('HTTP SERVER')

http.createServer(app).listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
})
