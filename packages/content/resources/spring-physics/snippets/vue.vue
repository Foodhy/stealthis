<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const stiffness = ref(180);
const damping = ref(12);
const mass = ref(1);

const areaEl = ref(null);
const ballEl = ref(null);
const lineEl = ref(null);
const velBarEl = ref(null);

let state = {
  posX: 0,
  posY: 0,
  velX: 0,
  velY: 0,
  isDragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
};

let rafId = null;
let lastTime = 0;

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.032);
  lastTime = now;
  const s = state;

  if (!s.isDragging) {
    const fx = -stiffness.value * s.posX - damping.value * s.velX;
    const fy = -stiffness.value * s.posY - damping.value * s.velY;
    s.velX += (fx / mass.value) * dt;
    s.velY += (fy / mass.value) * dt;
    s.posX += s.velX * dt;
    s.posY += s.velY * dt;

    if (
      Math.abs(s.posX) < 0.01 &&
      Math.abs(s.posY) < 0.01 &&
      Math.abs(s.velX) < 0.01 &&
      Math.abs(s.velY) < 0.01
    ) {
      s.posX = 0;
      s.posY = 0;
      s.velX = 0;
      s.velY = 0;
    }
  }

  if (ballEl.value) {
    ballEl.value.style.transform = `translate(calc(-50% + ${s.posX}px), calc(-50% + ${s.posY}px))`;
  }

  if (lineEl.value) {
    const dist = Math.sqrt(s.posX * s.posX + s.posY * s.posY);
    const angle = Math.atan2(s.posY, s.posX) * (180 / Math.PI);
    lineEl.value.style.width = `${dist}px`;
    lineEl.value.style.transform = `rotate(${angle}deg)`;
  }

  if (velBarEl.value) {
    const speed = Math.sqrt(s.velX * s.velX + s.velY * s.velY);
    velBarEl.value.style.width = `${Math.min(speed / 8, 100)}%`;
  }

  rafId = requestAnimationFrame(loop);
}

function onPointerDown(e) {
  state.isDragging = true;
  state.velX = 0;
  state.velY = 0;
  e.target.setPointerCapture(e.pointerId);

  if (areaEl.value) {
    const rect = areaEl.value.getBoundingClientRect();
    state.dragOffsetX = e.clientX - rect.left - rect.width / 2 - state.posX;
    state.dragOffsetY = e.clientY - rect.top - rect.height / 2 - state.posY;
  }
}

function onPointerMove(e) {
  if (!state.isDragging || !areaEl.value) return;
  const rect = areaEl.value.getBoundingClientRect();
  state.posX = e.clientX - rect.left - rect.width / 2 - state.dragOffsetX;
  state.posY = e.clientY - rect.top - rect.height / 2 - state.dragOffsetY;
}

function onPointerUp() {
  state.isDragging = false;
}

onMounted(() => {
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
});

const sliders = [
  { key: "stiffness", label: "Stiffness", min: 20, max: 500 },
  { key: "damping", label: "Damping", min: 1, max: 40 },
  { key: "mass", label: "Mass", min: 1, max: 10 },
];

function getVal(key) {
  if (key === "stiffness") return stiffness.value;
  if (key === "damping") return damping.value;
  return mass.value;
}

function setVal(key, v) {
  if (key === "stiffness") stiffness.value = Number(v);
  else if (key === "damping") damping.value = Number(v);
  else mass.value = Number(v);
}
</script>

<template>
  <div style="min-height:100vh;background:#0a0a0a;display:grid;place-items:center;padding:2rem;font-family:system-ui,-apple-system,sans-serif;color:#e4e4e7;overflow:hidden">
    <div style="width:min(520px,100%);display:flex;flex-direction:column;gap:1.5rem;align-items:center">
      <div style="text-align:center">
        <h2 style="font-size:1.25rem;font-weight:700;color:#f4f4f5">Spring Physics</h2>
        <p style="font-size:0.8rem;color:#52525b;margin-top:0.25rem">Drag the ball and release -- it springs back with real physics</p>
      </div>

      <div
        ref="areaEl"
        style="width:100%;height:340px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:1rem;position:relative;overflow:hidden"
      >
        <!-- Origin dot -->
        <div style="position:absolute;width:12px;height:12px;border-radius:50%;background:rgba(109,40,217,0.3);border:2px solid rgba(109,40,217,0.5);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none"></div>
        <!-- Spring line -->
        <div
          ref="lineEl"
          style="position:absolute;top:50%;left:50%;transform-origin:0 0;height:2px;background:linear-gradient(90deg,rgba(109,40,217,0.4),rgba(109,40,217,0.1));pointer-events:none;border-radius:1px;width:0"
        ></div>
        <!-- Ball -->
        <div
          ref="ballEl"
          @pointerdown="onPointerDown"
          style="position:absolute;width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#a78bfa,#6d28d9);box-shadow:0 0 30px rgba(109,40,217,0.4),0 0 60px rgba(109,40,217,0.15);top:50%;left:50%;transform:translate(-50%,-50%);cursor:grab;user-select:none;touch-action:none;display:grid;place-items:center;font-size:0.65rem;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.05em"
        >DRAG</div>
      </div>

      <!-- Velocity bar -->
      <div style="width:100%;height:4px;background:rgba(255,255,255,0.04);border-radius:2px;overflow:hidden">
        <div
          ref="velBarEl"
          style="height:100%;background:linear-gradient(90deg,#6d28d9,#a78bfa);border-radius:2px;width:0%;transition:width 0.05s"
        ></div>
      </div>

      <!-- Controls -->
      <div style="width:100%;display:flex;flex-direction:column;gap:0.75rem">
        <div v-for="s in sliders" :key="s.key" style="display:flex;align-items:center;gap:0.75rem">
          <span style="font-size:0.75rem;font-weight:600;color:#71717a;min-width:80px;text-transform:uppercase;letter-spacing:0.06em">{{ s.label }}</span>
          <input
            type="range"
            :min="s.min"
            :max="s.max"
            :value="getVal(s.key)"
            @input="(e) => setVal(s.key, e.target.value)"
            style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;outline:none;-webkit-appearance:none;appearance:none"
          />
          <span style="font-size:0.75rem;font-weight:600;color:#a78bfa;min-width:40px;text-align:right;font-variant-numeric:tabular-nums">{{ getVal(s.key) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
