<script setup>
const sizeMap = {
  sm: { padding: "0.625rem 1.5rem", fontSize: "0.8125rem" },
  md: { padding: "0.875rem 2rem", fontSize: "0.9375rem" },
  lg: { padding: "1.125rem 2.75rem", fontSize: "1.0625rem" },
};

const demos = [
  { label: "Get Started", color: "59, 130, 246", size: "md" },
  { label: "Subscribe Now", color: "139, 92, 246", size: "md" },
  { label: "Download Free", color: "16, 185, 129", size: "md" },
  { label: "Sign Up Today", color: "244, 63, 94", size: "lg" },
  { label: "Learn More", color: "245, 158, 11", size: "sm" },
];

function btnStyle(color, size) {
  const s = sizeMap[size] || sizeMap.md;
  return {
    "--pulse-color": color,
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: s.padding,
    fontSize: s.fontSize,
    borderRadius: "999px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    border: "none",
    outline: "none",
    color: "#fff",
    background: `rgb(${color})`,
    boxShadow: `0 0 0 0 rgba(${color}, 0.6)`,
    animation: "pulse-ring-vue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    transition: "transform 0.2s ease, filter 0.2s ease",
  };
}

function handleClick(e) {
  const btn = e.currentTarget;
  btn.style.animation = "none";
  btn.offsetHeight;
  btn.style.animation = "";
}

function handleEnter(e) {
  e.currentTarget.style.transform = "scale(1.05)";
  e.currentTarget.style.filter = "brightness(1.15)";
}

function handleLeave(e) {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.filter = "brightness(1)";
}
</script>

<template>
  <div class="pulse-demo">
    <h2 class="pulse-heading">Pulsating Buttons</h2>
    <p class="pulse-sub">Buttons with animated glow rings</p>
    <div class="pulse-row">
      <button
        v-for="d in demos.slice(0, 3)"
        :key="d.label"
        :style="btnStyle(d.color, d.size)"
        @click="handleClick"
        @mouseenter="handleEnter"
        @mouseleave="handleLeave"
      >
        {{ d.label }}
      </button>
    </div>
    <div class="pulse-row">
      <button
        v-for="d in demos.slice(3)"
        :key="d.label"
        :style="btnStyle(d.color, d.size)"
        @click="handleClick"
        @mouseenter="handleEnter"
        @mouseleave="handleLeave"
      >
        {{ d.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-ring-vue {
  0% { box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.5); }
  50% { box-shadow: 0 0 0 12px rgba(var(--pulse-color), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0); }
}
@media (prefers-reduced-motion: reduce) {
  button { animation: none !important; }
}
.pulse-demo {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}
.pulse-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
}
.pulse-sub {
  color: #525252;
  font-size: 0.875rem;
}
.pulse-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  justify-content: center;
}
</style>
