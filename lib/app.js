const express = require('express');
const notFoundMiddleware = require('./middleware/not-found.js');
const errorMiddleware = require('./middleware/error.js');
const userController = require('./controllers/users.js');
const authController = require('./controllers/auth.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');

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

app.use('/api/v1', authController);
app.use('/api/v1/users', userController);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
