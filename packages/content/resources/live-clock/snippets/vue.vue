<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const now = ref(new Date());
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const h = computed(() => now.value.getHours() % 12);
const m = computed(() => now.value.getMinutes());
const s = computed(() => now.value.getSeconds());
const hourDeg = computed(() => (h.value / 12) * 360 + (m.value / 60) * 30);
const minDeg = computed(() => (m.value / 60) * 360 + (s.value / 60) * 6);
const secDeg = computed(() => (s.value / 60) * 360);

const timeStr = computed(() =>
  now.value.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
);
const dateStr = computed(() =>
  now.value.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

const ticks = computed(() =>
  Array.from({ length: 12 }, (_, i) => {
    const angle = ((i / 12) * 360 * Math.PI) / 180;
    return {
      x1: 100 + 80 * Math.sin(angle),
      y1: 100 - 80 * Math.cos(angle),
      x2: 100 + 88 * Math.sin(angle),
      y2: 100 - 88 * Math.cos(angle),
    };
  })
);

const zones = [
  { city: "New York", offset: -5 },
  { city: "London", offset: 0 },
  { city: "Tokyo", offset: 9 },
];

function cityTime(offset) {
  return new Date(now.value.getTime() + (now.value.getTimezoneOffset() + offset * 60) * 60000);
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-6 p-6">
    <div class="flex flex-col items-center gap-2">
      <!-- Analog Clock -->
      <svg viewBox="0 0 200 200" class="w-48 h-48">
        <circle cx="100" cy="100" r="96" fill="#161b22" stroke="#30363d" stroke-width="2" />
        <line
          v-for="(tick, i) in ticks"
          :key="i"
          :x1="tick.x1" :y1="tick.y1" :x2="tick.x2" :y2="tick.y2"
          stroke="#484f58" stroke-width="2.5" stroke-linecap="round"
        />
        <!-- Hour hand -->
        <line
          x1="100" y1="100"
          :x2="100 + 50 * Math.sin((hourDeg * Math.PI) / 180)"
          :y2="100 - 50 * Math.cos((hourDeg * Math.PI) / 180)"
          stroke="#e6edf3" stroke-width="4" stroke-linecap="round"
        />
        <!-- Minute hand -->
        <line
          x1="100" y1="100"
          :x2="100 + 70 * Math.sin((minDeg * Math.PI) / 180)"
          :y2="100 - 70 * Math.cos((minDeg * Math.PI) / 180)"
          stroke="#e6edf3" stroke-width="2.5" stroke-linecap="round"
        />
        <!-- Second hand -->
        <line
          x1="100" y1="100"
          :x2="100 + 75 * Math.sin((secDeg * Math.PI) / 180)"
          :y2="100 - 75 * Math.cos((secDeg * Math.PI) / 180)"
          stroke="#f85149" stroke-width="1.5" stroke-linecap="round"
        />
        <circle cx="100" cy="100" r="4" fill="#f85149" />
      </svg>

      <p class="font-mono text-[36px] font-bold text-[#e6edf3] tabular-nums">{{ timeStr }}</p>
      <p class="text-[#8b949e] text-sm">{{ dateStr }}</p>
    </div>

    <div class="flex gap-4">
      <div
        v-for="zone in zones"
        :key="zone.city"
        class="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-center"
      >
        <p class="text-[11px] text-[#484f58] uppercase tracking-wider mb-1">{{ zone.city }}</p>
        <p class="font-mono text-[14px] font-bold text-[#e6edf3] tabular-nums">
          {{ cityTime(zone.offset).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) }}
        </p>
      </div>
    </div>
  </div>
</template>
