<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const SIZE = 120;
const STROKE = 10;
const R = SIZE / 2 - STROKE;
const C = 2 * Math.PI * R;

const RINGS = [
  { label: "Conversion", value: 72, color: "#818cf8" },
  { label: "Retention", value: 85, color: "#34d399" },
  { label: "Bounce", value: 38, color: "#f59e0b" },
  { label: "Uptime", value: 99, color: "#f87171" },
];

const cx = SIZE / 2;
const cy = SIZE / 2;

const values = ref(RINGS.map((r) => r.value));
const currentValues = ref(RINGS.map(() => 0));
let rafIds = [];

function animateRing(index, targetValue) {
  let start = null;
  const duration = 1200;

  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    currentValues.value[index] = Math.round(targetValue * eased);
    if (p < 1) {
      rafIds[index] = requestAnimationFrame(step);
    }
  }
  rafIds[index] = requestAnimationFrame(step);
}

function startAll() {
  rafIds.forEach((id) => cancelAnimationFrame(id));
  currentValues.value = RINGS.map(() => 0);
  values.value.forEach((v, i) => animateRing(i, v));
}

function randomize() {
  values.value = RINGS.map(() => Math.floor(Math.random() * 95) + 5);
  currentValues.value = RINGS.map(() => 0);
  rafIds.forEach((id) => cancelAnimationFrame(id));
  values.value.forEach((v, i) => animateRing(i, v));
}

function getOffset(index) {
  return C - C * (currentValues.value[index] / 100);
}

onMounted(() => {
  startAll();
});

onUnmounted(() => {
  rafIds.forEach((id) => cancelAnimationFrame(id));
});
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] p-6 flex flex-col items-center gap-8">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-8">
      <div v-for="(ring, i) in RINGS" :key="ring.label" class="flex flex-col items-center gap-2">
        <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
          <circle :cx="cx" :cy="cy" :r="R" fill="none" stroke="#1e2130" :stroke-width="STROKE" />
          <circle
            :cx="cx"
            :cy="cy"
            :r="R"
            fill="none"
            :stroke="ring.color"
            :stroke-width="STROKE"
            :stroke-dasharray="C"
            :stroke-dashoffset="getOffset(i)"
            :transform="`rotate(-90 ${cx} ${cy})`"
            stroke-linecap="round"
            style="transition: stroke-dashoffset 0.05s linear"
          />
          <text :x="cx" :y="cy + 4" text-anchor="middle" fill="#e6edf3" font-size="20" font-weight="800">
            {{ currentValues[i] }}%
          </text>
          <text :x="cx" :y="cy + 18" text-anchor="middle" fill="#484f58" font-size="10">
            {{ ring.label }}
          </text>
        </svg>
      </div>
    </div>
    <button
      @click="randomize"
      class="px-4 py-2 bg-[#818cf8]/20 border border-[#818cf8]/40 text-[#818cf8] rounded-lg text-[13px] hover:bg-[#818cf8]/30 transition-colors"
    >
      Randomize
    </button>
  </div>
</template>

<style scoped>
</style>
