const { Router } = require('express');
const Game = require('../models/Game.js');

module.exports = Router()
    .post('/', async (req, res, next) => {
       try{ 
           const game = await Game.insert(req.body);
        //    console.log(game)
           res.send(game);
       } catch(err) {
           next(err)
       }
    })

    .get('/', async (req, res, next) => {
        try {
            const games = await Game.getAllGames()
            res.send(games);
        } catch(err) {
            next(err);
        }
    })

    .put('/:id', async (req, res, next) => {
        try {
            const game = await Game.updateGame(req.params.id, req.body);
            res.send(game);
        } catch(err) {
            next(err)
        }
    })

    