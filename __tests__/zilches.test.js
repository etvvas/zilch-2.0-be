const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');

describe('zilches routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  const agent = request.agent(app);

  const user = {
    username: 'username',
    password: 'password',
    avatar: 'Avatar.png'
  };

  const zilchesOne = {
    gameId: '1',
    userId:'1',
    playerZilches: 2
  }

  const zilchesTwo = {
    gameId: '1',
    userId:'2',
    numberOfRounds: 5,
    playerZilches: 0
  }

  test('creates zilches per game via POST', async () => {
    const { body } = await agent
      .post('/api/v1/signup')
      .send(user);
      
    const res = await agent
      .post('/api/v1/zilches')
      .send(zilchesOne);

    expect(res.body).toEqual({
      zilchId: '1',
      gameId: '1',
      userId:'1',
      playerZilches: 2
    });
  });
});
