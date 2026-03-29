<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const CARDS = [
  {
    label: "Monthly Revenue",
    value: 124500,
    prev: 108200,
    prefix: "$",
    suffix: "",
    color: "#818cf8",
    period: "Mar 2026",
    decimals: 0,
  },
  {
    label: "Active Users",
    value: 8420,
    prev: 7890,
    prefix: "",
    suffix: "",
    color: "#34d399",
    period: "This month",
    decimals: 0,
  },
  {
    label: "Conversion Rate",
    value: 3.4,
    prev: 2.8,
    prefix: "",
    suffix: "%",
    color: "#f59e0b",
    period: "vs last month",
    decimals: 1,
  },
  {
    label: "Avg Order Value",
    value: 72,
    prev: 65,
    prefix: "$",
    suffix: "",
    color: "#f87171",
    period: "Last 30 days",
    decimals: 0,
  },
];

const counters = ref(CARDS.map(() => 0));
let rafIds = [];

function formatValue(card, val) {
  if (card.decimals) return val.toFixed(card.decimals);
  return Math.round(val).toLocaleString();
}

function delta(card) {
  const d = (((card.value - card.prev) / card.prev) * 100).toFixed(1);
  return { value: d, isUp: +d > 0 };
}

function sparkPoints() {
  const pts = [0, 10, 14, 8, 18, 4, 24];
  return pts.map((v, i) => `${i * 10},${24 - v}`).join(" ");
}

onMounted(() => {
  const duration = 1200;
  CARDS.forEach((card, idx) => {
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      counters.value[idx] = +(card.value * eased).toFixed(card.decimals);
      if (p < 1) rafIds[idx] = requestAnimationFrame(step);
    }
    rafIds[idx] = requestAnimationFrame(step);
  });
});

onUnmounted(() => {
  rafIds.forEach((id) => cancelAnimationFrame(id));
});
</script>

<template>
  <div style="min-height:100vh;background:#0d1117;padding:1.5rem;font-family:system-ui,-apple-system,sans-serif">
    <div style="width:100%;max-width:800px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem">
      <div
        v-for="(card, idx) in CARDS"
        :key="card.label"
        style="background:#161b22;border:1px solid #30363d;border-radius:0.75rem;padding:1.25rem;position:relative;overflow:hidden"
      >
        <!-- Color bar -->
        <div :style="{ position:'absolute',top:0,left:0,width:'4px',height:'100%',borderRadius:'0.75rem 0 0 0.75rem',background:card.color }"></div>

        <div style="margin-left:4px">
          <div style="font-size:11px;color:#484f58;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">{{ card.period }}</div>
          <div style="font-size:28px;font-weight:800;color:#e6edf3;line-height:1;margin-bottom:4px">
            {{ card.prefix }}{{ formatValue(card, counters[idx]) }}{{ card.suffix }}
          </div>
          <div style="color:#8b949e;font-size:13px;margin-bottom:12px">{{ card.label }}</div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div :style="{ fontSize:'12px',fontWeight:'600',color: delta(card).isUp ? '#34d399' : '#f87171' }">
              {{ delta(card).isUp ? '\u25B2' : '\u25BC' }} {{ Math.abs(delta(card).value) }}%
            </div>
            <svg width="60" height="24" viewBox="0 0 60 24">
              <polyline :points="sparkPoints()" fill="none" :stroke="card.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
