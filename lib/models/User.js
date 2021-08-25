const pool = require('../utils/pool.js');
const jwt = require('jsonwebtoken');

module.export = class User{
  userId;
  username;
  passwordHash;
  avatar;

  constructor(row){
    this.userId = row.user_id;
    this.username = row.username;
    this.passwordHash = row.password_hash;
    this.avater = row.avatar;
  }

  static async signup({ username, passwordHash, avatar }){
    const { rows } = await pool.query(`
    INSERT INTO users (username, password_hash, avatar) VALUES ($1, $2, $3) RETURNING (user_id, username, avatar)`
    , [username, passwordHash, avatar]);

    return new User(rows[0]);
  }

  authToken(){
    return jwt.sign({ ...this }, process.env.APP_SECRET);
  }

  toJSON(){
    return {
      id: this.userId,
      username: this.username,
      avatar: this.avatar
    };
  }
};
