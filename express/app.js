// app
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
require('dotenv').config();

// cors
const cors = require('./cors');

// endpoints
const routes = require('./routes');

// app settings
app.use(express.static(path.join(__dirname, 'public', 'dist', 'house-of-dogs')))
app.use(express.json());
app.use('/api', cors, routes);

app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dist', 'house-of-dogs', 'index.html'));
})

// server
const sslServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app);

// console.log('sslServer: ', sslServer);

sslServer.listen(3000, () => {
  console.log('server started on port 3000');
});
