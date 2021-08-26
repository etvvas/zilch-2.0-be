const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');

describe.skip('results routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  const agent = request.agent(app);

  const user = {
    username: 'username',
    password: 'password',
    avatar: 'Avatar.png'
  };

  const resultsOne = {
    gameId: '1',
    userId: '1',
    numberOfRounds: 5,
    playerScore: 300
  }

  const resultsTwo = {
    gameId: '1',
    userId: '2',
    numberOfRounds: 5,
    playerScore: 500
  }

  test('creates results via POST', async () => {
    const { body } = await agent
      .post('/api/v1/signup')
      .send(user);

    const res = await agent
      .post('/api/v1/results')
      .send(resultsOne);

    expect(res.body).toEqual({
      resultId: '1',
      gameId: '1',
      userId: '1',
      numberOfRounds: 5,
      playerScore: 300
    });
  });
});
