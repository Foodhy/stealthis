<script setup>
import { computed } from "vue";

const props = defineProps({
  shineColor: { type: String, default: "rgba(255, 255, 255, 0.9)" },
  speed: { type: String, default: "3s" },
});

const badges = [
  { label: "NEW", speed: "3s" },
  { label: "PRO", speed: "3.3s" },
  { label: "PREMIUM", speed: "3.6s" },
];

function shinyStyle(s) {
  return {
    display: "inline-block",
    lineHeight: "1.2",
    backgroundImage: `linear-gradient(120deg, #555 0%, #555 40%, ${props.shineColor} 50%, #555 60%, #555 100%)`,
    backgroundSize: "250% 100%",
    backgroundPosition: "100% center",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animationDuration: s,
  };
}
</script>

<template>
  <div
    style="min-height: 100vh; display: grid; place-items: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 2rem;"
  >
    <div style="display: flex; flex-direction: column; align-items: center; gap: 2rem;">
      <h1>
        <span class="animated-shiny-text" :style="shinyStyle(props.speed)">
          <span style="font-size: clamp(2.5rem, 6vw, 5rem); font-weight: 800; letter-spacing: -0.03em;">
            Animated Shiny Text
          </span>
        </span>
      </h1>
      <p style="color: #666; font-size: 1rem;">
        A shimmer highlight sweeps across the text
      </p>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
        <span
          v-for="badge in badges"
          :key="badge.label"
          class="animated-shiny-text"
          :style="shinyStyle(badge.speed)"
        >
          <span
            style="font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; padding: 0.5rem 1.25rem; border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; display: inline-block;"
          >
            {{ badge.label }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animated-shiny-text {
  animation: shine-sweep ease-in-out infinite;
}
@keyframes shine-sweep {
  0% { background-position: 100% center; }
  40% { background-position: -100% center; }
  100% { background-position: -100% center; }
}
@media (prefers-reduced-motion: reduce) {
  .animated-shiny-text { animation: none !important; background-position: 0% center !important; }
}
</style>
