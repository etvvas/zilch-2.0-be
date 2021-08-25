const {Router} = require('express');
const ensureAuth = require('../middleware/ensure-auth.js');
const Zilch = require('../models/Zilch.js');

module.exports = Router ()
  .post('/', ensureAuth, async (req, res, next) => {
    try{
      const zilch = await Zilch.insert(req.body);
      res.send(zilch);

    } catch(err) {
      next(err);
    }
  });
