let myGhost;
let otherGhosts = [];
let socket;
let positionGhostsArray;
let allTimeGhostCounter;
let bannerText = '';
let animations = [];
let houseHoldObjects = {};
let gameState = 'idle';
let gameRoundInfoClient;

function setup() {
  createCanvas(windowWidth, windowHeight);
  sockets();
  myGhost = new Ghost(random(0, 200), random(0, 200), 'myGhost', false);
  createJohnsHouseHoldObjects();
}

function draw() {
  drawEnvironment();
  updateOtherGhosts();
  updateMyGhost();
  animationEffects();
  displayAllTimeGhostCounter();
  banner();
  timer();
  if (mouseIsPressed) {
    document.getElementById('instructions').classList.add('hide');
  }
}

const sockets = () => {
  socket = io.connect();
  socket.on('connection', initExistingGhosts);
  socket.on('ghostArray', ghostArrayMessage);
  socket.on('ghostConnected', connectedGhostMessage);
  socket.on('ghostDisconnected', disconnectedGhostMessage);
  socket.on('startGame', startOfGame);
  socket.on('endGame', endOfGame);
  socket.on('zaps', eventsFromThePhysicalWorld);
};

const createJohnsHouseHoldObjects = () => {
  createClock();
  createBook();
  createLightbulb();
};

const eventsFromThePhysicalWorld = data => {
  console.log(data);
  data.type == 'zap'
    ? zap(data)
    : data.type == 'reading'
    ? reading(data)
    : null;
};

const reading = ({ data }) => {
  console.log(`reading: ${data}`);
};

const banner = () => {
  if (
    gameState == 'ended' &&
    gameRoundInfoClient.timeEnded + 10000 > Date.now()
  ) {
    rectMode(CENTER);
    fill('white');
    stroke('purple');
    rect(width / 2, 200, 400, 200);
    fill('purple');
    strokeWeight(3);
    textSize(30);
    textAlign(CENTER, CENTER);
    text(bannerText, width / 2, 200);
  }
};

const timer = () => {
  textAlign(RIGHT, CENTER);
  textSize(30);
  noStroke();
  fill(0);
  if (gameState == 'inProgress') {
    let timeLeft = 180000 - (Date.now() - gameRoundInfoClient.timeStarted);
    let timeLeftSeconds = Math.floor((timeLeft % 60000) / 1000);
    text(
      `Time left: ${Math.floor(timeLeft / 60000)}\:${
        timeLeftSeconds < 10 ? ' ' + timeLeftSeconds : timeLeftSeconds
      }`,
      width - 10,
      20
    );
  }
};

const updateOtherGhosts = () =>
  otherGhosts.forEach(element => (element.ghostReady ? element.show() : null));

const updateMyGhost = () => {
  moveMyGhost();
  myGhost.show();
  sendMyGhostData();
};

const ghostArrayMessage = ({ ghosts, gameRound }) => {
  Object.keys(gameRound.environment).forEach(hauntedObject => {
    houseHoldObjects[hauntedObject].hauntStatus =
      gameRound.environment[hauntedObject];
  });
  ghosts.forEach(element => {
    let index = otherGhosts.findIndex(item => item.id === element.id);
    if (otherGhosts[index] != undefined) {
      otherGhosts[index].updatePosition(element.position.x, element.position.y);
      otherGhosts[index].ghostReady = element.position.x === '' ? false : true;
    }
  });
};

const disconnectedGhostMessage = data => {
  console.log('ghost disconnected', data);
  let index = otherGhosts.findIndex(item => item.id === data);
  otherGhosts.splice(index, 1);
};

const connectedGhostMessage = data => {
  console.log('ghost connected', data);
  otherGhosts.push(new Ghost('', '', data, false));
  allTimeGhostCounter++;
};

const initExistingGhosts = data => {
  myGhost.ghostReady = true;
  data.ghosts.forEach(element =>
    otherGhosts.push(
      new Ghost(element.position.x, element.position.y, element.id, false)
    )
  );
  allTimeGhostCounter = data.allTimeGhostCounter;
  gameRoundInfoClient = data.gameRoundInfo;
  setGameState();
};

const setGameState = () => {
  if (gameRoundInfoClient.gameInProgress) {
    gameState = 'inProgress';
  }
};

const sendMyGhostData = () => {
  if (myGhost.ghostReady) {
    var data = {
      position: { x: myGhost.position.x, y: myGhost.position.y },
      isInClock: myGhost.isInClock() ? 1 : 0,
      isInBook: myGhost.isInBook() ? 1 : 0,
      isInLightbulb: myGhost.isInLightbulb() ? 1 : 0,
    };
    socket.emit('position', data);
  }
};

const moveMyGhost = () => {
  if (keyIsDown(87) || keyIsDown(38)) {
    myGhost.move(createVector(0, -5));
  }
  if (keyIsDown(65) || keyIsDown(37)) {
    myGhost.move(createVector(-5, 0));
  }
  if (keyIsDown(83) || keyIsDown(40)) {
    myGhost.move(createVector(0, 5));
  }
  if (keyIsDown(68) || keyIsDown(39)) {
    myGhost.move(createVector(5, 0));
  }
  if (myGhost.forceMoveStartTime + myGhost.forceMoveDuration > frameCount) {
    myGhost.move(myGhost.forceMoveVector);
  }
};

const createClock = () =>
  (houseHoldObjects.clock = {
    position: createVector(200, 600),
    numberOfGhostsInClock: 0,
  });

const drawClock = () => {
  textAlign(CENTER, CENTER);
  textSize(240);
  text(
    '⏰',
    houseHoldObjects.clock.position.x,
    houseHoldObjects.clock.position.y
  );
  textSize(240 + Math.sin(frameCount / 10) * 10);
};
const createBook = () =>
  (houseHoldObjects.book = {
    position: createVector(1400, 200),
    numberOfGhostsInBook: 0,
  });

const drawBook = () => {
  textAlign(CENTER, CENTER);
  textSize(240);
  text(
    '🪑',
    houseHoldObjects.book.position.x,
    houseHoldObjects.book.position.y
  );
};
const createLightbulb = () =>
  (houseHoldObjects.lightbulb = {
    position: createVector(1200, 800),
    numberOfGhostsInLightbulb: 0,
  });

const drawLightbulb = () => {
  textAlign(CENTER, CENTER);
  textSize(240);
  text(
    '💡',
    houseHoldObjects.lightbulb.position.x,
    houseHoldObjects.lightbulb.position.y
  );
};

const drawEnvironment = () => {
  clear();
  //background(200);
  drawClock();
  drawBook();
  drawLightbulb();
};

const displayAllTimeGhostCounter = () => {
  if (allTimeGhostCounter != undefined) {
    textAlign(LEFT, CENTER);
    textSize(30);
    noStroke();
    rectMode(CORNER);
    fill(255);
    rect(0, 0, width, 40);
    fill(0);
    text(`All Time Ghost Counter: ${allTimeGhostCounter}`, 10, 20);
  }
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

const endOfGame = gameRoundInfo => {
  gameRoundInfoClient = gameRoundInfo;
  bannerText =
    gameRoundInfoClient.previousWinner == 'ghosts'
      ? '👻Ghosts Win!👻'
      : '😭Ghost Hunter Wins!😭';
  gameState = 'ended';
  gameRoundInfo = gameRoundInfo.timeEnded;
};

const startOfGame = gameRoundInfo => {
  gameState = 'inProgress';
  gameRoundInfoClient = gameRoundInfo;
};

const zap = ({ data }) => {
  console.log(`zap: ${data}`);
  addAnimationToAnimationList(data, 'zap');
  if (myGhost.isInsideThisObject() == data) {
    let moveVector = createVector(
      random(10, 20) * (random() < 0.5 ? -1 : 1),
      random(10, 20) * (random() < 0.5 ? -1 : 1)
    );
    let duration = 30;
    myGhost.forceMoveGhost(moveVector, duration);
  }
};

const addAnimationToAnimationList = (location, type) => {
  animations.push({
    type,
    location,
    startTime: frameCount,
    duration: 10,
  });
};

const animationEffects = () => {
  animations.forEach((animation, index, animations) => {
    console.log(animation);
    fill(0, 255, 0);
    stroke(0, 255, 0);
    let xPosition =
      animation.location == 'clock'
        ? houseHoldObjects.clock.position.x
        : animation.location == 'lightbulb'
        ? houseHoldObjects.lightbulb.position.x
        : animation.location == 'book'
        ? houseHoldObjects.book.position.x
        : null;
    let yPosition =
      animation.location == 'clock'
        ? houseHoldObjects.clock.position.y
        : animation.location == 'lightbulb'
        ? houseHoldObjects.lightbulb.position.y
        : animation.location == 'book'
        ? houseHoldObjects.book.position.y
        : null;
    if (xPosition != null) {
      ellipse(
        xPosition + random(-100, 100),
        yPosition + random(-100, 100),
        random(100, 300)
      );
    } else {
      console.log('animation position == null, plz fix');
    }
    animation.startTime + animation.duration < frameCount
      ? animations.splice(index, 1)
      : null;
  });
  hauntAnimations();
};

const hauntAnimations = () => {
  Object.keys(houseHoldObjects).forEach(key => {
    textSize(
      houseHoldObjects[key].hauntStatus * 2 +
        (houseHoldObjects[key].hauntStatus < 200
          ? Math.sin(frameCount / 10) * houseHoldObjects[key].hauntStatus
          : 0)
    );
    text(
      '🕸',
      houseHoldObjects[key].position.x,
      houseHoldObjects[key].position.y
    );
  });
};
