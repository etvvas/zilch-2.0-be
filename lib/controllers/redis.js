const { Router } = require('express')
const { setGameData, getGameData } = require('../utils/redis.js')
const redis = require('redis')
// const ensureAuth = require()

// deployment 
const redisClient = redis.createClient(process.env.REDIS_URL)

//local
const redisClient = redis.createClient()

module.exports = Router()
  .post('/', (req, res, next) => {
    const key = Object.keys(req.body)
    setGameData(redisClient, key[0].toString(), req.body[key[0]])
      .then(() => {
        getGameData(redisClient, key[0].toString())
          .then(resp => res.send(resp))
      })
      .catch(next)

    // redisClient.quit()
  })
  .get('/:key', (req, res, next) => {
    getGameData(redisClient, req.params.key)
      .then(response => {
        if (!response) {
          res.status(500)
          res.send({ message: 'No Matching Key' })
        } else {
          res.send(response)
        }
      })
      .catch(next)
  })
