// app
const express = require('express');
const app = express();
// TODO: remove later if not needed
// remove body parser also
const cors = require('cors');

// cors validator
const corsValidator = require('./cors');

// endpoints
const routes = require('./routes');

// app settings
app.use(express.json());
app.use('/api', corsValidator, routes);

app.listen(3000, () => {
  console.log('server started on port 3000');
});
