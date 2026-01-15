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

// --- GAME MODES ---
const MODE_CLASSIC = "classic";   
const MODE_COOP_AI = "coop_ai";   
let gameMode = MODE_CLASSIC;    


let leftY2 = (height - paddleHeight) / 2 + 60;


const aiSpeed = 5;
const aiError = 200; 


// Pause state
let paused = false;

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function setMode(mode) {
  gameMode = mode;
  resetGame();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "m" || e.key === "M") {
    setMode(gameMode === MODE_CLASSIC ? MODE_COOP_AI : MODE_CLASSIC);
  }
});


function handleInput() {
  if (gameMode === MODE_CLASSIC) {
    
    if (wDown) leftY -= paddleSpeed;
    if (sDown) leftY += paddleSpeed;
    if (upDown) rightY -= paddleSpeed;
    if (downDown) rightY += paddleSpeed;

    leftY = clamp(leftY, 0, height - paddleHeight);
    rightY = clamp(rightY, 0, height - paddleHeight);
    return;
  }

  if (gameMode === MODE_COOP_AI) {
    if (wDown) leftY -= paddleSpeed;
    if (sDown) leftY += paddleSpeed;

    
    if (upDown) leftY2 -= paddleSpeed;
    if (downDown) leftY2 += paddleSpeed;

    leftY = clamp(leftY, 0, height - paddleHeight);
    leftY2 = clamp(leftY2, 0, height - paddleHeight);

    
    const aiTarget = ballY - paddleHeight / 2 + (Math.random() * 2 - 1) * aiError;
    if (aiTarget > rightY) rightY += aiSpeed;
    else if (aiTarget < rightY) rightY -= aiSpeed;
    rightY = clamp(rightY, 0, height - paddleHeight);
  }
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


if (ballSpeedX < 0 && ballX <= leftX + paddleWidth) {
  const hitLeft1 =
    ballY + ballSize >= leftY && ballY <= leftY + paddleHeight;

  const hitLeft2 =
    (gameMode === MODE_COOP_AI) &&
    (ballY + ballSize >= leftY2 && ballY <= leftY2 + paddleHeight);

  if (hitLeft1 || hitLeft2) {
    ballX = leftX + paddleWidth;
    ballSpeedX = -ballSpeedX;
  }
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

function resetGame() {
    ctx.clearRect(0, 0, width, height);
    leftScore = 0;
    rightScore = 0;
    leftY = (height - paddleHeight) / 2;
    rightY = (height - paddleHeight) / 2;
    resetBall(1);
}

function togglePause() {
  paused = !paused;
  if (pauseBtn) {
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  }
}

// function togglePause() {
//     if (paused) {
//         paused = false;
//         pauseBtn.textContent = "Pause";
//         nextTick();
//     } else {
//         paused = true;
//         pauseBtn.textContent = "Resume";
//     }
// }

// function clear() {
//     ctx.clearRect(0,0,width,height):
// }

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

ctx.fillRect(leftX, leftY, paddleWidth, paddleHeight);

if (gameMode === MODE_COOP_AI) {
  ctx.fillRect(leftX, leftY2, paddleWidth, paddleHeight);
}

ctx.fillRect(rightX, rightY, paddleWidth, paddleHeight);

ctx.font = "14px Arial";
ctx.fillText(
  gameMode === MODE_CLASSIC ? "Mode: Classic (M to switch)" : "Mode: Co-op vs AI (M to switch)",
  width / 2,
  height - 15
);


}

function update() {
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

loop();
