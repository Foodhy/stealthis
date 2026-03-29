<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  words: { type: Array, default: () => ["amazing", "beautiful", "fast", "modern", "stunning"] },
  duration: { type: Number, default: 2500 },
});

const index = ref(0);
const animKey = ref(0);
let interval;

onMounted(() => {
  if (props.words.length < 2) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  interval = setInterval(() => {
    index.value = (index.value + 1) % props.words.length;
    animKey.value += 1;
  }, props.duration);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <div class="flip-demo">
    <div>
      <h1 class="flip-heading">
        We build
        <span class="flip-container">
          <span
            :key="animKey"
            class="flip-word"
            :style="{ animationDuration: duration + 'ms' }"
          >
            {{ words[index] }}
          </span>
        </span>
        products
      </h1>
      <p class="flip-subtitle">Words flip vertically to cycle through a list</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes flip-in {
  0% { transform: rotateX(90deg); opacity: 0; }
  15% { transform: rotateX(0deg); opacity: 1; }
  80% { transform: rotateX(0deg); opacity: 1; }
  100% { transform: rotateX(-90deg); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .flip-word { animation: none !important; transform: rotateX(0deg) !important; opacity: 1 !important; }
}
.flip-demo {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0a0a0a;
  font-family: system-ui, -apple-system, sans-serif;
  text-align: center;
  padding: 2rem;
}
.flip-heading {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: #e0e0e0;
}
.flip-container {
  display: inline-block;
  position: relative;
  height: 1.2em;
  overflow: hidden;
  vertical-align: bottom;
  perspective: 600px;
}
.flip-word {
  display: inline-block;
  background-image: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: flip-in ease forwards;
  transform-origin: center bottom;
  backface-visibility: hidden;
}
.flip-subtitle {
  margin-top: 1.5rem;
  color: #666;
  font-size: 1rem;
}
</style>
