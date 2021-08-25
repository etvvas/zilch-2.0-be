const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');

describe('Games tests', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('POST a game', async () => {
    const res = await request(app)
      .post('/api/v1/games')
      .send({
        firstUserId: '1',
        secondUserId: '2',
        timestampStart: '1:50'
      });

    expect(res.body).toEqual({
      id: '1',
      firstUserId: '1',
      secondUserId: '2',
      timestampStart: '1:50'
    });
  });
});
