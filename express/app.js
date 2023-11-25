// app
// NOTE: doesn't work with https in production, why?
// const https = require('https');
const http = require('http');
const path = require('path');
const express = require('express');
const app = express();

const dotenv = require('dotenv').config({
  path: path.resolve(__dirname, `environments/.env.${process.env.ENV ? process.env.ENV : 'development' }`)
});

if (dotenv.error) {
  console.log('FAILED TO LOAD ENV VARIABLES: ', dotenv.error.message);
}

const PORT = process.env.PORT || 3000;

// cors
const cors = require('./cors');

// endpoints
const routes = require('./routes');

// app settings
app.use(express.static(__dirname + '/public'));

app.use('/api', cors, express.json(), routes);

// const currentDir = path.join(__dirname);
// TODO: NO REQUESTS BOTH, request immediatelly hits public/index
// '*' for angular routing to work
// app.get('*', (req, res) => {
//   console.log('got request')
//   res.sendFile(path.join(currentDir, 'public', 'index.html'));
// })
// app.get('/', (req, res) => {
//   console.log('got request')
//   res.sendFile(path.join(currentDir, 'public', 'index.html'));
// })

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
