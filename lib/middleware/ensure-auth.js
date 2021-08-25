const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const { session } = req.cookies;
  const payload = jwt.verify(session, 
    process.env.APP_SECRET
  );
  req.user = payload;
  next();
};
