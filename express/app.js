// app
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
require('dotenv').config();

const currentDir = path.join(__dirname);

// cors
const cors = require('./cors');

// endpoints
const routes = require('./routes');

// app settings
app.use(express.static(path.join(currentDir, 'public', 'dist')));
app.use(express.json());
app.use('/api', cors, routes);

app.get('', (req, res) => {
  res.sendFile(path.join(currentDir, 'public', 'dist', 'index.html'));
})

// server
const sslServer = https.createServer({
  key: fs.readFileSync(path.join(currentDir, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(currentDir, 'cert', 'cert.pem'))
}, app);

// console.log('sslServer: ', sslServer);

sslServer.listen(3000, () => {
  console.log('server started on port 3000');
});
