const Game = require('../models/Game.js')
const { UserGame } = require('../models/UserStats.js')

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
}