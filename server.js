const redis = require('redis');
const app = require("./lib/app.js");
const httpServer = require("http").createServer(app);
const pool = require("./lib/utils/pool.js");
const io = require("socket.io")(httpServer, {
  cors: true
});
const { setGameData, getGameData } = require('./lib/utils/redis.js')

const gameRooms = [];

//placeholder comment

// const gameRoom = {
//   players: [],
//   roomName: "",
//   rounds: 0,
//   winner: "",
//   timeStampStart: "",
//   timeStampEnd: "",
//   targetScore: "",
//   firstUser: {
//     userId: "",
//     gameId: "",
//     numberOfRound: 0,
//     playerScore: 0,
//     playerZilches: 0,
//     playerUberZilches: 0,
//   },
//   secondUser: {
//     userId: "",
//     gameId: "",
//     numberOfRound: 0,
//     playerScore: 0,
//     playerZilches: 0,
//     playerUberZilches: 0,
//   },
// };

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  //deployed
  // const redisClient = redis.createClient(process.env.REDIS_URL)

  // local
  const redisClient = redis.createClient()

  // get all rooms data;

  socket.on('DISCONNECT', () => socket.disconnect(true))

  // socket.emit('ENTER_LOBBY', gameRooms)
  //get game room data on initial entry
  //AND any time there is an update
  socket.on("JOIN_ROOM", async ({ userId, username, avatar }, roomName) => {
    let matchingRoom = await getGameData(redisClient, roomName)

    if (!matchingRoom) {
      matchingRoom = {
        [roomName]: {
          ready: [],
          players: [userId],
          roomName: roomName,
          rounds: 0,
          targetScore: 5000,
          firstUser: {
            userName: username,
            userId: userId,
            avatar: avatar,
            gameId: "",
            numberOfRound: 0,
            playerScore: 0,
            playerZilches: 0,
            playerUberZilches: 0,
          }
        }
      };

      await setGameData(redisClient, roomName, matchingRoom)
      // io.emit('ENTER_LOBBY', gameRooms)

      socket.join(matchingRoom[roomName]);

    } else {

      // let matchingRoom = await getGameData(redisClient, roomName)
      console.log('MATCHING ROOM', matchingRoom)
      if (matchingRoom[roomName].players.length < 2) {
        matchingRoom[roomName].players.push(userId)
        matchingRoom[roomName].secondUser = {
          userName: username,
          userId: userId,
          avatar: avatar,
          gameId: "",
          numberOfRound: 0,
          playerScore: 0,
          playerZilches: 0,
          playerUberZilches: 0,
        }

        await setGameData(redisClient, roomName, matchingRoom)
        socket.join(matchingRoom[roomName]);
        // io.emit('ENTER_LOBBY', gameRooms)

      } else {
        socket.emit('FULL_ROOM')
      }
    }
  });

  socket.on('PLAYER_READY',
    // Ready buttons
    // ready: [] -> if length === 2 , start game
    async (room) => {
      const matchingRoom = await getGameData(redisClient, room)
      console.log('READY', matchingRoom)
      // room.push(userId)
      // if (room.ready.length <= 2) {
      //   // alert users that game is starting
      //   io.to(room.roomName).emit('READY', username)
      // currentRoom.ready.push(userId)
      // if (currentRoom.ready.length === 2) {
      //   io.to([currentRoom.roomName]).emit('START_GAME', 'Ready to play!')
      // }
      // }
    })
  // initialize game (/api/v1/startgame)
  // randomize first player
  // currentPlayer = room.players[userIndex]
  // userIndex is random number initially
  // userIndex = ++userIndex % 2;



  // )

  socket.on('disconnect', () => {
    // remove room from redis

    console.log(socket.id, 'disconnected');
    redisClient.end(true)
  })
});

const PORT = process.env.PORT || 7890;


httpServer.listen(PORT, () => {
  console.log(`http server on ${PORT}`);
});

process.on("exit", () => {
  console.log("Goodbye!");
  pool.end();
});

module.exports = io;
