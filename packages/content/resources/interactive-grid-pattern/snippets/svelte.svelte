<script>
import { onMount, onDestroy } from "svelte";

export let cellSize = 32;
export let gap = 2;
export let cornerRadius = 3;
export let illuminationRadius = 200;
export let trailRadius = 120;
export let glowColor = [52, 211, 153];

let wrapperEl;
let canvasEl;
let animId = 0;
let mouse = { x: -1000, y: -1000 };
let target = { x: -1000, y: -1000 };
let grid = { cols: 0, rows: 0, dpr: 1 };

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function resize() {
  if (!canvasEl || !wrapperEl) return;
  const dpr = window.devicePixelRatio || 1;
  const w = wrapperEl.clientWidth;
  const h = wrapperEl.clientHeight;
  canvasEl.width = w * dpr;
  canvasEl.height = h * dpr;
  canvasEl.style.width = w + "px";
  canvasEl.style.height = h + "px";
  grid = {
    cols: Math.ceil(w / (cellSize + gap)) + 1,
    rows: Math.ceil(h / (cellSize + gap)) + 1,
    dpr,
  };
}

let resizeTimer;

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
}

function handleMouseMove(e) {
  const rect = wrapperEl.getBoundingClientRect();
  target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function handleMouseLeave() {
  target = { x: -1000, y: -1000 };
}

function handleTouchMove(e) {
  const touch = e.touches[0];
  const rect = wrapperEl.getBoundingClientRect();
  target = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

function handleTouchEnd() {
  target = { x: -1000, y: -1000 };
}

onMount(() => {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  resize();
  const [gR, gG, gB] = glowColor;

  function draw() {
    mouse.x = lerp(mouse.x, target.x, 0.15);
    mouse.y = lerp(mouse.y, target.y, 0.15);

    const { cols, rows, dpr } = grid;
    const w = canvasEl.width / dpr;
    const h = canvasEl.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * (cellSize + gap);
        const y = r * (cellSize + gap);
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;

        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const intensity = Math.max(0, 1 - dist / illuminationRadius);
        const smoothIntensity = intensity * intensity;
        const trailI = Math.max(0, 1 - dist / (illuminationRadius + trailRadius));
        const smoothTrail = trailI * trailI * 0.3;
        const finalIntensity = Math.min(1, smoothIntensity + smoothTrail);

        const alpha = 0.04 + finalIntensity * 0.55;

        if (finalIntensity > 0.01) {
          ctx.fillStyle = `rgba(${gR}, ${gG}, ${gB}, ${alpha.toFixed(3)})`;
          ctx.shadowColor = `rgba(${gR}, ${gG}, ${gB}, ${(finalIntensity * 0.6).toFixed(3)})`;
          ctx.shadowBlur = finalIntensity * 12;
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        roundRect(ctx, x, y, cellSize, cellSize, cornerRadius);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        if (finalIntensity > 0.1) {
          ctx.strokeStyle = `rgba(${gR}, ${gG}, ${gB}, ${(finalIntensity * 0.3).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          roundRect(ctx, x, y, cellSize, cellSize, cornerRadius);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener("resize", handleResize);
});

onDestroy(() => {
  cancelAnimationFrame(animId);
  clearTimeout(resizeTimer);
  window.removeEventListener("resize", handleResize);
});
</script>

<div class="grid-demo">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="grid-wrapper"
    bind:this={wrapperEl}
    on:mousemove={handleMouseMove}
    on:mouseleave={handleMouseLeave}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
  >
    <canvas bind:this={canvasEl} class="grid-canvas" />
    <div class="vignette" />
  </div>

  <div class="label-overlay">
    <h1 class="grid-title">Interactive Grid</h1>
    <p class="grid-subtitle">Move your mouse to illuminate nearby cells</p>
  </div>
</div>

<style>
  .grid-demo {
    width: 100vw;
    height: 100vh;
    background: #0a0a0a;
    display: grid;
    place-items: center;
    position: relative;
  }

  .grid-wrapper {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .grid-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 60% at 50% 50%, transparent 20%, #0a0a0a 75%);
    pointer-events: none;
  }

  .label-overlay {
    position: absolute;
    z-index: 10;
    text-align: center;
    pointer-events: none;
  }

  .grid-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #d1fae5 0%, #34d399 50%, #059669 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.5rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .grid-subtitle {
    font-size: clamp(0.875rem, 2vw, 1.125rem);
    color: rgba(148, 163, 184, 0.8);
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
  }
</style>
