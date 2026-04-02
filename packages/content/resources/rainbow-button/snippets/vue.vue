<script setup>
const sizeMap = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

function outerStyle(rounded, speed) {
  return {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px",
    borderRadius: rounded ? "999px" : "12px",
    border: "none",
    outline: "none",
    cursor: "pointer",
    background:
      "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff, #ff0000)",
    animation: `rainbow-spin ${speed} linear infinite`,
    transition: "transform 0.2s ease, filter 0.2s ease",
  };
}

function labelStyle(filled, size, rounded) {
  return {
    display: "block",
    ...sizeMap[size],
    borderRadius: rounded ? "999px" : "10px",
    background: filled ? "transparent" : "#0a0a0a",
    color: filled ? "#fff" : "#f1f5f9",
    fontWeight: 600,
    letterSpacing: "0.01em",
    textShadow: filled ? "0 1px 2px rgba(0,0,0,0.4)" : "none",
    transition: "background 0.3s ease",
  };
}

const row1 = [
  { label: "Explore Now", filled: false, size: "md", rounded: false, speed: "3s" },
  { label: "Get Premium", filled: true, size: "md", rounded: false, speed: "3s" },
];
const row2 = [
  { label: "Start Your Journey", filled: false, size: "lg", rounded: false, speed: "3s" },
  { label: "Try Free", filled: true, size: "sm", rounded: false, speed: "3s" },
];
const row3 = [
  { label: "Join Community", filled: false, size: "md", rounded: true, speed: "3s" },
];
</script>

<template>
  <div style="min-height:100vh;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;padding:2rem;font-family:system-ui,-apple-system,sans-serif">
    <h2 style="font-size:1.5rem;font-weight:700;color:#e2e8f0">Rainbow Buttons</h2>
    <p style="color:#525252;font-size:0.875rem">Animated rainbow gradient borders</p>
    <div style="display:flex;flex-wrap:wrap;gap:2.5rem;justify-content:center">
      <button
        v-for="btn in row1" :key="btn.label"
        :style="outerStyle(btn.rounded, btn.speed)"
        @mouseenter="e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.filter='brightness(1.2)' }"
        @mouseleave="e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.filter='' }"
      >
        <span :style="labelStyle(btn.filled, btn.size, btn.rounded)">{{ btn.label }}</span>
      </button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:2.5rem;justify-content:center">
      <button
        v-for="btn in row2" :key="btn.label"
        :style="outerStyle(btn.rounded, btn.speed)"
        @mouseenter="e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.filter='brightness(1.2)' }"
        @mouseleave="e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.filter='' }"
      >
        <span :style="labelStyle(btn.filled, btn.size, btn.rounded)">{{ btn.label }}</span>
      </button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:2.5rem;justify-content:center">
      <button
        v-for="btn in row3" :key="btn.label"
        :style="outerStyle(btn.rounded, btn.speed)"
        @mouseenter="e => { e.currentTarget.style.transform='scale(1.04)'; e.currentTarget.style.filter='brightness(1.2)' }"
        @mouseleave="e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.filter='' }"
      >
        <span :style="labelStyle(btn.filled, btn.size, btn.rounded)">{{ btn.label }}</span>
      </button>
    </div>
  </div>
</template>

<style>
@keyframes rainbow-spin {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  button { animation: none !important; }
}
</style>
