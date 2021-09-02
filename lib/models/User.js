const pool = require('../utils/pool.js');
const jwt = require('jsonwebtoken');

module.exports = class User {
  userId;
  username;
  passwordHash;
  avatar;

  constructor(row) {
    this.userId = row.user_id;
    this.username = row.username;
    this.passwordHash = row.password_hash;
    this.avatar = row.avatar;
  }

  static async signup({ username, passwordHash, avatar }) {
    const { rows } = await pool.query(`
    INSERT INTO users (username, password_hash, avatar) VALUES ($1, $2, $3) RETURNING user_id, username, avatar`
      , [username, passwordHash, avatar]);

    return new User(rows[0]);
  }

  static async findUsername(username) {
    const { rows } = await pool.query(`
    SELECT * FROM users WHERE username = $1`, [username]);

    if (!rows[0]) return null;
    return new User(rows[0]);
  }

  static async findById(userId) {
    const { rows } = await pool.query(`
    SELECT * FROM users WHERE user_id = $1`, [userId]);

    if (!rows[0]) return null;
    return new User(rows[0]);
  }

  static async getAllUsers(){
    const { rows } = await pool.query(
      'SELECT * FROM users');

      if(!rows[0]) return null;
      return rows.map(row => new User(row));
  }

  static async updateAvatar({ avatar }, { userId }) {
    const { rows } = await pool.query(`
    UPDATE users
    SET avatar = $1
    WHERE user_id = $2
    RETURNING username, user_id, avatar`,
      [avatar, userId]);

    return new User(rows[0]);
  }

  static async deleteUser({ userId }) {
    const { rows } = await pool.query(`
    DELETE FROM users
    WHERE user_id = $1
    RETURNING username, user_id, avatar`,
      [userId]);

    return new User(rows[0]);
  }

  authToken() {
    return jwt.sign({ ...this }, process.env.APP_SECRET);
  }

  toJSON() {
    return {
      userId: this.userId,
      username: this.username,
      avatar: this.avatar
    };
  }
};
