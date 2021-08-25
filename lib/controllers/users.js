const { Router } = require('express');
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
