const User = require('../models/User.js');
const bcrypt = require('bcrypt');

module.exports = class UserService {
  static async create({ username, password, avatar }){
    const passwordHash = await bcrypt.hash(password, Number(process.env.SALT));

    const user = await User.findUsername(username);
    if(user){
      throw new Error('Username already exists');
    }

    return User.signup({ username, passwordHash, avatar });
  }

  static async authenticate({ username, password }){
    
    const user = await User.findUsername(username);
    
    if(!user){
      throw new Error('Invalid username or password');
    }

    const matchingPassword = await bcrypt.compare(password, user.passwordHash);
    if(!matchingPassword){
      throw new Error('Invalid username or password');
    }

    return { username: user.username, userId: user.userId, avatar: user.avatar };
  }
};
