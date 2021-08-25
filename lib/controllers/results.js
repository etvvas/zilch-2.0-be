const { Router } = require('express');
const ensureAuth = require('../middleware/ensure-auth.js');
const Result = require('../models/Result.js');

module.exports = Router()
    .post('/', ensureAuth, async (req, res, next) => {
       try{ 
           const result = await Result.insert(req.body);
           res.send(result);

       } catch(err) {
           next(err);
       }
    })
    
    
    
    
    ;
