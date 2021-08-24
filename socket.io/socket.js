const io = require('../server.js');

io.on('connection', socket => {
  console.log('socket connected');
});
