const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const { session } = req.cookies;

  const payload = jwt.verify(session, process.env.APP_SECRET, function (err, decoded) {
    if (err) {
      return err
    }
    return decoded
  }
  );

  if (payload.passwordHash) delete payload.passwordHash;

  req.user = payload;
  next();
};
