<script setup>
import { ref, computed } from "vue";

const DATA = [
  { label: "Organic Search", value: 4200, color: "#818cf8" },
  { label: "Direct", value: 2800, color: "#34d399" },
  { label: "Social Media", value: 1900, color: "#f59e0b" },
  { label: "Referral", value: 1300, color: "#f87171" },
  { label: "Email", value: 800, color: "#a78bfa" },
];
const total = DATA.reduce((a, d) => a + d.value, 0);
const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 110;
const INNER_R = 65;

const mode = ref("donut");
const hovered = ref(null);
const tooltip = ref(null);

function polarXY(r, angle) {
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

function arcPath(r, innerR, start, end, isDonut) {
  const [sx, sy] = polarXY(r, start);
  const [ex, ey] = polarXY(r, end);
  const large = end - start > Math.PI ? 1 : 0;
  if (isDonut) {
    const [ix, iy] = polarXY(innerR, end);
    const [ox, oy] = polarXY(innerR, start);
    return `M${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} L${ix},${iy} A${innerR},${innerR} 0 ${large},0 ${ox},${oy} Z`;
  }
  return `M${CX},${CY} L${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} Z`;
}

const slices = computed(() => {
  let angle = -Math.PI / 2;
  return DATA.map((d, i) => {
    const share = (d.value / total) * 2 * Math.PI;
    const start = angle;
    const end = angle + share;
    angle = end;
    return { ...d, start, end, i };
  });
});

function sliceTransform(s) {
  if (hovered.value !== s.i) return "translate(0,0)";
  const mid = (s.start + s.end) / 2;
  return `translate(${(Math.cos(mid) * 6).toFixed(1)},${(Math.sin(mid) * 6).toFixed(1)})`;
}

function handleEnter(e, s) {
  hovered.value = s.i;
  tooltip.value = {
    label: s.label,
    value: s.value,
    pct: ((s.value / total) * 100).toFixed(1),
    x: e.clientX,
    y: e.clientY,
  };
}
function handleMove(e) {
  if (tooltip.value) {
    tooltip.value = { ...tooltip.value, x: e.clientX, y: e.clientY };
  }
}
function handleLeave() {
  hovered.value = null;
  tooltip.value = null;
}

function pct(d) {
  return ((d.value / total) * 100).toFixed(1);
}
</script>

<template>
  <div class="page">
    <div class="wrap">
      <div class="mode-btns">
        <button class="mode-btn" :class="{ active: mode === 'donut' }" @click="mode = 'donut'">donut</button>
        <button class="mode-btn" :class="{ active: mode === 'pie' }" @click="mode = 'pie'">pie</button>
      </div>

      <div class="chart-layout">
        <div class="chart-col">
          <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
            <path v-for="s in slices" :key="s.label"
              :d="arcPath(R, INNER_R, s.start, s.end, mode === 'donut')"
              :fill="s.color"
              :opacity="hovered === null || hovered === s.i ? 1 : 0.5"
              :transform="sliceTransform(s)"
              style="transition: transform 0.2s, opacity 0.2s; cursor: pointer;"
              @mouseenter="handleEnter($event, s)"
              @mousemove="handleMove"
              @mouseleave="handleLeave"/>
            <template v-if="mode === 'donut'">
              <text :x="CX" :y="CY - 6" text-anchor="middle" fill="#e6edf3" font-size="22" font-weight="800">{{ (total / 1000).toFixed(1) }}k</text>
              <text :x="CX" :y="CY + 12" text-anchor="middle" fill="#484f58" font-size="11">total visits</text>
            </template>
          </svg>
        </div>

        <div class="legend-col">
          <div v-for="(d, i) in DATA" :key="d.label" class="legend-row"
            :class="{ highlighted: hovered === i }"
            @mouseenter="hovered = i" @mouseleave="hovered = null">
            <span class="legend-swatch" :style="{ background: d.color }"></span>
            <span class="legend-label">{{ d.label }}</span>
            <span class="legend-value">{{ d.value.toLocaleString() }}</span>
            <span class="legend-pct" :style="{ color: d.color }">{{ pct(d) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tooltip" class="tooltip-fixed"
      :style="{ left: tooltip.x + 12 + 'px', top: tooltip.y - 40 + 'px' }">
      <div class="tooltip-title">{{ tooltip.label }}</div>
      <div class="tooltip-sub">{{ Number(tooltip.value).toLocaleString() }} visits &middot; {{ tooltip.pct }}%</div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1.5rem; display: flex; justify-content: center; font-family: system-ui, -apple-system, sans-serif; }
.wrap { width: 100%; max-width: 600px; }
.mode-btns { display: flex; gap: 4px; margin-bottom: 1.5rem; justify-content: center; }
.mode-btn { font-size: 11px; padding: 4px 12px; border-radius: 4px; border: 1px solid #30363d; background: none; color: #8b949e; cursor: pointer; transition: all 0.2s; text-transform: capitalize; }
.mode-btn:hover { border-color: #8b949e; }
.mode-btn.active { background: rgba(129,140,248,0.2); border-color: #818cf8; color: #818cf8; }
.chart-layout { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
@media (min-width: 480px) { .chart-layout { flex-direction: row; } }
.chart-col { flex-shrink: 0; }
.legend-col { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; width: 100%; }
.legend-row { display: flex; align-items: center; gap: 0.5rem; padding: 4px 8px; border-radius: 4px; cursor: default; transition: background 0.2s; }
.legend-row.highlighted { background: #161b22; }
.legend-swatch { width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; }
.legend-label { color: #8b949e; font-size: 13px; flex: 1; }
.legend-value { color: #484f58; font-size: 12px; }
.legend-pct { font-size: 12px; font-weight: 600; width: 48px; text-align: right; }
.tooltip-fixed { position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50; }
.tooltip-title { font-weight: 600; color: #e6edf3; }
.tooltip-sub { color: #8b949e; }
</style>
