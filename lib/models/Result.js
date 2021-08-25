const pool = require("../utils/pool.js");

class Result {
  resultId;
  gameId;
  userId;
  numberOfRounds;
  playerScore;

  constructor(row) {
    this.resultId = row.result_id;
    this.gameId = row.game_id;
    this.userId = row.user_id;
    this.numberOfRounds = row.number_of_rounds;
    this.playerScore = row.player_score;
  }

  static async insert({gameId, userId, numberOfRounds, playerScore}) {
    const {rows} = await pool.query(`
      INSERT INTO results (game_id, user_id, number_of_rounds, player_score)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [gameId, userId, numberOfRounds, playerScore]);

    return new Result(rows[0]);
  }
}

module.exports = Result;
