<script setup>
import { computed } from "vue";

const props = defineProps({
  neonSpeed: { type: String, default: "4s" },
  glowSize: { type: Number, default: 30 },
  borderWidth: { type: Number, default: 2 },
  borderRadius: { type: String, default: "1.25rem" },
});

const gradientColors = "#ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080";

const outerStyle = computed(() => ({
  position: "relative",
  borderRadius: props.borderRadius,
  overflow: "visible",
}));

const glowStyle = computed(() => ({
  position: "absolute",
  inset: `-${props.borderWidth}px`,
  borderRadius: props.borderRadius,
  background: `conic-gradient(from 0deg, ${gradientColors})`,
  animation: `neon-hue-shift ${props.neonSpeed} linear infinite`,
  zIndex: 0,
}));

const outerGlowStyle = computed(() => ({
  position: "absolute",
  inset: `-${props.glowSize}px`,
  borderRadius: `calc(${props.borderRadius} + ${props.glowSize}px)`,
  background: `conic-gradient(from 0deg, ${gradientColors})`,
  filter: `blur(${props.glowSize}px)`,
  opacity: 0.4,
  animation: `neon-hue-shift ${props.neonSpeed} linear infinite`,
  zIndex: -1,
}));

const contentStyle = computed(() => ({
  position: "relative",
  zIndex: 1,
  margin: `${props.borderWidth}px`,
  borderRadius: `calc(${props.borderRadius} - ${props.borderWidth}px)`,
  background: "#0a0a0a",
}));

const features = ["Animated color shifting", "Soft outer glow", "Pure CSS animation"];
</script>

<template>
  <div class="neon-demo">
    <div :style="outerStyle">
      <div :style="glowStyle">
        <div :style="outerGlowStyle"></div>
      </div>
      <div :style="contentStyle">
        <div class="neon-content">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 1.5rem;">&#x26A1;</span>
            <span class="neon-badge">NEW</span>
          </div>
          <h2 class="neon-title">Neon Gradient Card</h2>
          <p class="neon-desc">
            An animated neon glow border that shifts through vivid colors, perfect for eye-catching UI elements.
          </p>
          <ul class="neon-features">
            <li v-for="feature in features" :key="feature" class="neon-feature-item">
              <span style="color: #40e0d0; font-weight: 700; margin-right: 0.5rem;">&#x2713;</span>
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes neon-hue-shift {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
.neon-demo {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0a0a0a;
  font-family: system-ui, -apple-system, sans-serif;
}
.neon-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #f1f5f9;
  width: min(400px, calc(100vw - 2rem));
}
.neon-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(255,0,128,0.15);
  border: 1px solid rgba(255,0,128,0.4);
  color: #ff0080;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.neon-title {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}
.neon-desc {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #94a3b8;
  margin: 0;
}
.neon-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
}
.neon-feature-item {
  font-size: 0.875rem;
  color: #cbd5e1;
}
</style>
