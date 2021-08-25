const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const notFoundMiddleware = require('./middleware/not-found.js');
const errorMiddleware = require('./middleware/error.js');
const authController = require('./controllers/auth.js')
const userController = require('./controllers/users.js');
const cors = require('cors');
const gameController = require('./controllers/games.js');
const resultController = require('./controllers/results.js')

const app = express();

app.use(express.json());

app.use(cors({
  credentials: true,
  origin: true
}));

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ hello: 'world'    });
});

app.use('/api/v1/games', gameController)

app.use(userController);
app.use('/api/v1', authController);
app.use('/api/v1/users', userController);
app.use('/api/v1/games', gameController);
app.use('/api/v1/results', resultController);


app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
