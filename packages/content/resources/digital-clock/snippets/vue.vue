<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const time = ref(new Date());
let interval;

const hours = computed(() => time.value.getHours());
const minutes = computed(() => String(time.value.getMinutes()).padStart(2, "0"));
const seconds = computed(() => String(time.value.getSeconds()).padStart(2, "0"));
const ampm = computed(() => (hours.value >= 12 ? "PM" : "AM"));
const h12 = computed(() => String(hours.value % 12 || 12).padStart(2, "0"));
const dateStr = computed(() =>
  time.value.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

onMounted(() => {
  interval = setInterval(() => {
    time.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-10 py-8 text-center shadow-2xl">
      <div class="flex items-end justify-center gap-1 mb-2">
        <span class="text-[72px] font-mono font-bold text-[#e6edf3] leading-none tabular-nums">
          {{ h12 }}:{{ minutes }}
        </span>
        <div class="flex flex-col items-start mb-2 gap-1">
          <span class="text-[28px] font-mono font-semibold text-[#58a6ff] leading-none tabular-nums">
            {{ seconds }}
          </span>
          <span class="text-[14px] font-mono font-bold text-[#8b949e] leading-none">
            {{ ampm }}
          </span>
        </div>
      </div>
      <p class="text-[14px] text-[#8b949e] tracking-wide">{{ dateStr }}</p>
    </div>
  </div>
</template>
