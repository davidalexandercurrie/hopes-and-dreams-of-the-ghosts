let myGhost;
let otherGhosts = [];
let socket;
let positionGhostsArray;

function setup() {
  createCanvas(windowWidth, windowHeight);
  socket = io.connect();
  socket.on('connection', initExistingGhosts);
  socket.on('ghostArray', ghostArrayMessage);
  socket.on('ghostConnected', connectedGhostMessage);
  socket.on('ghostDisconnected', disconnectedGhostMessage);
  myGhost = new Ghost(random(0, 200), random(0, 200), 'myGhost', true);
}
function draw() {
  background(200);
  myGhost.move();
  myGhost.show();
  otherGhosts.forEach(element => {
    element.ghostReady ? element.show() : null;
  });
  frameCount % 10 === 0 ? sendPosition() : null;
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

function sendPosition() {
  var data = {
    position: { x: myGhost.position.x, y: myGhost.position.y },
  };
  socket.emit('position', data);
}
