<script setup>
import { reactive } from "vue";

const variantConfig = {
  default: {
    fill: "#f1f5f9",
    text: "#e2e8f0",
    textHover: "#0a0a0a",
    border: "#475569",
    borderHover: "#f1f5f9",
  },
  blue: {
    fill: "#3b82f6",
    text: "#93c5fd",
    textHover: "#fff",
    border: "#3b82f6",
    borderHover: "#60a5fa",
  },
  purple: {
    fill: "#8b5cf6",
    text: "#c4b5fd",
    textHover: "#fff",
    border: "#8b5cf6",
    borderHover: "#a78bfa",
  },
  emerald: {
    fill: "#10b981",
    text: "#6ee7b7",
    textHover: "#fff",
    border: "#10b981",
    borderHover: "#34d399",
  },
  rose: {
    fill: "#f43f5e",
    text: "#fda4af",
    textHover: "#fff",
    border: "#f43f5e",
    borderHover: "#fb7185",
  },
  "slide-right": {
    fill: "#f1f5f9",
    text: "#e2e8f0",
    textHover: "#0a0a0a",
    border: "#475569",
    borderHover: "#f1f5f9",
  },
  curtain: {
    fill: "#8b5cf6",
    text: "#c4b5fd",
    textHover: "#fff",
    border: "#8b5cf6",
    borderHover: "#a78bfa",
  },
  glow: {
    fill: "#3b82f6",
    text: "#93c5fd",
    textHover: "#fff",
    border: "#3b82f6",
    borderHover: "#60a5fa",
  },
};

const sizeStyles = {
  sm: "padding: 0.625rem 1.5rem; font-size: 0.8125rem;",
  md: "padding: 0.875rem 2rem; font-size: 0.9375rem;",
  lg: "padding: 1.125rem 2.75rem; font-size: 1.0625rem;",
};

const buttons = [
  { id: "a", variant: "default", size: "md", label: "Explore" },
  { id: "b", variant: "blue", size: "md", label: "Get Started" },
  { id: "c", variant: "purple", size: "md", label: "Learn More" },
  { id: "d", variant: "emerald", size: "lg", label: "Download Now" },
  { id: "e", variant: "rose", size: "sm", label: "Sign Up" },
  { id: "f", variant: "slide-right", size: "md", label: "Slide Right" },
  { id: "g", variant: "curtain", size: "md", label: "Curtain Reveal" },
  { id: "h", variant: "glow", size: "md", label: "Glow Effect" },
];

const hoverStates = reactive({});

function btnStyle(variant, size, hovered) {
  const config = variantConfig[variant];
  const isGlow = variant === "glow";
  const boxShadow =
    isGlow && hovered ? "0 0 20px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.2)" : "none";
  return `position:relative;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;font-weight:600;letter-spacing:0.01em;cursor:pointer;background:transparent;border:1.5px solid ${hovered ? config.borderHover : config.border};outline:none;overflow:hidden;transition:border-color 0.35s ease,box-shadow 0.35s ease;box-shadow:${boxShadow};${sizeStyles[size]}`;
}

function fillStyle(variant, hovered) {
  const config = variantConfig[variant];
  const isSlideRight = variant === "slide-right";
  const isCurtain = variant === "curtain";
  if (isSlideRight) {
    return `position:absolute;top:0;left:0;width:${hovered ? "100%" : "0"};height:100%;background:${config.fill};transition:width 0.35s cubic-bezier(0.25,0.46,0.45,0.94);z-index:0;`;
  }
  if (isCurtain) {
    return `position:absolute;top:50%;left:0;width:100%;height:${hovered ? "100%" : "0"};transform:translateY(-50%);background:${config.fill};transition:height 0.35s cubic-bezier(0.25,0.46,0.45,0.94);z-index:0;`;
  }
  return `position:absolute;bottom:0;left:0;width:100%;height:${hovered ? "100%" : "0"};background:${config.fill};transition:height 0.35s cubic-bezier(0.25,0.46,0.45,0.94);z-index:0;`;
}

function labelStyle(variant, hovered) {
  const config = variantConfig[variant];
  return `position:relative;z-index:1;color:${hovered ? config.textHover : config.text};transition:color 0.35s ease;`;
}
</script>

<template>
  <div class="hover-btn-demo">
    <h2 class="demo-title">Interactive Hover Buttons</h2>
    <p class="demo-subtitle">Hover over the buttons to see the fill effect</p>

    <div class="btn-row">
      <button
        v-for="btn in buttons.slice(0, 3)"
        :key="btn.id"
        :style="btnStyle(btn.variant, btn.size, hoverStates[btn.id])"
        @mouseenter="hoverStates[btn.id] = true"
        @mouseleave="hoverStates[btn.id] = false"
      >
        <span :style="fillStyle(btn.variant, hoverStates[btn.id])" />
        <span :style="labelStyle(btn.variant, hoverStates[btn.id])">{{ btn.label }}</span>
      </button>
    </div>
    <div class="btn-row">
      <button
        v-for="btn in buttons.slice(3, 5)"
        :key="btn.id"
        :style="btnStyle(btn.variant, btn.size, hoverStates[btn.id])"
        @mouseenter="hoverStates[btn.id] = true"
        @mouseleave="hoverStates[btn.id] = false"
      >
        <span :style="fillStyle(btn.variant, hoverStates[btn.id])" />
        <span :style="labelStyle(btn.variant, hoverStates[btn.id])">{{ btn.label }}</span>
      </button>
    </div>
    <div class="btn-row">
      <button
        v-for="btn in buttons.slice(5)"
        :key="btn.id"
        :style="btnStyle(btn.variant, btn.size, hoverStates[btn.id])"
        @mouseenter="hoverStates[btn.id] = true"
        @mouseleave="hoverStates[btn.id] = false"
      >
        <span :style="fillStyle(btn.variant, hoverStates[btn.id])" />
        <span :style="labelStyle(btn.variant, hoverStates[btn.id])">{{ btn.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hover-btn-demo {
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

.demo-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.demo-subtitle {
  color: #525252;
  font-size: 0.875rem;
  margin: 0;
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}
</style>
