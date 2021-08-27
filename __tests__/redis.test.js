const redis = require('redis')
const { promisify } = require('util')
const { setGameData, getGameData } = require('../lib/utils/redis.js')
const app = require('../lib/app.js')
const request = require('supertest')

let redisClient;
let get;
let set;


describe('tests redis functions', () => {
  beforeEach(() => {
    redisClient = redis.createClient(6379, '127.0.0.1')
    redisClient.flushall('ASYNC', function (err) {
      console.log(err)
    })
    set = promisify(redisClient.set).bind(redisClient)
    get = promisify(redisClient.get).bind(redisClient)

  })

  // afterEach(() => {
  //   redisClient.end(true)
  // })

  it('sets a game into cache', async () => {
    await setGameData(redisClient, 'chase', { chase: 'abbott' })

    const getData = await get('chase')

    expect(JSON.parse(getData)).toEqual({ chase: 'abbott' })
  })

  it('gets specific set of data from the cache', async () => {
    await setGameData(redisClient, 'chase', { chase: 'abbott' })

    const retrievedData = await getGameData(redisClient, 'chase')

    expect(retrievedData).toEqual({ chase: 'abbott' })
  })

  it('makes a request to the api to post data to the redis db', async () => {
    const data = {
      game1: {
        gameId: '1',
        firstUserId: '1',
        secondUserId: '2',
        winner: 'chase',
        timestampStart: '1:50',
        timestampEnd: '2:00',
        targetScore: 5000,
        firstUser: {
          userId: '1',
          gameId: '1',
          numberOfRounds: 10,
          playerScore: 3000,
          playerZilches: 3,
          playerUberZilches: 1
        },
        secondUser: {
          userId: '2',
          gameId: '1',
          numberOfRounds: 10,
          playerScore: 5000,
          playerZilches: 4,
          playerUberZilches: 1
        }
      }
    }

    console.log(JSON.stringify(data))
    const { body } = await request(app)
      .post('/api/v1/games/redis')
      .send(data)

    expect(body).toEqual(data.game1)
  })
})