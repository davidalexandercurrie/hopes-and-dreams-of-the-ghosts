var express = require('express');
var app = express();
var http = require('http').createServer(app);
const options = {
  /* ... */
};
const io = require('socket.io')(http, options);

let ghosts = [];

// routes
app.use('/', express.static('public'));

http.listen(process.env.PORT || 3000, process.env.IP, () => {
  console.log('listening on *:3000');
});

// on connect initialise a space in the ghost Array
io.on('connection', socket => {
  console.log(socket.id + ' connected');
  ghosts.push({
    id: socket.id,
    position: {
      x: '',
      y: '',
    },
  });
  socket.emit('connection', ghosts);
  socket.broadcast.emit('ghostConnected', socket.id);

  // when a ghost disconnects
  socket.on('disconnect', function () {
    let index = ghosts.findIndex(function (item) {
      return item.id === socket.id;
    });
    ghosts.splice(index, 1);
    console.log(socket.id + ' disconnected');
    socket.broadcast.emit('ghostDisconnected', socket.id);
  });

  // receive position of ghost, update position in ghosts Array, reply to sender with ghosts Array minus the sender's entry
  socket.on('position', data => {
    let index = ghosts.findIndex(function (item) {
      return item.id === socket.id;
    });
    ghosts[index].position = { x: data.position.x, y: data.position.y };
    let copy = ghosts.slice(0);
    copy.splice(index, 1);

    socket.emit('ghostArray', copy);
  });
});
