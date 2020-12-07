class Ghost {
  constructor(x, y, id, ready) {
    this.id = id != undefined ? id : 'myGhost';
    this.position = createVector(x, y);
    this.ghostReady = ready;
    this.color = color(random(255), random(255), random(255), 50);
    this.forceMoveVector = createVector(0, 0);
    this.forceMoveDuration = 0;
    this.forceMoveStartTime = 0;
  }
  show() {
    this.styleGhost();
    this.isInClock() || this.isInBook() || this.isInLightbulb()
      ? this.insideObject()
      : this.outsideObject();
    this.drawGhost();
  }
  move(movementVector) {
    this.position.add(movementVector);
  }
  updatePosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
  forceMoveGhost(vector, duration) {
    this.forceMoveVector = vector;
    this.forceMoveStartTime = frameCount;
    this.forceMoveDuration = duration;
  }
  isMyGhost() {
    return this.id === 'myGhost' ? true : false;
  }
  isInClock() {
    return dist(
      clock.position.x,
      clock.position.y,
      this.position.x,
      this.position.y
    ) < 120
      ? true
      : false;
  }
  isInBook() {
    return dist(
      book.position.x,
      book.position.y,
      this.position.x,
      this.position.y
    ) < 120
      ? true
      : false;
  }
  isInLightbulb() {
    return dist(
      lightbulb.position.x,
      lightbulb.position.y,
      this.position.x,
      this.position.y
    ) < 120
      ? true
      : false;
  }
  insideObject() {
    ellipseMode(CENTER);
    ellipse(this.position.x, this.position.y, 200);
  }
  outsideObject() {
    rect(this.position.x, this.position.y, 100, 100);
  }
  drawGhost() {
    textSize(80);
    textAlign(CENTER, CENTER);
    text('👻', this.position.x, this.position.y + 10);
  }
  styleGhost() {
    strokeWeight(this.isMyGhost() ? 10 : 0);
    stroke(0, 255, 255);
    fill(this.color);
    rectMode(CENTER);
  }
}
