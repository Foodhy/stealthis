<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  value: { type: Number, default: 48253 },
  separator: { type: String, default: "," },
  prefix: { type: String, default: "" },
  suffix: { type: String, default: "" },
  duration: { type: Number, default: 1 },
});

const animate = ref(false);

const digits = computed(() => String(props.value).split("").map(Number));

onMounted(() => {
  setTimeout(() => {
    animate.value = true;
  }, 200);
});

function replay() {
  animate.value = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animate.value = true;
    });
  });
}

function needsSep(i) {
  return props.separator && i > 0 && (digits.value.length - i) % 3 === 0;
}

function getDelay(i) {
  return (digits.value.length - 1 - i) * 0.06;
}

function columnStyle(digit, i) {
  const delay = getDelay(i);
  return {
    display: "flex",
    flexDirection: "column",
    transition: animate.value
      ? `transform ${props.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
      : "none",
    transform: animate.value ? `translateY(-${digit}em)` : "translateY(0)",
  };
}
</script>

<template>
  <div class="ticker-demo">
    <div class="ticker-inner">
      <h2 class="ticker-heading">Statistics</h2>

      <div class="ticker-card">
        <span class="ticker-label">Total Count</span>

        <div style="display: flex; align-items: baseline;">
          <span v-if="prefix" class="ticker-prefix">{{ prefix }}</span>

          <div class="ticker-digits">
            <template v-for="(digit, i) in digits" :key="i">
              <span v-if="needsSep(i)" class="ticker-sep">{{ separator }}</span>
              <div :style="columnStyle(digit, i)">
                <span v-for="d in 10" :key="d - 1" class="ticker-digit-cell">
                  {{ d - 1 }}
                </span>
              </div>
            </template>
          </div>

          <span v-if="suffix" class="ticker-suffix">{{ suffix }}</span>
        </div>
      </div>

      <button class="ticker-replay" @click="replay">Replay Animation</button>
    </div>
  </div>
</template>

<style scoped>
.ticker-demo {
  min-height: 100vh;
  background: #0a0a0a;
  display: grid;
  place-items: center;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: #f1f5f9;
}
.ticker-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.ticker-heading {
  font-size: 1.375rem;
  font-weight: 700;
}
.ticker-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 1rem;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.ticker-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ticker-prefix {
  font-size: 2rem;
  font-weight: 700;
  color: #e2e8f0;
}
.ticker-digits {
  display: flex;
  align-items: baseline;
  overflow: hidden;
  height: 1em;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: #f8fafc;
}
.ticker-sep {
  height: 1em;
  display: flex;
  align-items: center;
  color: #475569;
  font-size: 0.85em;
}
.ticker-digit-cell {
  height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ticker-suffix {
  font-size: 1.25rem;
  color: #64748b;
  margin-left: 0.1rem;
}
.ticker-replay {
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  color: #a5b4fc;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
}
</style>
