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

module.exports = {
  setGameData,
  getGameData
}