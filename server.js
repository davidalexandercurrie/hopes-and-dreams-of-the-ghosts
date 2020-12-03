const express = require('express');
const app = express();
const http = require('http').createServer(app);
const _ = require('lodash');
const firebase = require('firebase');
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBglEP4rIByR3UZKtlj4pff7l4bUNapvmQ',
  authDomain: 'spooky-ghosts-data.firebaseapp.com',
  databaseURL: 'https://spooky-ghosts-data.firebaseio.com',
  projectId: 'spooky-ghosts-data',
  storageBucket: 'spooky-ghosts-data.appspot.com',
  messagingSenderId: '1067223608961',
  appId: '1:1067223608961:web:d54fde92c4dd1728a7a780',
  measurementId: 'G-Y7XV2F8KQD',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
const database = firebase.database();
let ref = database.ref('statistics');
ref.on(
  'value',
  data => (allTimeGhostCounter = data.val().allTimeGhostCounter),
  err => console.log('firebase error', err)
);

let allTimeGhostCounter;
let ghosts = [];
let sendToMax = {
  ghostsInBook: 0,
  ghostsInClock: 0,
  ghostsInLightbulb: 0,
};
let startSendingToMax = true;

// const gotData =

const options = {
  /* ... */
};
const io = require('socket.io')(http, options);

// routes
app.use('/', express.static('public'));

http.listen(process.env.PORT || 3000, process.env.IP, () => {
  console.log('listening on *:3000');
});

// on connect initialise a space in the ghost Array
io.on('connection', socket => {
  onGhostConnect(socket);
  // when a ghost disconnects
  socket.on('disconnect', () => onGhostDisconnect(socket));

  // receive position of ghost, update position in ghosts Array, reply to sender with ghosts Array minus the sender's entry
  socket.on('position', data => {
    updateAndSendClientGhostData(socket, data);
    sendDataToMax(socket);
  });
});

const incrementGhostCounter = () => {
  ref.set({
    allTimeGhostCounter: firebase.database.ServerValue.increment(1),
  });
};

const initGhost = socket => {
  ghosts.push({
    id: socket.id,
    position: {
      x: '',
      y: '',
    },
    isInClock: false,
    isInBook: false,
    isInLightbulb: false,
  });
};

const findGhostIndex = socket => {
  return ghosts.findIndex(item => item.id === socket.id);
};

const onGhostConnect = socket => {
  console.log(socket.id + ' connected');
  incrementGhostCounter();
  initGhost(socket);
  let data = {
    ghosts,
    allTimeGhostCounter,
  };
  socket.emit('connection', data);
  socket.broadcast.emit('ghostConnected', socket.id);
};

const onGhostDisconnect = socket => {
  let index = findGhostIndex(socket);
  ghosts.splice(index, 1);
  console.log(socket.id + ' disconnected');
  socket.broadcast.emit('ghostDisconnected', socket.id);
};

const sendDataToMax = socket => {
  sendToMax.ghostsInClock = _.sum(ghosts.map(item => item.isInClock));
  sendToMax.ghostsInBook = _.sum(ghosts.map(item => item.isInBook));
  sendToMax.ghostsInLightbulb = _.sum(ghosts.map(item => item.isInLightbulb));

  if (startSendingToMax) {
    startSendingToMax = false;
    setInterval(() => {
      sendToMax.numGhostsConnected = io.engine.clientsCount;
      socket.broadcast.emit('maxSocket', sendToMax);
      // socket send to max
    }, 100);
  }
};

const updateAndSendClientGhostData = (socket, data) => {
  let index = findGhostIndex(socket);
  ghosts[index].position = { x: data.position.x, y: data.position.y };
  ghosts[index].isInClock = data.isInClock;
  ghosts[index].isInBook = data.isInBook;
  ghosts[index].isInLightbulb = data.isInLightbulb;
  let copy = ghosts.slice(0);
  // let data = {
  //   ghosts: copy,
  // };
  copy.splice(index, 1);
  socket.emit('ghostArray', copy);
};
