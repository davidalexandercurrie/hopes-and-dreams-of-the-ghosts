const express = require('express');
const app = express();
const http = require('http').createServer(app);
const _ = require('lodash');
const Datastore = require('nedb'),
  db = new Datastore('database.db');
db.loadDatabase(function (error) {
  if (error) {
    console.log(
      'FATAL: local database could not be loaded. Caused by: ' + error
    );
    throw error;
  }
  console.log('INFO: local database loaded successfully.');
});
let allTimeGhostCounter;
db.find({ prop: 'allTimeGhostCounter' }, function (err, docs) {
  allTimeGhostCounter = docs[0].count;
});
const options = {
  /* ... */
};
const io = require('socket.io')(http, options);

let ghosts = [];
let clock = {
  ghostsInClock: 0,
};

// routes
app.use('/', express.static('public'));

http.listen(process.env.PORT || 3000, process.env.IP, () => {
  console.log('listening on *:3000');
});

// on connect initialise a space in the ghost Array
io.on('connection', socket => {
  console.log(socket.id + ' connected');
  incrementGhostCounter();
  ghosts.push({
    id: socket.id,
    position: {
      x: '',
      y: '',
    },
    isInClock: false,
  });
  let data = {
    ghosts,
  };
  socket.emit('connection', data);
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
    ghosts[index].isInClock = data.isInClock;
    let copy = ghosts.slice(0);
    copy.splice(index, 1);
    socket.emit('ghostArray', copy);
    let ghostsInClock = _.sum(ghosts.map(item => item.isInClock));
    socket.broadcast.emit('ghostsInClock', ghostsInClock);
  });
});

function incrementGhostCounter() {
  db.update(
    { prop: 'allTimeGhostCounter' },
    { $inc: { count: 1 } },
    { upsert: true },
    function () {}
  );
  allTimeGhostCounter++;
}
