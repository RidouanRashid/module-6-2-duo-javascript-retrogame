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

const ballSize = 16;
const initialBallSpeedX = 2;
const initialBallSpeedY = 1.5;

let balls = [];

function makeBall(direction) {
  const sx = direction < 0 ? -Math.abs(initialBallSpeedX) : Math.abs(initialBallSpeedX);
  const sy = Math.random() < 0.5 ? initialBallSpeedY : -initialBallSpeedY;
  return { x: width / 2 - ballSize / 2, y: height / 2 - ballSize / 2, sx: sx, sy: sy, size: ballSize };
}

const speedIncreaseFactor = 1.02; 
const maxBallSpeed = 12;

let leftScore = 0;
let rightScore = 0;
const timeLimitSeconds = 60; 
let remainingSeconds = timeLimitSeconds;
let timerInterval = null;

let wDown = false;
let sDown = false;
let upDown = false;
let downDown = false;

const modeEl = document.getElementById('modeText');

const backgroundColors = {
  dark: '#222',
  blue: '#001a4d',
  green: '#001a00',
  red: '#4d0000'
};
let currentBackground = backgroundColors.dark;
let currentBackgroundImage = null;
let useBackgroundImage = false;


const bgImage = new Image();
bgImage.src = 'img/kerst.png';
bgImage.onload = () => {
  console.log('Background image loaded successfully');
};


const ballImage = new Image();
ballImage.src = 'img/kerstbal.png';
ballImage.onload = () => {
  console.log('Ball image loaded successfully');
};


const MODE_CLASSIC = "classic";   
const MODE_COOP_AI = "coop_ai";   
const MODE_MULTI = "multi";
let gameMode = MODE_CLASSIC;    
const MODE_ORDER = [MODE_CLASSIC, MODE_COOP_AI, MODE_MULTI];


let leftY2 = (height - paddleHeight) / 2 + 60;


const aiSpeed = 5;
const aiError = 20; 


let paused = false;
let gameOver = false;


function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function setMode(mode) {
  if (!MODE_ORDER.includes(mode)) return;
  gameMode = mode;
  resetGame();
}

function updateModeText() {
  if (!modeEl) return;
  let text = 'Mode: Classic';
  if (gameMode === MODE_COOP_AI) text = 'Mode: Coop AI';
  if (gameMode === MODE_MULTI) text = 'Mode: Multi-ball';
  text += ' — Press M for next mode, N for previous mode';
  modeEl.textContent = text;
}

window.addEventListener("keydown", (e) => {
  const k = e.key && e.key.toLowerCase();
  if (k === 'm') {
    const idx = MODE_ORDER.indexOf(gameMode);
    const next = MODE_ORDER[(idx + 1) % MODE_ORDER.length];
    setMode(next);
  } else if (k === 'n') {
    const idx = MODE_ORDER.indexOf(gameMode);
    const prev = MODE_ORDER[(idx - 1 + MODE_ORDER.length) % MODE_ORDER.length];
    setMode(prev);
  }
});


function handleInput() {
  if (gameMode === MODE_CLASSIC || gameMode === MODE_MULTI) {
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

    
    const targetBallY = (balls.length > 0) ? balls[0].y : (typeof ballY !== 'undefined' ? ballY : height/2);
    const aiTarget = targetBallY - paddleHeight / 2 + (Math.random() * 2 - 1) * aiError;
    if (aiTarget > rightY) rightY += aiSpeed;
    else if (aiTarget < rightY) rightY -= aiSpeed;
    rightY = clamp(rightY, 0, height - paddleHeight);
  }
}


function moveBall() {
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    b.x += b.sx;
    b.y += b.sy;

    if (b.y <= 0) {
      b.y = 0;
      b.sy = -b.sy;
      increaseBallSpeed(b);
    }
    if (b.y + b.size >= height) {
      b.y = height - b.size;
      b.sy = -b.sy;
      increaseBallSpeed(b);
    }

    if (b.sx < 0 && b.x <= leftX + paddleWidth) {
      const hitLeft1 = b.y + b.size >= leftY && b.y <= leftY + paddleHeight;
      const hitLeft2 = (gameMode === MODE_COOP_AI) && (b.y + b.size >= leftY2 && b.y <= leftY2 + paddleHeight);
      if (hitLeft1 || hitLeft2) {
        b.x = leftX + paddleWidth;
        b.sx = -b.sx;
        const hitPos = (b.y + b.size / 2) - (leftY + paddleHeight / 2);
        b.sy += (hitPos / (paddleHeight / 2)) * 1.5;
        increaseBallSpeed(b);
      }
    }

    if (b.x + b.size >= rightX && b.y + b.size >= rightY && b.y <= rightY + paddleHeight && b.sx > 0) {
      b.x = rightX - b.size;
      b.sx = -b.sx;
      const hitPosR = (b.y + b.size / 2) - (rightY + paddleHeight / 2);
      b.sy += (hitPosR / (paddleHeight / 2)) * 1.5;
      increaseBallSpeed(b);
    }

    if (b.x + b.size < 0) {
      if (rightScore < 10) rightScore += 1;
      if (rightScore >= 10) { rightScore = 10; handleGameOver('Right'); }
      balls[i] = makeBall(1);
    }
    if (b.x > width) {
      if (leftScore < 10) leftScore += 1;
      if (leftScore >= 10) { leftScore = 10; handleGameOver('Left'); }
      balls[i] = makeBall(-1);
    }
  }
}

function resetBall(direction) {
  balls = [ makeBall(direction) ];
}

function increaseBallSpeed(ball) {
  const sx = Math.sign(ball.sx) || 1;
  const sy = Math.sign(ball.sy) || 1;
  let ax = Math.min(Math.abs(ball.sx) * speedIncreaseFactor, maxBallSpeed);
  let ay = Math.min(Math.abs(ball.sy) * speedIncreaseFactor, maxBallSpeed);
  if (ay < 0.5) ay = 0.5;
  ball.sx = ax * sx;
  ball.sy = ay * sy;
}

function resetGame() {
    ctx.clearRect(0, 0, width, height);
    leftScore = 0;
    rightScore = 0;
    leftY = (height - paddleHeight) / 2;
    rightY = (height - paddleHeight) / 2;
    leftY2 = (height - paddleHeight) / 2;
    if (gameMode === MODE_MULTI) {
      balls = [ makeBall(1), makeBall(-1) ];
      balls[1].y += 30; balls[2].y -= 30;
    } else {
      balls = [ makeBall(1) ];
    }
    updateModeText();
    startTimer();
  gameOver = false;
  paused = false;
  if (pauseBtn) pauseBtn.textContent = "Pause";
  try { localStorage.removeItem('pongWinner'); } catch (e) {}
}

function togglePause() {
  if (gameOver) return; 
  paused = !paused;
  if (pauseBtn) {
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  remainingSeconds = timeLimitSeconds;
  timerInterval = setInterval(() => {
    if (!paused && !gameOver) {
      remainingSeconds -= 1;
      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        clearInterval(timerInterval);
        gameOver = true;
        handleGameOver('Time');
      }
    }
  }, 1000);
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
  try { localStorage.setItem('pongWinner', winner); } catch (e) {}
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // Draw background
  if (useBackgroundImage && bgImage.complete) {
    ctx.drawImage(bgImage, 0, 0, width, height);
  } else {
    ctx.fillStyle = currentBackground;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = "#fff";

  ctx.fillRect(width / 2 - 1, 0, 2, height);

  ctx.fillRect(leftX, leftY, paddleWidth, paddleHeight);
  if (gameMode === MODE_COOP_AI) {
    ctx.fillRect(leftX, leftY2, paddleWidth, paddleHeight);
  }
  ctx.fillRect(rightX, rightY, paddleWidth, paddleHeight);

  // Draw balls
  for (const b of balls) {
    if (useBackgroundImage && ballImage.complete) {
      ctx.drawImage(ballImage, b.x, b.y, b.size, b.size);
    } else {
      ctx.fillRect(b.x, b.y, b.size, b.size);
    }
  }

  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(leftScore, width / 2 - 40, 30);
  ctx.fillText(rightScore, width / 2 + 40, 30);

  
  ctx.textAlign = "right";
  ctx.fillText(`Time: ${remainingSeconds}s`, width - 10, 30);
  ctx.textAlign = "center";

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
    let winnerText = '';
    if (leftScore === rightScore) winnerText = 'Draw!';
    else winnerText = leftScore > rightScore ? 'Left Player Wins!' : 'Right Player Wins!';
    ctx.fillText(`Game Over - ${winnerText}`, width / 2, height / 2 - 10);
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

resetGame();

if (resetBtn) resetBtn.addEventListener('click', resetGame);
if (pauseBtn) pauseBtn.addEventListener('click', togglePause);


const bgBtn1 = document.getElementById('bgBtn1');
const bgBtn2 = document.getElementById('bgBtn2');
const bgBtn3 = document.getElementById('bgBtn3');
const bgBtn4 = document.getElementById('bgBtn4');
const bgBtnImg = document.getElementById('bgBtnImg');

if (bgBtn1) bgBtn1.addEventListener('click', () => { currentBackground = backgroundColors.dark; useBackgroundImage = false; });
if (bgBtn2) bgBtn2.addEventListener('click', () => { currentBackground = backgroundColors.blue; useBackgroundImage = false; });
if (bgBtn3) bgBtn3.addEventListener('click', () => { currentBackground = backgroundColors.green; useBackgroundImage = false; });
if (bgBtn4) bgBtn4.addEventListener('click', () => { currentBackground = backgroundColors.red; useBackgroundImage = false; });
if (bgBtnImg) bgBtnImg.addEventListener('click', () => { useBackgroundImage = true; });

loop();
