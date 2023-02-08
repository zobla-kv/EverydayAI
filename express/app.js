const express = require('express');
const app = express();
const cors = require('cors');

const routes = require('./routes');

const emailService = require('./emailService');

const corsConfig = {
  origin: '*',
  // Allow follow-up middleware to override this CORS for options
  // preflightContinue: true,
}

app.use('/api', cors(corsConfig), routes);

app.listen(3000, () => {
  console.log('server started on port 3000');
});


// TODO: trigger on rest
// emailService.sendEmail('houseofdogs.online@gmail.com', 'zobla', 'activation');

