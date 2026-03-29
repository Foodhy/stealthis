<script setup>
import { ref, computed } from "vue";

const AXES = ["Design", "Frontend", "Backend", "DevOps", "Testing", "Communication"];
const SERIES = [
  { label: "Alice", color: "#818cf8", data: [85, 90, 65, 70, 80, 92] },
  { label: "Bob", color: "#34d399", data: [70, 75, 88, 82, 60, 75] },
];
const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2 + 10;
const R = 120;
const RINGS = 5;
const step = 360 / AXES.length;

const hidden = ref(new Set());
const tooltip = ref(null);

function toggleHidden(i) {
  const n = new Set(hidden.value);
  n.has(i) ? n.delete(i) : n.add(i);
  hidden.value = n;
}

function polarXY(r, angleDeg) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function points(data) {
  return data.map((v, i) => polarXY((v / 100) * R, i * step));
}

function ptsStr(pts) {
  return pts.map((p) => p.join(",")).join(" ");
}

const rings = computed(() => {
  return Array.from({ length: RINGS }, (_, r) => {
    const pts = AXES.map((_, i) => polarXY((R / RINGS) * (r + 1), i * step));
    const labelPos = polarXY((R / RINGS) * (r + 1), 0);
    return {
      pts: ptsStr(pts),
      label: Math.round((100 / RINGS) * (r + 1)),
      lx: labelPos[0] + 3,
      ly: labelPos[1],
    };
  });
});

const axes = computed(() => {
  return AXES.map((axis, i) => {
    const [ex, ey] = polarXY(R, i * step);
    const [lx, ly] = polarXY(R + 22, i * step);
    const anchor = lx < CX - 5 ? "end" : lx > CX + 5 ? "start" : "middle";
    return { axis, ex, ey, lx, ly, anchor };
  });
});

const seriesData = computed(() => {
  return SERIES.map((s, si) => {
    const pts = points(s.data);
    return { ...s, si, pts, ptsStr: ptsStr(pts) };
  });
});

function handleEnter(e, si, i) {
  tooltip.value = {
    axis: AXES[i],
    label: SERIES[si].label,
    value: SERIES[si].data[i],
    x: e.clientX,
    y: e.clientY,
  };
}
</script>

<template>
  <div class="page">
    <div class="wrap">
      <div class="legend">
        <button v-for="(s, i) in SERIES" :key="s.label" class="legend-btn"
          :style="{ opacity: hidden.has(i) ? 0.3 : 1 }" @click="toggleHidden(i)">
          <span class="legend-dot" :style="{ background: s.color }"></span>
          <span class="legend-label">{{ s.label }}</span>
        </button>
      </div>

      <div class="chart-center">
        <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
          <!-- Rings -->
          <g v-for="ring in rings" :key="ring.label">
            <polygon :points="ring.pts" fill="none" stroke="#21262d" stroke-width="1"/>
            <text :x="ring.lx" :y="ring.ly" fill="#484f58" font-size="9">{{ ring.label }}</text>
          </g>

          <!-- Axes + labels -->
          <g v-for="a in axes" :key="a.axis">
            <line :x1="CX" :y1="CY" :x2="a.ex" :y2="a.ey" stroke="#30363d" stroke-width="1"/>
            <text :x="a.lx" :y="a.ly + 4" :text-anchor="a.anchor" fill="#8b949e" font-size="11">{{ a.axis }}</text>
          </g>

          <!-- Series -->
          <template v-for="s in seriesData" :key="s.label">
            <g v-if="!hidden.has(s.si)">
              <polygon :points="s.ptsStr" :fill="s.color" fill-opacity="0.15" :stroke="s.color" stroke-width="2"/>
              <circle v-for="(pt, i) in s.pts" :key="i"
                :cx="pt[0]" :cy="pt[1]" r="4" :fill="s.color" stroke="#0d1117" stroke-width="2"
                style="cursor: pointer;"
                @mouseenter="handleEnter($event, s.si, i)"
                @mouseleave="tooltip = null"/>
            </g>
          </template>
        </svg>
      </div>
    </div>

    <div v-if="tooltip" class="tooltip-fixed"
      :style="{ left: tooltip.x + 12 + 'px', top: tooltip.y - 40 + 'px' }">
      <div class="tooltip-title">{{ tooltip.axis }}</div>
      <div class="tooltip-sub">{{ tooltip.label }}: <strong>{{ tooltip.value }}</strong></div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1.5rem; display: flex; justify-content: center; font-family: system-ui, -apple-system, sans-serif; }
.wrap { width: 100%; max-width: 600px; }
.legend { display: flex; gap: 0.75rem; margin-bottom: 1rem; justify-content: center; }
.legend-btn { display: flex; align-items: center; gap: 0.375rem; font-size: 12px; padding: 4px 12px; border-radius: 4px; border: 1px solid #30363d; background: none; cursor: pointer; transition: opacity 0.2s; }
.legend-btn:hover { border-color: #8b949e; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.legend-label { color: #8b949e; }
.chart-center { display: flex; justify-content: center; }
.tooltip-fixed { position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50; }
.tooltip-title { font-weight: 600; color: #e6edf3; }
.tooltip-sub { color: #8b949e; }
.tooltip-sub strong { color: #e6edf3; }
</style>
