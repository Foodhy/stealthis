<script setup>
import { computed } from "vue";

const props = defineProps({
  text: { type: String, default: "STEAL THIS COMPONENT * " },
  radius: { type: Number, default: 125 },
  duration: { type: Number, default: 10 },
});

const chars = computed(() =>
  props.text.split("").map((char, i) => ({
    char,
    angle: (360 / props.text.length) * i,
  }))
);
</script>

<template>
  <div class="demo">
    <div class="spin-ring" :style="{ width: props.radius * 2 + 'px', height: props.radius * 2 + 'px' }">
      <!-- Center dot -->
      <div class="center-dot"></div>

      <!-- Spinning container -->
      <div class="spin-container" :style="{ animation: `spinText ${props.duration}s linear infinite` }">
        <span
          v-for="(c, i) in chars"
          :key="i"
          class="char"
          :style="{ transformOrigin: `0 ${props.radius}px`, transform: `rotate(${c.angle}deg)` }"
        >
          {{ c.char }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spinText {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.demo {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spin-ring {
  position: relative;
}
.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: #a78bfa;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px #a78bfa, 0 0 40px rgba(167,139,250,0.3);
}
.spin-container {
  position: absolute;
  inset: 0;
}
.char {
  position: absolute;
  left: 50%;
  top: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  text-shadow: 0 0 8px rgba(167,139,250,0.4);
}
</style>
