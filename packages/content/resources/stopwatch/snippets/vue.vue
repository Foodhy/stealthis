<script setup>
import { ref, onUnmounted } from "vue";

const elapsed = ref(0);
const running = ref(false);
const laps = ref([]);
let startTime = 0;
let base = 0;
let interval;

function format(ms) {
  const cents = Math.floor((ms % 1000) / 10);
  const secs = Math.floor(ms / 1000) % 60;
  const mins = Math.floor(ms / 60000) % 60;
  const hrs = Math.floor(ms / 3600000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(cents).padStart(2, "0")}`;
}

function toggle() {
  if (running.value) {
    base = elapsed.value;
    clearInterval(interval);
    running.value = false;
  } else {
    startTime = Date.now();
    running.value = true;
    interval = setInterval(() => {
      elapsed.value = base + Date.now() - startTime;
    }, 10);
  }
}

function reset() {
  clearInterval(interval);
  running.value = false;
  elapsed.value = 0;
  base = 0;
  laps.value = [];
}

function lap() {
  if (running.value) {
    laps.value = [elapsed.value, ...laps.value];
  }
}

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <div class="card">
        <p class="display">{{ format(elapsed) }}</p>
        <div class="buttons">
          <button
            :class="['btn', running ? 'stop' : 'start']"
            @click="toggle"
          >
            {{ running ? "Stop" : "Start" }}
          </button>
          <button class="btn secondary" :disabled="!running" @click="lap">Lap</button>
          <button class="btn secondary" @click="reset">Reset</button>
        </div>
      </div>

      <div v-if="laps.length > 0" class="laps">
        <div class="laps-scroll">
          <div v-for="(lapTime, i) in laps" :key="i" class="lap-row">
            <span class="lap-label">Lap {{ laps.length - i }}</span>
            <span class="lap-time">{{ format(lapTime) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #0d1117;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.wrapper {
  width: 100%;
  max-width: 384px;
}

.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
}

.display {
  font-family: monospace;
  font-size: 52px;
  font-weight: 700;
  color: #e6edf3;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin: 0 0 1.5rem;
}

.buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  flex: 1;
  padding: 0.625rem 0;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn.start {
  background: #238636;
  border: 1px solid #2ea043;
  color: white;
}

.btn.start:hover { background: #2ea043; }

.btn.stop {
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.3);
  color: #f85149;
}

.btn.stop:hover { background: rgba(248, 81, 73, 0.2); }

.btn.secondary {
  background: #21262d;
  border: 1px solid #30363d;
  color: #8b949e;
}

.btn.secondary:hover { color: #e6edf3; }
.btn.secondary:disabled { opacity: 0.4; cursor: not-allowed; }

.laps {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 0.75rem;
  overflow: hidden;
}

.laps-scroll {
  max-height: 192px;
  overflow-y: auto;
}

.lap-row {
  display: flex;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #21262d;
}

.lap-row:last-child { border-bottom: none; }

.lap-label { color: #8b949e; }

.lap-time {
  font-family: monospace;
  color: #e6edf3;
  font-variant-numeric: tabular-nums;
}
</style>
