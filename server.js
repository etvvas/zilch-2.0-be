const redis = require('redis');
const app = require("./lib/app.js");
const GameService = require('./lib/services/GameService.js');
const httpServer = require("http").createServer(app);
const pool = require("./lib/utils/pool.js");
const io = require("socket.io")(httpServer, {
  cors: true
});
const { setGameData, getGameData, getAllRoomData, getAllRooms } = require('./lib/utils/redis.js');
const moment = require('moment');

const updateLobby = async (redisClient) => {
  const allGames = await getAllRoomData(redisClient, await getAllRooms(redisClient))
  io.emit('UPDATE_LOBBY', allGames)
}
const joinLobby = async (socket, redisClient) => {
  const allGames = await getAllRoomData(redisClient, await getAllRooms(redisClient))
  socket.emit('UPDATE_LOBBY', allGames)
}


io.on("connection", async (socket) => {
  console.log(`${socket.id} connected`);

  //deployed
  // const redisClient = redis.createClient(process.env.REDIS_URL)

  // local
  const redisClient = redis.createClient()

  // get all rooms data;
  await joinLobby(socket, redisClient)
  
  socket.on('DISCONNECT', () =>{ 
    socket.disconnect(true)
    console.log('DISCONNECT', socket.disconnected);
  })


  //get game room data on initial entry
  //AND any time there is an update
  socket.on("JOIN_ROOM", async ({ userId, username, avatar }, roomName) => {
    let matchingRoom = await getGameData(redisClient, roomName)

    if (!matchingRoom) {
      matchingRoom = {
        [roomName]: {
          ready: [],
          currentPlayerIndex: 0,
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
      socket.emit('ROOM_JOINED', matchingRoom)
      socket.join(matchingRoom[roomName].roomName);
      await updateLobby(redisClient)

    } else {

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
        //
        await setGameData(redisClient, roomName, matchingRoom)
        socket.join(matchingRoom[roomName].roomName);
        io.to(matchingRoom[roomName].roomName).emit('ROOM_JOINED', matchingRoom)
        await updateLobby(redisClient)
        // io.emit('ENTER_LOBBY', gameRooms)

      } else {
        socket.emit('FULL_ROOM')
      }
    }

    socket.on('PLAYER_READY',
      // Ready buttons
      // ready: [] -> if length === 2 , start game
      async (roomName, userId) => {
        const matchingRoom = await getGameData(redisClient, roomName)
        matchingRoom[roomName].ready.push(userId)
        await setGameData(redisClient, roomName, matchingRoom)

        io.to(roomName).emit('READY', matchingRoom)
        //post game to db
        // // // // // // // // // // // 
        
        // // // // // // // // // // 

        if(matchingRoom[roomName].ready.length > 1) {
          
          const {newGame} = await GameService.initializeGame({
            firstUserId: matchingRoom[roomName].firstUser.userId,
            secondUserId: matchingRoom[roomName].secondUser.userId,
            timestampStart: moment().format(),
            targetScore: matchingRoom[roomName].targetScore
          })

          //set user index
          if (Math.random() < 0.5) {
            matchingRoom[roomName].currentPlayerIndex = 0;
          } matchingRoom[roomName].currentPlayerIndex = 1;
        
          matchingRoom[roomName].firstUser.gameId = newGame.gameId;
          matchingRoom[roomName].secondUser.gameId = newGame.gameId;
          matchingRoom[roomName].gameId = newGame.gameId;

          io.to(roomName).emit('START_GAME', matchingRoom)
        }
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

