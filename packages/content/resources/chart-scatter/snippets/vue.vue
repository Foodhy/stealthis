<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const GROUPS = [
  {
    label: "Team A",
    color: "#818cf8",
    points: [
      { name: "Auth", x: 12, y: 3 },
      { name: "Dashboard", x: 18, y: 7 },
      { name: "Profile", x: 8, y: 2 },
      { name: "Settings", x: 22, y: 11 },
      { name: "Reports", x: 15, y: 5 },
    ],
  },
  {
    label: "Team B",
    color: "#34d399",
    points: [
      { name: "API", x: 25, y: 9 },
      { name: "Search", x: 30, y: 14 },
      { name: "Payments", x: 20, y: 6 },
      { name: "Mobile", x: 35, y: 18 },
      { name: "Export", x: 14, y: 4 },
    ],
  },
  {
    label: "Team C",
    color: "#f59e0b",
    points: [
      { name: "Admin", x: 40, y: 20 },
      { name: "CMS", x: 28, y: 12 },
      { name: "Email", x: 10, y: 1 },
      { name: "CDN", x: 45, y: 22 },
    ],
  },
];
const PAD = { top: 24, right: 24, bottom: 48, left: 52 };

const wrapEl = ref(null);
const W = ref(600);
const hidden = ref(new Set());
const tooltip = ref(null);
let ro = null;

onMounted(() => {
  ro = new ResizeObserver(() => {
    if (!wrapEl.value) return;
    W.value = wrapEl.value.clientWidth - 32;
  });
  if (wrapEl.value) ro.observe(wrapEl.value);
});
onUnmounted(() => {
  if (ro) ro.disconnect();
});

function toggleHidden(i) {
  const n = new Set(hidden.value);
  n.has(i) ? n.delete(i) : n.add(i);
  hidden.value = n;
}

const H = computed(() => Math.round(W.value * 0.5));
const cW = computed(() => W.value - PAD.left - PAD.right);
const cH = computed(() => H.value - PAD.top - PAD.bottom);

const allPts = GROUPS.flatMap((g) => g.points);
const maxX = Math.ceil(Math.max(...allPts.map((p) => p.x)) * 1.1);
const maxY = Math.ceil(Math.max(...allPts.map((p) => p.y)) * 1.15);

function xOf(v) {
  return PAD.left + (v / maxX) * cW.value;
}
function yOf(v) {
  return PAD.top + cH.value - (v / maxY) * cH.value;
}

function linReg(pts) {
  const n = pts.length;
  const sumX = pts.reduce((a, p) => a + p.x, 0);
  const sumY = pts.reduce((a, p) => a + p.y, 0);
  const sumXY = pts.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = pts.reduce((a, p) => a + p.x * p.x, 0);
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return { m, b: (sumY - m * sumX) / n };
}

const reg = linReg(allPts);
const ry1 = reg.m * 0 + reg.b;
const ry2 = reg.m * maxX + reg.b;

const xTicks = computed(() =>
  Array.from({ length: 6 }, (_, t) => {
    const v = Math.round((maxX / 5) * t);
    return { v, x: xOf(v) };
  })
);

const yTicks = computed(() =>
  Array.from({ length: 6 }, (_, t) => {
    const v = Math.round((maxY / 5) * t);
    return { v, y: yOf(v) };
  })
);

function dotEnter(e, p) {
  tooltip.value = { name: p.name, x: e.clientX, y: e.clientY };
}
function dotMove(e) {
  if (tooltip.value) tooltip.value = { ...tooltip.value, x: e.clientX, y: e.clientY };
}
</script>

<template>
  <div class="page">
    <div ref="wrapEl" class="wrap">
      <div class="legend">
        <button v-for="(g, i) in GROUPS" :key="g.label" class="legend-btn"
          :style="{ opacity: hidden.has(i) ? 0.3 : 1 }" @click="toggleHidden(i)">
          <span class="legend-dot" :style="{ background: g.color }"></span>
          <span class="legend-label">{{ g.label }}</span>
        </button>
      </div>

      <div class="chart-wrap">
        <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" class="chart-svg">
          <!-- X grid -->
          <g v-for="tick in xTicks" :key="'x'+tick.v">
            <line :x1="tick.x" :x2="tick.x" :y1="PAD.top" :y2="PAD.top + cH" stroke="#21262d" stroke-width="1"/>
            <text :x="tick.x" :y="H - 8" text-anchor="middle" fill="#484f58" font-size="10">{{ tick.v }} features</text>
          </g>
          <!-- Y grid -->
          <g v-for="tick in yTicks" :key="'y'+tick.v">
            <line :x1="PAD.left" :x2="PAD.left + cW" :y1="tick.y" :y2="tick.y" stroke="#21262d" stroke-width="1"/>
            <text :x="PAD.left - 6" :y="tick.y + 3.5" text-anchor="end" fill="#484f58" font-size="10">{{ tick.v }}</text>
          </g>
          <!-- Regression line -->
          <line :x1="xOf(0)" :y1="yOf(ry1)" :x2="xOf(maxX)" :y2="yOf(ry2)"
            stroke="#484f58" stroke-width="1.5" stroke-dasharray="6 3"/>
          <!-- Dots -->
          <template v-for="(g, gi) in GROUPS" :key="g.label">
            <template v-if="!hidden.has(gi)">
              <circle v-for="(p, pi) in g.points" :key="pi"
                :cx="xOf(p.x)" :cy="yOf(p.y)" r="7" :fill="g.color" fill-opacity="0.85"
                style="cursor: pointer; transition: r 0.15s;"
                @mouseenter="dotEnter($event, p)"
                @mousemove="dotMove"
                @mouseleave="tooltip = null"/>
            </template>
          </template>
        </svg>

        <div v-if="tooltip" class="tooltip-fixed"
          :style="{ left: tooltip.x + 12 + 'px', top: tooltip.y - 40 + 'px' }">
          <div class="tooltip-title">{{ tooltip.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1.5rem; font-family: system-ui, -apple-system, sans-serif; }
.wrap { width: 100%; max-width: 800px; margin: 0 auto; }
.legend { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.legend-btn { display: flex; align-items: center; gap: 0.375rem; font-size: 11px; padding: 4px 8px; border-radius: 4px; border: 1px solid #30363d; background: none; cursor: pointer; transition: opacity 0.2s; }
.legend-btn:hover { border-color: #8b949e; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-label { color: #8b949e; }
.chart-wrap { position: relative; }
.chart-svg { width: 100%; }
.tooltip-fixed { position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50; }
.tooltip-title { font-weight: 600; color: #e6edf3; }
</style>
