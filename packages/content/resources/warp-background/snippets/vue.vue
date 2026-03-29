<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  gridCols: { type: Number, default: 40 },
  gridRows: { type: Number, default: 30 },
  speed: { type: Number, default: 0.0008 },
  amplitudeX: { type: Number, default: 30 },
  amplitudeY: { type: Number, default: 25 },
  frequency: { type: Number, default: 0.06 },
  color: { type: Array, default: () => [139, 92, 246] },
});

const canvasEl = ref(null);
let animId = 0;
let sizeState = { width: 0, height: 0, dpr: 1 };
let resizeTimer;

function resize() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  const dpr = window.devicePixelRatio || 1;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  sizeState = { width: w, height: h, dpr };
}

function getWarpedPoint(col, row, t) {
  const { width, height } = sizeState;
  const baseX = (col / props.gridCols) * width;
  const baseY = (row / props.gridRows) * height;

  const dx1 = Math.sin(baseY * props.frequency + t * 1.3) * props.amplitudeX;
  const dy1 = Math.cos(baseX * props.frequency + t * 1.1) * props.amplitudeY;
  const dx2 =
    Math.sin(baseX * props.frequency * 1.5 + baseY * props.frequency * 0.5 + t * 0.7) *
    props.amplitudeX *
    0.5;
  const dy2 =
    Math.cos(baseY * props.frequency * 1.3 + baseX * props.frequency * 0.4 + t * 0.9) *
    props.amplitudeY *
    0.5;
  const dx3 = Math.sin(baseX * props.frequency * 3 + t * 2.1) * props.amplitudeX * 0.15;
  const dy3 = Math.cos(baseY * props.frequency * 2.8 + t * 1.8) * props.amplitudeY * 0.15;

  return {
    x: baseX + dx1 + dx2 + dx3,
    y: baseY + dy1 + dy2 + dy3,
    displacement: Math.sqrt((dx1 + dx2) ** 2 + (dy1 + dy2) ** 2),
  };
}

onMounted(() => {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  resize();

  const [cR, cG, cB] = props.color;

  function draw(timestamp) {
    const time = timestamp * props.speed;
    const { width, height, dpr } = sizeState;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const points = [];
    for (let r = 0; r <= props.gridRows; r++) {
      points[r] = [];
      for (let c = 0; c <= props.gridCols; c++) {
        points[r][c] = getWarpedPoint(c, r, time);
      }
    }

    const maxAmp = props.amplitudeX + props.amplitudeY;

    for (let r = 0; r <= props.gridRows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= props.gridCols; c++) {
        const pt = points[r][c];
        if (c === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      const avg = points[r].reduce((s, p) => s + p.displacement, 0) / points[r].length;
      const alpha = 0.03 + (avg / maxAmp) * 0.15;
      ctx.strokeStyle = `rgba(${cR}, ${cG}, ${cB}, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    for (let c = 0; c <= props.gridCols; c++) {
      ctx.beginPath();
      let totalDisp = 0;
      for (let r = 0; r <= props.gridRows; r++) {
        const pt = points[r][c];
        if (r === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
        totalDisp += pt.displacement;
      }
      const avg = totalDisp / (props.gridRows + 1);
      const alpha = 0.03 + (avg / maxAmp) * 0.15;
      ctx.strokeStyle = `rgba(${cR}, ${cG}, ${cB}, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    for (let r = 0; r <= props.gridRows; r += 2) {
      for (let c = 0; c <= props.gridCols; c += 2) {
        const pt = points[r][c];
        const norm = pt.displacement / maxAmp;
        if (norm > 0.3) {
          const dotAlpha = (norm - 0.3) * 0.6;
          const dotRadius = 1 + norm * 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cR}, ${cG}, ${cB}, ${dotAlpha.toFixed(3)})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dotRadius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cR}, ${cG}, ${cB}, ${(dotAlpha * 0.15).toFixed(3)})`;
          ctx.fill();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  animId = requestAnimationFrame(draw);

  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  };
  window.addEventListener("resize", handleResize);

  // Store cleanup for onUnmounted
  window.__warpCleanup = () => {
    cancelAnimationFrame(animId);
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", handleResize);
  };
});

onUnmounted(() => {
  if (window.__warpCleanup) {
    window.__warpCleanup();
    delete window.__warpCleanup;
  }
});
</script>

<template>
  <div
    style="width: 100vw; height: 100vh; background: #0a0a0a; display: grid; place-items: center; position: relative;"
  >
    <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
      <canvas
        ref="canvasEl"
        style="position: absolute; inset: 0; width: 100%; height: 100%; display: block;"
      />
      <div
        style="position: absolute; inset: 0; background: radial-gradient(ellipse 50% 50% at 50% 50%, transparent 20%, rgba(10,10,10,0.5) 60%, #0a0a0a 85%); pointer-events: none;"
      />
    </div>
    <div
      style="position: absolute; z-index: 10; text-align: center; pointer-events: none;"
    >
      <h1
        style="font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(135deg, #fde68a 0%, #f59e0b 40%, #d946ef 80%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem; font-family: system-ui, -apple-system, sans-serif;"
      >
        Warp Background
      </h1>
      <p
        style="font-size: clamp(0.875rem, 2vw, 1.125rem); color: rgba(148, 163, 184, 0.8); font-family: system-ui, -apple-system, sans-serif;"
      >
        Flowing mesh distortions powered by layered sine waves
      </p>
    </div>
  </div>
</template>
