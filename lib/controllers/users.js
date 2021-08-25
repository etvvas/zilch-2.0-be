const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth.js');
const User = require('../models/User.js');

module.exports = Router()
  // removed :userId from route b/c req.user holds user auth info & is more secure
  .patch('/', ensureAuth, (req, res, next) => {
    User.updateAvatar(req.body, req.user)
      .then(user => res.send(user))
      .catch(next);
  })
  .delete('/', ensureAuth, (req, res, next) => {
    User.deleteUser(req.user)
      .then(user => res.send(user))
      .catch(next);
  });
  
