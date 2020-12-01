let myGhost;
let otherGhosts = [];
let socket;
let positionGhostsArray;
let clock = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io.connect();
  socket.on('connection', initExistingGhosts);
  socket.on('ghostArray', ghostArrayMessage);
  socket.on('ghostConnected', connectedGhostMessage);
  socket.on('ghostDisconnected', disconnectedGhostMessage);
  myGhost = new Ghost(random(0, 200), random(0, 200), 'myGhost', true);
  createClock();
}
function draw() {
  drawEnvironment();
  updateOtherGhosts();
  updateMyGhost();
}

function updateOtherGhosts() {
  otherGhosts.forEach(element => {
    element.ghostReady ? element.show() : null;
  });
}

function updateMyGhost() {
  // myGhost.move();
  moveMyGhost();
  myGhost.show();
  sendMyGhostData();
}

function ghostArrayMessage(data) {
  // console.log('positions', data);
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
}

function initExistingGhosts(data) {
  data.forEach(element => {
    otherGhosts.push(
      new Ghost(element.position.x, element.position.y, element.id, false)
    );
  });
}

function sendMyGhostData() {
  var data = {
    position: { x: myGhost.position.x, y: myGhost.position.y },
    isInClock: myGhost.isInClock() ? 1 : 0,
  };
  socket.emit('position', data);
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

function drawEnvironment() {
  background(200);
  drawClock();
}
