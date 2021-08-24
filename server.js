const app = require('./lib/app.js');
const path = require('path');
const express = require('express');
const pool = require('./lib/utils/pool.js');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: true
});



// app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 7890;

httpServer.listen(4000, () => {
  console.log('http server on 4000');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});

process.on('exit', () => {
  console.log('Goodbye!');
  pool.end();
});


module.exports = io;
