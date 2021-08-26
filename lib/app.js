const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const notFoundMiddleware = require('./middleware/not-found.js');
const errorMiddleware = require('./middleware/error.js');
const authController = require('./controllers/auth.js')
const userController = require('./controllers/users.js');
const gameController = require('./controllers/games.js');
const resultController = require('./controllers/results.js');
const zilchController = require('./controllers/zilches.js');
const uberZilchController = require('./controllers/uberZilches.js')

const app = express();
app.enable('trust proxy')

app.use(express.json());

app.use(cors({
  credentials: true,
  origin: true
}));

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ hello: 'world' });
});

app.use('/api/v1', authController);
app.use('/api/v1/users', userController);
app.use('/api/v1/games', gameController);
app.use('/api/v1/results', resultController);
app.use('/api/v1/zilches', zilchController);
app.use('/api/v1/uberZilches', uberZilchController)

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
