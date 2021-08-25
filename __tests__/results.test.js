const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');

describe('results routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  const resultsOne = {
    gameId: '1',
    userId:'1',
    numberOfRounds: 5,
    playerScore: 300
  }

  const resultsTwo = {
    gameId: '1',
    userId:'2',
    numberOfRounds: 5,
    playerScore: 500
  }

  test('creates results via POST', async () => {
    const res = await request(app)
      .post('/api/v1/results')
      .send(resultsOne);

    expect(res.body).toEqual({
      resultId: '1',
      gameId: '1',
      userId:'1',
      numberOfRounds: 5,
      playerScore: 300
    });
  });

});
