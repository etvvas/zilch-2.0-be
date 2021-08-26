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
};
