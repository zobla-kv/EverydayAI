// app
// NOTE: doesn't work with https in production, why?
// const https = require('https');
const { ENV, PORT = 3000 } = process.env;
const http = require('http');
const path = require('path');
const express = require('express');
const app = express();

const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, `environments/.env.${ENV ? ENV : 'development' }`)
});

if (dotenv.error) {
  console.log('FAILED TO LOAD ENV VARIABLES: ', dotenv.error.message);
}

// cors
const cors = require('./middleware/cors');

// endpoints
const apiRouter = require('./api/index');

// app settings
app.use(express.static(path.join(__dirname + '/public')));

// api handlers
app.use('/api', cors, express.json(), apiRouter);

// https server
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
