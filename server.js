const redis = require("redis");
const app = require("./lib/app.js");
const GameService = require("./lib/services/GameService.js");
const httpServer = require("http").createServer(app);
const pool = require("./lib/utils/pool.js");
const io = require("socket.io")(httpServer, {
    // cors: true
  cors: {
    origin: ['https://zilch-v2-staging.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
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
  let currentUserId = null
  let currentRoomName = null

  //deployed
  // const redisClient = redis.createClient(process.env.REDIS_URL)

  // local
  const redisClient = redis.createClient();
  //
  // get all rooms data;
  //on User entering lobby get all games from redis and send to user
  await joinLobby(socket, redisClient);

  socket.on("DISCONNECT", () => {
    console.log('DISCONNECT EVENT');
    //disconnect socket from server on component unmount
    socket.disconnect(true);

  });

  // socket.emit('ENTER_LOBBY', gameRooms)
  //get game room data on initial entry
  //AND any time there is an update
  socket.on("JOIN_ROOM", async ({ userId, username, avatar }, roomName) => {
    //Check for matching in redis db
    let matchingRoom = await getGameData(redisClient, roomName);
    currentUserId = userId;
    currentRoomName = roomName;
    if (!matchingRoom) {
      matchingRoom = {
        [roomName]: {

          ready: [],
          currentPlayerIndex: 0,
          players: [userId],
          roomName: roomName,
          rounds: 1,
          targetScore: 6000,
          firstUser: {
            userName: username,
            userId: userId,
            avatar: avatar,
            gameId: "",
            numberOfRounds: 0,
            playerScore: 0,
            roundScore: 0,
            roundScores: [],
            playerZilches: 0,
            playerUberZilches: 0,
            zilchRun: 0,
          },
        },
      };

      await setGameData(redisClient, roomName, matchingRoom);
      socket.emit("ROOM_JOINED", matchingRoom);
      socket.join(roomName);
      await updateLobby(redisClient);
    } else {
      //Does this do anything anymore???
      // if (matchingRoom[roomName].players.find((player) => player === userId)) {
      //   return;
      // }
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
          roundScores: [],
          playerZilches: 0,
          playerUberZilches: 0,
          zilchRun: 0,
        };

        await setGameData(redisClient, roomName, matchingRoom);
        socket.join(roomName);
        io.to(roomName).emit("ROOM_JOINED", matchingRoom);
        await updateLobby(redisClient);
      } else {
        currentUserId = null
        currentRoomName = null
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
          } else {
            matchingRoom[roomName].currentPlayerIndex = 1;
          }

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

          await updateLobby(redisClient)
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
          gameState[roomName][matchingUser].zilchRun++

          if (gameState[roomName][matchingUser].roundScores.length >= 4) gameState[roomName][matchingUser].roundScores.shift()
          gameState[roomName][matchingUser].roundScores.push({
            roundScore: displayRoundScore(gameState[roomName][matchingUser].roundScore, gameState[roomName][matchingUser].roundScores),
            totalScore: gameState[roomName][matchingUser].playerScore
          })
          if (gameState[roomName][matchingUser].zilchRun === 3) {
            gameState[roomName][matchingUser].playerUberZilches++
            gameState[roomName][matchingUser].score -= 500
            gameState[roomName][matchingUser].zilchRun = 0
          }

          const otherUser = getOtherUser(userId, gameState[roomName])

          gameState[roomName].currentPlayerIndex == 1 ? gameState[roomName].currentPlayerIndex = 0 : gameState[roomName].currentPlayerIndex = 1
          delete gameState.dice
          io.to(roomName).emit('ZILCH', gameState[roomName].players[gameState[roomName].currentPlayerIndex], gameState[roomName][otherUser].roundScores)
          await setGameData(redisClient, roomName, gameState)
          await updateLobby(redisClient)
        } else {
          gameState[roomName][matchingUser].zilchRun = 0
          await setGameData(redisClient, roomName, gameState);
          io.to(roomName).emit("ROLLED", gameState.dice, scoringOptions);
          // await updateLobby(redisClient)
        }
      }
      //IF all dice held then reset dice, send dice on roll

    });
    socket.emit('UPDATE')
    socket.on("BANK", async () => {
      const currentGameState = await getGameData(redisClient, roomName);
      delete currentGameState.dice;
      //Every round push the users score to their respective array
      //End Match
      let matchingUser;
      currentGameState[roomName].firstUser.userId === currentUserId
        ? (matchingUser = "firstUser")
        : (matchingUser = "secondUser");

      console.log('ROUND SCORE', displayRoundScore(currentGameState[roomName][matchingUser].roundScore, currentGameState[roomName][matchingUser].zilchRun));
      currentGameState[roomName][matchingUser].playerScore += currentGameState[roomName][matchingUser].roundScore
      if (currentGameState[roomName][matchingUser].roundScores.length >= 4) currentGameState[roomName][matchingUser].roundScores.shift()
      currentGameState[roomName][matchingUser].roundScores.push({
        roundScore: displayRoundScore(currentGameState[roomName][matchingUser].roundScore, currentGameState[roomName][matchingUser].roundScores),
        totalScore: currentGameState[roomName][matchingUser].playerScore
      })

      currentGameState[roomName][matchingUser].roundScore = 0;
      currentGameState[roomName][matchingUser].numberOfRounds++
      currentGameState[roomName].rounds = Math.max(currentGameState[roomName].firstUser.numberOfRounds, currentGameState[roomName].secondUser.numberOfRounds)
      if (currentGameState[roomName][matchingUser].playerScore >= currentGameState[roomName].targetScore) {
        //End Game
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
      const otherUser = getOtherUser(userId, currentGameState[roomName])
      await updateLobby(redisClient)

      io.to(roomName).emit(
        "BANKED",
        currentGameState,
        currentGameState[roomName].currentPlayerIndex,
        currentGameState[roomName].players,
        currentGameState[roomName][otherUser].roundScores
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

  });
  socket.on("disconnect", async () => {
    
    // remove room from redis
    if (currentRoomName) {
      const roomData = await getGameData(redisClient, currentRoomName);
      // On disconnect remove player from players array
      const UpdatedRoomPlayers = roomData?.[currentRoomName].players.filter(
        (playerId) => playerId !== currentUserId
        
      );
      if(roomData[currentRoomName].ready.length === 2 ) {
        console.log('Player disconnected');
        io.to(currentRoomName).emit('OPPONENT_DISCONNECT')
      }
      //Emit event if user disconnects mid game
     
      if (!UpdatedRoomPlayers || UpdatedRoomPlayers.length == 0) {
        //If no players in player array remove room
        await deleteRoom(redisClient, currentRoomName);
        await updateLobby(redisClient);
      } else {
        //If players in player array, update player array, and remove either firstUser or secondUser from game Object
       
        roomData[currentRoomName].players = UpdatedRoomPlayers;
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
    }



    console.log(socket.id, "disconnected");
    redisClient.end(true);
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
function getMatchingUser(currentUserId, gameState) {
  let matchingUser;
  gameState.firstUser.userId === currentUserId
    ? (matchingUser = "firstUser")
    : (matchingUser = "secondUser");
  return matchingUser
}

function getOtherUser(currentUserId, gameState) {
  let matchingUser;
  gameState.firstUser.userId === currentUserId
    ? (matchingUser = "secondUser")
    : (matchingUser = "firstUser");
  return matchingUser

}

function displayRoundScore(roundScore, roundScores) {

  if (roundScore === 0) {
    if (roundScores.length > 1) {
      if (roundScores.slice(-2)[0].roundScore === 'ZILCH' && roundScores.slice(-2)[1].roundScore === 'ZILCH') return 'UBER ZILCH! -500 PTS'

    }
    return 'ZILCH'
  }
  return roundScore
}
