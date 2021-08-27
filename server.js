const app = require("./lib/app.js");
const pool = require("./lib/utils/pool.js");
const httpServer = require("http").createServer(app);
const gameRooms = [];
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
const io = require("socket.io")(httpServer, {
  cors: true,
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  socket.on("JOIN_ROOM", ({userId, username, avatar}, roomName) => {
    if(!gameRooms.find(room => room.roomName === roomName)) {
      gameRooms.push({
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
    } else {
      const room = gameRooms.find(room => room.roomName === roomName)
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
    }

    socket.join(roomName);
    console.log(gameRooms);
  });
  
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