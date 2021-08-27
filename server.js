const app = require('./lib/app.js');
const redis = require('redis')
const pool = require('./lib/utils/pool.js');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: true
});

const PORT = process.env.PORT || 7890;


httpServer.listen(PORT, () => {
  console.log(`http server on ${PORT}`);
});

process.on('exit', () => {
  console.log('Goodbye!');
  pool.end();
});


module.exports = { io };
