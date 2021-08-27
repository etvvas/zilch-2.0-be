const { Router } = require('express')
const { setGameData, getGameData } = require('../utils/redis.js')
const redis = require('redis')
// const ensureAuth = require()
const redisClient = redis.createClient()

// process.env.REDIS_URL, {
//   tls: {
//     rejectUnauthorized: false
//   }
// }

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