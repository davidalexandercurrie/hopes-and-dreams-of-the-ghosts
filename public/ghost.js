class Ghost {
  constructor(x, y, id, ready) {
    this.id = id != undefined ? id : 'myGhost';
    this.position = createVector(x, y);
    this.ghostReady = ready;
  }
  show() {
    noStroke();
    if (this.id == 'myGhost') {
      fill(255, 0, 0);
    } else {
      fill(0, 255, 0);
    }
    rect(this.position.x, this.position.y, 100, 100);
  }
  move() {
    this.position.x += random() - 0.5;
    this.position.y += random() - 0.5;
  }
  updatePosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
}
