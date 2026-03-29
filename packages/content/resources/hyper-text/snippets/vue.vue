<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  text: { type: String, default: "STEALTHIS" },
  scrambleSpeed: { type: Number, default: 50 },
  resolveDelay: { type: Number, default: 80 },
});

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

const displayChars = ref(props.text.split(""));
const resolvedFlags = ref(new Array(props.text.length).fill(true));
let isAnimating = false;
let intervalId = null;
let timeoutIds = [];
let mountTimeout = null;

function scramble() {
  if (isAnimating) return;
  isAnimating = true;

  const resolved = new Array(props.text.length).fill(false);
  resolvedFlags.value = [...resolved];

  timeoutIds.forEach(clearTimeout);
  timeoutIds = [];

  props.text.split("").forEach((_, i) => {
    const tid = setTimeout(
      () => {
        resolved[i] = true;
        resolvedFlags.value = [...resolved];
      },
      props.resolveDelay * (i + 1)
    );
    timeoutIds.push(tid);
  });

  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    const next = props.text.split("").map((ch, i) => {
      if (ch === " ") return "\u00A0";
      if (resolved[i]) return ch;
      return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    });
    displayChars.value = next;

    if (resolved.every(Boolean)) {
      if (intervalId) clearInterval(intervalId);
      displayChars.value = props.text.split("");
      isAnimating = false;
    }
  }, props.scrambleSpeed);
}

onMounted(() => {
  mountTimeout = setTimeout(scramble, 400);
});

onUnmounted(() => {
  if (mountTimeout) clearTimeout(mountTimeout);
  if (intervalId) clearInterval(intervalId);
  timeoutIds.forEach(clearTimeout);
});
</script>

<template>
  <div class="hyper-text-wrapper">
    <div class="hyper-text" @mouseenter="scramble">
      <span
        v-for="(ch, i) in displayChars"
        :key="i"
        class="char"
        :style="{
          color: resolvedFlags[i] ? '#f1f5f9' : '#a78bfa',
          textShadow: resolvedFlags[i] ? '0 0 4px rgba(241,245,249,0.2)' : '0 0 8px rgba(167,139,250,0.5)',
        }"
      >
        {{ ch === ' ' ? '\u00A0' : ch }}
      </span>
    </div>

    <p class="hint">Hover to scramble</p>
  </div>
</template>

<style scoped>
.hyper-text-wrapper {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 3rem;
}

.hyper-text {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: clamp(2rem, 6vw, 4.5rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #f1f5f9;
  cursor: default;
  display: inline-flex;
}

.char {
  display: inline-block;
  min-width: 0.6em;
  text-align: center;
  transition: color 0.15s ease;
}

.hint {
  font-size: 0.75rem;
  color: #333;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0;
}
</style>
