<script setup>
import { ref, computed, watch, onUnmounted } from "vue";

const props = defineProps({
  text: {
    type: String,
    default:
      "Design is not just what it looks like and feels like. Design is how it works. Every detail matters when crafting remarkable experiences.",
  },
  delayPerWord: {
    type: Number,
    default: 120,
  },
  highlightColor: {
    type: String,
    default: "rgba(167, 139, 250, 0.15)",
  },
});

const highlightedCount = ref(0);
const key = ref(0);
let timeouts = [];

const words = computed(() => props.text.split(/\s+/));

function cleanup() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
}

function startAnimation() {
  cleanup();
  highlightedCount.value = 0;
  words.value.forEach((_, i) => {
    const tid = setTimeout(() => {
      highlightedCount.value = i + 1;
    }, props.delayPerWord * i);
    timeouts.push(tid);
  });
}

watch([key, () => props.delayPerWord, () => words.value.length], startAnimation, {
  immediate: true,
});

function replay() {
  key.value += 1;
}

onUnmounted(cleanup);
</script>

<template>
  <div class="wrapper">
    <div class="inner">
      <p class="text" @click="replay">
        <template v-for="(word, i) in words" :key="`${key}-${i}`">
          <span v-if="i > 0"> </span>
          <span
            class="word"
            :style="{ color: i < highlightedCount ? '#f1f5f9' : 'rgba(241,245,249,0.3)' }"
          >
            <span
              class="highlight-bg"
              :style="{
                background: highlightColor,
                transform: i < highlightedCount ? 'scaleX(1)' : 'scaleX(0)'
              }"
            ></span>
            {{ word }}
          </span>
        </template>
      </p>

      <p class="hint">Click to replay</p>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.inner {
  max-width: 640px;
}
.text {
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  font-weight: 600;
  line-height: 1.6;
  color: rgba(241, 245, 249, 0.3);
  cursor: pointer;
  user-select: none;
}
.word {
  position: relative;
  display: inline-block;
  padding: 0 0.1em;
  transition: color 0.3s ease;
}
.highlight-bg {
  position: absolute;
  inset: 0;
  border-radius: 4px;
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: -1;
}
.hint {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.75rem;
  color: #333;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
