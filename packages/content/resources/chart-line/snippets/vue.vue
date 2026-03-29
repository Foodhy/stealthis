<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const SERIES = [
  {
    label: "Revenue",
    color: "#818cf8",
    data: [42, 58, 51, 67, 73, 89, 95, 88, 102, 115, 108, 127],
  },
  { label: "Expenses", color: "#f87171", data: [30, 34, 29, 35, 40, 44, 48, 42, 50, 55, 52, 58] },
  { label: "Profit", color: "#34d399", data: [12, 24, 22, 32, 33, 45, 47, 46, 52, 60, 56, 69] },
];
const LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAD = { top: 20, right: 20, bottom: 36, left: 48 };

const wrapEl = ref(null);
const W = ref(600);
const H = ref(270);
const smooth = ref(false);
const hidden = ref(new Set());
const tooltip = ref(null);
let ro = null;

onMounted(() => {
  ro = new ResizeObserver(() => {
    if (!wrapEl.value) return;
    W.value = wrapEl.value.clientWidth - 32;
    H.value = Math.round(W.value * 0.45);
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

const n = LABELS.length;
const cW = computed(() => W.value - PAD.left - PAD.right);
const cH = computed(() => H.value - PAD.top - PAD.bottom);
const maxVal = computed(() => {
  const visible = SERIES.filter((_, i) => !hidden.value.has(i));
  const vals = visible.flatMap((s) => s.data);
  return vals.length ? Math.ceil(Math.max(...vals) * 1.15) : 100;
});

function xOf(i) {
  return PAD.left + (i / (n - 1)) * cW.value;
}
function yOf(v) {
  return PAD.top + cH.value - (v / maxVal.value) * cH.value;
}

function linePath(pts) {
  return pts
    .map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
}
function bezierPath(pts) {
  if (pts.length < 2) return linePath(pts);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * 0.4;
    const cp2x = pts[i + 1][0] - (pts[i + 1][0] - pts[i][0]) * 0.4;
    d += ` C${cp1x.toFixed(1)} ${pts[i][1].toFixed(1)} ${cp2x.toFixed(1)} ${pts[i + 1][1].toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}

function handleMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W.value / rect.width);
  const idx = Math.round(((mx - PAD.left) / cW.value) * (n - 1));
  if (idx < 0 || idx >= n) {
    tooltip.value = null;
    return;
  }
  tooltip.value = { idx, x: xOf(idx), y: PAD.top };
}

const ticks = computed(() =>
  Array.from({ length: 6 }, (_, t) => {
    const v = (maxVal.value / 5) * t;
    return { v, y: yOf(v), label: Math.round(v) + "k" };
  })
);

const seriesData = computed(() =>
  SERIES.map((s, si) => {
    const pts = s.data.map((v, i) => [xOf(i), yOf(v)]);
    const pathD = smooth.value ? bezierPath(pts) : linePath(pts);
    return { ...s, si, pts, pathD };
  })
);
</script>

<template>
  <div class="page">
    <div ref="wrapEl" class="wrap">
      <div class="controls">
        <div class="legend">
          <button v-for="(s, i) in SERIES" :key="s.label" class="legend-btn"
            :style="{ opacity: hidden.has(i) ? 0.3 : 1 }" @click="toggleHidden(i)">
            <span class="legend-dot" :style="{ background: s.color }"></span>
            <span class="legend-label">{{ s.label }}</span>
          </button>
        </div>
        <div class="mode-btns">
          <button class="mode-btn" :class="{ active: !smooth }" @click="smooth = false">Linear</button>
          <button class="mode-btn" :class="{ active: smooth }" @click="smooth = true">Smooth</button>
        </div>
      </div>

      <div class="chart-wrap">
        <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" class="chart-svg"
          @mousemove="handleMove" @mouseleave="tooltip = null">
          <g v-for="tick in ticks" :key="tick.v">
            <line :x1="PAD.left" :x2="PAD.left + cW" :y1="tick.y" :y2="tick.y" stroke="#21262d" stroke-width="1"/>
            <text :x="PAD.left - 6" :y="tick.y + 3.5" text-anchor="end" fill="#484f58" font-size="10">{{ tick.label }}</text>
          </g>

          <text v-for="(lbl, i) in LABELS" :key="lbl" :x="xOf(i)" :y="H - 6" text-anchor="middle" fill="#484f58" font-size="10">{{ lbl }}</text>

          <line v-if="tooltip" :x1="tooltip.x" :x2="tooltip.x" :y1="PAD.top" :y2="PAD.top + cH"
            stroke="#8b949e" stroke-width="1" stroke-dasharray="4 2"/>

          <template v-for="s in seriesData" :key="s.label">
            <g v-if="!hidden.has(s.si)">
              <path :d="s.pathD" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle v-for="(pt, i) in s.pts" :key="i" :cx="pt[0]" :cy="pt[1]"
                :r="tooltip && tooltip.idx === i ? 4 : 2.5"
                :fill="s.color" :opacity="tooltip && tooltip.idx === i ? 1 : 0.7"/>
            </g>
          </template>
        </svg>

        <div v-if="tooltip" class="tooltip-box"
          :style="{ left: Math.min(tooltip.x + 12, W - 160) + 'px', top: tooltip.y + 'px' }">
          <div class="tooltip-date">{{ LABELS[tooltip.idx] }}</div>
          <template v-for="(s, si) in SERIES" :key="s.label">
            <div v-if="!hidden.has(si)" class="tooltip-row">
              <span class="tooltip-dot" :style="{ background: s.color }"></span>
              <span class="tooltip-label">{{ s.label }}</span>
              <span class="tooltip-val">${{ s.data[tooltip.idx] }}k</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1.5rem; font-family: system-ui, -apple-system, sans-serif; }
.wrap { width: 100%; max-width: 800px; margin: 0 auto; }
.controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.legend { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.legend-btn { display: flex; align-items: center; gap: 0.375rem; font-size: 11px; padding: 4px 8px; border-radius: 4px; border: 1px solid #30363d; background: none; cursor: pointer; transition: opacity 0.2s; }
.legend-btn:hover { border-color: #8b949e; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-label { color: #8b949e; }
.mode-btns { display: flex; gap: 4px; }
.mode-btn { font-size: 11px; padding: 4px 12px; border-radius: 4px; border: 1px solid #30363d; background: none; color: #8b949e; cursor: pointer; transition: all 0.2s; }
.mode-btn:hover { border-color: #8b949e; }
.mode-btn.active { background: rgba(129,140,248,0.2); border-color: #818cf8; color: #818cf8; }
.chart-wrap { position: relative; }
.chart-svg { width: 100%; }
.tooltip-box { position: absolute; pointer-events: none; background: #161b22; border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); min-width: 140px; }
.tooltip-date { color: #8b949e; font-weight: 600; margin-bottom: 0.375rem; }
.tooltip-row { display: flex; align-items: center; gap: 0.5rem; padding: 2px 0; }
.tooltip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tooltip-label { color: #8b949e; flex: 1; }
.tooltip-val { color: #e6edf3; font-weight: 700; }
</style>
