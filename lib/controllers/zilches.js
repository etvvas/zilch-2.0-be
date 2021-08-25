const {Router} = require('express');
const Zilch = require('../models/Zilch.js');

module.exports = Router ()
  .post('/', async (req, res, next) => {
    try{
      const zilch = await Zilch.insert(req.body);
      res.send(zilch);

    } catch(err) {
      next(err);
    }
  });
