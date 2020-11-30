let otherGhosts = [];
let myGhost;

function setup() {
  createCanvas(windowWidth, windowHeight);
  myGhost = new Ghost();
}
function draw() {
  background(200);
  myGhost.show();
}
