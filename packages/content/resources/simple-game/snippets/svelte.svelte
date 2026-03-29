<script>
import { onMount, onDestroy } from "svelte";

const GRID = 20;
const TILE = 20;
const SIZE = GRID * TILE;

let canvas;
let score = 0;
let highScore = 0;
let phase = "idle"; // 'idle' | 'running' | 'over'

let state = {
  snake: [{ x: 10, y: 10 }],
  food: { x: 5, y: 5 },
  dx: 0,
  dy: 0,
  running: false,
  score: 0,
  gameOver: false,
};

let loopId = null;

function placeFood(snake) {
  let f;
  do {
    f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => s.x === f.x && s.y === f.y));
  return f;
}

function draw() {
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;
  const s = state;

  const head = { x: s.snake[0].x + s.dx, y: s.snake[0].y + s.dy };
  s.snake.unshift(head);

  if (head.x === s.food.x && head.y === s.food.y) {
    s.score += 10;
    score = s.score;
    s.food = placeFood(s.snake);
  } else {
    s.snake.pop();
  }

  const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
  const hitSelf = s.snake.slice(1).some((seg) => seg.x === head.x && seg.y === head.y);
  if (hitWall || hitSelf) {
    clearInterval(loopId);
    s.running = false;
    phase = "over";
    if (s.score > highScore) {
      highScore = s.score;
      localStorage.setItem("snake-hs", String(highScore));
    }
    return;
  }

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(s.food.x * TILE, s.food.y * TILE, TILE - 2, TILE - 2);
  s.snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#34d399" : "#10b981";
    ctx.fillRect(seg.x * TILE, seg.y * TILE, TILE - 2, TILE - 2);
  });
}

function startGame() {
  state.snake = [{ x: 10, y: 10 }];
  state.dx = 1;
  state.dy = 0;
  state.score = 0;
  state.running = true;
  state.gameOver = false;
  state.food = placeFood(state.snake);
  score = 0;
  phase = "running";
  if (loopId) clearInterval(loopId);
  loopId = setInterval(draw, 100);
}

function handleDpad(dx, dy, condFn) {
  if (state.running && condFn(state)) {
    state.dx = dx;
    state.dy = dy;
  }
}

const dpadButtons = [
  { label: "↑", row: 1, col: 2, dx: 0, dy: -1, cond: (s) => s.dy === 0 },
  { label: "←", row: 2, col: 1, dx: -1, dy: 0, cond: (s) => s.dx === 0 },
  { label: "↓", row: 2, col: 2, dx: 0, dy: 1, cond: (s) => s.dy === 0 },
  { label: "→", row: 2, col: 3, dx: 1, dy: 0, cond: (s) => s.dx === 0 },
];

function onKey(e) {
  if (!state.running && e.code === "Space") {
    startGame();
    return;
  }
  switch (e.key) {
    case "ArrowUp":
    case "w":
      if (state.dy === 0) {
        state.dx = 0;
        state.dy = -1;
      }
      break;
    case "ArrowDown":
    case "s":
      if (state.dy === 0) {
        state.dx = 0;
        state.dy = 1;
      }
      break;
    case "ArrowLeft":
    case "a":
      if (state.dx === 0) {
        state.dx = -1;
        state.dy = 0;
      }
      break;
    case "ArrowRight":
    case "d":
      if (state.dx === 0) {
        state.dx = 1;
        state.dy = 0;
      }
      break;
  }
}

onMount(() => {
  highScore = Number(localStorage.getItem("snake-hs") || 0);
  window.addEventListener("keydown", onKey);
});

onDestroy(() => {
  window.removeEventListener("keydown", onKey);
  if (loopId) clearInterval(loopId);
});
</script>

<div class="wrapper">
  <div class="score-row">
    <span class="score-label">Score: <strong class="score-val">{score}</strong></span>
    <span class="score-label">Best: <strong class="best-val">{highScore}</strong></span>
  </div>

  <div class="canvas-wrap">
    <canvas bind:this={canvas} width={SIZE} height={SIZE} style="display: block;"></canvas>
    {#if phase !== 'running'}
      <div class="overlay">
        <p class="overlay-title">{phase === 'over' ? 'Game Over' : 'Snake'}</p>
        {#if phase === 'over'}
          <p class="overlay-score">Score: {score}</p>
        {/if}
        <button class="start-btn" on:click={startGame}>
          {phase === 'over' ? 'Try Again' : 'Start Game'}
        </button>
      </div>
    {/if}
  </div>

  <div class="dpad">
    {#each dpadButtons as btn}
      <button
        class="dpad-btn"
        style="grid-row: {btn.row}; grid-column: {btn.col};"
        on:click={() => handleDpad(btn.dx, btn.dy, btn.cond)}
      >
        {btn.label}
      </button>
    {/each}
  </div>
  <p class="hint">Arrow keys or WASD to control</p>
</div>

<style>
  .wrapper {
    min-height: 100vh;
    background: #0d1117;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.5rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .score-row { display: flex; gap: 2rem; font-size: 0.875rem; }
  .score-label { color: #8b949e; }
  .score-val { color: #34d399; font-variant-numeric: tabular-nums; }
  .best-val { color: #f1e05a; font-variant-numeric: tabular-nums; }
  .canvas-wrap {
    position: relative;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 1px solid #30363d;
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  .overlay-title { color: #e6edf3; font-size: 1.25rem; font-weight: 700; }
  .overlay-score { color: #8b949e; font-size: 0.875rem; }
  .start-btn {
    padding: 0.625rem 1.5rem;
    background: #238636;
    border: 1px solid #2ea043;
    color: white;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
  }
  .start-btn:hover { background: #2ea043; }
  .dpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem; margin-top: 0.5rem; }
  .dpad-btn {
    width: 2.5rem;
    height: 2.5rem;
    background: #21262d;
    border: 1px solid #30363d;
    border-radius: 0.5rem;
    color: #8b949e;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .dpad-btn:hover { color: #e6edf3; border-color: rgba(139,147,158,0.4); }
  .hint { font-size: 11px; color: #484f58; }
</style>
