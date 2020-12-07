let myGhost;
let otherGhosts = [];
let socket;
let positionGhostsArray;
let allTimeGhostCounter;
let showBanner = false;
let bannerText = '';
let animations = [];
let houseHoldObjects = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io.connect();
  socket.on('connection', initExistingGhosts);
  socket.on('ghostArray', ghostArrayMessage);
  socket.on('ghostConnected', connectedGhostMessage);
  socket.on('ghostDisconnected', disconnectedGhostMessage);
  socket.on('endGame', endOfGame);
  socket.on('zaps', eventsFromThePhysicalWorld);
  myGhost = new Ghost(random(0, 200), random(0, 200), 'myGhost', false);
  johnsHouseHoldObjects();
}

function draw() {
  drawEnvironment();
  updateOtherGhosts();
  updateMyGhost();
  animationEffects();
  displayAllTimeGhostCounter();
  banner();
}

const johnsHouseHoldObjects = () => {
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
  if (showBanner) {
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

const updateOtherGhosts = () =>
  otherGhosts.forEach(element => (element.ghostReady ? element.show() : null));

const updateMyGhost = () => {
  moveMyGhost();
  myGhost.show();
  sendMyGhostData();
};

const ghostArrayMessage = ({ ghosts, gameRound }) => {
  displayHauntStatus(gameRound);
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
  if (keyIsDown(87)) {
    myGhost.move(createVector(0, -5));
  }
  if (keyIsDown(65)) {
    myGhost.move(createVector(-5, 0));
  }
  if (keyIsDown(83)) {
    myGhost.move(createVector(0, 5));
  }
  if (keyIsDown(68)) {
    myGhost.move(createVector(5, 0));
  }
  if (myGhost.forceMoveStartTime + myGhost.forceMoveDuration > frameCount) {
    myGhost.move(myGhost.forceMoveVector);
  }
};

const createClock = () =>
  (houseHoldObjects.clock = {
    position: createVector(800, 800),
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
  text(
    '🕸',
    houseHoldObjects.clock.position.x,
    houseHoldObjects.clock.position.y
  );
};
const createBook = () =>
  (houseHoldObjects.book = {
    position: createVector(1200, 1200),
    numberOfGhostsInBook: 0,
  });

const drawBook = () => {
  textAlign(CENTER, CENTER);
  textSize(240);
  text(
    '📓',
    houseHoldObjects.book.position.x,
    houseHoldObjects.book.position.y
  );
  textSize(240 + Math.sin(frameCount / 10) * 10);
  text('🕸', houseHoldObjects.book.position.x, houseHoldObjects.book.position.y);
};
const createLightbulb = () =>
  (houseHoldObjects.lightbulb = {
    position: createVector(1800, 800),
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
  textSize(240 + Math.sin(frameCount / 10) * 10);
  text(
    '🕸',
    houseHoldObjects.lightbulb.position.x,
    houseHoldObjects.lightbulb.position.y
  );
};

const drawEnvironment = () => {
  background(200);
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

const displayHauntStatus = () => {};

const endOfGame = winner => {
  bannerText = winner;
  showBanner = true;
  console.log(winner);
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
};
