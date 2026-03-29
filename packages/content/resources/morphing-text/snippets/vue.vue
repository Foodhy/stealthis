<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  texts: {
    type: Array,
    default: () => ["Innovative", "Creative", "Powerful", "Beautiful", "Seamless"],
  },
  morphDuration: { type: Number, default: 2000 },
});

const showingA = ref(true);
const aText = ref(props.texts[0] || "");
const bText = ref(props.texts[1] || "");
const aOpacity = ref(1);
const bOpacity = ref(0);
let index = 0;
let interval = null;

onMounted(() => {
  if (props.texts.length < 2) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  interval = setInterval(() => {
    index = (index + 1) % props.texts.length;
    if (showingA.value) {
      bText.value = props.texts[index];
      aOpacity.value = 0;
      bOpacity.value = 1;
    } else {
      aText.value = props.texts[index];
      aOpacity.value = 1;
      bOpacity.value = 0;
    }
    showingA.value = !showingA.value;
  }, props.morphDuration);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <div class="morph-demo">
    <div>
      <svg style="position: absolute; width: 0; height: 0;" aria-hidden="true">
        <defs>
          <filter id="morph-blur-vue">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>
      </svg>
      <span class="morph-wrapper">
        <span class="morph-spacer">{{ showingA ? aText : bText }}</span>
        <span class="morph-text" :style="{ opacity: aOpacity }">{{ aText }}</span>
        <span class="morph-text" :style="{ opacity: bOpacity }">{{ bText }}</span>
      </span>
      <p class="morph-subtitle">
        Text morphs smoothly between words via SVG blur
      </p>
    </div>
  </div>
</template>

<style scoped>
.morph-demo {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0a0a0a;
  font-family: system-ui, -apple-system, sans-serif;
  text-align: center;
  padding: 2rem;
}
.morph-wrapper {
  position: relative;
  display: inline-block;
  filter: url(#morph-blur-vue) contrast(30);
}
.morph-spacer {
  position: relative;
  visibility: hidden;
  white-space: nowrap;
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #e8e8e8;
}
.morph-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #e8e8e8;
  transition: opacity 0.6s ease;
}
.morph-subtitle {
  margin-top: 1.5rem;
  color: #666;
  font-size: 1rem;
  position: relative;
  z-index: 1;
}
</style>
