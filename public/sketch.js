let myGhost;
let otherGhosts = [];
let socket;
let positionGhostsArray;
let clock = {};
let book = {};
let lightbulb = {};
let allTimeGhostCounter;

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io.connect();
  socket.on('connection', initExistingGhosts);
  socket.on('ghostArray', ghostArrayMessage);
  socket.on('ghostConnected', connectedGhostMessage);
  socket.on('ghostDisconnected', disconnectedGhostMessage);
  myGhost = new Ghost(random(0, 200), random(0, 200), 'myGhost', false);
  createClock();
  createBook();
  createLightbulb();
}
function draw() {
  drawEnvironment();
  updateOtherGhosts();
  updateMyGhost();
  displayAllTimeGhostCounter();
  // banner();
}

const banner = () => {
  rectMode(CENTER);
  fill('white');
  stroke('purple');
  rect(width / 2, height / 2, 1000, 200);
  fill('purple');
  strokeWeight(3);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("JOHN'S GHOST GAME: COMING SOON TO GHOST WORLD!", width / 2, height / 2);
};

const updateOtherGhosts = () =>
  otherGhosts.forEach(element => (element.ghostReady ? element.show() : null));

const updateMyGhost = () => {
  moveMyGhost();
  myGhost.show();
  sendMyGhostData();
};

const ghostArrayMessage = ({ ghosts, environment }) => {
  displayHauntStatus(environment);
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
};

const createClock = () =>
  (clock = { position: createVector(400, 400), numberOfGhostsInClock: 0 });

const drawClock = () => {
  textAlign(CENTER, CENTER);
  textSize(240);
  text('⏰', clock.position.x, clock.position.y);
};
const createBook = () =>
  (book = { position: createVector(800, 200), numberOfGhostsInBook: 0 });

const drawBook = () => {
  textAlign(CENTER, CENTER);
  textSize(240);
  text('📓', book.position.x, book.position.y);
};
const createLightbulb = () =>
  (lightbulb = {
    position: createVector(200, 800),
    numberOfGhostsInLightbulb: 0,
  });

const drawLightbulb = () => {
  textAlign(CENTER, CENTER);
  textSize(240);
  text('💡', lightbulb.position.x, lightbulb.position.y);
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
