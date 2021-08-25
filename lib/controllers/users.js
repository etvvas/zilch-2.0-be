const { Router } = require('express');

module.exports = Router()
  .post('/api/v1/signup', (req, res, next) => {
    res.send({ hello: 'world' });
  });
