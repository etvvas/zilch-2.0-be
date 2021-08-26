const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');
const Game = require('../lib/models/Game.js');
const UserGame = require('../lib/models/User-Game.js');

describe('users routes', () => {

  beforeEach(() => {
    return setup(pool);
  });

  const agent = request.agent(app)

  const userOne = {
    username: 'username',
    password: 'password',
    avatar: 'Avatar.png'
  }

  const userTwo = {
    username: 'somebody',
    password: 'password',
    avatar: 'Avatar.png'
  }

  const userThree = {
    username: 'no one',
    password: 'password',
    avatar: 'Avatar.png'
  }

  test('create a usergame via POST', async () => {
    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const game = await Game.insert({
      firstUserId: '1',
      secondUserId: '2',
      timestampStart: '1:50',
      targetScore: 5000
    })

    const userGame = {userId: user1.body.userId, gameId: game.gameId}

    const res = await agent
      .post('/api/v1/users/games')
      .send(userGame);

    expect(res.body).toEqual(userGame)
  })

  test('outputs all games of a user via GET', async () => {

    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const user2 = await agent
      .post('/api/v1/signup')
      .send(userTwo); 

    const user3 = await agent
      .post('/api/v1/signup')
      .send(userThree); 


    const game1 = await Game.insert({
      firstUserId: user1.body.userId.toString(),
      secondUserId: user2.body.userId.toString(),
      timestampStart: '1:50',
      targetScore: 5000
    })

    const game2 = await Game.insert({
      firstUserId: user2.body.userId.toString(),
      secondUserId: user1.body.userId.toString(),
      timestampStart: '2:50',
      targetScore: 3000
    })

    const game3 = await Game.insert({
      firstUserId: user2.body.userId.toString(),
      secondUserId: user3.body.userId.toString(),
      timestampStart: '5:00',
      targetScore: 10000
    })

    const userGame1 = await UserGame.insert({
      userId: user1.body.userId, 
      gameId: game1.gameId
    })

    const userGame2 = await UserGame.insert({
      userId: user2.body.userId, 
      gameId: game1.gameId
    })

    const userGame3 = await UserGame.insert({
      userId: user2.body.userId, 
      gameId: game2.gameId
    })

    const res = await agent
      .get(`/api/v1/users/${user2.body.userId}/games`)
    
    expect(res.body).toEqual([
      {userId: user2.body.userId, ...game1}, 
      {userId: user2.body.userId, ...game2}
    ]);
  });
});
