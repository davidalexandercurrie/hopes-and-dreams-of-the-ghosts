var express = require('express');
var app = express();
var http = require('http').createServer(app);
const options = {
  /* ... */
};
const io = require('socket.io')(http, options);
io.on('connection', socket => {
  console.log(socket.id);
});

// routes
app.use('/', express.static('public'));

http.listen(process.env.PORT || 3000, process.env.IP, () => {
  console.log('listening on *:3000');
});

let ghosts = [];

io.sockets.on('connection', socket => {
  socket.on('msg', data => {
    socket.broadcast.emit('msg', data);
  });
});
