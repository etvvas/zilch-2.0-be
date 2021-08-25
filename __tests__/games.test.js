const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');
const Game = require('../lib/models/Game.js')

// Will need to revisit timestamps upon date implementation

describe('Games tests', () => {
  beforeEach(() => {
    return setup(pool);
  });

  const gameOne = {
    firstUserId: '1',
    secondUserId: '2',
    timestampStart: '1:50'
  }

  const gameTwo = {
    firstUserId: '2',
    secondUserId: '3',
    timestampStart: '2:50'
  }

  it('POST a game', async () => {
    const res = await request(app)
      .post('/api/v1/games')
      .send(gameOne);

    expect(res.body).toEqual({
      id: '1',
      firstUserId: '1',
      secondUserId: '2',
      timestampStart: '1:50',
      winner: null,
      timestampEnd: null
    });
  });

  it('GET all games', async () => {
      const game1 = await Game.insert(gameOne)
      const game2 = await Game.insert(gameTwo)

      const res = await request(app)
        .get('/api/v1/games')

    expect(res.body).toEqual([game1, game2])
  })
});
