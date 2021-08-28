// reference code https://stackoverflow.com/questions/6716463/using-redis-and-node-js-issue-why-does-redis-get-return-false

const setGameData = (client, key, data) => {
  const set = new Promise((resolve, reject) => {
    client.set(key, JSON.stringify(data), function (err, reply) {
      if (err) {
        reject(err)
      } else {
        resolve(reply)
      }
    })
  })

  return set
}

const getGameData = (client, key) => {
  const get = new Promise((resolve, reject) => {
    client.get(key, function (err, reply) {
      if (err) {
        reject(err)
      }
      resolve(JSON.parse(reply))
    })
  })

  return get
}

const getAllRooms = (client) => {
  return new Promise((resolve, reject) => {
    client.keys('*Room*', function (err, reply) {
      if (err) {
        reject(err)
      } else {
        resolve(reply)
      }
    })
  })
}

const getAllRoomData = (client, roomKeys) => {
  return Promise.all(roomKeys.map(key => {
    return new Promise((resolve, reject) => {
      client.get(key, function (err, reply) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(reply))
        }
      })
    })
  }))
}

const deleteRoom = (client, roomKey) => {
  return new Promise((resolve, reject) => {
    client.DEL(roomKey, function (err, reply) {
      if (err) {
        reject(err)
      } else {
        resolve(reply)
      }
    })
  })
}

module.exports = {
  setGameData,
  getGameData,
  getAllRooms,
  getAllRoomData,
  deleteRoom
}