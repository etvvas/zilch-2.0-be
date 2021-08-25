const pool = require('../utils/pool.js');
// Will need to revisit timestamps upon date implementation

class Game {
    id;
    firstUserId;
    secondUserId;
    winner;
    timestampStart;
    timestampEnd;

    constructor(row){
        this.id = row.id;
        this.firstUserId = row.first_user_id;
        this.secondUserId = row.second_user_id;
        this.winner = row.winner;
        this.timestampStart = row.timestamp_start;
        this.timestampEnd = row.timestamp_end;
    }

    static async insert({firstUserId, secondUserId, winner, timestampStart, timestampEnd}) {
        const { rows } = await pool.query(
            `INSERT INTO games (first_user_id, second_user_id, winner, timestamp_start, timestamp_end)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [firstUserId, secondUserId, winner, timestampStart, timestampEnd]
        )
        return new Game(rows[0])
    }

    static async getAllGames(){
        const { rows } = await pool.query(
            `SELECT * FROM games
            ORDER BY timestamp_start ASC`
        )
        console.log(rows)
        return rows.map(row => new Game(row))
    }
}

module.exports = Game;