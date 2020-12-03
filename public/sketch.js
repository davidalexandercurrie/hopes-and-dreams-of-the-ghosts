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
  rectMode(CENTER);
  fill('white');
  stroke('purple');
  rect(width / 2, height / 2, 1000, 200);
  fill('purple');
  strokeWeight(3);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("JOHN'S GHOST GAME: COMING SOON TO GHOST WORLD!", width / 2, height / 2);
}

function updateOtherGhosts() {
  otherGhosts.forEach(element => {
    element.ghostReady ? element.show() : null;
  });
}

function updateMyGhost() {
  moveMyGhost();
  myGhost.show();
  sendMyGhostData();
}

function ghostArrayMessage(data) {
  data.forEach(element => {
    let index = otherGhosts.findIndex(function (item) {
      return item.id === element.id;
    });
    if (otherGhosts[index] != undefined) {
      otherGhosts[index].updatePosition(element.position.x, element.position.y);

      otherGhosts[index].ghostReady = element.position.x === '' ? false : true;
    }
  });
}

function disconnectedGhostMessage(data) {
  console.log('ghost disconnected', data);
  let index = otherGhosts.findIndex(function (item) {
    return item.id === data;
  });
  console.log(otherGhosts[index]);
  otherGhosts.splice(index, 1);
}

function connectedGhostMessage(data) {
  console.log('ghost connected', data);
  otherGhosts.push(new Ghost('', '', data, false));
  allTimeGhostCounter++;
}

function initExistingGhosts(data) {
  myGhost.ghostReady = true;
  data.ghosts.forEach(element => {
    otherGhosts.push(
      new Ghost(element.position.x, element.position.y, element.id, false)
    );
  });
  allTimeGhostCounter = data.allTimeGhostCounter;
}

function sendMyGhostData() {
  if (myGhost.ghostReady) {
    var data = {
      position: { x: myGhost.position.x, y: myGhost.position.y },
      isInClock: myGhost.isInClock() ? 1 : 0,
      isInBook: myGhost.isInBook() ? 1 : 0,
      isInLightbulb: myGhost.isInLightbulb() ? 1 : 0,
    };
    socket.emit('position', data);
  }
}

function moveMyGhost() {
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
}

function createClock() {
  clock = {
    position: createVector(400, 400),
    numberOfGhostsInClock: 0,
  };
}

function drawClock() {
  textAlign(CENTER, CENTER);
  textSize(240);
  text('⏰', clock.position.x, clock.position.y);
}
function createBook() {
  book = {
    position: createVector(800, 200),
    numberOfGhostsInBook: 0,
  };
}

function drawBook() {
  textAlign(CENTER, CENTER);
  textSize(240);
  text('📓', book.position.x, book.position.y);
}
function createLightbulb() {
  lightbulb = {
    position: createVector(200, 800),
    numberOfGhostsInLightbulb: 0,
  };
}

function drawLightbulb() {
  textAlign(CENTER, CENTER);
  textSize(240);
  text('💡', lightbulb.position.x, lightbulb.position.y);
}

function drawEnvironment() {
  background(200);
  drawClock();
  drawBook();
  drawLightbulb();
}

function displayAllTimeGhostCounter() {
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
