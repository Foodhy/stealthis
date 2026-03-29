<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  filled: { type: Boolean, default: false },
  size: { type: String, default: "md" }, // sm, md, lg
  rounded: { type: Boolean, default: false },
  speed: { type: String, default: "3s" },
  class: { type: [String, Object, Array], default: "" },
});

const sizeMap: Record<string, { padding: string; fontSize: string }> = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

const outerStyle = computed(() => ({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2px",
  borderRadius: props.rounded ? "999px" : "12px",
  border: "none",
  outline: "none",
  cursor: "pointer",
  background:
    "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff, #ff0000)",
  animation: `rainbow-spin ${props.speed} linear infinite`,
  transition: "transform 0.2s ease, filter 0.2s ease",
  fontFamily: "system-ui, -apple-system, sans-serif",
}));

const labelStyle = computed(() => ({
  display: "block",
  ...sizeMap[props.size],
  borderRadius: props.rounded ? "999px" : "10px",
  background: props.filled ? "transparent" : "#0a0a0a",
  color: props.filled ? "#fff" : "#f1f5f9",
  fontWeight: 600,
  letterSpacing: "0.01em",
  textShadow: props.filled ? "0 1px 2px rgba(0,0,0,0.4)" : "none",
  transition: "background 0.3s ease",
}));

function onMouseEnter(e: Event) {
  const target = e.currentTarget as HTMLElement;
  target.style.transform = "scale(1.04)";
  target.style.filter = "brightness(1.2) hue-rotate(0deg)";
}

function onMouseLeave(e: Event) {
  const target = e.currentTarget as HTMLElement;
  target.style.transform = "scale(1)";
  target.style.filter = "";
}

function onClick(e: Event) {
  const target = e.currentTarget as HTMLElement;
  target.style.animation = "none";
  target.offsetHeight; // trigger reflow
  target.style.animation = "";
}
</script>

<template>
  <button
    class="rainbow-btn-vue"
    :class="props.class"
    :style="outerStyle"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <span :style="labelStyle">
      <slot>Rainbow Button</slot>
    </span>
  </button>
</template>

<style>
@keyframes rainbow-spin {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .rainbow-btn-vue { animation: none !important; }
}
</style>
