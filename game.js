const resetBtn = document.querySelector('#resetBtn');
const pauseBtn = document.querySelector('#pauseBtn');    
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
let ballX = width / 2 - ballSize / 2;
let ballY = height / 2 - ballSize / 2;
let ballSpeedX = 4;
let ballSpeedY = 3;

let leftScore = 0;
let rightScore = 0;

let wDown = false;
let sDown = false;
let upDown = false;
let downDown = false;
let paused = false;
let gameOver = false;


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
    // right player scored
    if (rightScore < 10) rightScore = rightScore + 1;
    if (rightScore >= 10) {
      rightScore = 10;
      handleGameOver('Right');
    }
    resetBall(1);
  }
  if (ballX > width) {
    // left player scored
    if (leftScore < 10) leftScore = leftScore + 1;
    if (leftScore >= 10) {
      leftScore = 10;
      handleGameOver('Left');
    }
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
  ballSpeedY = Math.random() < 0.5 ? 3 : -3;
}

function resetGame() {
    ctx.clearRect(0, 0, width, height);
    leftScore = 0;
    rightScore = 0;
    leftY = (height - paddleHeight) / 2;
    rightY = (height - paddleHeight) / 2;
    resetBall(1);
  gameOver = false;
  if (pauseBtn) pauseBtn.textContent = "Pause";
  try { localStorage.removeItem('pongWinner'); } catch (e) {}
}

function togglePause() {
  paused = !paused;
  if (pauseBtn) {
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  }
}

function MaxscoreReached() {
    if (leftScore >= 10 || rightScore >= 10) {
        gameOver = true;
        return true;
    }
    return false;
}

function handleGameOver(winner) {
  gameOver = true;
  // Save winner to localStorage
  try { localStorage.setItem('pongWinner', winner); } catch (e) {}
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

  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Paused", width / 2, height / 2);
  }

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    const winner = leftScore >= 10 ? 'Left Player' : 'Right Player';
    ctx.fillText(`Game Over - ${winner} Wins!`, width / 2, height / 2 - 10);
    ctx.font = "18px Arial";
    ctx.fillText('Press Reset to play again', width / 2, height / 2 + 20);
  }
}

function update() {
  if (gameOver) return;
  handleInput();
  moveBall();
}

function loop() {
  if (!paused) {
    update();
  }
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

// Serve once on load from center with random vertical direction
resetBall(1);

// Hook up buttons if present
if (resetBtn) resetBtn.addEventListener('click', resetGame);
if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

loop();
