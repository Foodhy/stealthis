const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const startBtn = document.getElementById('start-game-btn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let score = 0;
let highScore = localStorage.getItem('snake-high-score') || 0;
let dx = 0;
let dy = 0;
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let gameLoop;
let isGameRunning = false;

highScoreEl.textContent = highScore;

function startGame() {
  isGameRunning = true;
  score = 0;
  scoreEl.textContent = score;
  dx = 1;
  dy = 0;
  snake = [{ x: 10, y: 10 }];
  overlay.style.display = 'none';
  createFood();
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(draw, 100);
}

function createFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
  // Don't spawn food on snake
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    createFood();
  }
}

function draw() {
  moveSnake();
  if (checkGameOver()) return;
  
  // Clear Canvas
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw Food
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
  
  // Draw Snake
  ctx.fillStyle = '#10b981';
  snake.forEach((segment, index) => {
    // Head is slightly different
    if (index === 0) ctx.fillStyle = '#34d399';
    else ctx.fillStyle = '#10b981';
    
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    createFood();
  } else {
    snake.pop();
  }
}

function checkGameOver() {
  const head = snake[0];
  
  // Wall collision
  const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  
  // Self collision
  const hitSelf = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  
  if (hitWall || hitSelf) {
    gameOver();
    return true;
  }
  return false;
}

function gameOver() {
  isGameRunning = false;
  clearInterval(gameLoop);
  overlay.style.display = 'flex';
  overlayTitle.textContent = 'Game Over';
  overlayMsg.textContent = `Score: ${score}`;
  startBtn.textContent = 'Try Again';
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snake-high-score', highScore);
    highScoreEl.textContent = highScore;
  }
}

window.addEventListener('keydown', e => {
  if (!isGameRunning && e.code === 'Space') {
    startGame();
    return;
  }
  
  switch (e.key) {
    case 'ArrowUp': case 'w': if (dy === 0) { dx = 0; dy = -1; } break;
    case 'ArrowDown': case 's': if (dy === 0) { dx = 0; dy = 1; } break;
    case 'ArrowLeft': case 'a': if (dx === 0) { dx = -1; dy = 0; } break;
    case 'ArrowRight': case 'd': if (dx === 0) { dx = 1; dy = 0; } break;
  }
});

startBtn.addEventListener('click', startGame);
