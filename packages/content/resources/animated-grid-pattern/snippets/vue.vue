<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  cellSize: { type: Number, default: 40 },
  gap: { type: Number, default: 1 },
  glowColor: { type: String, default: "rgba(99, 102, 241, 0.6)" },
  glowColorBright: { type: String, default: "rgba(129, 140, 248, 0.9)" },
  highlightInterval: { type: Number, default: 120 },
  glowDuration: { type: Number, default: 2500 },
  maxSimultaneous: { type: Number, default: 8 },
});

const svgEl = ref(null);
const width = ref(0);
const height = ref(0);
let cells = [];
let activeCount = 0;
let intervalId;
let resizeTimer;

function buildGrid() {
  const svg = svgEl.value;
  if (!svg) return;
  const parent = svg.parentElement;
  if (!parent) return;

  width.value = parent.clientWidth;
  height.value = parent.clientHeight;

  const cols = Math.ceil(width.value / (props.cellSize + props.gap)) + 1;
  const rows = Math.ceil(height.value / (props.cellSize + props.gap)) + 1;

  while (svg.firstChild) svg.removeChild(svg.firstChild);
  cells = [];
  activeCount = 0;

  const ns = "http://www.w3.org/2000/svg";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", String(c * (props.cellSize + props.gap)));
      rect.setAttribute("y", String(r * (props.cellSize + props.gap)));
      rect.setAttribute("width", String(props.cellSize));
      rect.setAttribute("height", String(props.cellSize));
      rect.setAttribute("rx", "2");
      rect.setAttribute("fill", "transparent");
      rect.setAttribute("stroke", "rgba(255,255,255,0.06)");
      rect.setAttribute("stroke-width", "0.5");
      svg.appendChild(rect);
      cells.push(rect);
    }
  }
}

function startHighlighting() {
  intervalId = setInterval(() => {
    if (cells.length === 0 || activeCount >= props.maxSimultaneous) return;

    const idx = Math.floor(Math.random() * cells.length);
    const cell = cells[idx];

    if (cell.dataset.active === "true") return;

    cell.dataset.active = "true";
    cell.setAttribute("fill", props.glowColor);
    cell.style.filter = `drop-shadow(0 0 8px ${props.glowColorBright})`;
    cell.style.transition = "fill 0.3s ease, filter 0.3s ease";
    activeCount++;

    setTimeout(() => {
      cell.setAttribute("fill", props.glowColorBright);
      cell.style.filter = `drop-shadow(0 0 16px ${props.glowColorBright})`;
    }, props.glowDuration * 0.2);

    setTimeout(() => {
      cell.setAttribute("fill", "transparent");
      cell.style.filter = "none";
      cell.dataset.active = "false";
      activeCount--;
    }, props.glowDuration);
  }, props.highlightInterval);
}

function handleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildGrid, 200);
}

onMounted(() => {
  buildGrid();
  startHighlighting();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  clearInterval(intervalId);
  clearTimeout(resizeTimer);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div
    style="width: 100vw; height: 100vh; background: #0a0a0a; display: grid; place-items: center; position: relative;"
  >
    <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
      <svg
        ref="svgEl"
        :viewBox="`0 0 ${width} ${height}`"
        style="position: absolute; inset: 0; width: 100%; height: 100%;"
        aria-hidden="true"
      ></svg>
      <div
        style="position: absolute; inset: 0; background: radial-gradient(ellipse 50% 50% at 50% 50%, transparent 30%, #0a0a0a 80%); pointer-events: none;"
      ></div>
    </div>
    <div
      style="position: absolute; z-index: 10; text-align: center; pointer-events: none;"
    >
      <h1
        style="font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem; font-family: system-ui, -apple-system, sans-serif;"
      >
        Animated Grid
      </h1>
      <p
        style="font-size: clamp(0.875rem, 2vw, 1.125rem); color: rgba(148, 163, 184, 0.8); font-family: system-ui, -apple-system, sans-serif;"
      >
        Randomly glowing cells create a living background
      </p>
    </div>
  </div>
</template>
