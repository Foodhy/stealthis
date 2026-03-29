<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  colors: { type: Array, default: () => ["#ffd700", "#ffffff", "#00d4ff", "#ff9ff3", "#a78bfa"] },
  sparkleCount: { type: Number, default: 3 },
  spawnInterval: { type: Number, default: 400 },
});

const wrapperEl = ref(null);
let interval = null;

function createSparkle() {
  if (!wrapperEl.value) return;
  const rect = wrapperEl.value.getBoundingClientRect();
  const size = Math.random() * 14 + 10;
  const color = props.colors[Math.floor(Math.random() * props.colors.length)];
  const x = Math.random() * (rect.width + 40) - 20;
  const y = Math.random() * (rect.height + 40) - 20;

  const sparkle = document.createElement("span");
  sparkle.className = "sparkle-vue";
  sparkle.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 2;
    animation: sparkle-vue-anim 0.8s ease-out forwards;
  `;
  sparkle.innerHTML = `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
      <path d="M12 0l3.09 7.26L23 8.27l-5.46 5.04L18.82 21 12 17.27 5.18 21l1.28-7.69L1 8.27l7.91-1.01z"/>
    </svg>
  `;
  wrapperEl.value.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 800);
}

onMounted(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  for (let i = 0; i < props.sparkleCount * 2; i++) {
    setTimeout(() => createSparkle(), i * 100);
  }

  interval = setInterval(() => {
    for (let i = 0; i < props.sparkleCount; i++) {
      createSparkle();
    }
  }, props.spawnInterval);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <div class="demo">
    <div>
      <span ref="wrapperEl" class="sparkle-wrapper">
        <h1 class="heading">Sparkles Text</h1>
      </span>
      <p class="subtitle">Floating sparkle particles around text</p>
    </div>
  </div>
</template>

<style>
@keyframes sparkle-vue-anim {
  0% { transform: scale(0) rotate(0deg); opacity: 1; }
  50% { transform: scale(1) rotate(90deg); opacity: 1; }
  100% { transform: scale(0) rotate(180deg); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .sparkle-vue { display: none !important; }
}
</style>

<style scoped>
.demo {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0a0a0a;
  font-family: system-ui, -apple-system, sans-serif;
  text-align: center;
  padding: 2rem;
}
.sparkle-wrapper {
  position: relative;
  display: inline-block;
  padding: 1rem 2rem;
}
.heading {
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #f0f0f0;
  position: relative;
  z-index: 1;
}
.subtitle {
  margin-top: 1.5rem;
  color: #666;
  font-size: 1rem;
  position: relative;
  z-index: 1;
}
</style>
