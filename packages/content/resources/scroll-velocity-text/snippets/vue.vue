<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  text: { type: [String, Array], default: () => [] },
  baseSpeed: { type: Number, default: 0.5 },
  speedMultiplier: { type: Number, default: 3 },
  direction: { type: String, default: "left" },
  accentIndices: { type: Array, default: () => [] },
});

const trackEl = ref(null);
let pos = 0;
let halfWidth = 0;
let scrollVel = 0;
let smoothVel = 0;
let lastScroll = 0;
let raf = 0;
let onScroll = null;

const texts = computed(() => (Array.isArray(props.text) ? props.text : [props.text]));
const allTexts = computed(() => [...texts.value, ...texts.value]);
const dir = computed(() => (props.direction === "right" ? 1 : -1));

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function isAccent(i) {
  return props.accentIndices.includes(i % texts.value.length);
}

function textStyle(i) {
  return {
    fontSize: "clamp(3rem, 10vw, 8rem)",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: isAccent(i) ? "rgba(129, 140, 248, 0.25)" : "rgba(255, 255, 255, 0.08)",
    textTransform: "uppercase",
    flexShrink: 0,
    paddingRight: "2rem",
  };
}

onMounted(() => {
  lastScroll = window.scrollY;

  onScroll = () => {
    const y = window.scrollY;
    scrollVel = y - lastScroll;
    lastScroll = y;
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  requestAnimationFrame(() => {
    if (trackEl.value) halfWidth = trackEl.value.scrollWidth / 2;
  });

  const animate = () => {
    smoothVel = lerp(smoothVel, scrollVel, 0.05);
    scrollVel = lerp(scrollVel, 0, 0.05);

    const absVel = Math.abs(smoothVel);
    const speed = props.baseSpeed + absVel * props.speedMultiplier * 0.1;
    const scrollDir = smoothVel >= 0 ? 1 : -1;

    pos += speed * dir.value * scrollDir;

    if (Math.abs(pos) >= halfWidth && halfWidth > 0) {
      pos = 0;
    }

    if (trackEl.value) {
      trackEl.value.style.transform = `translateX(${pos}px)`;
    }

    raf = requestAnimationFrame(animate);
  };

  raf = requestAnimationFrame(animate);
});

onUnmounted(() => {
  if (onScroll) window.removeEventListener("scroll", onScroll);
  cancelAnimationFrame(raf);
});
</script>

<template>
  <div style="overflow: hidden; white-space: nowrap; padding: 1.5rem 0; user-select: none;">
    <div ref="trackEl" style="display: inline-flex; gap: 2rem; will-change: transform;">
      <span
        v-for="(t, i) in allTexts"
        :key="`${t}-${i}`"
        :style="textStyle(i)"
      >
        {{ t }}
      </span>
    </div>
  </div>
</template>
