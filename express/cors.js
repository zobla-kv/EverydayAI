module.exports = function cors(req, res, next) {
  const origin = req.header('origin');
  if (origin && origin.includes(process.env.HOST_URL)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-type');
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  }
  next();
};
