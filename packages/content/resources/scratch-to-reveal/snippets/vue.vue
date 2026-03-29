<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const W = 380;
const H = 240;
const BRUSH = 40;
const THRESHOLD = 0.55;

const canvas1 = ref(null);
const canvas2 = ref(null);
const state1 = ref({ revealed: false, scratching: false, pct: 0 });
const state2 = ref({ revealed: false, scratching: false, pct: 0 });
const draw1 = { isDrawing: false, lastPos: null };
const draw2 = { isDrawing: false, lastPos: null };
let cleanups = [];

function fillOverlay(canvas, color) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let x = 0; x < W; x += 4)
    for (let y = 0; y < H; y += 4) if (Math.random() > 0.5) ctx.fillRect(x, y, 2, 2);
}

function setupCard(canvas, state, drawRef, overlayColor) {
  if (!canvas) return;
  fillOverlay(canvas, overlayColor);

  const getPos = (e) => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };

  const scratchAt = (pos) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, BRUSH / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const scratchLine = (from, to) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const getPct = () => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let t = 0;
    const total = d.length / 4;
    for (let j = 3; j < d.length; j += 4) if (d[j] === 0) t++;
    return t / total;
  };

  const onStart = (e) => {
    e.preventDefault();
    if (state.value.revealed) return;
    drawRef.isDrawing = true;
    state.value.scratching = true;
    const p = getPos(e);
    drawRef.lastPos = p;
    scratchAt(p);
  };
  const onMove = (e) => {
    e.preventDefault();
    if (!drawRef.isDrawing || state.value.revealed) return;
    const p = getPos(e);
    if (drawRef.lastPos) scratchLine(drawRef.lastPos, p);
    drawRef.lastPos = p;
  };
  const onEnd = () => {
    if (!drawRef.isDrawing) return;
    drawRef.isDrawing = false;
    drawRef.lastPos = null;
    const p = getPct();
    state.value.pct = p;
    if (p >= THRESHOLD && !state.value.revealed) state.value.revealed = true;
  };

  canvas.addEventListener("mousedown", onStart);
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mouseup", onEnd);
  canvas.addEventListener("mouseleave", onEnd);
  canvas.addEventListener("touchstart", onStart, { passive: false });
  canvas.addEventListener("touchmove", onMove, { passive: false });
  canvas.addEventListener("touchend", onEnd);
  canvas.addEventListener("touchcancel", onEnd);

  cleanups.push(() => {
    canvas.removeEventListener("mousedown", onStart);
    canvas.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("mouseup", onEnd);
    canvas.removeEventListener("mouseleave", onEnd);
    canvas.removeEventListener("touchstart", onStart);
    canvas.removeEventListener("touchmove", onMove);
    canvas.removeEventListener("touchend", onEnd);
    canvas.removeEventListener("touchcancel", onEnd);
  });
}

function reset1() {
  state1.value = { revealed: false, scratching: false, pct: 0 };
  draw1.isDrawing = false;
  draw1.lastPos = null;
  setTimeout(() => fillOverlay(canvas1.value, "#1a1a2e"), 10);
}

function reset2() {
  state2.value = { revealed: false, scratching: false, pct: 0 };
  draw2.isDrawing = false;
  draw2.lastPos = null;
  setTimeout(() => fillOverlay(canvas2.value, "#0a2f1f"), 10);
}

onMounted(() => {
  setupCard(canvas1.value, state1, draw1, "#1a1a2e");
  setupCard(canvas2.value, state2, draw2, "#0a2f1f");
});

onUnmounted(() => cleanups.forEach((fn) => fn()));
</script>

<template>
  <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0a0a0a; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; padding: 2rem; gap: 2rem;">
    <h1 style="font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-align: center; line-height: 1.2;">Scratch to Reveal</h1>
    <p style="color: rgba(148,163,184,0.8); font-size: 1.125rem; margin-top: -0.5rem;">Drag across the card to reveal what's hidden</p>

    <div style="display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center;">
      <!-- Card 1 -->
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
        <div style="position: relative; width: 380px; height: 240px; border-radius: 20px; overflow: hidden; cursor: crosshair; user-select: none; -webkit-user-select: none; touch-action: none; box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px -15px rgba(0,0,0,0.5);">
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 2rem; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%); z-index: 1;">
            <span style="font-size: 3rem; line-height: 1;">&#127881;</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: #e0e7ff; text-align: center;">You Won!</span>
            <span style="background: rgba(255,255,255,0.1); border: 1px dashed rgba(255,255,255,0.3); border-radius: 8px; padding: 0.5rem 1.5rem; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 1.25rem; font-weight: 700; color: #fbbf24; letter-spacing: 0.15em;">STEAL2026</span>
            <span style="font-size: 0.9rem; color: rgba(196,181,253,0.8); text-align: center;">Use this code for 40% off</span>
          </div>
          <canvas ref="canvas1" :style="{ position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: 2, borderRadius: '20px', opacity: state1.revealed ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: state1.revealed ? 'none' : 'auto' }"></canvas>
          <div v-if="!state1.scratching && !state1.revealed" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; z-index: 3; pointer-events: none;">
            <span style="font-size: 2rem; color: rgba(255,255,255,0.5);">&#9997;</span>
            <span style="font-size: 0.85rem; color: rgba(255,255,255,0.4); font-weight: 500;">Scratch here</span>
          </div>
        </div>
        <div style="width: 380px; height: 4px; background: rgba(255,255,255,0.04); border-radius: 2px; overflow: hidden;">
          <div :style="{ height: '100%', background: '#818cf8', borderRadius: '2px', width: Math.round(state1.pct * 100) + '%', transition: 'width 0.1s ease' }"></div>
        </div>
        <div style="width: 380px; display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(148,163,184,0.5);">
          <span>Scratched</span><span>{{ Math.round(state1.pct * 100) }}%</span>
        </div>
      </div>

      <!-- Card 2 -->
      <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
        <div style="position: relative; width: 380px; height: 240px; border-radius: 20px; overflow: hidden; cursor: crosshair; user-select: none; -webkit-user-select: none; touch-action: none; box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px -15px rgba(0,0,0,0.5);">
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 2rem; background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%); z-index: 1;">
            <span style="font-size: 3rem; line-height: 1;">&#11088;</span>
            <span style="font-size: 1.5rem; font-weight: 800; color: #e0e7ff; text-align: center;">Secret Message</span>
            <span style="font-size: 0.9rem; color: rgba(167,243,208,0.8); text-align: center; max-width: 260px; line-height: 1.6;">The best UI components are the ones you steal and make your own.</span>
          </div>
          <canvas ref="canvas2" :style="{ position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: 2, borderRadius: '20px', opacity: state2.revealed ? 0 : 1, transition: 'opacity 0.6s ease', pointerEvents: state2.revealed ? 'none' : 'auto' }"></canvas>
          <div v-if="!state2.scratching && !state2.revealed" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; z-index: 3; pointer-events: none;">
            <span style="font-size: 2rem; color: rgba(255,255,255,0.5);">&#9997;</span>
            <span style="font-size: 0.85rem; color: rgba(255,255,255,0.4); font-weight: 500;">Scratch here</span>
          </div>
        </div>
        <div style="width: 380px; height: 4px; background: rgba(255,255,255,0.04); border-radius: 2px; overflow: hidden;">
          <div :style="{ height: '100%', background: '#818cf8', borderRadius: '2px', width: Math.round(state2.pct * 100) + '%', transition: 'width 0.1s ease' }"></div>
        </div>
        <div style="width: 380px; display: flex; justify-content: space-between; font-size: 0.75rem; color: rgba(148,163,184,0.5);">
          <span>Scratched</span><span>{{ Math.round(state2.pct * 100) }}%</span>
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 1rem;">
      <button @click="reset1" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(148,163,184,0.8); padding: 0.6rem 1.5rem; border-radius: 10px; font-size: 0.875rem; font-weight: 500; cursor: pointer; font-family: inherit;">Reset Card 1</button>
      <button @click="reset2" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(148,163,184,0.8); padding: 0.6rem 1.5rem; border-radius: 10px; font-size: 0.875rem; font-weight: 500; cursor: pointer; font-family: inherit;">Reset Card 2</button>
    </div>
  </div>
</template>
