const Game = require('../models/Game.js')
const Result = require('../models/Result.js')
const Zilch = require('../models/Zilch.js')
const UberZilch = require('../models/UberZilch.js')

const { UserGame, UserZilch } = require('../models/UserStats.js')

module.exports = class GameService {
  static async initializeGame(gameData) {
    console.log('GAME DATA', gameData)
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
    const updatedGame = await Game.updateGame(gameData.gameId, gameData);

    const firstResults = await Result.insert(gameData.firstUser)
    const secondResults = await Result.insert(gameData.secondUser)

    const firstZilch = await Zilch.insert(gameData.firstUser)
    const firstUserZilch = await UserZilch.insert(firstZilch)

    const secondZilch = await Zilch.insert(gameData.secondUser)
    const secondUserZilch = await UserZilch.insert(secondZilch)

    const firstUberZilch = await UberZilch.insert(gameData.firstUser)
    const secondUberZilch = await UberZilch.insert(gameData.secondUser)

    return {
      updatedGame,
      firstResults,
      secondResults,
      firstZilch,
      secondZilch,
      firstUserZilch,
      secondUserZilch,
      firstUberZilch,
      secondUberZilch
    }
  }
}