const redis = require('redis')
const { promisify } = require('util')
let redisClient;
let get;
let set;


describe('tests redis functions', () => {
  beforeEach(() => {
    redisClient = redis.createClient()
    set = promisify(redisClient.set).bind(redisClient)
    get = promisify(redisClient.get).bind(redisClient)
  })

  it('sets a game into cache', async () => {
    const newSet = await set('chase', 'abbott')

    console.log(newSet)

    expect(await get('chase')).toBe('abbott')
  })
})