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