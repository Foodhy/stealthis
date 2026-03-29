<script setup>
import { computed } from "vue";

const props = defineProps({
  colors: {
    type: Array,
    default: () => ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#ff6b6b"],
  },
  speed: {
    type: String,
    default: "3s",
  },
});

const gradientColors = computed(() => props.colors.join(", "));
</script>

<template>
  <div
    style="min-height: 100vh; display: grid; place-items: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 2rem;"
  >
    <div>
      <h1
        class="animated-gradient-text"
        :style="{ '--gradient-colors': gradientColors, '--animation-speed': props.speed, fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.1' }"
      >
        Animated Gradient Text
      </h1>
      <p style="margin-top: 1.25rem; color: #666; font-size: 1rem;">
        Pure CSS animated gradient flowing through text
      </p>
    </div>
  </div>
</template>

<style scoped>
.animated-gradient-text {
  background-image: linear-gradient(90deg, var(--gradient-colors));
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-flow var(--animation-speed) linear infinite;
}

@keyframes gradient-flow {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
@media (prefers-reduced-motion: reduce) {
  .animated-gradient-text { animation: none !important; }
}
</style>
