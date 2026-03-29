<script setup>
import { ref } from "vue";

const PAIRS = [
  {
    label: "Dark / Light Mode",
    before: { label: "Dark", bg: "#0d1117", items: ["#58a6ff", "#bc8cff", "#7ee787"] },
    after: { label: "Light", bg: "#ffffff", items: ["#0969da", "#8250df", "#1a7f37"] },
  },
  {
    label: "Blur / Sharp",
    before: { label: "Blurred", bg: "#1c1c2e", items: ["#bc8cff", "#58a6ff", "#ff6b6b"] },
    after: { label: "Sharp", bg: "#1c1c2e", items: ["#e040fb", "#29b6f6", "#ef5350"] },
  },
];

const widths = [40, 25, 35];
const positions = ref(PAIRS.map(() => 50));
const draggingIndex = ref(-1);

function updatePos(index, clientX, container) {
  const rect = container.getBoundingClientRect();
  positions.value[index] = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
}

function onMouseMove(e, index) {
  if (draggingIndex.value === index) {
    updatePos(index, e.clientX, e.currentTarget);
  }
}

function onTouchMove(e, index) {
  updatePos(index, e.touches[0].clientX, e.currentTarget);
}

function startDrag(index) {
  draggingIndex.value = index;
}

function stopDrag() {
  draggingIndex.value = -1;
}
</script>

<template>
  <div class="image-comparison">
    <div class="inner">
      <h2 class="title">Image Comparison</h2>
      <div v-for="(pair, index) in PAIRS" :key="pair.label">
        <p class="pair-label">{{ pair.label }}</p>
        <div
          class="slider-container"
          @mousemove="(e) => onMouseMove(e, index)"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          @touchmove="(e) => onTouchMove(e, index)"
          @touchend="stopDrag"
        >
          <!-- Before -->
          <div class="layer">
            <div class="mock-ui" :style="{ background: pair.before.bg }">
              <div class="bar-row">
                <div v-for="(c, i) in pair.before.items" :key="i" class="bar" :style="{ background: c, width: widths[i] + '%' }" />
              </div>
              <div class="grid-row">
                <div v-for="(c, i) in pair.before.items" :key="i" class="grid-cell" :style="{ background: c + '20', borderColor: 'rgba(255,255,255,0.1)' }">
                  <div class="cell-bar" :style="{ background: c, opacity: 0.7 }" />
                </div>
              </div>
              <div class="bottom-bar" :style="{ background: pair.before.items[0], opacity: 0.4 }" />
            </div>
          </div>
          <!-- After -->
          <div class="layer" :style="{ clipPath: `inset(0 0 0 ${positions[index]}%)` }">
            <div class="mock-ui" :style="{ background: pair.after.bg }">
              <div class="bar-row">
                <div v-for="(c, i) in pair.after.items" :key="i" class="bar" :style="{ background: c, width: widths[i] + '%' }" />
              </div>
              <div class="grid-row">
                <div v-for="(c, i) in pair.after.items" :key="i" class="grid-cell" :style="{ background: c + '20', borderColor: 'rgba(255,255,255,0.1)' }">
                  <div class="cell-bar" :style="{ background: c, opacity: 0.7 }" />
                </div>
              </div>
              <div class="bottom-bar" :style="{ background: pair.after.items[0], opacity: 0.4 }" />
            </div>
          </div>
          <!-- Divider -->
          <div class="divider" :style="{ left: positions[index] + '%' }">
            <div class="handle" @mousedown="startDrag(index)" @touchstart="startDrag(index)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5">
                <polyline points="8 4 4 12 8 20" /><polyline points="16 4 20 12 16 20" />
              </svg>
            </div>
          </div>
          <!-- Labels -->
          <span class="label-before">{{ pair.before.label }}</span>
          <span class="label-after">{{ pair.after.label }}</span>
        </div>
      </div>
      <p class="hint">Drag the handle to compare</p>
    </div>
  </div>
</template>

<style scoped>
.image-comparison {
  min-height: 100vh;
  background: #0d1117;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.inner {
  width: 100%;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.title {
  color: #e6edf3;
  font-weight: 700;
  font-size: 1.125rem;
  margin: 0;
}
.pair-label {
  color: #8b949e;
  font-size: 0.75rem;
  margin: 0 0 0.5rem;
  text-align: center;
}
.slider-container {
  position: relative;
  height: 9rem;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: col-resize;
  user-select: none;
  border: 1px solid #30363d;
}
.layer {
  position: absolute;
  inset: 0;
}
.mock-ui {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.75rem;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.bar {
  height: 0.5rem;
  border-radius: 9999px;
}
.grid-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  flex: 1;
}
.grid-cell {
  border-radius: 0.5rem;
  border: 1px solid;
  padding: 0.5rem;
  display: flex;
  align-items: flex-end;
}
.cell-bar {
  height: 0.375rem;
  border-radius: 9999px;
  width: 100%;
}
.bottom-bar {
  height: 0.25rem;
  border-radius: 9999px;
  width: 75%;
}
.divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: white;
  z-index: 10;
}
.handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1.75rem;
  height: 1.75rem;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  cursor: col-resize;
}
.label-before {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-size: 10px;
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
.label-after {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 10px;
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
.hint {
  font-size: 11px;
  text-align: center;
  color: #484f58;
  margin: 0;
}
</style>
