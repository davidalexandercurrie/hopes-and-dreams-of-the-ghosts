class Ghost {
  constructor() {
    this.pos = createVector(random(200, 600), random(200, 600));
  }
  show() {
    rect(this.pos.x, this.pos.y, 100, 100);
  }
}
