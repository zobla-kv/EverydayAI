// app
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3030;

const currentDir = path.join(__dirname);

// cors
const cors = require('./cors');

// endpoints
const routes = require('./routes');

// app settings
app.use(express.static('public'));
app.use(express.json());
app.use('/api', cors, routes);

// '*' for angular routing to work
app.get('*', (req, res) => {
  console.log('got request');
  res.sendFile(path.join(currentDir, 'public', 'index.html'));
})

// server
const sslServer = https.createServer({
  // NOTE: cert folders unused in production
  key: process.env.CERT_KEY,
  cert: process.env.CERT
}, app);

// console.log('sslServer: ', sslServer);

console.log('starting server...');

sslServer.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
