const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth.js');
const User = require('../models/User.js');
const { UserGame, UserZilch } = require('../models/UserStats.js');

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
  })

  .post('/games', ensureAuth, async (req, res, next) => {
    // console.log('controller', req.body)
    const data = await UserGame.insert(req.body);
    // workaround - for some reason it's returning userId, but not gameId in the test
    const object = {};
    object.userId = data.userId;
    object.gameId = data.gameId;
    res.send(object)  
  })

  .get('/:id/games', ensureAuth, (req, res, next) => {
    UserGame.getAllGames(req.params.id)
      .then(games => res.send(games))
      .catch(next);
  })

  .get('/:id/zilches', ensureAuth, (req, res, next) => {
    UserZilch.getAllZilches(req.params.id)
    .then(zilches => res.send(zilches))
    .catch(next)
  })

  .get('/:id/results', ensureAuth, (req, res, next) => {
    res.send({hello: 'world'})
  })

  
