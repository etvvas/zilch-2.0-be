const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');

const agent = request.agent(app);

describe.only('user routes', () => {
  const user = {
    username: 'chase',
    password: 'password',
    avatar: 'Avatar.png'
  };

  beforeEach(() => {
    return setup(pool);
  });

  it('signs a user up', async () => {

    const { body } = await agent
      .post('/api/v1/signup')
      .send(user);

    expect(body).toEqual({
      userId: '1',
      username: 'chase',
      avatar: 'Avatar.png' });

    const newRequest = await agent
      .post('/api/v1/signup')
      .send(user);

    expect(newRequest.body.message).toBe('Username already exists');
  });

  it('logs a user in', async () => {
    await agent
      .post('/api/v1/signup')
      .send(user);

    const { body } = await agent
      .post('/api/v1/login')
      .send(user);

    expect(body).toEqual({
      userId: '1',
      username: 'chase',
      avatar: 'Avatar.png'
    });
  });
  it('updates a user', async () => {
    const newUser = await agent
      .post('/api/v1/signup')
      .send(user);

    //patch avatar
    const { body } = await agent
      .patch('/api/v1/users')
      .send({ avatar: 'BetterAvatar.png' });

    expect(body).toEqual({
      ...newUser.body,
      avatar: 'BetterAvatar.png'
    });
  });

  it('deletes a user from the database', async () => {
    // signs user up
    const newUser = await agent
      .post('/api/v1/signup')
      .send(user);

    // deletes user
    const { body } = await agent
      .delete('/api/v1/users');

    expect(body).toEqual(newUser.body);

    // resign up with same username
    const newSignUp = await agent
      .post('/api/v1/signup')
      .send(user);
    
    // expect to have successful signup due to deletion of user in db
    expect(newSignUp.body).toEqual({
      userId: expect.any(String),
      username: 'chase',
      avatar: 'Avatar.png' });
  });

  it('verifies that a user is authenticated', async () => {
    const response = await agent
      .get('/api/v1/logout');

    expect(response.body.message).toBe('No active user');

    const { body } = await agent
      .get('/api/v1/verify');

    expect(body.status).toBe(500);
    expect(body.message).toBe('jwt must be provided');
  });

});


