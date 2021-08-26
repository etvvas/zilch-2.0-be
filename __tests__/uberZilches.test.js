const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');

describe.skip('uber zilches routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  const agent = request.agent(app);

  const user = {
    username: 'username',
    password: 'password',
    avatar: 'Avatar.png'
  };

  const uberZilchOne = {
    gameId: '1',
    userId: '1',
    playerUberZilches: 1
  }

  const uberZilchTwo = {
    gameId: '1',
    userId: '2',
    playerUberZilches: 1
  }

  it('create UBER zilch via POST', async () => {
    const { body } = await agent
      .post('/api/v1/signup')
      .send(user);

    const res = await agent
      .post('/api/v1/uberZilches')
      .send(uberZilchOne);

    expect(res.body).toEqual({
      uberZilchId: '1',
      gameId: '1',
      userId: '1',
      playerUberZilches: 1
    })
  })

})