const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth.js');
const Game = require('../models/Game.js');

module.exports = Router()
    .post('/', ensureAuth, async (req, res, next) => {
       try{ 
           const game = await Game.insert(req.body);
        //    console.log(game)
           res.send(game);
       } catch(err) {
           next(err)
       }
    })

    .get('/', ensureAuth, async (req, res, next) => {
        try {
            const games = await Game.getAllGames()
            res.send(games);
        } catch(err) {
            next(err);
        }
    })

    .put('/:id', ensureAuth, async (req, res, next) => {
        try {
            const game = await Game.updateGame(req.params.id, req.body);
            res.send(game);
        } catch(err) {
            next(err)
        }
    })

    