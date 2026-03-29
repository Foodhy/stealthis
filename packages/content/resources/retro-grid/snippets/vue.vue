<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  color: { type: String, default: "rgba(139,92,246,0.3)" },
  size: { type: Number, default: 60 },
  glowColor: { type: String, default: "rgba(139,92,246,0.5)" },
  speed: { type: Number, default: 8 },
});

const wrapperEl = ref(null);

const animationCSS = computed(() =>
  props.speed
    ? `@keyframes retro-scroll{0%{transform:rotateX(55deg) translateY(0)}100%{transform:rotateX(55deg) translateY(${props.size}px)}}`
    : ""
);

const glowStyle = computed(() => ({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "120%",
  height: "300px",
  background: `radial-gradient(ellipse 50% 80% at 50% 50%, ${props.glowColor}, transparent)`,
  opacity: 0.4,
  pointerEvents: "none",
  filter: "blur(40px)",
}));

const gridStyle = computed(() => ({
  position: "absolute",
  inset: 0,
  transform: "rotateX(55deg)",
  transformOrigin: "50% 0%",
  backgroundImage: `repeating-linear-gradient(90deg, ${props.color} 0px, ${props.color} 1px, transparent 1px, transparent ${props.size}px), repeating-linear-gradient(0deg, ${props.color} 0px, ${props.color} 1px, transparent 1px, transparent ${props.size}px)`,
  backgroundSize: `${props.size}px ${props.size}px`,
  animation: props.speed ? `retro-scroll ${props.speed}s linear infinite` : "none",
}));

function handleMouseMove(e) {
  const wrapper = wrapperEl.value;
  if (!wrapper) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  wrapper.style.perspectiveOrigin = `${50 + x * 10}% ${y * 8}%`;
}

function handleMouseLeave() {
  const wrapper = wrapperEl.value;
  if (wrapper) wrapper.style.perspectiveOrigin = "50% 0%";
}
</script>

<template>
  <component :is="'style'" v-if="animationCSS">{{ animationCSS }}</component>
  <div
    style="position: relative; width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(to bottom, #0a0a0a 0%, #0a0a0a 50%, #0d0520 100%); overflow: hidden; font-family: system-ui, -apple-system, sans-serif;"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div :style="glowStyle" />
    <div
      ref="wrapperEl"
      style="position: absolute; bottom: 0; left: 0; right: 0; height: 65%; overflow: hidden; perspective: 400px; perspective-origin: 50% 0%;"
    >
      <div :style="gridStyle" />
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 40%; background: linear-gradient(to bottom, #0a0a0a 0%, transparent 100%); pointer-events: none; z-index: 1;" />
    </div>
    <div style="position: relative; z-index: 2;">
      <slot>
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-bottom: 10vh;">
          <h1 style="font-size: clamp(3rem, 8vw, 6rem); font-weight: 900; letter-spacing: 0.05em; line-height: 1; color: #fafafa; font-family: system-ui, -apple-system, sans-serif; text-shadow: 0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(139,92,246,0.1);">
            RETRO<span style="color: #a78bfa;">GRID</span>
          </h1>
          <p style="font-size: 1rem; font-weight: 400; color: #71717a; letter-spacing: 0.08em; text-transform: uppercase; font-family: system-ui, -apple-system, sans-serif;">
            Perspective grid with vanishing-point effect
          </p>
          <div style="width: 80px; height: 2px; background: linear-gradient(90deg, transparent, #8b5cf6, transparent); margin-top: 0.5rem;" />
        </div>
      </slot>
    </div>
  </div>
</template>
