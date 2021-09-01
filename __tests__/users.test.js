const pool = require('../lib/utils/pool.js');
const setup = require('../data/setup.js');
const request = require('supertest');
const app = require('../lib/app.js');
const Game = require('../lib/models/Game.js');
const { UserGame, UserZilch, UserUberZilches } = require('../lib/models/UserStats.js');
const Zilch = require('../lib/models/Zilch.js');
const Result = require('../lib/models/Result.js');
const UberZilch = require('../lib/models/UberZilch.js');
const User = require('../lib/models/User.js');

describe('users routes', () => {

  beforeEach(() => {
    return setup(pool);
  });

    const userOne = {
    username: 'username',
    password: 'password',
    avatar: 'Avatar.png'
  }

  const userTwo = {
    username: 'somebody',
    password: 'password',
    avatar: 'Avatar.png'
  }

  const userThree = {
    username: 'no one',
    password: 'password',
    avatar: 'Avatar.png'
  }

  const agent = request.agent(app)

  const user1 = agent
      .post('/api/v1/signup')
      .send(userOne);

    const user2 = agent
      .post('/api/v1/signup')
      .send(userTwo);

    const user3 = agent
      .post('/api/v1/signup')
      .send(userThree);

  test('create a userGame via POST', async () => {
    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);
    const user2 = await agent
      .post('/api/v1/signup')
      .send(userTwo);
    const user3 = await agent
      .post('/api/v1/signup')
      .send(userThree);

    const game = await Game.insert({
      firstUserId: '1',
      secondUserId: '2',
      timestampStart: '1:50',
      targetScore: 5000
    })

    const userGame = { userId: user1.body.userId, gameId: game.gameId }

    const res = await agent
      .post('/api/v1/users/games')
      .send(userGame);

    expect(res.body).toEqual(userGame)
  })

  test('outputs all games of a user via GET', async () => {

    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const user2 = await agent
      .post('/api/v1/signup')
      .send(userTwo);

    const user3 = await agent
      .post('/api/v1/signup')
      .send(userThree);


    const game1 = await Game.insert({
      firstUserId: user1.body.userId.toString(),
      secondUserId: user2.body.userId.toString(),
      timestampStart: '1:50',
      targetScore: 5000
    })

    const game2 = await Game.insert({
      firstUserId: user2.body.userId.toString(),
      secondUserId: user1.body.userId.toString(),
      timestampStart: '2:50',
      targetScore: 3000
    })

    const game3 = await Game.insert({
      firstUserId: user2.body.userId.toString(),
      secondUserId: user3.body.userId.toString(),
      timestampStart: '5:00',
      targetScore: 10000
    })

    const userGame1 = await UserGame.insert({
      userId: user1.body.userId,
      gameId: game1.gameId
    })

    const userGame2 = await UserGame.insert({
      userId: user2.body.userId,
      gameId: game1.gameId
    })

    const userGame3 = await UserGame.insert({
      userId: user2.body.userId,
      gameId: game2.gameId
    })

    const res = await agent
      .get(`/api/v1/users/${user2.body.userId}/games`)
    expect(res.body).toEqual([
      { userId: user2.body.userId, ...game1 },
      { userId: user2.body.userId, ...game2 }
    ]);
  });

  test('GETs all users zilches', async () => {
    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const user2 = await agent
      .post('/api/v1/signup')
      .send(userTwo);


    const zilch1 = await Zilch.insert({
      gameId: '1',
      userId: user1.body.userId,
      playerZilches: 2
    })
    const zilch2 = await Zilch.insert({
      gameId: '2',
      userId: user1.body.userId,
      playerZilches: 1
    })
    const zilch3 = await Zilch.insert({
      gameId: '3',
      userId: user1.body.userId,
      playerZilches: 20
    })

    const userZilch1 = await UserZilch.insert({
      userId: '1',
      gameId: zilch1.gameId,
      zilchId: zilch1.zilchId
    });
    const userZilch2 = await UserZilch.insert({
      userId: '1',
      gameId: zilch2.gameId,
      zilchId: zilch2.zilchId
    });
    const userZilch3 = await UserZilch.insert({
      userId: '1',
      gameId: zilch3.gameId,
      zilchId: zilch3.zilchId
    });

    const res = await agent
      .get('/api/v1/users/1/zilches');

    expect(res.body).toEqual([
      {
        userId: '1',
        gameId: '1',
        playerZilches: 2
      },
      {
        userId: '1',
        gameId: '2',
        playerZilches: 1
      },
      {
        userId: '1',
        gameId: '3',
        playerZilches: 20
      }
    ])
  })

  test('outputs all WINS of a user via GET', async () => {

      const userOne = {
    username: 'username',
    password: 'password',
    avatar: 'Avatar.png'
  }

  const userTwo = {
    username: 'somebody',
    password: 'password',
    avatar: 'Avatar.png'
  }

  const userThree = {
    username: 'no one',
    password: 'password',
    avatar: 'Avatar.png'
  }

    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const user2 = await agent
      .post('/api/v1/signup')
      .send(userTwo);

    const user3 = await agent
      .post('/api/v1/signup')
      .send(userThree);


    const game1 = await Game.insert({
      firstUserId: user1.body.userId.toString(),
      secondUserId: user2.body.userId.toString(),
      timestampStart: '1:50',
      targetScore: 5000,
      winner: user1.body.username
    })

    const game2 = await Game.insert({
      firstUserId: user2.body.userId.toString(),
      secondUserId: user1.body.userId.toString(),
      timestampStart: '2:50',
      targetScore: 3000,
      winner: user1.body.username
    })

    const game3 = await Game.insert({
      firstUserId: user2.body.userId.toString(),
      secondUserId: user3.body.userId.toString(),
      timestampStart: '5:00',
      targetScore: 10000,
      winner: user2.body.username
    })

    const userGame1 = await UserGame.insert({
      userId: user1.body.userId,
      gameId: game1.gameId
    })

    const userGame2 = await UserGame.insert({
      userId: user1.body.userId,
      gameId: game2.gameId
    })

    const userGame3 = await UserGame.insert({
      userId: user2.body.userId,
      gameId: game3.gameId
    })

    const res = await agent
      .get(`/api/v1/users/1/wins`)
      console.log('RES BODY',res.body)
    expect(res.body).toEqual([
      { userId: user1.body.userId,
        username: 'username',
        avatar: 'Avatar.png',
        winner: 'username',
        gameId: '1'
      },
      { userId: user1.body.userId,
        username: 'username',
        avatar: 'Avatar.png',
        winner: 'username',
        gameId: '2' }

    ]);
  });

  test('GETs all users', async () => {
    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const user2 = await agent
      .post('/api/v1/signup')
      .send(userTwo);

      const res = await agent.get('/api/v1/users')
      console.log('USERS USERS', res.body)
      expect(res.body).toEqual([user1.body, user2.body])
  })

  test('GETs all of a users uberZilches', async () => {
    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const user2 = await agent
      .post('/api/v1/signup')
      .send(userTwo);


    const uberZilch1 = await UberZilch.insert({
      gameId: '1',
      userId: user1.body.userId,
      playerUberZilches: 2
    })
    const uberZilch2 = await UberZilch.insert({
      gameId: '2',
      userId: user1.body.userId,
      playerUberZilches: 1
    })
    const uberZilch3 = await UberZilch.insert({
      gameId: '3',
      userId: user1.body.userId,
      playerUberZilches: 20
    })

    const userUberZilch1 = await UserUberZilches.insert({
      userId: '1',
      gameId: uberZilch1.gameId,
      uberZilchId: uberZilch1.uberZilchId
    });
    const userUberZilch2 = await UserUberZilches.insert({
      userId: '1',
      gameId: uberZilch2.gameId,
      uberZilchId: uberZilch2.uberZilchId
    });
    const userUberZilch3 = await UserUberZilches.insert({
      userId: '1',
      gameId: uberZilch3.gameId,
      uberZilchId: uberZilch3.uberZilchId
    });
    const res = await agent
      .get('/api/v1/users/1/uberZilches');

    expect(res.body).toEqual([
      {
        userId: '1',
        gameId: '1',
        playerUberZilches: 2,
        uberZilchId: '1',
        username: 'username'
      },
      {
        userId: '1',
        gameId: '2',
        playerUberZilches: 1,
        uberZilchId: '2',
        username: 'username'
      },
      {
        userId: '1',
        gameId: '3',
        playerUberZilches: 20,
        uberZilchId: '3',
        username: 'username'
      }
    ])
  })

  test('GETs all of a user\'s results', async () => {
    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const user2 = await agent
      .post('/api/v1/signup')
      .send(userTwo);

    const game1 = await Game.insert({
      firstUserId: user1.body.userId.toString(),
      secondUserId: user2.body.userId.toString(),
      timestampStart: '1:50',
      timestampEnd: '2:00',
      targetScore: 5000,
      winner: user1.body.username
    })

    const userGame1 = await UserGame.insert({
      userId: user1.body.userId,
      gameId: game1.gameId
    })

    const userGame2 = await UserGame.insert({
      userId: user2.body.userId,
      gameId: game1.gameId
    })

    const resultsUser1 = await Result.insert({
      gameId: game1.gameId.toString(),
      userId: user1.body.userId.toString(),
      numberOfRounds: 10,
      playerScore: 5000
    })

    const resultsUser2 = await Result.insert({
      gameId: game1.gameId.toString(),
      userId: user2.body.userId.toString(),
      numberOfRounds: 10,
      playerScore: 3250
    })

    const { body } = await agent
      .get(`/api/v1/users/${user1.body.userId}/results`)

    expect(body).toEqual([{
      userId: user1.body.userId,
      gameId: game1.gameId.toString(),
      winner: user1.body.username,
      targetScore: 5000,
      numberOfRounds: 10,
      playerScore: 5000,
      timestampStart: '1:50',
      timestampEnd: '2:00'
    }])

    const secondUserResults = await agent
      .get(`/api/v1/users/${user2.body.userId}/results`)

    expect(secondUserResults.body).toEqual([{
      userId: user2.body.userId,
      gameId: game1.gameId.toString(),
      winner: user1.body.username,
      targetScore: 5000,
      numberOfRounds: 10,
      playerScore: 3250,
      timestampStart: '1:50',
      timestampEnd: '2:00'
    }])
  })

  test('get user info by username', async() => {
    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const res = await agent
      .get(`/api/v1/users/${user1.body.username}`)

    expect(res.body).toEqual({
      userId: '1',
      username: 'username',
      avatar: 'Avatar.png'
    })
  })

  test('get user info by id', async() => {
    const user1 = await agent
      .post('/api/v1/signup')
      .send(userOne);

    const res = await agent
      .get(`/api/v1/users/id/${user1.body.userId}`)

    expect(res.body).toEqual({
      userId: '1',
      username: 'username',
      avatar: 'Avatar.png'
    })
  })
});
