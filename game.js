var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var width = canvas.width;
var height = canvas.height;

var paddleWidth = 10;
var paddleHeight = 80;
var paddleSpeed = 6;

var leftX = 20;
var leftY = (height - paddleHeight) / 2;

var rightX = width - 20 - paddleWidth;
var rightY = (height - paddleHeight) / 2;

var ballSize = 10;
var ballX = width / 2;
var ballY = height / 2;
var ballSpeedX = 4;
var ballSpeedY = 3;

var leftScore = 0;
var rightScore = 0;

var wDown = false;
var sDown = false;
var upDown = false;
var downDown = false;

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
  var k = e.key;
  if (k === "w" || k === "W") wDown = true;
  if (k === "s" || k === "S") sDown = true;
  if (k === "ArrowUp") upDown = true;
  if (k === "ArrowDown") downDown = true;
}

function onKeyUp(e) {
  var k = e.key;
  if (k === "w" || k === "W") wDown = false;
  if (k === "s" || k === "S") sDown = false;
  if (k === "ArrowUp") upDown = false;
  if (k === "ArrowDown") downDown = false;
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

loop();
