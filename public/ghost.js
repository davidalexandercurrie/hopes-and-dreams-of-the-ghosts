class Ghost {
  constructor(x, y, id, ready) {
    this.id = id != undefined ? id : 'myGhost';
    this.position = createVector(x, y);
    this.ghostReady = ready;
    this.color = color(random(255), random(255), random(255));
  }
  show() {
    strokeWeight(this.isMyGhost() ? 10 : 0);
    stroke(0, 255, 255);
    fill(this.color);
    rectMode(CENTER);
    rect(this.position.x, this.position.y, 100, 100);
    textSize(80);
    textAlign(CENTER, CENTER);

    text('👻', this.position.x, this.position.y + 10);
  }
  move(movementVector) {
    this.position.add(movementVector);
  }
  updatePosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
  isMyGhost() {
    return this.id === 'myGhost' ? true : false;
  }
}
