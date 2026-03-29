<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const canvasRef = ref(null);
const PERSPECTIVE = 600;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const DOT_COUNT = 800;
const DOT_RADIUS = 1.8;
const AUTO_SPEED = 0.003;
const COLOR = { r: 6, g: 182, b: 212 };

function generateFibonacciSphere(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

function rotatePoint(p, ry, rx) {
  const x = p.x * Math.cos(ry) - p.z * Math.sin(ry);
  const z = p.x * Math.sin(ry) + p.z * Math.cos(ry);
  const y2 = p.y * Math.cos(rx) - z * Math.sin(rx);
  const z2 = p.y * Math.sin(rx) + z * Math.cos(rx);
  return { x, y: y2, z: z2 };
}

let animId = null;
let dragTimeout = null;
const points = generateFibonacciSphere(DOT_COUNT);
const rot = { y: 0, x: 0.3 };
const drag = { active: false, lastX: 0, lastY: 0, autoRotate: true };

function onDown(x, y) {
  drag.active = true;
  drag.lastX = x;
  drag.lastY = y;
  drag.autoRotate = false;
  clearTimeout(dragTimeout);
}

function onMove(x, y) {
  if (!drag.active) return;
  const dx = x - drag.lastX;
  const dy = y - drag.lastY;
  rot.y += dx * 0.005;
  rot.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rot.x + dy * 0.005));
  drag.lastX = x;
  drag.lastY = y;
}

function onUp() {
  drag.active = false;
  dragTimeout = setTimeout(() => {
    drag.autoRotate = true;
  }, 2000);
}

function handleMouseDown(e) {
  onDown(e.clientX, e.clientY);
}
function handleMouseMove(e) {
  onMove(e.clientX, e.clientY);
}
function handleTouchStart(e) {
  onDown(e.touches[0].clientX, e.touches[0].clientY);
}
function handleTouchMove(e) {
  onMove(e.touches[0].clientX, e.touches[0].clientY);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth : window.innerWidth;
    const h = parent ? parent.clientHeight : window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const radius = Math.min(w, h) * 0.3;

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(w / 2, h / 2, radius * 0.2, w / 2, h / 2, radius * 1.2);
    grad.addColorStop(0, `rgba(${COLOR.r}, ${COLOR.g}, ${COLOR.b}, 0.15)`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (drag.autoRotate && !drag.active) {
      rot.y += AUTO_SPEED;
    }

    const projected = points.map((p) => {
      const r = rotatePoint(p, rot.y, rot.x);
      const scale = PERSPECTIVE / (PERSPECTIVE + r.z * radius);
      return { x: r.x * radius * scale + w / 2, y: r.y * radius * scale + h / 2, scale, z: r.z };
    });
    projected.sort((a, b) => a.z - b.z);

    for (const p of projected) {
      const alpha = Math.max(0.08, (p.z + 1) / 2);
      const ds = DOT_RADIUS * p.scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y, ds, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR.r}, ${COLOR.g}, ${COLOR.b}, ${alpha})`;
      ctx.fill();

      if (p.z > 0.3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, ds * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLOR.r}, ${COLOR.g}, ${COLOR.b}, ${alpha * 0.15})`;
        ctx.fill();
      }
    }

    animId = requestAnimationFrame(draw);
  }

  canvas.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
  canvas.addEventListener("touchend", onUp);

  draw();
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
  clearTimeout(dragTimeout);
  window.removeEventListener("resize", () => {});
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", onUp);
});
</script>

<template>
  <div style="width:100vw;height:100vh;background:#0a0a0a;position:relative;font-family:system-ui,-apple-system,sans-serif">
    <canvas ref="canvasRef" style="width:100%;height:100%;cursor:grab;display:block"></canvas>
    <div style="position:absolute;top:12%;left:0;right:0;text-align:center;pointer-events:none;z-index:10">
      <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#a5f3fc 0%,#06b6d4 50%,#0891b2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0 0 0.5rem 0">
        3D Globe
      </h1>
      <p style="font-size:clamp(0.875rem,2vw,1.125rem);color:rgba(148,163,184,0.8);margin:0">
        Drag to explore — pure canvas, no libraries
      </p>
    </div>
  </div>
</template>
