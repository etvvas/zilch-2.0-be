const redis = require("redis");
const app = require("./lib/app.js");
const GameService = require("./lib/services/GameService.js");
const httpServer = require("http").createServer(app);
const pool = require("./lib/utils/pool.js");
const io = require("socket.io")(httpServer, {
  cors: true,
});
const {
  setGameData,
  getGameData,
  getAllRoomData,
  getAllRooms,
  deleteRoom,
} = require("./lib/utils/redis.js");
const moment = require("moment");

const {
  roll,
  initializeDice,
  displayScoringOptions,
  filterSelected,
  updateDice,
} = require("./lib/utils/gameLogic.js");

const updateLobby = async (redisClient) => {
  const allGames = await getAllRoomData(
    redisClient,
    await getAllRooms(redisClient)
  );
  io.emit("UPDATE_LOBBY", allGames);
};
const joinLobby = async (socket, redisClient) => {
  const allGames = await getAllRoomData(
    redisClient,
    await getAllRooms(redisClient)
  );
  socket.emit("UPDATE_LOBBY", allGames);
};
///////////////////////////////////
//Set game object to redis after each change
//Get game object from redis on new events
//On each turn update Lobby
///////////////////////////////////

/////
//Send only nec pieces of state change or entire game object?
/////
io.on("connection", async (socket) => {
  console.log(`${socket.id} connected`);
  let currentUserId;
  let currentRoomName;

  //deployed
  const redisClient = redis.createClient(process.env.REDIS_URL)

  // local
  // const redisClient = redis.createClient();

  // get all rooms data;
  //on User entering lobby get all games from redis and send to user
  await joinLobby(socket, redisClient);

  socket.on("DISCONNECT", () => {
    //disconnect socket from server on component unmount
    socket.disconnect(true);

  });

  //get game room data on initial entry
  //AND any time there is an update
  socket.on("JOIN_ROOM", async ({ userId, username, avatar }, roomName) => {
    //Check for matching in redis db
    let matchingRoom = await getGameData(redisClient, roomName);

    //keep track of userId and roomName for disconnect event
    currentUserId = userId;
    currentRoomName = roomName;

    if (!matchingRoom) {
      //If no matching room in redis, initialize a room
      matchingRoom = {
        [roomName]: {
          ready: [],
          currentPlayerIndex: 0,
          players: [userId],
          roomName: roomName,
          rounds: 1,
          targetScore: 1000,
          firstUser: {
            userName: username,
            userId: userId,
            avatar: avatar,
            gameId: "",
            numberOfRounds: 0,
            playerScore: 0,
            roundScore: 0,
            playerZilches: 0,
            playerUberZilches: 0,
          },
        },
      };

      await setGameData(redisClient, roomName, matchingRoom);
      socket.emit("ROOM_JOINED", matchingRoom);
      socket.join(roomName);
      await updateLobby(redisClient);
    } else {
      //Does this do anything anymore???
      if (matchingRoom[roomName].players.find((player) => player === userId)) {
        return;
      }
      //If a room exists create second user property
      if (matchingRoom[roomName].players.length < 2) {
        let userIdentifier;
        //If user has left room and come back, assign their user property accordingly
        matchingRoom[roomName].secondUser
          ? (userIdentifier = "firstUser")
          : (userIdentifier = "secondUser");
        matchingRoom[roomName].players.push(userId);
        matchingRoom[roomName][userIdentifier] = {
          userName: username,
          userId: userId,
          avatar: avatar,
          gameId: "",
          numberOfRounds: 0,
          playerScore: 0,
          roundScore: 0,
          playerZilches: 0,
          playerUberZilches: 0,
        };

        await setGameData(redisClient, roomName, matchingRoom);
        socket.join(roomName);
        io.to(roomName).emit("ROOM_JOINED", matchingRoom);
        await updateLobby(redisClient);
      } else {
        socket.emit("FULL_ROOM");
      }
    }

    socket.on(
      "PLAYER_READY",
      //roomName and userId already accessible should probably be removed
      async (roomName, userId) => {
        const matchingRoom = await getGameData(redisClient, roomName);
        matchingRoom[roomName].ready.push(userId);
        await setGameData(redisClient, roomName, matchingRoom);

        io.to(roomName).emit("READY", matchingRoom);

        if (matchingRoom[roomName].ready.length > 1) {
          //Posting new game to SQL db
          const { newGame } = await GameService.initializeGame({
            firstUserId: matchingRoom[roomName].firstUser.userId,
            secondUserId: matchingRoom[roomName].secondUser.userId,
            timestampStart: moment().format(),
            targetScore: matchingRoom[roomName].targetScore,
          });

          //set user index
          if (Math.random() < 0.5) {
            matchingRoom[roomName].currentPlayerIndex = 0;
          }
          matchingRoom[roomName].currentPlayerIndex = 1;

          //Is it nec to update all three properties now or after
          matchingRoom[roomName].firstUser.gameId = newGame.gameId;
          matchingRoom[roomName].secondUser.gameId = newGame.gameId;
          matchingRoom[roomName].gameId = newGame.gameId;
          matchingRoom[roomName].timestampStart = newGame.timestampStart
          await setGameData(redisClient, roomName, matchingRoom);

          io.to(roomName).emit(
            "START_GAME",
            matchingRoom,
            matchingRoom[roomName].currentPlayerIndex,
            matchingRoom[roomName].players
          );
        }
      }
    );

    socket.on("ROLL", async dice => {
      //initialize die array that will be passed around per turn
      const gameState = await getGameData(redisClient, roomName);
      // if(gameState.dice.find(die => die.held == true))
      let matchingUser;
      let scoringOptions;

      if (dice.filter(die => die.held === true).length === 6) {
        gameState.dice = initializeDice()
        // return io.to(roomName).emit('FREE_ROLL')
      }

      gameState[roomName].firstUser.userId === currentUserId
        ? (matchingUser = "firstUser")
        : (matchingUser = "secondUser");

      //check if initial dice roll
      if (!gameState.dice) {
        gameState.dice = initializeDice();
        scoringOptions = displayScoringOptions(gameState.dice);
        if (scoringOptions[0].choice === 'ZILCH') {
          gameState[roomName].isFreeRoll = true
          io.to(roomName).emit('ROLLED', gameState.dice, [], gameState[roomName].isFreeRoll)
          delete gameState[roomName].isFreeRoll
          await setGameData(redisClient, roomName, gameState)
        } else {
          await setGameData(redisClient, roomName, gameState);
          io.to(roomName).emit("ROLLED", gameState.dice, scoringOptions);
        }
      } else {
        // reroll unheld dice
        gameState.dice = roll(gameState.dice);
        scoringOptions = displayScoringOptions(gameState.dice);

        if (scoringOptions[0].choice === 'ZILCH') {
          gameState[roomName][matchingUser].roundScore = 0
          gameState[roomName][matchingUser].playerZilches++
          if (gameState[roomName][matchingUser].playerZilches % 3 === 0) {
            gameState[roomName][matchingUser].playerUberZilches++
            gameState[roomName][matchingUser].score -= 500
          }
          gameState[roomName].currentPlayerIndex == 1 ? gameState[roomName].currentPlayerIndex = 0 : gameState[roomName].currentPlayerIndex = 1

          delete gameState.dice
          io.to(roomName).emit('ZILCH', gameState[roomName].players[gameState[roomName].currentPlayerIndex])
          await setGameData(redisClient, roomName, gameState)
        } else {
          await setGameData(redisClient, roomName, gameState);
          io.to(roomName).emit("ROLLED", gameState.dice, scoringOptions);
        }
      }
      //IF all dice held then reset dice, send dice on roll

    });

    socket.on("BANK", async () => {
      const currentGameState = await getGameData(redisClient, roomName);
      delete currentGameState.dice;


      let matchingUser;
      currentGameState[roomName].firstUser.userId === currentUserId
        ? (matchingUser = "firstUser")
        : (matchingUser = "secondUser");



      currentGameState[roomName][matchingUser].playerScore += currentGameState[roomName][matchingUser].roundScore
      currentGameState[roomName][matchingUser].roundScore = 0;
      currentGameState[roomName][matchingUser].numberOfRounds++
      currentGameState[roomName].rounds = Math.max(currentGameState[roomName].firstUser.numberOfRounds, currentGameState[roomName].secondUser.numberOfRounds)

      if (currentGameState[roomName][matchingUser].playerScore >= currentGameState[roomName].targetScore) {
        currentGameState[roomName].firstUserId = currentGameState[roomName].firstUser.userId
        currentGameState[roomName].secondUserId = currentGameState[roomName].secondUser.userId
        currentGameState[roomName].winner = currentGameState[roomName][matchingUser].userName
        currentGameState[roomName].timestampEnd = moment().format()

        await GameService.endGame(currentGameState[roomName])
        await deleteRoom(redisClient, roomName)
        return io.to(roomName).emit('GAME_OVER', currentGameState[roomName])
      }
      // switch current player
      currentGameState[roomName].currentPlayerIndex == 0
        ? (currentGameState[roomName].currentPlayerIndex = 1)
        : (currentGameState[roomName].currentPlayerIndex = 0);

      await setGameData(redisClient, roomName, currentGameState);

      io.to(roomName).emit(
        "BANKED",
        currentGameState,
        currentGameState[roomName].currentPlayerIndex,
        currentGameState[roomName].players
      );
    });

    socket.on("UPDATE_SELECTED", async (selectedOptions) => {
      let matchingUser;

      const roomData = await getGameData(redisClient, roomName)
      roomData[currentRoomName].firstUser.userId === currentUserId
        ? (matchingUser = "firstUser")
        : (matchingUser = "secondUser");
      roomData[roomName][matchingUser].roundScore += selectedOptions[0].score;
      const updatedDice = updateDice(roomData.dice, selectedOptions)
      roomData.dice = updatedDice
      if (roomData.dice.filter(die => die.held === true).length === 6) {
        roomData[currentRoomName].isFreeRoll = true
      }

      const scoringOptions = displayScoringOptions(updatedDice)

      // without toggle
      // with toggle, wait to setGameData on Roll or Bank
      io.to(roomName).emit('UPDATE_SCORING_OPTIONS', updatedDice, scoringOptions, roomData[currentRoomName])
      if (roomData[currentRoomName].isFreeRoll) {
        delete roomData[currentRoomName].isFreeRoll
      }
      await setGameData(redisClient, roomName, roomData)
    });

    socket.on("disconnect", async () => {
      // remove room from redis
      const roomData = await getGameData(redisClient, currentRoomName);
      // On disconnect remove player from players array
      const updatedRoomData = roomData?.[currentRoomName].players.filter(
        (playerId) => playerId !== currentUserId
      );

      if (updatedRoomData.length == 0) {
        //If no players in player array remove room
        await deleteRoom(redisClient, currentRoomName);
        await updateLobby(redisClient);
      } else {
        //If players in player array, update player array, and remove either firstUser or secondUser from game Object
        roomData[currentRoomName].players = updatedRoomData;
        let matchingUser;
        //Check if user is first or second
        roomData[currentRoomName].firstUser.userId === currentUserId
          ? (matchingUser = "firstUser")
          : (matchingUser = "secondUser");
        //delete first or second from game room Object
        delete roomData[currentRoomName][matchingUser];
        await setGameData(redisClient, currentRoomName, roomData);
        await updateLobby(redisClient);
      }
      console.log(socket.id, "disconnected");
      redisClient.end(true);
    });
  });
});
const { setGameData, getGameData } = require('./lib/utils/redis.js');
const moment = require('moment');


io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  //deployed
  const redisClient = redis.createClient(process.env.REDIS_URL)

  // local
  // const redisClient = redis.createClient()

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
        // io.emit('ENTER_LOBBY', gameRooms)

      } else {
        socket.emit('FULL_ROOM')
      }
    }

    socket.on('PLAYER_READY',
      // Ready buttons
      // ready: [] -> if length === 2 , start game
      async (room) => {
        const matchingRoom = await getGameData(redisClient, room)

        //post game to db
        const postGame = await GameService.initializeGame({
          firstUserId: matchingRoom[roomName].firstUser.userId,
          secondUserId: matchingRoom[roomName].secondUser.userId,
          timestampStart: moment().format(),
          targetScore: matchingRoom[roomName].targetScore
        })

        //set user index
        if (Math.random() < 0.5) {
          matchingRoom[roomName].currentPlayerIndex = 0
        } matchingRoom[roomName].currentPlayerIndex = 1

        console.log(matchingRoom[roomName])
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

