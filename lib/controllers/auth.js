const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth.js');
const UserService = require('../services/UserService.js');

const fullDay = 1000 * 60 * 60 * 24;

let secure;

(process.env.SECURE == 'false') ? secure = false : secure = true

module.exports = Router()
  .post('/signup', (req, res, next) => {
    UserService.create(req.body)
      .then(user => {
        res.cookie('session', user.authToken(), {
          httpOnly: true,
          maxAge: fullDay,
          sameSite: 'none',
          secure: secure
        });
        res.send(user);
      })
      .catch(next);
  })
  .post('/login', (req, res, next) => {
    UserService.authenticate(req.body)
      .then(user => {
        res.cookie('session', user.authToken(), {
          httpOnly: true,
          maxAge: fullDay,
          sameSite: 'none',
          secure: secure
        });
        res.send({ userId: user.userId, username: user.username, avatar: user.avatar });
      })
      .catch(next);
  })
  .get('/verify', ensureAuth, (req, res) => {
    res.status(200).send(req.user);
  })
  .get('/logout', (req, res) => {
    res.clearCookie('session', {
      httpOnly: true,
      maxAge: fullDay,
      sameSite: 'none',
      secure: secure
    });
    res.send({ message: 'No active user' });
  });
