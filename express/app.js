// app
const { ENV } = process.env;
const https = require('https');
const path = require('path');
const express = require('express');
const app = express();
const fs = require('fs');

const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, `environments/.env.${ENV ? ENV : 'development' }`)
});

const { SERVER_PORT, SSL_KEY_FILE, SSL_CERT_FILE } = process.env;

if (dotenv.error) {
  throw new Error('FAILED TO LOAD ENV VARIABLES: ' + dotenv.error.message);
}

// cors
const cors = require('./middleware/cors');

// endpoints
const apiRouter = require('./api/index');

// app settings
app.use(express.static(path.join(__dirname + '/public')));

// api handlers
app.use('/api', cors, express.json({ limit: '20mb' }), apiRouter);

// if route not found on server use ng routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public', 'index.html'));
});

// https server
https.createServer({
  key: fs.readFileSync(SSL_KEY_FILE),
  cert: fs.readFileSync(SSL_CERT_FILE)
}, app)
.listen(SERVER_PORT, () => {
  console.log(`server started on port ${SERVER_PORT}`);
})
