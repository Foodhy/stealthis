<script setup>
import { ref, reactive } from "vue";

const IMAGES = [
  { label: "Code snippet", colors: ["#0d1117", "#161b22", "#21262d"], accent: "#58a6ff" },
  { label: "UI design", colors: ["#1a0533", "#2d1b69", "#553c9a"], accent: "#bc8cff" },
  { label: "Data chart", colors: ["#021d1a", "#033028", "#065f46"], accent: "#7ee787" },
];

const LENS = 80;
const ZOOM = 2.5;
const DOT_COLORS = ["#f85149", "#f1e05a", "#7ee787"];
const LINE_WIDTHS = [90, 70, 80, 60, 85];

const mouseStates = reactive(IMAGES.map(() => null));
const containerEls = ref([]);

function setContainerRef(el, idx) {
  if (el) containerEls.value[idx] = el;
}

function onMove(idx, e) {
  const rect = containerEls.value[idx]?.getBoundingClientRect();
  if (!rect) return;
  mouseStates[idx] = { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function onLeave(idx) {
  mouseStates[idx] = null;
}

function getLensX(idx) {
  const m = mouseStates[idx];
  if (!m) return 0;
  return Math.min(
    Math.max(m.x - LENS / 2, 0),
    (containerEls.value[idx]?.offsetWidth ?? 300) - LENS
  );
}

function getLensY(idx) {
  const m = mouseStates[idx];
  if (!m) return 0;
  return Math.min(
    Math.max(m.y - LENS / 2, 0),
    (containerEls.value[idx]?.offsetHeight ?? 200) - LENS
  );
}

function getContainerWidth(idx) {
  return containerEls.value[idx]?.offsetWidth ?? 300;
}

function getContainerHeight(idx) {
  return containerEls.value[idx]?.offsetHeight ?? 140;
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
    <div class="w-full max-w-sm space-y-4">
      <h2 class="text-[#e6edf3] font-bold text-lg mb-4">Zoom / Magnifier</h2>

      <div v-for="(img, idx) in IMAGES" :key="img.label">
        <p class="text-[#8b949e] text-xs mb-1.5">{{ img.label }}</p>
        <div
          :ref="(el) => setContainerRef(el, idx)"
          class="relative rounded-xl overflow-hidden border border-[#30363d] cursor-crosshair"
          style="height: 140px"
          @mousemove="(e) => onMove(idx, e)"
          @mouseleave="onLeave(idx)"
        >
          <!-- MockImage -->
          <div class="w-full h-full flex flex-col gap-2 p-4" :style="{ background: img.colors[0] }">
            <div class="flex gap-1.5 mb-1">
              <div v-for="c in DOT_COLORS" :key="c" class="w-2.5 h-2.5 rounded-full" :style="{ background: c }" />
            </div>
            <div
              v-for="(w, i) in LINE_WIDTHS"
              :key="i"
              class="h-1.5 rounded-full"
              :style="{ width: w + '%', background: i % 2 === 0 ? img.accent : img.colors[2], opacity: 0.7 }"
            />
            <div class="mt-2 grid grid-cols-3 gap-1.5">
              <div
                v-for="n in 3"
                :key="n"
                class="h-6 rounded"
                :style="{ background: img.colors[1], border: `1px solid ${img.accent}30` }"
              />
            </div>
          </div>

          <template v-if="mouseStates[idx]">
            <!-- Lens highlight -->
            <div
              class="absolute rounded-full border-2 border-white/50 pointer-events-none z-10"
              :style="{
                width: LENS + 'px',
                height: LENS + 'px',
                left: getLensX(idx) + 'px',
                top: getLensY(idx) + 'px',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
              }"
            />
            <!-- Zoomed preview -->
            <div
              class="absolute bottom-2 right-2 rounded-lg border-2 border-white/20 overflow-hidden z-20 shadow-xl pointer-events-none"
              style="width: 100px; height: 100px"
            >
              <div
                :style="{
                  width: getContainerWidth(idx) * ZOOM + 'px',
                  height: getContainerHeight(idx) * ZOOM + 'px',
                  transform: `translate(-${mouseStates[idx].x * ZOOM - 50}px, -${mouseStates[idx].y * ZOOM - 50}px)`,
                }"
              >
                <div
                  :style="{
                    width: getContainerWidth(idx) + 'px',
                    height: getContainerHeight(idx) + 'px',
                    transform: `scale(${ZOOM})`,
                    transformOrigin: 'top left',
                  }"
                >
                  <div class="w-full h-full flex flex-col gap-2 p-4" :style="{ background: img.colors[0] }">
                    <div class="flex gap-1.5 mb-1">
                      <div v-for="c in DOT_COLORS" :key="c" class="w-2.5 h-2.5 rounded-full" :style="{ background: c }" />
                    </div>
                    <div
                      v-for="(w, i) in LINE_WIDTHS"
                      :key="i"
                      class="h-1.5 rounded-full"
                      :style="{ width: w + '%', background: i % 2 === 0 ? img.accent : img.colors[2], opacity: 0.7 }"
                    />
                    <div class="mt-2 grid grid-cols-3 gap-1.5">
                      <div
                        v-for="n in 3"
                        :key="n"
                        class="h-6 rounded"
                        :style="{ background: img.colors[1], border: `1px solid ${img.accent}30` }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <p class="text-[11px] text-center text-[#484f58]">Hover over an image to magnify</p>
    </div>
  </div>
</template>
