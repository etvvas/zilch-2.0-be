const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth.js');
const UserService = require('../services/UserService.js');

const fullDay = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/api/v1/signup', (req, res, next) => {
    UserService.create(req.body)
      .then(user => {
        res.cookie('session', user.authToken(), {
          httpOnly: true,
          maxAge: fullDay
        });
        res.send(user);
      })
      .catch(next);
  })
  .post('/api/v1/login', (req, res, next) => {
    UserService.authenticate(req.body)
      .then(user => {
        res.cookie('session', user.authToken(), {
          httpOnly: true,
          maxAge: fullDay
        });
        res.send(user);
      })
      .catch(next);
  });
  
// .get('/api/v1/verify', ensureAuth, (req, res) => {
//   res.send(req.user);
// });
// .get('/api/v1/logout', (req, res) => {
//   res.clearCookie('session', {
//     httpOnly: true,
//     maxAge: fullDay
//   });
// });
