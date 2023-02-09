// app
const express = require('express');
const app = express();
require('dotenv').config();

// cors
const cors = require('./cors');

// endpoints
const routes = require('./routes');

// app settings
app.use(express.json());
app.use('/api', cors, routes);

app.listen(3000, () => {
  console.log('server started on port 3000');
});
