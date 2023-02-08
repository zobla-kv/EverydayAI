const router = require('express').Router();

router.get('/', (req, res) => {
  res.status(203).send({ response: 'bob' });
});

router.get('/send-verification-email', (req, res) => {
  console.log('got get request: ', req);
  res.sendStatus(200);
})

router.post('/send-verification-email', (req, res) => {
  console.log('got post request: ', req);
  console.log('req.body: ', req.headers);
})

module.exports = router;
