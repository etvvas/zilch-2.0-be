const pool = require('../utils/pool.js');

class Zilch {
  zilchId;
  gameId;
  userId;
  playerZilches;

  constructor(row) {
    this.zilchId = row.zilch_id;
    this.gameId = row.game_id;
    this.userId = row.user_id;
    this.playerZilches = row.player_zilches;
  }

  static async insert ({gameId, userId, playerZilches}) {
    const {rows} = await pool.query(`
      INSERT INTO zilches (game_id, user_id, player_zilches)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [gameId, userId, playerZilches]);

    return new Zilch(rows[0]);
  }
}

module.exports = Zilch;
