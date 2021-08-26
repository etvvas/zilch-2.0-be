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
});
