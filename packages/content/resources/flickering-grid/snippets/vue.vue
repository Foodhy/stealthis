<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  cellSize: { type: Number, default: 24 },
  gap: { type: Number, default: 2 },
  baseOpacity: { type: Number, default: 0.06 },
  maxOpacity: { type: Number, default: 0.35 },
  flickerChance: { type: Number, default: 0.005 },
  color: { type: Object, default: () => ({ r: 16, g: 185, b: 129 }) },
});

const containerEl = ref(null);
const canvasEl = ref(null);
let animId = 0;
let cells = [];
const lerpSpeed = 0.04;

function setup() {
  const canvas = canvasEl.value;
  const container = containerEl.value;
  if (!canvas || !container) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cols = Math.ceil(rect.width / (props.cellSize + props.gap));
  const rows = Math.ceil(rect.height / (props.cellSize + props.gap));

  cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: c * (props.cellSize + props.gap),
        y: r * (props.cellSize + props.gap),
        opacity: props.baseOpacity + Math.random() * 0.03,
        target: props.baseOpacity,
      });
    }
  }

  const w = rect.width;
  const h = rect.height;

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (const cell of cells) {
      if (Math.random() < props.flickerChance) {
        cell.target = props.baseOpacity + Math.random() * (props.maxOpacity - props.baseOpacity);
      }
      cell.opacity += (cell.target - cell.opacity) * lerpSpeed;
      cell.target += (props.baseOpacity - cell.target) * 0.01;

      ctx.fillStyle = `rgba(${props.color.r}, ${props.color.g}, ${props.color.b}, ${cell.opacity})`;
      ctx.beginPath();
      ctx.roundRect(cell.x, cell.y, props.cellSize, props.cellSize, 2);
      ctx.fill();
    }
    animId = requestAnimationFrame(animate);
  }

  cancelAnimationFrame(animId);
  animate();
}

let resizeTimer;
function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setup, 100);
}

onMounted(() => {
  setup();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
  window.removeEventListener("resize", handleResize);
  clearTimeout(resizeTimer);
});

const stats = [
  { value: "60", label: "FPS" },
  { value: "<2%", label: "CPU" },
  { value: "Canvas", label: "2D API" },
];
</script>

<template>
  <div ref="containerEl" class="flickering-container">
    <canvas ref="canvasEl" class="flickering-canvas"></canvas>
    <div class="flickering-content">
      <slot>
        <div class="demo-inner">
          <div class="demo-glow"></div>
          <h1 class="demo-title">Flickering Grid</h1>
          <p class="demo-desc">
            Canvas-based animated grid where cells randomly pulse opacity, creating
            a living, breathing background.
          </p>
          <div class="demo-stats">
            <template v-for="(stat, i) in stats" :key="stat.label">
              <div class="stat-item">
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
              <div v-if="i < stats.length - 1" class="stat-divider"></div>
            </template>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.flickering-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: grid;
  place-items: center;
  background: #000;
  overflow: hidden;
}
.flickering-canvas {
  position: absolute;
  inset: 0;
  display: block;
}
.flickering-content {
  position: relative;
  z-index: 1;
}
.demo-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 2rem;
  position: relative;
}
.demo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.demo-title {
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #fafafa;
  font-family: system-ui, -apple-system, sans-serif;
}
.demo-desc {
  font-size: 1rem;
  line-height: 1.7;
  color: #71717a;
  max-width: 400px;
  font-family: system-ui, -apple-system, sans-serif;
}
.demo-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.stat-value { font-size: 1.25rem; font-weight: 700; color: #10b981; }
.stat-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #52525b;
}
.stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.08); }
</style>
