const redis = require('redis')
const { promisify } = require('util')
const {
  setGameData,
  getGameData,
  getAllRooms,
  getAllRoomData,
  deleteRoom } = require('../lib/utils/redis.js')

let redisClient;
let get;
let set;


describe('tests redis functions', () => {
  beforeEach(() => {
    redisClient = redis.createClient()
    redisClient.flushall('ASYNC', function (err) {
      console.log(err)
    })
    set = promisify(redisClient.set).bind(redisClient)
    get = promisify(redisClient.get).bind(redisClient)
    keys = promisify(redisClient.keys).bind(redisClient)
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

  // it('gets all of the \'Room\' keys', async () => {
  //   await setGameData(redisClient, 'Room1', { room: 'room1' })
  //   await setGameData(redisClient, 'Room2', { room: 'room2' })
  //   await setGameData(redisClient, 'Room3', { room: 'room3' })
  //   await setGameData(redisClient, 'ROOm3', { room: 'room3' })
  //   await setGameData(redisClient, 'RooM3', { room: 'room3' })
  //   await setGameData(redisClient, 'room3', { room: 'room3' })

  //   const roomsArray = await getAllRooms(redisClient)

  //   expect(roomsArray).toEqual(['Room1', 'Room2', 'Room3'])
  // })

  // it('gets all of the data from all available rooms', async () => {
  //   await setGameData(redisClient, 'Room1', { room: 'room1' })
  //   await setGameData(redisClient, 'Room2', { room: 'room2' })
  //   await setGameData(redisClient, 'Room3', { room: 'room3' })
  //   await setGameData(redisClient, 'room1', { room: 'fakeroom' })
  //   await setGameData(redisClient, 'ROOM1', { room: 'fakeroom' })

  //   const roomData = await getAllRoomData(redisClient, await getAllRooms(redisClient))

  //   expect(roomData).toEqual([{ room: 'room1' }, { room: 'room2' }, { room: 'room3' }])
  // })

  it('deletes a room', async () => {
    await setGameData(redisClient, 'Room1', { room: 'room1' })
    await setGameData(redisClient, 'Room2', { room: 'room2' })
    await setGameData(redisClient, 'Room3', { room: 'room3' })

    const deletedRoom = await deleteRoom(redisClient, 'Room1')

    expect(deletedRoom).toBe(1)

    const getDeletedRoom = await getGameData(redisClient, 'Room1')

    expect(getDeletedRoom).toBeNull()

    const roomsArray = await getAllRooms(redisClient)

    expect(roomsArray).toEqual(['Room2', 'Room3'])
  })
})