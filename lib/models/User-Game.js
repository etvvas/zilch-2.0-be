const pool = require('../utils/pool.js');
const jwt = require('jsonwebtoken');

module.exports = class UserGame{
  userId;
  gameId;

  constructor(row){
    this.userId = row.user_id;
    this.gameId = row.game_id;
  }

  static async insert({userId, gameId}) {

    const {rows} = await pool.query(`
      INSERT INTO users_games (user_id, game_id)
      VALUES ($1, $2)
      RETURNING *
    `, [userId, gameId]);

    return new UserGame(rows[0]);
  }

  static async getAllGames(userId) {

    const {rows} = await pool.query(`
      SELECT users.user_id, games.*
      FROM users_games
      JOIN users
      ON users_games.user_id = users.user_id
      JOIN games
      ON users_games.game_id = games.game_id
      WHERE users.user_id = $1
    `, [userId])
    console.log('rows', rows)

    class AllGames {
      userId;
      gameId;
      firstUserId;
      secondUserId;
      winner;
      timestampStart;
      timestampEnd;
      targetScore;

      constructor(row) {
        this.userId = row.user_id;
        this.gameId = row.game_id;
        this.firstUserId = row.first_user_id;
        this.secondUserId = row.second_user_id;
        this.winner = row.winner;
        this.timestampStart = row.timestamp_start;
        this.timestampEnd = row.timestamp_end;
        this.targetScore = row.target_score;
      }
    }

    return rows.map(row => new AllGames(row))
  }
};
