<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  cellSize: { type: Number, default: 32 },
  gap: { type: Number, default: 2 },
  cornerRadius: { type: Number, default: 3 },
  illuminationRadius: { type: Number, default: 200 },
  trailRadius: { type: Number, default: 120 },
  glowColor: { type: Array, default: () => [52, 211, 153] },
});

const wrapperEl = ref(null);
const canvasEl = ref(null);
let animId = 0;
const mouse = { x: -1000, y: -1000 };
const target = { x: -1000, y: -1000 };
const grid = { cols: 0, rows: 0, dpr: 1 };

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
  const canvas = canvasEl.value;
  const wrapper = wrapperEl.value;
  if (!canvas || !wrapper) return;
  const dpr = window.devicePixelRatio || 1;
  const w = wrapper.clientWidth;
  const h = wrapper.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  grid.cols = Math.ceil(w / (props.cellSize + props.gap)) + 1;
  grid.rows = Math.ceil(h / (props.cellSize + props.gap)) + 1;
  grid.dpr = dpr;
}

let resizeTimer;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
}

function handleMouseMove(e) {
  const rect = wrapperEl.value.getBoundingClientRect();
  target.x = e.clientX - rect.left;
  target.y = e.clientY - rect.top;
}

function handleMouseLeave() {
  target.x = -1000;
  target.y = -1000;
}

function handleTouchMove(e) {
  const touch = e.touches[0];
  const rect = wrapperEl.value.getBoundingClientRect();
  target.x = touch.clientX - rect.left;
  target.y = touch.clientY - rect.top;
}

function handleTouchEnd() {
  target.x = -1000;
  target.y = -1000;
}

onMounted(() => {
  const canvas = canvasEl.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  resize();
  const [gR, gG, gB] = props.glowColor;

  function draw() {
    mouse.x = lerp(mouse.x, target.x, 0.15);
    mouse.y = lerp(mouse.y, target.y, 0.15);

    const { cols, rows, dpr } = grid;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * (props.cellSize + props.gap);
        const y = r * (props.cellSize + props.gap);
        const cx = x + props.cellSize / 2;
        const cy = y + props.cellSize / 2;

        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const intensity = Math.max(0, 1 - dist / props.illuminationRadius);
        const smoothIntensity = intensity * intensity;
        const trailI = Math.max(0, 1 - dist / (props.illuminationRadius + props.trailRadius));
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

        roundRect(ctx, x, y, props.cellSize, props.cellSize, props.cornerRadius);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        if (finalIntensity > 0.1) {
          ctx.strokeStyle = `rgba(${gR}, ${gG}, ${gB}, ${(finalIntensity * 0.3).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          roundRect(ctx, x, y, props.cellSize, props.cellSize, props.cornerRadius);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
  clearTimeout(resizeTimer);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="grid-demo">
    <div
      ref="wrapperEl"
      class="grid-wrapper"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <canvas ref="canvasEl" class="grid-canvas" />
      <div class="vignette" />
    </div>

    <div class="label-overlay">
      <h1 class="grid-title">Interactive Grid</h1>
      <p class="grid-subtitle">Move your mouse to illuminate nearby cells</p>
    </div>
  </div>
</template>

<style scoped>
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
