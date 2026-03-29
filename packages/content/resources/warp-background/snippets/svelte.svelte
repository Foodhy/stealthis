<script>
import { onMount, onDestroy } from "svelte";

export let gridCols = 40;
export let gridRows = 30;
export let speed = 0.0008;
export let amplitudeX = 30;
export let amplitudeY = 25;
export let frequency = 0.06;
export let color = [139, 92, 246];

let canvasEl;
let animId = 0;
let sizeState = { width: 0, height: 0, dpr: 1 };
let resizeTimer;

function resize() {
  if (!canvasEl) return;
  const parent = canvasEl.parentElement;
  if (!parent) return;
  const dpr = window.devicePixelRatio || 1;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  canvasEl.width = w * dpr;
  canvasEl.height = h * dpr;
  canvasEl.style.width = w + "px";
  canvasEl.style.height = h + "px";
  sizeState = { width: w, height: h, dpr };
}

function getWarpedPoint(col, row, t) {
  const { width, height } = sizeState;
  const baseX = (col / gridCols) * width;
  const baseY = (row / gridRows) * height;

  const dx1 = Math.sin(baseY * frequency + t * 1.3) * amplitudeX;
  const dy1 = Math.cos(baseX * frequency + t * 1.1) * amplitudeY;
  const dx2 =
    Math.sin(baseX * frequency * 1.5 + baseY * frequency * 0.5 + t * 0.7) * amplitudeX * 0.5;
  const dy2 =
    Math.cos(baseY * frequency * 1.3 + baseX * frequency * 0.4 + t * 0.9) * amplitudeY * 0.5;
  const dx3 = Math.sin(baseX * frequency * 3 + t * 2.1) * amplitudeX * 0.15;
  const dy3 = Math.cos(baseY * frequency * 2.8 + t * 1.8) * amplitudeY * 0.15;

  return {
    x: baseX + dx1 + dx2 + dx3,
    y: baseY + dy1 + dy2 + dy3,
    displacement: Math.sqrt((dx1 + dx2) ** 2 + (dy1 + dy2) ** 2),
  };
}

onMount(() => {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;
  resize();

  const [cR, cG, cB] = color;

  function draw(timestamp) {
    const time = timestamp * speed;
    const { width, height, dpr } = sizeState;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const points = [];
    for (let r = 0; r <= gridRows; r++) {
      points[r] = [];
      for (let c = 0; c <= gridCols; c++) {
        points[r][c] = getWarpedPoint(c, r, time);
      }
    }

    const maxAmp = amplitudeX + amplitudeY;

    for (let r = 0; r <= gridRows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= gridCols; c++) {
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

    for (let c = 0; c <= gridCols; c++) {
      ctx.beginPath();
      let totalDisp = 0;
      for (let r = 0; r <= gridRows; r++) {
        const pt = points[r][c];
        if (r === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
        totalDisp += pt.displacement;
      }
      const avg = totalDisp / (gridRows + 1);
      const alpha = 0.03 + (avg / maxAmp) * 0.15;
      ctx.strokeStyle = `rgba(${cR}, ${cG}, ${cB}, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    for (let r = 0; r <= gridRows; r += 2) {
      for (let c = 0; c <= gridCols; c += 2) {
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

  return () => {
    cancelAnimationFrame(animId);
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", handleResize);
  };
});

onDestroy(() => {
  cancelAnimationFrame(animId);
  clearTimeout(resizeTimer);
});
</script>

<div
  style="width: 100vw; height: 100vh; background: #0a0a0a; display: grid; place-items: center; position: relative;"
>
  <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
    <canvas
      bind:this={canvasEl}
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
