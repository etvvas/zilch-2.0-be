const pool = require('../utils/pool.js');
const jwt = require('jsonwebtoken');

class UserGame {
  userId;
  gameId;

  constructor(row) {
    this.userId = row.user_id;
    this.gameId = row.game_id;
  }

  static async insert({ userId, gameId }) {

    const { rows } = await pool.query(`
      INSERT INTO users_games (user_id, game_id)
      VALUES ($1, $2)
      RETURNING *
    `, [userId, gameId]);

    return new UserGame(rows[0]);
  }

  static async getAllGames(userId) {

    const { rows } = await pool.query(`
      SELECT users.user_id, games.*
      FROM users_games
      JOIN users
      ON users_games.user_id = users.user_id
      JOIN games
      ON users_games.game_id = games.game_id
      WHERE users.user_id = $1
    `, [userId])

    return rows.map(row => (
      {
        userId: row.user_id,
        gameId: row.game_id,
        firstUserId: row.first_user_id,
        secondUserId: row.second_user_id,
        winner: row.winner,
        timestampStart: row.timestamp_start,
        timestampEnd: row.timestamp_end,
        targetScore: row.target_score
      }
    ))
  }
}

class UserZilch {
  userId;
  gameId;
  zilchId;

  constructor(rows) {
    this.userId = rows.user_id;
    this.gameId = rows.game_id;
    this.zilchId = rows.zilch_id;
  }

  static async insert({ userId, gameId, zilchId }) {

    const { rows } = await pool.query(`
      INSERT INTO users_zilches (user_id, game_id, zilch_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, gameId, zilchId]);

    return new UserZilch(rows[0]);
  }

  static async getAllZilches(userId) {
    const { rows } = await pool.query(
      `SELECT users.user_id, zilches.game_id, zilches.*
        FROM users
        JOIN users_zilches
        ON users_zilches.user_id = users.user_id
        JOIN zilches
        ON zilches.zilch_id = zilches.zilch_id
        WHERE users.user_id = $1
      `, [userId])

    return rows.map(row => ({
      userId: row.user_id,
      gameId: row.game_id,
      playerZilches: row.player_zilches
    }))
  }
}

class UserResults {
  userId;
  gameId;
  winner;
  targetScore;
  numberOfRounds;
  playerScore;
  timestampStart;
  timestampEnd;

  constructor(row) {
    this.userId = row.user_id;
    this.gameId = row.game_id;
    this.winner = row.winner;
    this.targetScore = row.target_score;
    this.numberOfRounds = row.number_of_rounds;
    this.playerScore = row.player_score;
    this.timestampStart = row.timestamp_start;
    this.timestampEnd = row.timestamp_end
  }

  static async getAllResults(userId) {
    const { rows } = await pool.query(`
    SELECT users.user_id, games.game_id, username, winner, target_score, number_of_rounds, player_score, timestamp_start, timestamp_end
    FROM users
    JOIN users_games
    ON users.user_id = users_games.user_id
	  JOIN games
	  ON users_games.game_id = games.game_id
	  JOIN results
	  ON results.game_id = games.game_id 
	  WHERE users.user_id = $1 AND results.user_id = $1`, [userId])

    return rows.map(row => new UserResults(row))
  }
}

module.exports = {
  UserGame,
  UserZilch,
  UserResults
}
