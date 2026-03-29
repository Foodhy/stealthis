<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

const DATA = [
  { label: "Electronics", value: 340, color: "#818cf8" },
  { label: "Clothing", value: 220, color: "#34d399" },
  { label: "Books", value: 185, color: "#f59e0b" },
  { label: "Sports", value: 260, color: "#f87171" },
  { label: "Home", value: 310, color: "#a78bfa" },
  { label: "Beauty", value: 145, color: "#38bdf8" },
];
const PAD = { top: 24, right: 20, bottom: 40, left: 52 };

const wrapEl = ref(null);
const W = ref(600);
const orient = ref("vertical");
const tooltip = ref(null);
const animated = ref(false);
let ro = null;

const maxVal = computed(() => Math.ceil(Math.max(...DATA.map((d) => d.value)) * 1.15));

onMounted(() => {
  ro = new ResizeObserver(() => {
    if (wrapEl.value) W.value = wrapEl.value.clientWidth - 32;
  });
  if (wrapEl.value) ro.observe(wrapEl.value);
  requestAnimationFrame(() => (animated.value = true));
});
onUnmounted(() => {
  if (ro) ro.disconnect();
});

function toggleOrient(o) {
  orient.value = o;
  animated.value = false;
  requestAnimationFrame(() => (animated.value = true));
}

function showTooltip(d, e) {
  tooltip.value = { ...d, x: e.clientX, y: e.clientY };
}
function moveTooltip(e) {
  if (tooltip.value) tooltip.value = { ...tooltip.value, x: e.clientX, y: e.clientY };
}
function hideTooltip() {
  tooltip.value = null;
}

// Vertical
const vH = computed(() => Math.round(W.value * 0.5));
const vCW = computed(() => W.value - PAD.left - PAD.right);
const vCH = computed(() => vH.value - PAD.top - PAD.bottom);
const vGap = 8;
const vBarW = computed(() => (vCW.value - vGap * (DATA.length - 1)) / DATA.length);
function vYOf(v) {
  return PAD.top + vCH.value - (v / maxVal.value) * vCH.value;
}

const vTicks = computed(() =>
  Array.from({ length: 6 }, (_, t) => {
    const v = Math.round((maxVal.value / 5) * t);
    return { v, y: vYOf(v) };
  })
);

// Horizontal
const hBarH = 30;
const hGap = 12;
const hTotalH = DATA.length * (hBarH + hGap);
const hH = computed(() => hTotalH + PAD.top + PAD.bottom);
const hCW = computed(() => W.value - PAD.left - PAD.right);
function hXOf(v) {
  return PAD.left + (v / maxVal.value) * hCW.value;
}

const hTicks = computed(() =>
  Array.from({ length: 6 }, (_, t) => {
    const v = Math.round((maxVal.value / 5) * t);
    return { v, x: hXOf(v) };
  })
);
</script>

<template>
  <div class="page">
    <div ref="wrapEl" class="wrap">
      <div class="controls">
        <button v-for="o in ['vertical','horizontal']" :key="o"
          :class="['ctrl-btn', { active: orient === o }]" @click="toggleOrient(o)">{{ o }}</button>
      </div>

      <div class="chart-wrap">
        <!-- Vertical -->
        <svg v-if="orient === 'vertical'" :width="W" :height="vH" :viewBox="`0 0 ${W} ${vH}`">
          <g v-for="tick in vTicks" :key="tick.v">
            <line :x1="PAD.left" :x2="PAD.left+vCW" :y1="tick.y" :y2="tick.y" stroke="#21262d" stroke-width="1"/>
            <text :x="PAD.left-6" :y="tick.y+3.5" text-anchor="end" fill="#484f58" font-size="10">{{ tick.v }}</text>
          </g>
          <g v-for="(d, i) in DATA" :key="d.label">
            <rect :x="PAD.left + i * (vBarW + vGap)" :y="animated ? vYOf(d.value) : PAD.top + vCH"
              :width="vBarW" :height="animated ? (d.value / maxVal) * vCH : 0" rx="4" :fill="d.color"
              :style="{ transition: `y 0.5s cubic-bezier(.4,0,.2,1) ${i*0.06}s, height 0.5s cubic-bezier(.4,0,.2,1) ${i*0.06}s`, cursor: 'pointer' }"
              @mouseenter="showTooltip(d, $event)" @mousemove="moveTooltip" @mouseleave="hideTooltip"/>
            <text :x="PAD.left + i * (vBarW + vGap) + vBarW / 2" :y="vYOf(d.value) - 4" text-anchor="middle" fill="#8b949e" font-size="10">{{ d.value }}</text>
            <text :x="PAD.left + i * (vBarW + vGap) + vBarW / 2" :y="vH - 6" text-anchor="middle" fill="#484f58" font-size="10">{{ d.label }}</text>
          </g>
        </svg>

        <!-- Horizontal -->
        <svg v-else :width="W" :height="hH" :viewBox="`0 0 ${W} ${hH}`">
          <g v-for="tick in hTicks" :key="tick.v">
            <line :x1="tick.x" :x2="tick.x" :y1="PAD.top" :y2="PAD.top+hTotalH" stroke="#21262d" stroke-width="1"/>
            <text :x="tick.x" :y="PAD.top+hTotalH+14" text-anchor="middle" fill="#484f58" font-size="10">{{ tick.v }}</text>
          </g>
          <g v-for="(d, i) in DATA" :key="d.label">
            <rect :x="PAD.left" :y="PAD.top + i * (hBarH + hGap)"
              :width="animated ? (d.value / maxVal) * hCW : 0" :height="hBarH" rx="4" :fill="d.color"
              :style="{ transition: `width 0.5s cubic-bezier(.4,0,.2,1) ${i*0.06}s`, cursor: 'pointer' }"
              @mouseenter="showTooltip(d, $event)" @mousemove="moveTooltip" @mouseleave="hideTooltip"/>
            <text :x="PAD.left - 6" :y="PAD.top + i * (hBarH + hGap) + hBarH / 2 + 4" text-anchor="end" fill="#484f58" font-size="10">{{ d.label }}</text>
            <text :x="PAD.left + (animated ? (d.value / maxVal) * hCW : 0) + 4" :y="PAD.top + i * (hBarH + hGap) + hBarH / 2 + 4" text-anchor="start" fill="#8b949e" font-size="10">{{ d.value }}</text>
          </g>
        </svg>

        <div v-if="tooltip" class="tip" :style="{ left: tooltip.x+12+'px', top: tooltip.y-40+'px' }">
          <div class="tip-label" :style="{ color: tooltip.color }">{{ tooltip.label }}</div>
          <div class="tip-val">{{ tooltip.value }} units</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1.5rem; }
.wrap { width: 100%; max-width: 800px; margin: 0 auto; }
.controls { display: flex; gap: 4px; margin-bottom: 1rem; justify-content: flex-end; }
.ctrl-btn {
  font-size: 11px; padding: 4px 12px; border-radius: 4px; border: 1px solid #30363d;
  background: transparent; color: #8b949e; cursor: pointer; text-transform: capitalize;
  transition: color 0.15s, border-color 0.15s, background 0.15s; font-family: inherit;
}
.ctrl-btn.active { background: rgba(129,140,248,0.2); border-color: #818cf8; color: #818cf8; }
.ctrl-btn:hover:not(.active) { border-color: #8b949e; }
.chart-wrap { position: relative; }
svg { width: 100%; overflow: visible; }
.tip {
  position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d;
  border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50;
}
.tip-label { font-weight: 600; }
.tip-val { color: #8b949e; }
</style>
