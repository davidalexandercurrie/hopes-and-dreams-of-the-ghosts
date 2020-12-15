const express = require('express');
const { ExpressPeerServer } = require("peer");
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

let gameRoundInfo = {
  gameInProgress: false,
  timeStarted: null,
  timeEnded: null,
  previousWinner: null,
  environment: {
    book: 0,
    clock: 0,
    lightbulb: 0,
  },
};

const options = {
  /* ... */
};
const io = require('socket.io')(http, options);

// routes
app.use('/', express.static('public'));
app.use('/startgame', express.static('startGame'));

const listener = http.listen(process.env.PORT || 3000, process.env.IP, () =>
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
    !gameRoundInfo.gameInProgress
      ? startGame()
      : console.log('game in progress!')
  );
  socket.on('msg', data => zaps(data));
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
    gameRoundInfo,
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
        gameRound: gameRoundInfo,
      };
      socket.broadcast.emit('maxSocket', data);
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
    gameRound: gameRoundInfo,
  };
  socket.emit('ghostArray', ghostData);
};

const zaps = data => io.emit('zaps', data);

const startGame = socket => {
  gameRoundInfo.gameInProgress = true;
  gameRoundInfo.timeStarted = Date.now();
  gameTimer(socket);
  io.emit('startGame', gameRoundInfo);
};

const gameTimer = socket => {
  // restart
  const timer = setInterval(() => {
    gameRoundInfo.environment = {
      book:
        locations.ghostsInBook > 0
          ? gameRoundInfo.environment.book + locations.ghostsInBook > 300
            ? 300
            : gameRoundInfo.environment.book + locations.ghostsInBook
          : gameRoundInfo.environment.book - 5 < 0
          ? 0
          : gameRoundInfo.environment.book - 5,
      clock:
        locations.ghostsInClock > 0
          ? gameRoundInfo.environment.clock + locations.ghostsInClock > 300
            ? 300
            : gameRoundInfo.environment.clock + locations.ghostsInClock
          : gameRoundInfo.environment.clock - 5 < 0
          ? 0
          : gameRoundInfo.environment.clock - 5,
      lightbulb:
        locations.ghostsInLightbulb > 0
          ? gameRoundInfo.environment.lightbulb + locations.ghostsInLightbulb >
            300
            ? 300
            : gameRoundInfo.environment.lightbulb + locations.ghostsInLightbulb
          : gameRoundInfo.environment.lightbulb - 5 < 0
          ? 0
          : gameRoundInfo.environment.lightbulb - 5,
    };
    // end game if after set time
    if (gameRoundInfo.timeStarted + 180000 < Date.now()) {
      console.log('Game Ended! Ghost Hunter Wins!');
      gameRoundInfo.previousWinner = 'ghostHunter';
      gameRoundInfo.gameInProgress = false;
      resetGameData();
      clearInterval(timer);
    }
    // or if two things have been haunted
    else if (ghostWinCondition()) {
      console.log('Game Ended! Ghosts Win!');
      gameRoundInfo.previousWinner = 'ghosts';
      gameRoundInfo.gameInProgress = false;
      clearInterval(timer);
      resetGameData();
    }
  }, 100);
};

const ghostWinCondition = () =>
  (gameRoundInfo.environment.clock >= 200 &&
    gameRoundInfo.environment.lightbulb >= 200) ||
  (gameRoundInfo.environment.clock >= 200 &&
    gameRoundInfo.environment.book >= 200) ||
  (gameRoundInfo.environment.lightbulb >= 200 &&
    gameRoundInfo.environment.book >= 200);

const resetGameData = () => {
  gameRoundInfo.gameInProgress = false;
  gameRoundInfo.timeStarted = null;
  gameRoundInfo.timeEnded = Date.now();
  (gameRoundInfo.environment = {
    book: 0,
    clock: 0,
    lightbulb: 0,
  }),
    io.emit('endGame', gameRoundInfo);
};


// peerjs server
const peerServer = ExpressPeerServer(listener, {
  debug: true,
  path: '/myapp'
});

app.use('/peerjs', peerServer);