// TODO: change localhost for prod
module.exports = function corsValidator(req, res, next) {
  const origin = req.header('origin');
  if (origin.includes('localhost')) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-type');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
  } 
  next();
};