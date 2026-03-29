<script setup>
import { reactive, onUnmounted } from "vue";

const TEXTS = [
  "The transformer architecture fundamentally changed natural language processing by introducing the attention mechanism — allowing models to weigh the relevance of each token relative to all others in the sequence, regardless of distance.",
  "Retrieval-augmented generation (RAG) combines a parametric language model with a non-parametric retrieval component. At inference time, relevant documents are fetched from a knowledge base and appended to the context, grounding the model's output in factual sources.",
  "Constitutional AI trains models to be helpful, harmless, and honest by generating a set of principles the model critiques itself against. This iterative self-improvement loop reduces harmful outputs without requiring human labelers for every edge case.",
];

const cards = [
  { text: TEXTS[0], speed: 12, label: "Standard (12ms)" },
  { text: TEXTS[1], speed: 4, label: "Fast (4ms)" },
  { text: TEXTS[2], speed: 30, label: "Slow (30ms)" },
];

const states = reactive(cards.map(() => ({ displayed: "", running: false, done: false })));

const timers = [null, null, null];
const indices = [0, 0, 0];

function start(i) {
  if (states[i].running) return;
  indices[i] = 0;
  states[i].displayed = "";
  states[i].running = true;
  states[i].done = false;
  timers[i] = setInterval(() => {
    indices[i]++;
    states[i].displayed = cards[i].text.slice(0, indices[i]);
    if (indices[i] >= cards[i].text.length) {
      clearInterval(timers[i]);
      states[i].running = false;
      states[i].done = true;
    }
  }, cards[i].speed);
}

function reset(i) {
  if (timers[i]) clearInterval(timers[i]);
  indices[i] = 0;
  states[i].displayed = "";
  states[i].running = false;
  states[i].done = false;
}

function pct(i) {
  return Math.round((states[i].displayed.length / cards[i].text.length) * 100);
}

onUnmounted(() => {
  timers.forEach((t) => {
    if (t) clearInterval(t);
  });
});
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <div v-for="(card, i) in cards" :key="i" class="card">
        <!-- Header -->
        <div class="card-header">
          <div class="header-left">
            <span class="label">{{ card.label }}</span>
            <span v-if="states[i].running" class="streaming">
              <span class="dot" />
              Streaming
            </span>
            <span v-if="states[i].done" class="chars">{{ card.text.length }} chars</span>
          </div>
          <div class="header-right">
            <button
              class="btn-stream"
              :disabled="states[i].running"
              @click="start(i)"
            >
              {{ states[i].done ? "Replay" : "Stream" }}
            </button>
            <button
              v-if="states[i].running || states[i].done"
              class="btn-reset"
              @click="reset(i)"
            >Reset</button>
          </div>
        </div>

        <!-- Progress bar -->
        <div v-if="states[i].running || states[i].done" class="progress-track">
          <div class="progress-bar" :style="{ width: pct(i) + '%' }" />
        </div>

        <!-- Text -->
        <div class="text-area">
          <p v-if="states[i].displayed" class="text">
            {{ states[i].displayed }}<span v-if="states[i].running" class="cursor" />
          </p>
          <p v-else class="placeholder">Click Stream to start →</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #0d1117;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
}

.wrapper {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  background: #21262d;
  border-bottom: 1px solid #30363d;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.streaming {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 11px;
  color: #4ade80;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  animation: pulse 1.5s ease-in-out infinite;
}

.chars {
  font-size: 11px;
  color: #8b949e;
}

.header-right {
  display: flex;
  gap: 0.375rem;
}

.btn-stream {
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 11px;
  font-weight: 600;
  background: rgba(88, 166, 255, 0.1);
  border: 1px solid rgba(88, 166, 255, 0.3);
  color: #58a6ff;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-stream:hover { background: rgba(88, 166, 255, 0.2); }
.btn-stream:disabled { opacity: 0.3; cursor: not-allowed; }

.btn-reset {
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid #30363d;
  background: transparent;
  color: #8b949e;
  cursor: pointer;
  transition: color 0.15s;
}

.btn-reset:hover { color: #e6edf3; }

.progress-track {
  height: 2px;
  background: #21262d;
}

.progress-bar {
  height: 100%;
  background: #58a6ff;
  transition: width 0.1s;
}

.text-area {
  padding: 1rem 1.25rem;
  min-height: 80px;
}

.text {
  font-size: 14px;
  line-height: 1.6;
  color: #cdd6f4;
  margin: 0;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1rem;
  background: #58a6ff;
  margin-left: 2px;
  vertical-align: middle;
  animation: pulse 1.5s ease-in-out infinite;
}

.placeholder {
  font-size: 13px;
  color: #484f58;
  margin: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
