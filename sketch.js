class Cell {
  constructor(pos, value) {
    this.pos = pos;
    this.value = value;
    this.size = width / boardSize;
    this.drawPos = p5.Vector.mult(pos, this.size);
  }

  draw() {
    const padding = 2;
    this.size = width / boardSize;
    this.drawPos = p5.Vector.lerp(
      this.drawPos,
      p5.Vector.mult(this.pos, this.size),
      0.1);

    let color = this.value == 0 ? 245
      : 255 - Math.log2(this.value) * 16;

    fill(color);
    noStroke();
    square(
      this.drawPos.x + padding,
      this.drawPos.y + padding,
      this.size - padding);
    if (!this.value) return;

    fill(51);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(this.value,
      this.drawPos.x + this.size / 2,
      this.drawPos.y + this.size / 2);
  }
}

class Board {
  constructor(size) {
    this.size = size;
    this.board =
      new Array(this.size ** 2)
        .fill(0).map((v, i) =>
          new Cell(this.i2v(i), 0),
        );
  }

  spawn() {
    const emptyList = this.board.filter(cell => !cell.value);
    const empty = random(emptyList);
    if (empty === undefined) return;
    empty.value = random() > 0.2 ? 2 : 4;
  }

  forEachBottomUp(f, size) {
    for (let y = 1; y < size; y++)
      for (let x = 0; x < size; x++)
        f(createVector(x, y));
  }

  forEachUpBottom(f, size) {
    for (let y = size - 2; y >= 0; y--)
      for (let x = 0; x < size; x++)
        f(createVector(x, y));
  }

  forEachRightLeft(f, size) {
    for (let x = 1; x < size; x++)
      for (let y = 0; y < size; y++)
        f(createVector(x, y));
  }

  forEachLeftRight(f, size) {
    for (let x = size - 2; x >= 0; x--)
      for (let y = 0; y < size; y++)
        f(createVector(x, y));
  }

  swapCells(currPos, nextPos) {
    const currIdx = this.v2i(currPos);
    const nextIdx = this.v2i(nextPos);
    const currCell = this.board[currIdx];
    const nextCell = this.board[nextIdx];
    if (!currCell.value) return;
    const swap = nextCell.value == 0 || currCell.value == nextCell.value;
    if (currCell.value == nextCell.value) {
      currCell.value *= 2; nextCell.value *= 0;
    }
    if (swap) {
      [currCell.pos, nextCell.pos] = [nextCell.pos, currCell.pos];
      [this.board[currIdx], this.board[nextIdx]] = [this.board[nextIdx], this.board[currIdx]];
    }
  }

  move(key) {
    const key2forLoop = {
      [UP_ARROW]:    [this.forEachBottomUp,  createVector(  0, -1)],
      [DOWN_ARROW]:  [this.forEachUpBottom,  createVector(  0,  1)],
      [LEFT_ARROW]:  [this.forEachRightLeft, createVector( -1,  0)],
      [RIGHT_ARROW]: [this.forEachLeftRight, createVector(  1,  0)],
    };

    const [forLoop, dir] = key2forLoop[key];

    const boardBefore = this.board.map(cell => cell.value);
    for (let i = 0; i < this.size; i++) forLoop(pos => this.swapCells(pos, p5.Vector.add(pos, dir)), this.size);
    const boardAfter = this.board.map(cell => cell.value);
    const arrayCompare = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
    if (arrayCompare(boardBefore, boardAfter)) return;

    this.spawn();
  }

  draw = () => this.board.forEach(cell => cell.draw());
  v2i = (v) => v.x + this.size * v.y;
  i2v = (i) => createVector(
    int(i % this.size),
    int(i / this.size),
    1);
}

let board;
const boardSize = 4;
const maxCanvasSize = 600;
let canvasSize = maxCanvasSize;

function setup() {
  createCanvas(canvasSize, canvasSize);
  board = new Board(boardSize);
  board.spawn();
}

function windowResized() {
  let w = windowWidth * 0.8;
  let h = windowHeight * 0.8;
  canvasSize = Math.min(w, h, maxCanvasSize);
  resizeCanvas(canvasSize, canvasSize);
}

function keyPressed() {
  if (keyCode === UP_ARROW)    board.move(keyCode);
  if (keyCode === DOWN_ARROW)  board.move(keyCode);
  if (keyCode === LEFT_ARROW)  board.move(keyCode);
  if (keyCode === RIGHT_ARROW) board.move(keyCode);
}

let mousePressPos;
function mousePressed() {
  mousePressPos = createVector(mouseX, mouseY);
}

function mouseReleased() {
  const mouseReleasePos = createVector(mouseX, mouseY);
  const mouseDiff = p5.Vector.sub(mouseReleasePos, mousePressPos);
  let keyCode = undefined;

  if (abs(mouseDiff.x) < abs(mouseDiff.y)) {
    if (mouseDiff.y < 0) keyCode = UP_ARROW;
    if (mouseDiff.y > 0) keyCode = DOWN_ARROW;
  }

  if (abs(mouseDiff.x) > abs(mouseDiff.y)) {
    if (mouseDiff.x < 0) keyCode = LEFT_ARROW;
    if (mouseDiff.x > 0) keyCode = RIGHT_ARROW;
  }

  if (keyCode)
    board.move(keyCode);
}

function draw() {
  clear();
  board.draw();
}
