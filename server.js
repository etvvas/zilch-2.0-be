const redis = require('redis');
const app = require("./lib/app.js");
const httpServer = require("http").createServer(app);
const pool = require("./lib/utils/pool.js");
const io = require("socket.io")(httpServer, {
  cors: true
});
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

  socket.on('DISCONNECT', () => socket.disconnect(true))

  socket.emit('ENTER_LOBBY', gameRooms)
  //get game room data on initial entry
  //AND any time there is an update
  socket.on("JOIN_ROOM", ({ userId, username, avatar }, roomName) => {

    if (!gameRooms.find(room => room.roomName === roomName)) {
      gameRooms.push({
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
      });
      io.emit('ENTER_LOBBY', gameRooms)

      socket.join(roomName);

    } else {

      const room = gameRooms.find(room => room.roomName === roomName)

      if (room.players.length === 1) {
        room.players.push(userId)
        room.secondUser = {
          userName: username,
          userId: userId,
          avatar: avatar,
          gameId: "",
          numberOfRound: 0,
          playerScore: 0,
          playerZilches: 0,
          playerUberZilches: 0,
        }

        socket.join(roomName);
        io.emit('ENTER_LOBBY', gameRooms)

      } else {

        socket.emit('FULL_ROOM')
      }
    }
  });

  socket.on('PLAYER_READY',
    // Ready buttons
    // ready: [] -> if length === 2 , start game
    (userId, room) => {
      const currentRoom = gameRooms.find(gameRoom => gameRoom.roomName === room)
      console.log('currentRoom', currentRoom);
      currentRoom.ready.push(userId)
      if (currentRoom.ready.length === 2) {
        io.to([currentRoom.roomName]).emit('START_GAME', 'Ready to play!')
      }
    }
    // initialize game (/api/v1/startgame)
    // randomize first player
    // currentPlayer = room.players[userIndex]
    // userIndex is random number initially
    // userIndex = ++userIndex % 2;



  )

  socket.on('disconnect', () => {

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
