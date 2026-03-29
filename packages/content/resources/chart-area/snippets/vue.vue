<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const SERIES = [
  {
    label: "Pageviews",
    color: "#818cf8",
    data: [3200, 2900, 3800, 4100, 3700, 4500, 4900, 4200, 5100, 4700, 5300, 5800, 5500, 6200],
  },
  {
    label: "Sessions",
    color: "#34d399",
    data: [1800, 1600, 2100, 2300, 2000, 2600, 2900, 2500, 3100, 2800, 3200, 3500, 3300, 3800],
  },
];
const DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 13 + i);
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
});
const PAD = { top: 20, right: 20, bottom: 36, left: 52 };

const wrapEl = ref(null);
const W = ref(600);
const H = ref(270);
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

const totalDays = DAYS.length;
const allVals = SERIES.flatMap((s) => s.data);
const maxVal = computed(() => Math.ceil(Math.max(...allVals) * 1.15));
const cW = computed(() => W.value - PAD.left - PAD.right);
const cH = computed(() => H.value - PAD.top - PAD.bottom);

function xOf(i) {
  return PAD.left + (i / (totalDays - 1)) * cW.value;
}
function yOf(v) {
  return PAD.top + cH.value - (v / maxVal.value) * cH.value;
}

function handleMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W.value / rect.width);
  const idx = Math.round(((mx - PAD.left) / cW.value) * (totalDays - 1));
  if (idx < 0 || idx >= totalDays) {
    tooltip.value = null;
    return;
  }
  tooltip.value = { idx, x: xOf(idx), y: PAD.top };
}

const ticks = computed(() =>
  Array.from({ length: 6 }, (_, t) => {
    const v = Math.round((maxVal.value / 5) * t);
    return { v, y: yOf(v), label: v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v) };
  })
);

const seriesData = computed(() =>
  SERIES.map((s, si) => {
    const pts = s.data.map((v, i) => [xOf(i), yOf(v)]);
    const ptsStr = pts.map((p) => p.join(",")).join(" ");
    const baseY = PAD.top + cH.value;
    const lineStr = pts.map((p) => p[0] + "," + p[1]).join(" ");
    const areaD =
      "M" + xOf(0) + "," + baseY + " L" + lineStr + " L" + xOf(totalDays - 1) + "," + baseY + " Z";
    const gradId = "agrad" + si;
    const gradFill = "url(#" + gradId + ")";
    return {
      label: s.label,
      color: s.color,
      si: si,
      pts: pts,
      ptsStr: ptsStr,
      areaD: areaD,
      gradId: gradId,
      gradFill: gradFill,
    };
  })
);
</script>

<template>
  <div class="page">
    <div ref="wrapEl" class="wrap">
      <div class="legend">
        <div v-for="s in SERIES" :key="s.label" class="legend-item">
          <span class="legend-dot" :style="{ background: s.color }"></span>
          <span class="legend-label">{{ s.label }}</span>
        </div>
      </div>

      <div class="chart-wrap">
        <svg :width="W" :height="H" :viewBox="'0 0 ' + W + ' ' + H" class="chart-svg"
          @mousemove="handleMove" @mouseleave="tooltip = null">
          <defs>
            <linearGradient v-for="(s, si) in SERIES" :key="si" :id="'agrad' + si" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="s.color" stop-opacity="0.5"/>
              <stop offset="100%" :stop-color="s.color" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <g v-for="tick in ticks" :key="tick.v">
            <line :x1="PAD.left" :x2="PAD.left+cW" :y1="tick.y" :y2="tick.y" stroke="#21262d" stroke-width="1"/>
            <text :x="PAD.left-6" :y="tick.y+3.5" text-anchor="end" fill="#484f58" font-size="10">{{ tick.label }}</text>
          </g>

          <template v-for="(d, i) in DAYS" :key="d">
            <text v-if="i % 2 === 0" :x="xOf(i)" :y="H-6" text-anchor="middle" fill="#484f58" font-size="10">{{ d }}</text>
          </template>

          <line v-if="tooltip" :x1="tooltip.x" :x2="tooltip.x" :y1="PAD.top" :y2="PAD.top+cH" stroke="#8b949e" stroke-width="1" stroke-dasharray="4 2"/>

          <template v-for="s in seriesData" :key="s.label">
            <g>
              <path :d="s.areaD" :fill="s.gradFill"/>
              <polyline :points="s.ptsStr" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle v-if="tooltip" :cx="s.pts[tooltip.idx][0]" :cy="s.pts[tooltip.idx][1]" r="4" :fill="s.color" stroke="#0d1117" stroke-width="2"/>
            </g>
          </template>
        </svg>

        <div v-if="tooltip" class="tooltip-box" :style="{ left: Math.min(tooltip.x+12, W-170)+'px', top: tooltip.y+'px' }">
          <div class="tooltip-date">{{ DAYS[tooltip.idx] }}</div>
          <div v-for="s in SERIES" :key="s.label" class="tooltip-row">
            <span class="tooltip-dot" :style="{ background: s.color }"></span>
            <span class="tooltip-label">{{ s.label }}</span>
            <span class="tooltip-val">{{ s.data[tooltip.idx].toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1.5rem; }
.wrap { width: 100%; max-width: 800px; margin: 0 auto; }
.legend { display: flex; gap: 1rem; margin-bottom: 1rem; }
.legend-item { display: flex; align-items: center; gap: 0.375rem; font-size: 12px; }
.legend-dot { width: 12px; height: 2px; border-radius: 999px; }
.legend-label { color: #8b949e; }
.chart-wrap { position: relative; }
.chart-svg { width: 100%; }
.tooltip-box {
  position: absolute; pointer-events: none; background: #161b22;
  border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem;
  font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); min-width: 150px;
}
.tooltip-date { color: #8b949e; font-weight: 600; margin-bottom: 0.375rem; }
.tooltip-row { display: flex; align-items: center; gap: 0.5rem; padding: 2px 0; }
.tooltip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tooltip-label { color: #8b949e; flex: 1; }
.tooltip-val { color: #e6edf3; font-weight: 700; }
</style>
