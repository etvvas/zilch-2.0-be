const redis = require('redis')
const { promisify } = require('util')
const { setGameData, getGameData } = require('../lib/utils/redis.js')
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
})