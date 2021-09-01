const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth.js');
const Game = require('../models/Game.js');
const GameService = require('../services/GameService.js')

module.exports = Router()
  // creates a new game and two new UserGames
  .post('/start-game', ensureAuth, async (req, res, next) => {
    GameService.initializeGame(req.body)
      .then(data => res.send(data))
      .catch(next)
  })

  .get('/', ensureAuth, async (req, res, next) => {
    try {
      const games = await Game.getAllGames()
      res.send(games);
    } catch (err) {
      next(err);
    }
  })

  .put('/:id', ensureAuth, async (req, res, next) => {
    try {
      const game = await Game.updateGame(req.params.id, req.body);
      res.send(game);
    } catch (err) {
      next(err)
    }
  })

  .post('/end-game', ensureAuth, async (req, res, next) => {
    GameService.endGame(req.body)
      .then(data => res.send(data))
      .catch(next)
  })
