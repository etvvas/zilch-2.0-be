const Game = require('../models/Game.js')
const Result = require('../models/Result.js')
const Zilch = require('../models/Zilch.js')
const UberZilch = require('../models/UberZilch.js')

const { UserGame, UserZilch, UserUberZilches } = require('../models/UserStats.js')

module.exports = class GameService {
  static async initializeGame(gameData) {
    const newGame = await Game.insert(gameData)
    const firstUserGame = await UserGame.insert({ userId: newGame.firstUserId, gameId: newGame.gameId })
    const secondUserGame = await UserGame.insert({ userId: newGame.secondUserId, gameId: newGame.gameId })

    return {
      newGame,
      firstUserGame,
      secondUserGame
    }
  }

  static async endGame(gameData) {
    await Game.updateGame(gameData.gameId, gameData);

    await Result.insert(gameData.firstUser)
    await Result.insert(gameData.secondUser)

    const firstZilch = await Zilch.insert(gameData.firstUser)
    await UserZilch.insert(firstZilch)

    const secondZilch = await Zilch.insert(gameData.secondUser)
    await UserZilch.insert(secondZilch)

    const firstUberZilch = await UberZilch.insert(gameData.firstUser)
    await UserUberZilches.insert(firstUberZilch)

    const secondUberZilch = await UberZilch.insert(gameData.secondUser)
    await UserUberZilches.insert(secondUberZilch)

    return gameData;
  }
}