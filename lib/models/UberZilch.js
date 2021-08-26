const pool = require('../utils/pool.js');

class UberZilch {
    uberZilchId;
    gameId;
    userId;
    playerUberZilches;

    constructor(row) {
        this.uberZilchId = row.uber_zilch_id;
        this.gameId = row.game_id;
        this.userId = row.user_id;
        this.playerUberZilches = row.player_uber_zilches;
    }

    static async insert ({gameId, userId, playerUberZilches}) {
        const { rows } = await pool.query(
            `INSERT INTO uber_zilches (game_id, user_id, player_uber_zilches)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [gameId, userId, playerUberZilches]
        )
        return new UberZilch(rows[0]);
    }
}

module.exports = UberZilch;