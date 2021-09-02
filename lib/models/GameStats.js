const pool = require('../utils/pool.js');

class GameResults {
  gameId;
  firstUserId;
  secondUserId;
  winner;
  timestampStart;
  timestampEnd;
  targetScore;
  userId;
  numberOfRounds;
  playerScore;

  constructor(row){
    this.gameId = row.game_id
    this.firstUserId = row.first_user_id
    this.secondUserId = row.second_user_id
    this.winner = row.winner
    this.timestampStart = row.timestamp_start
    this.timestampEnd = row.timestamp_end
    this.targetScore = row.target_score
    this.userId = row.user_id
    this.numberOfRounds = row.number_of_rounds
    this.playerScore = row.player_score
  }

  static async getGameResults(gameId) {
    const {rows} = await pool.query(`
    SELECT *
    FROM games
    JOIN results
    ON games.game_id = results.game_id
    WHERE games.game_id = $1
    `, [gameId])

    return rows.map(row => new GameResults(row))
  }
}

class GameZilches {
  gameId;
  userId;
  playZilches;

  constructor(row){
    this.gameId = row.game_id;
    this.userId = row.user_id;
    this.playerZilches = row.player_zilches
  }

  static async getGameZilches(gameId) {
    const {rows} = await pool.query(`
    SELECT *
    FROM games
    JOIN zilches
    ON games.game_id = zilches.game_id
    WHERE games.game_id = $1
    `, [gameId])

    return rows.map(row => new GameZilches(row))
  }
}

class GameUberZilches {
  gameId;
  userId;
  playUberZilches;

  constructor(row){
    this.gameId = row.game_id;
    this.userId = row.user_id;
    this.playerUberZilches = row.player_uber_zilches
  }

  static async getGameUberZilches(gameId) {
    const {rows} = await pool.query(`
    SELECT *
    FROM games
    JOIN uber_zilches
    ON games.game_id = uber_zilches.game_id
    WHERE games.game_id = $1
    `, [gameId])

    return rows.map(row => new GameUberZilches(row))
  }
}


module.exports = {
  GameResults,
  GameZilches,
  GameUberZilches
}
