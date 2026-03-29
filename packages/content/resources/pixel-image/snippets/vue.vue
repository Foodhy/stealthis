<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  width: { type: Number, default: 400 },
  height: { type: Number, default: 300 },
  pixelSize: { type: Number, default: 4 },
  animationDuration: { type: Number, default: 2000 },
});

const canvasRef = ref(null);
let pixels = [];
let animId = 0;
let scattered = true;
let animating = false;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
  return t * t * t;
}

function generateAndExtract() {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = props.width;
  tempCanvas.height = props.height;
  const tctx = tempCanvas.getContext("2d");

  const bg = tctx.createLinearGradient(0, 0, props.width, props.height);
  bg.addColorStop(0, "#1e1b4b");
  bg.addColorStop(0.3, "#312e81");
  bg.addColorStop(0.6, "#4338ca");
  bg.addColorStop(1, "#6366f1");
  tctx.fillStyle = bg;
  tctx.fillRect(0, 0, props.width, props.height);

  for (let i = 0; i < 6; i++) {
    const cx = props.width * (0.15 + Math.random() * 0.7);
    const cy = props.height * (0.15 + Math.random() * 0.7);
    const r = 20 + Math.random() * 60;
    const grad = tctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `rgba(${167 + Math.random() * 60},${139 + Math.random() * 60},250,0.6)`);
    grad.addColorStop(1, "transparent");
    tctx.beginPath();
    tctx.arc(cx, cy, r, 0, Math.PI * 2);
    tctx.fillStyle = grad;
    tctx.fill();
  }

  tctx.save();
  tctx.translate(props.width / 2, props.height / 2);
  tctx.fillStyle = "rgba(255,255,255,0.15)";
  tctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(angle) * 50;
    const y = Math.sin(angle) * 50;
    if (i === 0) tctx.moveTo(x, y);
    else tctx.lineTo(x, y);
  }
  tctx.closePath();
  tctx.fill();
  tctx.restore();

  const imageData = tctx.getImageData(0, 0, props.width, props.height);
  const data = imageData.data;
  pixels = [];

  for (let y = 0; y < props.height; y += props.pixelSize) {
    for (let x = 0; x < props.width; x += props.pixelSize) {
      const idx = (y * props.width + x) * 4;
      const r = data[idx],
        g = data[idx + 1],
        b = data[idx + 2],
        a = data[idx + 3];
      if (a < 10) continue;
      pixels.push({
        targetX: x,
        targetY: y,
        currentX: Math.random() * props.width * 2 - props.width * 0.5,
        currentY: Math.random() * props.height * 2 - props.height * 0.5,
        startX: 0,
        startY: 0,
        color: `rgba(${r},${g},${b},${a / 255})`,
        delay: Math.random() * 0.3,
      });
    }
  }
}

function drawCurrent() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, props.width, props.height);
  for (const p of pixels) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.currentX, p.currentY, props.pixelSize, props.pixelSize);
  }
}

function startAnimation() {
  if (animating) return;
  animating = true;
  const start = performance.now();
  const wasScattered = scattered;

  for (const p of pixels) {
    p.startX = p.currentX;
    p.startY = p.currentY;
  }

  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / props.animationDuration, 1);

    ctx.clearRect(0, 0, props.width, props.height);

    for (const p of pixels) {
      const adj = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
      if (wasScattered) {
        const ease = easeOutCubic(adj);
        p.currentX = p.startX + (p.targetX - p.startX) * ease;
        p.currentY = p.startY + (p.targetY - p.startY) * ease;
      } else {
        const ease = easeInCubic(adj);
        const rx = Math.random() * props.width * 2 - props.width * 0.5;
        const ry = Math.random() * props.height * 2 - props.height * 0.5;
        p.currentX = p.startX + (rx - p.startX) * ease;
        p.currentY = p.startY + (ry - p.startY) * ease;
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = wasScattered ? adj : 1 - adj * 0.5;
      ctx.fillRect(p.currentX, p.currentY, props.pixelSize, props.pixelSize);
    }
    ctx.globalAlpha = 1;

    if (progress < 1) {
      animId = requestAnimationFrame(animate);
    } else {
      animating = false;
      scattered = !wasScattered;
    }
  }

  animId = requestAnimationFrame(animate);
}

let timer;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.width = props.width;
  canvas.height = props.height;
  generateAndExtract();
  drawCurrent();
  timer = setTimeout(() => startAnimation(), 500);
});

onUnmounted(() => {
  clearTimeout(timer);
  cancelAnimationFrame(animId);
});
</script>

<template>
  <canvas
    ref="canvasRef"
    @click="startAnimation"
    style="cursor: pointer; display: block"
  />
</template>

<style scoped>
</style>
