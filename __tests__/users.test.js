const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');

describe('user routes', () => {

  beforeEach(() => {
    return setup(pool);
  });
  
  it('signs a user up', async () => {
    const user = {
      username: 'chase',
      password: 'password',
      avatar: 'Avatar.png'
    };

    const { body } = await request(app)
      .post('/api/v1/signup')
      .send(user);

    expect(body).toEqual({
      username: 'chase',
      userId: '1',
      avatar: 'Avatar.png' });
  });
});
