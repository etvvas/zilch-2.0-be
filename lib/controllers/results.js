const { Router } = require('express');
const Result = require('../models/Result.js');

module.exports = Router()
    .post('/', async (req, res, next) => {
       try{ 
           const result = await Result.insert(req.body);
           res.send(result);

       } catch(err) {
           next(err);
       }
    });
