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
let locations = {
  ghostsInBook: 0,
  ghostsInClock: 0,
  ghostsInLightbulb: 0,
};
let startSendingToMax = true;

let gameRound = {
  gameHasStarted: false,
  timeStarted: null,
  environment: {
    bookStatus: 0,
    clockStatus: 0,
    lightbulbStatus: 0,
  },
};

// const gotData =

const options = {
  /* ... */
};
const io = require('socket.io')(http, options);

// routes
app.use('/', express.static('public'));
app.use('/startgame', express.static('startGame'));

http.listen(process.env.PORT || 3000, process.env.IP, () =>
  console.log('listening on *:3000')
);

io.on('connection', socket => {
  onGhostConnect(socket);
  socket.on('disconnect', () => onGhostDisconnect(socket));
  socket.on('position', data => {
    updateAndSendClientGhostData(socket, data);
    sendDataToMax(socket);
  });
  socket.on('startGame', msg =>
    !gameRound.gameHasStarted ? startGame() : console.log('game in progress!')
  );
});

const incrementGhostCounter = () =>
  ref.set({ allTimeGhostCounter: firebase.database.ServerValue.increment(1) });

const initGhost = socket =>
  ghosts.push({
    id: socket.id,
    position: { x: '', y: '' },
    isInClock: false,
    isInBook: false,
    isInLightbulb: false,
  });

const findGhostIndex = socket =>
  ghosts.findIndex(item => item.id === socket.id);

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
  locations.ghostsInClock = _.sum(ghosts.map(item => item.isInClock));
  locations.ghostsInBook = _.sum(ghosts.map(item => item.isInBook));
  locations.ghostsInLightbulb = _.sum(ghosts.map(item => item.isInLightbulb));

  if (startSendingToMax) {
    startSendingToMax = false;
    setInterval(() => {
      locations.numGhostsConnected = io.engine.clientsCount;
      let data = {
        locations,
        gameRound,
      };
      socket.broadcast.emit('maxSocket', data);
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
  copy.splice(index, 1);
  let ghostData = {
    ghosts: copy,
    gameRound,
  };
  socket.emit('ghostArray', ghostData);
};

const startGame = socket => {
  gameRound.gameHasStarted = true;
  gameRound.timeStarted = Date.now();
  gameTimer(socket);
};

const gameTimer = socket => {
  const timer = setInterval(() => {
    console.log(gameRound.environment);
    gameRound.environment = {
      bookStatus:
        locations.ghostsInBook > 0
          ? gameRound.environment.bookStatus + locations.ghostsInBook > 300
            ? 300
            : gameRound.environment.bookStatus + locations.ghostsInBook
          : gameRound.environment.bookStatus - 5 < 0
          ? 0
          : gameRound.environment.bookStatus - 5,
      clockStatus:
        locations.ghostsInClock > 0
          ? gameRound.environment.clockStatus + locations.ghostsInClock > 300
            ? 300
            : gameRound.environment.clockStatus + locations.ghostsInClock
          : gameRound.environment.clockStatus - 5 < 0
          ? 0
          : gameRound.environment.clockStatus - 5,
      lightbulbStatus:
        locations.ghostsInLightbulb > 0
          ? gameRound.environment.lightbulbStatus +
              locations.ghostsInLightbulb >
            300
            ? 300
            : gameRound.environment.lightbulbStatus +
              locations.ghostsInLightbulb
          : gameRound.environment.lightbulbStatus - 5 < 0
          ? 0
          : gameRound.environment.lightbulbStatus - 5,
    };
    // end game if after set time
    if (gameRound.timeStarted + 180000 < Date.now()) {
      console.log('Game Ended! Ghost Hunter Wins!');
      gameRound.gameHasStarted = false;
      io.emit('endGame', 'Hunter Wins!');
      resetGameData();
      clearInterval(timer);
    }
    // or if two things have been haunted
    else if (ghostWinCondition()) {
      console.log('Game Ended! Ghosts Win!');
      gameRound.gameHasStarted = false;
      io.emit('endGame', 'Ghosts Win!');

      clearInterval(timer);
      resetGameData();
    }
  }, 100);
};

const ghostWinCondition = () =>
  (gameRound.environment.clockStatus >= 200 &&
    gameRound.environment.lightbulbStatus >= 200) ||
  (gameRound.environment.clockStatus >= 200 &&
    gameRound.environment.bookStatus >= 200) ||
  (gameRound.environment.lightbulbStatus >= 200 &&
    gameRound.environment.bookStatus >= 200);

const resetGameData = () => {
  gameRound = {
    gameHasStarted: false,
    timeStarted: null,
    environment: {
      bookStatus: 0,
      clockStatus: 0,
      lightbulbStatus: 0,
    },
  };
};
