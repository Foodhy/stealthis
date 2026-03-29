<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  spotlightColor: { type: String, default: "rgba(120, 120, 255, 0.15)" },
  spotlightRadius: { type: Number, default: 250 },
});

const items = [
  {
    icon: "\u2666",
    title: "Interactive",
    body: "Move your mouse over this card to see the spotlight follow your cursor.",
  },
  {
    icon: "\u2733",
    title: "Responsive",
    body: "Each card tracks the cursor independently with its own radial gradient.",
  },
  {
    icon: "\u2726",
    title: "Customizable",
    body: "Adjust colors, radius, and intensity using simple props.",
  },
];

// Each card gets its own mouse state
const cardStates = ref(items.map(() => ({ x: "50%", y: "50%", hovered: false })));

function handleMouseMove(e, i) {
  const rect = e.currentTarget.getBoundingClientRect();
  cardStates.value[i].x = `${e.clientX - rect.left}px`;
  cardStates.value[i].y = `${e.clientY - rect.top}px`;
}

function handleMouseEnter(i) {
  cardStates.value[i].hovered = true;
}

function handleMouseLeave(i) {
  cardStates.value[i].hovered = false;
  cardStates.value[i].x = "50%";
  cardStates.value[i].y = "50%";
}
</script>

<template>
  <div class="demo-wrapper">
    <div class="grid-container">
      <div
        v-for="(item, i) in items"
        :key="item.title"
        class="magic-card"
        :style="{
          borderColor: cardStates[i].hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
        }"
        @mousemove="handleMouseMove($event, i)"
        @mouseenter="handleMouseEnter(i)"
        @mouseleave="handleMouseLeave(i)"
      >
        <div
          class="spotlight"
          :style="{
            opacity: cardStates[i].hovered ? 1 : 0,
            background: `radial-gradient(${props.spotlightRadius}px circle at ${cardStates[i].x} ${cardStates[i].y}, ${props.spotlightColor}, transparent 100%)`,
          }"
        ></div>
        <div style="position: relative; z-index: 1;">
          <div class="card-content">
            <span class="card-icon">{{ item.icon }}</span>
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-body">{{ item.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0a0a0a;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 2rem;
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: min(740px, calc(100vw - 2rem));
}
.magic-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.03);
  cursor: default;
  transition: border-color 0.3s ease;
}
.spotlight {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}
.card-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.card-icon {
  font-size: 1.5rem;
  color: #818cf8;
  line-height: 1;
}
.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.01em;
  margin: 0;
}
.card-body {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0;
}
</style>
