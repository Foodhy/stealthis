<script setup>
import { ref, computed } from "vue";

const RAW_NODES = [
  { name: "Search ads", color: "#4285F4", val: "$48.5B", change: "+14%" },
  { name: "YouTube", color: "#FF0000", val: "$8.7B", change: "+13%" },
  { name: "AdMob", color: "#FBBC05", val: "$7.4B", change: "-5%" },
  { name: "Google Play", color: "#34A853", val: "$9.3B", change: "+14%" },
  { name: "Google Cloud", color: "#4285F4", val: "$10.3B", change: "+29%" },
  { name: "Other", color: "#64748b", val: "$0.5B" },
  { name: "Ad Revenue", color: "#4285F4", val: "$64.6B", change: "+11%" },
  { name: "Revenue", color: "#4285F4", val: "$84.7B", change: "+14%" },
  { name: "Gross Profit", color: "#34A853", val: "$49.2B", change: "58% margin" },
  { name: "Cost of Rev", color: "#EA4335", val: "$35.5B" },
  { name: "Op. Profit", color: "#34A853", val: "$27.4B", change: "32% margin" },
  { name: "Op. Expenses", color: "#EA4335", val: "$21.8B" },
  { name: "Net Profit", color: "#34A853", val: "$23.6B", change: "28% margin" },
  { name: "Tax", color: "#EA4335", val: "$3.9B" },
  { name: "Other P/L", color: "#64748b", val: "$0.1B" },
  { name: "R&D", color: "#EA4335", val: "$11.9B" },
  { name: "S&M", color: "#EA4335", val: "$6.8B" },
  { name: "G&A", color: "#EA4335", val: "$3.1B" },
];
const RAW_LINKS = [
  { s: 0, t: 6, v: 48.5 },
  { s: 1, t: 6, v: 8.7 },
  { s: 2, t: 6, v: 7.4 },
  { s: 6, t: 7, v: 64.6 },
  { s: 3, t: 7, v: 9.3 },
  { s: 4, t: 7, v: 10.3 },
  { s: 5, t: 7, v: 0.5 },
  { s: 7, t: 8, v: 49.2 },
  { s: 7, t: 9, v: 35.5 },
  { s: 8, t: 10, v: 27.4 },
  { s: 8, t: 11, v: 21.8 },
  { s: 10, t: 12, v: 23.6 },
  { s: 10, t: 13, v: 3.7 },
  { s: 10, t: 14, v: 0.1 },
  { s: 11, t: 15, v: 11.9 },
  { s: 11, t: 16, v: 6.8 },
  { s: 11, t: 17, v: 3.1 },
];
const COLS = [[0, 1, 2, 3, 4, 5], [6], [7], [8, 9], [10, 11], [12, 13, 14, 15, 16, 17]];
const W = 700;
const H = 500;
const NW = 14;

function buildLayout() {
  const colX = COLS.map((_, ci) => 60 + (ci / (COLS.length - 1)) * (W - 120));
  const nodes = [];
  const PAD = 10;

  COLS.forEach((col, ci) => {
    const totalVal = col.reduce((sum, ni) => {
      const incoming = RAW_LINKS.filter((l) => l.t === ni).reduce((a, l) => a + l.v, 0);
      const outgoing = RAW_LINKS.filter((l) => l.s === ni).reduce((a, l) => a + l.v, 0);
      return sum + (incoming || outgoing || 1);
    }, 0);
    const availH = H - PAD * (col.length - 1);
    let cy = 0;
    col.forEach((ni) => {
      const incoming = RAW_LINKS.filter((l) => l.t === ni).reduce((a, l) => a + l.v, 0);
      const outgoing = RAW_LINKS.filter((l) => l.s === ni).reduce((a, l) => a + l.v, 0);
      const val = incoming || outgoing || 1;
      const nh = Math.max(20, (val / totalVal) * availH);
      nodes[ni] = { ...RAW_NODES[ni], id: ni, x: colX[ci], y: cy, h: nh };
      cy += nh + PAD;
    });
  });

  const links = RAW_LINKS.map((l) => ({
    source: l.s,
    target: l.t,
    value: l.v,
    color: nodes[l.s]?.color || "#818cf8",
  }));
  return { nodes, links };
}

const layout = buildLayout();
const nodes = layout.nodes;
const links = layout.links;

const hovered = ref(null);
const tooltip = ref(null);

const renderedLinks = computed(() => {
  const srcOffset = {};
  const tgtOffset = {};
  nodes.forEach((n) => {
    srcOffset[n.id] = 0;
    tgtOffset[n.id] = 0;
  });

  return links
    .map((l) => {
      const src = nodes[l.source];
      const tgt = nodes[l.target];
      if (!src || !tgt) return null;
      const totalOut = links
        .filter((ll) => ll.source === l.source)
        .reduce((a, ll) => a + ll.value, 0);
      const totalIn = links
        .filter((ll) => ll.target === l.target)
        .reduce((a, ll) => a + ll.value, 0);
      const lh = Math.max(2, (l.value / (totalOut || 1)) * src.h);
      const lh2 = Math.max(2, (l.value / (totalIn || 1)) * tgt.h);
      const sy = src.y + srcOffset[l.source] + lh / 2;
      const ty = tgt.y + tgtOffset[l.target] + lh2 / 2;
      srcOffset[l.source] = (srcOffset[l.source] || 0) + lh;
      tgtOffset[l.target] = (tgtOffset[l.target] || 0) + lh2;
      const sx = src.x + NW;
      const tx = tgt.x;
      const cx = (sx + tx) / 2;
      return {
        path: `M${sx},${sy - lh / 2} C${cx},${sy - lh / 2} ${cx},${ty - lh2 / 2} ${tx},${ty - lh2 / 2} L${tx},${ty + lh2 / 2} C${cx},${ty + lh2 / 2} ${cx},${sy + lh / 2} ${sx},${sy + lh / 2} Z`,
        color: l.color,
        key: `${l.source}-${l.target}`,
        label: `${nodes[l.source].name} \u2192 ${nodes[l.target].name}: $${l.value}B`,
      };
    })
    .filter(Boolean);
});

function linkEnter(e, l) {
  tooltip.value = { text: l.label, x: e.clientX, y: e.clientY };
}
function linkMove(e) {
  if (tooltip.value) tooltip.value = { ...tooltip.value, x: e.clientX, y: e.clientY };
}
function linkLeave() {
  tooltip.value = null;
}

function textAnchor(n) {
  return n.x > W / 2 ? "end" : "start";
}
function textX(n) {
  return n.x > W / 2 ? n.x - 6 : n.x + NW + 6;
}
</script>

<template>
  <div class="page">
    <div class="scroll-wrap" :style="{ minWidth: W + 'px' }">
      <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" class="chart-svg">
        <!-- Links -->
        <path v-for="l in renderedLinks" :key="l.key"
          :d="l.path" :fill="l.color"
          :fill-opacity="hovered === null ? 0.18 : 0.08"
          style="cursor: pointer; transition: fill-opacity 0.15s;"
          @mouseenter="linkEnter($event, l)"
          @mousemove="linkMove"
          @mouseleave="linkLeave"/>

        <!-- Nodes -->
        <g v-for="(n, i) in nodes" :key="i"
          @mouseenter="hovered = i" @mouseleave="hovered = null">
          <template v-if="n">
            <rect :x="n.x" :y="n.y" :width="NW" :height="n.h" rx="3" :fill="n.color"
              :opacity="hovered === null || hovered === i ? 1 : 0.5"
              style="transition: opacity 0.15s;"/>
            <text :x="textX(n)" :y="n.y + n.h/2 - 4" :text-anchor="textAnchor(n)"
              fill="#e6edf3" font-size="9" font-weight="600">{{ n.name }}</text>
            <text :x="textX(n)" :y="n.y + n.h/2 + 7" :text-anchor="textAnchor(n)"
              :fill="n.color" font-size="10" font-weight="700">{{ n.val }}</text>
            <text v-if="n.change" :x="textX(n)" :y="n.y + n.h/2 + 19" :text-anchor="textAnchor(n)"
              fill="#484f58" font-size="9">{{ n.change }}</text>
          </template>
        </g>
      </svg>
    </div>

    <div v-if="tooltip" class="tooltip-fixed"
      :style="{ left: tooltip.x + 12 + 'px', top: tooltip.y - 40 + 'px' }">
      <span class="tooltip-text">{{ tooltip.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #0d1117; padding: 1rem; overflow-x: auto; font-family: system-ui, -apple-system, sans-serif; }
.scroll-wrap { min-width: 700px; }
.chart-svg { width: 100%; }
.tooltip-fixed { position: fixed; pointer-events: none; background: #161b22; border: 1px solid #30363d; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 50; }
.tooltip-text { color: #e6edf3; }
</style>
