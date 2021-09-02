const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');
const Game = require('../lib/models/Game.js')
const Zilch = require('../lib/models/Zilch.js')
const UberZilch = require('../lib/models/UberZilch.js')
const Result = require('../lib/models/Result.js')

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

  const user2 = {
    username: 'joe',
    password: 'newpassword',
    avatar: 'betterAvatar.png'
  }

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

  it('initialize a game via POST', async () => {

    const { body } = await agent
      .post('/api/v1/signup')
      .send(user);

    const res = await agent
      .post('/api/v1/games/start-game')
      .send(gameOne);

    expect(res.body).toEqual({
      newGame: {
        gameId: '1',
        firstUserId: '1',
        secondUserId: '2',
        timestampStart: '1:50',
        winner: null,
        timestampEnd: null,
        targetScore: 5000
      },
      firstUserGame: {
        gameId: '1',
        userId: '1'
      },
      secondUserGame: {
        gameId: '1',
        userId: '2'
      }
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

  it('finalizes a game via POST', async () => {
    let gameData;

    const user1Res = await agent
      .post('/api/v1/signup')
      .send(user);

    const user2Res = await agent
      .post('/api/v1/signup')
      .send(user2);

    const newGame = await agent
      .post('/api/v1/games/start-game')
      .send({
        ...gameOne,
        firstUserId: user1Res.body.userId,
        secondUserId: user2Res.body.userId
      })


    gameData = newGame.body.newGame;

    gameData.winner = user.username;
    gameData.timestampEnd = '2:00';

    gameData.firstUser = {
      userId: user1Res.body.userId,
      gameId: gameData.gameId,
      numberOfRounds: 10,
      playerScore: 3000,
      playerZilches: 3,
      playerUberZilches: 1
    }

    gameData.secondUser = {
      userId: user2Res.body.userId,
      gameId: gameData.gameId,
      numberOfRounds: 10,
      playerScore: 5000,
      playerZilches: 4,
      playerUberZilches: 1
    }

    const { body } = await agent
      .post('/api/v1/games/end-game')
      .send(gameData)

    expect(body).toEqual(gameData)
  })

  test('get results, zilches, and uber zilches of a game', async() => {
   let gameData;

    const user1Res = await agent
      .post('/api/v1/signup')
      .send(user);

    const user2Res = await agent
      .post('/api/v1/signup')
      .send(user2);

    const newGame = await agent
      .post('/api/v1/games/start-game')
      .send({
        ...gameOne,
        firstUserId: user1Res.body.userId,
        secondUserId: user2Res.body.userId
      })

    gameData = newGame.body.newGame;

    gameData.winner = user.username;
    gameData.timestampEnd = '2:00';

    gameData.firstUser = {
      userId: user1Res.body.userId,
      gameId: gameData.gameId,
      numberOfRounds: 10,
      playerScore: 3000,
      playerZilches: 3,
      playerUberZilches: 1
    }

    gameData.secondUser = {
      userId: user2Res.body.userId,
      gameId: gameData.gameId,
      numberOfRounds: 10,
      playerScore: 5000,
      playerZilches: 4,
      playerUberZilches: 1
    }

    const { body } = await agent
      .post('/api/v1/games/end-game')
      .send(gameData)

    const res1 = await agent
      .get(`/api/v1/games/${body.gameId}/results`)

    const res2 = await agent
      .get(`/api/v1/games/${body.gameId}/zilches`)
    
    const res3 = await agent
      .get(`/api/v1/games/${body.gameId}/uberZilches`)

    expect(res1.body).toEqual([
      {
        gameId: '1',
        firstUserId: '1',
        secondUserId: '2',
        winner: 'chase',
        timestampStart: '1:50',
        timestampEnd: '2:00',
        targetScore: 5000,
        userId: '1',
        numberOfRounds: 10,
        playerScore: 3000
      },
      {
        gameId: '1',
        firstUserId: '1',
        secondUserId: '2',
        winner: 'chase',
        timestampStart: '1:50',
        timestampEnd: '2:00',
        targetScore: 5000,
        userId: '2',
        numberOfRounds: 10,
        playerScore: 5000
      }
    ])

    console.log('res body', res3.body)
    expect(res2.body).toEqual([
      { gameId: '1', userId: '1', playerZilches: 3 },
      { gameId: '1', userId: '2', playerZilches: 4 }
    ])

    expect(res3.body).toEqual([
      { gameId: '1', userId: '1', playerUberZilches: 1 },
      { gameId: '1', userId: '2', playerUberZilches: 1 }
    ])
  })
});
