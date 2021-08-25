const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');
const Game = require('../lib/models/Game.js')

const agent = request.agent(app);

// Will need to revisit timestamps upon date implementation

describe('Games tests', () => {
  beforeEach(() => {
    return setup(pool);
  });

  const user = {
    username: 'chase',
    password: 'password',
    avatar: 'Avatar.png'
  };

  const gameOne = {
    firstUserId: '1',
    secondUserId: '2',
    timestampStart: '1:50',
    targetScore: 5000
  }

  const gameTwo = {
    firstUserId: '2',
    secondUserId: '3',
    timestampStart: '2:50',
    targetScore: 3000
  }

  it('POST a game', async () => {

    const { body } = await agent
      .post('/api/v1/signup')
      .send(user);

    const res = await agent
      .post('/api/v1/games')
      .send(gameOne);

    expect(res.body).toEqual({
      gameId: '1',
      firstUserId: '1',
      secondUserId: '2',
      timestampStart: '1:50',
      winner: null,
      timestampEnd: null,
      targetScore: 5000
    });
  });

  it('GET all games', async () => {
      const game1 = await Game.insert(gameOne)
      const game2 = await Game.insert(gameTwo)

      const res = await agent
        .get('/api/v1/games')

    expect(res.body).toEqual([game1, game2])
  });

  it('update a game with winner via PUT', async () => {
      const game1 = await Game.insert(gameOne);

      game1.winner = 'JOE'

      const res = await agent
        .put(`/api/v1/games/${game1.gameId}`)
        .send(game1)
    
        expect(res.body).toEqual({
            ...game1,
            winner: 'JOE'
        })
  })
});
