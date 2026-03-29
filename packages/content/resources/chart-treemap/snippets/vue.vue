<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const DATA = [
  {
    label: "Technology",
    color: "#818cf8",
    children: [
      { label: "NVDA", value: 320 },
      { label: "AAPL", value: 280 },
      { label: "MSFT", value: 240 },
      { label: "GOOGL", value: 200 },
    ],
  },
  {
    label: "Finance",
    color: "#34d399",
    children: [
      { label: "JPM", value: 180 },
      { label: "BAC", value: 140 },
      { label: "GS", value: 120 },
    ],
  },
  {
    label: "Healthcare",
    color: "#f59e0b",
    children: [
      { label: "JNJ", value: 160 },
      { label: "UNH", value: 130 },
      { label: "PFE", value: 90 },
    ],
  },
  {
    label: "Energy",
    color: "#f87171",
    children: [
      { label: "XOM", value: 150 },
      { label: "CVX", value: 110 },
    ],
  },
  {
    label: "Consumer",
    color: "#a78bfa",
    children: [
      { label: "AMZN", value: 200 },
      { label: "WMT", value: 130 },
    ],
  },
];
const total = DATA.flatMap((g) => g.children).reduce((a, d) => a + d.value, 0);

function squarify(items, x, y, w, h) {
  if (!items.length) return [];
  const results = [];
  const remaining = [...items];
  while (remaining.length) {
    const row = [];
    let rowVal = 0;
    const totalVal = remaining.reduce((a, d) => a + d.value, 0);
    const isHoriz = w >= h;
    const dim = isHoriz ? h : w;
    for (let i = 0; i < remaining.length; i++) {
      row.push(remaining[i]);
      rowVal += remaining[i].value;
      const rowArea = (rowVal / totalVal) * (w * h);
      const rowLen = rowArea / dim;
      const worst = row.reduce(
        (a, d) =>
          Math.max(
            a,
            Math.max(
              (rowLen * (d.value / rowVal) * dim) / (rowLen || 1),
              (rowLen || 1) / ((rowLen * (d.value / rowVal) * dim) / (rowLen || 1) || 1)
            )
          ),
        0
      );
      const nextVal = i + 1 < remaining.length ? remaining[i + 1].value : 0;
      const nextWorst =
        nextVal > 0
          ? Math.max(
              worst,
              Math.max(
                (rowLen * (nextVal / (rowVal + nextVal)) * dim) / (rowLen || 1),
                (rowLen || 1) /
                  ((rowLen * (nextVal / (rowVal + nextVal)) * dim) / (rowLen || 1) || 1)
              )
            )
          : Infinity;
      if (nextWorst >= worst && i + 1 < remaining.length) continue;
      let cursor = isHoriz ? y : x;
      const rowLen2 = ((rowVal / totalVal) * (w * h)) / dim;
      row.forEach((d) => {
        const size = (d.value / rowVal) * dim;
        const rect = isHoriz
          ? { x, y: cursor, w: rowLen2, h: size }
          : { x: cursor, y, w: size, h: rowLen2 };
        results.push({ ...d, rect });
        cursor += size;
      });
      remaining.splice(0, row.length);
      if (isHoriz) {
        x += rowLen2;
        w -= rowLen2;
      } else {
        y += rowLen2;
        h -= rowLen2;
      }
      break;
    }
    if (!row.length && remaining.length) {
      const d = remaining.shift();
      results.push({ ...d, rect: { x, y, w, h } });
    }
  }
  return results;
}

const wrapEl = ref(null);
const chartW = ref(600);
const chartH = ref(360);
const tooltip = ref(null);
let ro = null;

onMounted(() => {
  ro = new ResizeObserver(() => {
    if (!wrapEl.value) return;
    chartW.value = wrapEl.value.clientWidth - 4;
    chartH.value = Math.round(chartW.value * 0.6);
  });
  if (wrapEl.value) ro.observe(wrapEl.value);
});
onUnmounted(() => {
  if (ro) ro.disconnect();
});

const all = DATA.flatMap((g) => g.children.map((c) => ({ ...c, group: g.label, color: g.color })));

const tiles = computed(() => squarify(all, 0, 0, chartW.value, chartH.value));

function tileEnter(e, d) {
  tooltip.value = { item: d, x: e.clientX, y: e.clientY };
}
function tileMove(e) {
  if (tooltip.value) tooltip.value = { ...tooltip.value, x: e.clientX, y: e.clientY };
}
</script>

<template>
  <div class="page">
    <div class="wrap">
      <div class="legend">
        <div v-for="g in DATA" :key="g.label" class="legend-item">
          <span class="legend-swatch" :style="{ background: g.color }"></span>
          <span class="legend-label">{{ g.label }}</span>
        </div>
      </div>

      <div ref="wrapEl" class="treemap-wrap" :style="{ height: chartH + 'px' }">
        <div v-for="(d, i) in tiles" :key="i"
          class="tile"
          :style="{
            left: d.rect.x + 'px',
            top: d.rect.y + 'px',
            width: d.rect.w + 'px',
            height: d.rect.h + 'px',
            background: d.color,
            animationDelay: (i * 0.015) + 's'
          }"
          @mouseenter="tileEnter($event, d)"
          @mousemove="tileMove"
          @mouseleave="tooltip = null">
          <template v-if="d.rect.w > 40 && d.rect.h > 30">
            <div class="tile-label">{{ d.label }}</div>
            <div class="tile-value">${{ d.value }}B</div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="tooltip" class="tooltip-fixed"
      :style="{ left: tooltip.x + 12 + 'px', top: tooltip.y - 40 + 'px' }">
      <div class="tooltip-title">{{ tooltip.item.label }} &middot; <span class="tooltip-group">{{ tooltip.item.group }}</span></div>
      <div class="tooltip-sub">${{ tooltip.item.value }}B &nbsp;|&nbsp; {{ ((tooltip.item.value / total) * 100).toFixed(1) }}%</div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1.5rem; font-family: system-ui, -apple-system, sans-serif; }
.wrap { width: 100%; max-width: 800px; margin: 0 auto; }
.legend { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 0.375rem; font-size: 11px; }
.legend-swatch { width: 10px; height: 10px; border-radius: 2px; }
.legend-label { color: #8b949e; }
.treemap-wrap { position: relative; border-radius: 0.75rem; overflow: hidden; border: 1px solid #21262d; }
.tile {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #0d1117;
  box-sizing: border-box;
  opacity: 0;
  animation: tmIn 0.3s ease both;
}
@keyframes tmIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: none; }
}
.tile-label { color: white; font-weight: 700; font-size: 11px; line-height: 1; }
.tile-value { color: rgba(255,255,255,0.7); font-size: 10px; margin-top: 2px; }
.tooltip-fixed { position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50; }
.tooltip-title { font-weight: 600; color: #e6edf3; }
.tooltip-group { color: #8b949e; font-weight: 400; }
.tooltip-sub { color: #8b949e; }
</style>
