<script setup>
import { ref, computed, watch, onUnmounted } from "vue";

function pad(n) {
  return String(n).padStart(2, "0");
}

const targetDate = ref(
  (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  })()
);
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const expired = ref(false);
let intervalId;

function calc() {
  const diff = new Date(targetDate.value).getTime() - Date.now();
  if (diff <= 0) {
    expired.value = true;
    return;
  }
  expired.value = false;
  timeLeft.value = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

watch(
  targetDate,
  () => {
    calc();
    clearInterval(intervalId);
    intervalId = setInterval(calc, 1000);
  },
  { immediate: true }
);
onUnmounted(() => clearInterval(intervalId));

const units = computed(() => [
  { label: "Days", value: timeLeft.value.days },
  { label: "Hours", value: timeLeft.value.hours },
  { label: "Minutes", value: timeLeft.value.minutes },
  { label: "Seconds", value: timeLeft.value.seconds },
]);
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="w-full max-w-lg">
      <h2 class="text-center text-[#e6edf3] font-bold text-xl mb-6">Countdown Timer</h2>
      <div class="mb-6 flex justify-center">
        <input type="datetime-local" v-model="targetDate" class="bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#58a6ff]"/>
      </div>
      <p v-if="expired" class="text-center text-[#f85149] font-semibold text-lg">Time's up!</p>
      <div v-else class="grid grid-cols-4 gap-3">
        <div v-for="u in units" :key="u.label" class="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-center">
          <p class="text-[40px] font-mono font-bold text-[#58a6ff] tabular-nums leading-none mb-1">{{ pad(u.value) }}</p>
          <p class="text-[11px] text-[#8b949e] uppercase tracking-wider">{{ u.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
