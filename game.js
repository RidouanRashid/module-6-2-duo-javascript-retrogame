const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

const leftX = 20;
let leftY = (height - paddleHeight) / 2;

const rightX = width - 20 - paddleWidth;
let rightY = (height - paddleHeight) / 2;

const ballSize = 10;
let ballX = width / 2;
let ballY = height / 2;
let ballSpeedX = 4;
let ballSpeedY = 3;

let leftScore = 0;
let rightScore = 0;

let wDown = false;
let sDown = false;
let upDown = false;
let downDown = false;

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function handleInput() {
  if (wDown) {
    leftY = leftY - paddleSpeed;
  }
  if (sDown) {
    leftY = leftY + paddleSpeed;
  }
  if (upDown) {
    rightY = rightY - paddleSpeed;
  }
  if (downDown) {
    rightY = rightY + paddleSpeed;
  }

  leftY = clamp(leftY, 0, height - paddleHeight);
  rightY = clamp(rightY, 0, height - paddleHeight);
}

function moveBall() {
  ballX = ballX + ballSpeedX;
  ballY = ballY + ballSpeedY;

  if (ballY <= 0) {
    ballY = 0;
    ballSpeedY = -ballSpeedY;
  }
  if (ballY + ballSize >= height) {
    ballY = height - ballSize;
    ballSpeedY = -ballSpeedY;
  }

  if (
    ballX <= leftX + paddleWidth &&
    ballY + ballSize >= leftY &&
    ballY <= leftY + paddleHeight &&
    ballSpeedX < 0
  ) {
    ballX = leftX + paddleWidth;
    ballSpeedX = -ballSpeedX;
  }

  if (
    ballX + ballSize >= rightX &&
    ballY + ballSize >= rightY &&
    ballY <= rightY + paddleHeight &&
    ballSpeedX > 0
  ) {
    ballX = rightX - ballSize;
    ballSpeedX = -ballSpeedX;
  }

  if (ballX + ballSize < 0) {
    rightScore = rightScore + 1;
    resetBall(1);
  }
  if (ballX > width) {
    leftScore = leftScore + 1;
    resetBall(-1);
  }
}

function resetBall(direction) {
  ballX = width / 2 - ballSize / 2;
  ballY = height / 2 - ballSize / 2;
  if (direction < 0) {
    ballSpeedX = -Math.abs(ballSpeedX);
  } else {
    ballSpeedX = Math.abs(ballSpeedX);
  }
  ballSpeedY = ballSpeedY > 0 ? 3 : -3;
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#fff";

  ctx.fillRect(width / 2 - 1, 0, 2, height);

  ctx.fillRect(leftX, leftY, paddleWidth, paddleHeight);
  ctx.fillRect(rightX, rightY, paddleWidth, paddleHeight);

  ctx.fillRect(ballX, ballY, ballSize, ballSize);

  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(leftScore, width / 2 - 40, 30);
  ctx.fillText(rightScore, width / 2 + 40, 30);
}

function update() {
  handleInput();
  moveBall();
}

function loop() {
  update();
  draw();
  window.requestAnimationFrame(loop);
}

function onKeyDown(e) {
  const k = e.key;
  if (k === "w" || k === "W") wDown = true;
  if (k === "s" || k === "S") sDown = true;
  if (k === "ArrowUp") upDown = true;
  if (k === "ArrowDown") downDown = true;
}

function onKeyUp(e) {
  const k = e.key;
  if (k === "w" || k === "W") wDown = false;
  if (k === "s" || k === "S") sDown = false;
  if (k === "ArrowUp") upDown = false;
  if (k === "ArrowDown") downDown = false;
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

loop();
