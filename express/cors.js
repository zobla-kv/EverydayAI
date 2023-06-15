// PRODUCTION: change localhost for prod
// TODO: change logic? (this only makes it harder for FE)
module.exports = function cors(req, res, next) {
  const origin = req.header('origin');
  if (origin && origin.includes('https://house-of-dogs-zobla-kv.vercel.app/')) {
    console.log('cors fired');
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-type');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
  }
  next();
};
