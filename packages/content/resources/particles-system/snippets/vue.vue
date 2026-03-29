<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  count: { type: Number, default: 120 },
  color: { type: Object, default: () => ({ r: 99, g: 102, b: 241 }) },
  connectionDistance: { type: Number, default: 150 },
  speed: { type: Number, default: 0.4 },
  mouseRadius: { type: Number, default: 180 },
});

const canvasRef = ref(null);
let particles = [];
let mouse = { x: -9999, y: -9999, active: false };
let animId = 0;
let sizeState = { w: 0, h: 0 };

function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * props.speed * 2,
    vy: (Math.random() - 0.5) * props.speed * 2,
    size: 1 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.5,
  };
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  canvas.width = w;
  canvas.height = h;
  sizeState = { w, h };
}

function init() {
  resize();
  const { w, h } = sizeState;
  particles = [];
  for (let i = 0; i < props.count; i++) {
    particles.push(createParticle(w, h));
  }
}

function update() {
  const { w, h } = sizeState;
  const mouseForce = 0.08;
  const maxV = props.speed * 3;

  for (const p of particles) {
    if (mouse.active) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < props.mouseRadius && dist > 0) {
        const force = (props.mouseRadius - dist) / props.mouseRadius;
        p.vx += (dx / dist) * force * mouseForce;
        p.vy += (dy / dist) * force * mouseForce;
      }
    }
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
    p.vy = Math.max(-maxV, Math.min(maxV, p.vy));
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) {
      p.x = 0;
      p.vx *= -1;
    }
    if (p.x > w) {
      p.x = w;
      p.vx *= -1;
    }
    if (p.y < 0) {
      p.y = 0;
      p.vy *= -1;
    }
    if (p.y > h) {
      p.y = h;
      p.vy *= -1;
    }
  }
}

function draw(ctx) {
  const { w, h } = sizeState;
  const { r, g, b } = props.color;

  ctx.clearRect(0, 0, w, h);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const bp = particles[j];
      const dx = a.x - bp.x;
      const dy = a.y - bp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < props.connectionDistance) {
        const alpha = (1 - dist / props.connectionDistance) * 0.3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(bp.x, bp.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity * 0.15})`;
    ctx.fill();
  }

  if (mouse.active) {
    const gradient = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      props.mouseRadius
    );
    gradient.addColorStop(0, `rgba(${r},${g},${b},0.08)`);
    gradient.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, props.mouseRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function handleMouseMove(e) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
}

function handleMouseLeave() {
  mouse.active = false;
}

function handleResize() {
  resize();
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseleave", handleMouseLeave);
  window.addEventListener("resize", handleResize);

  init();

  function loop() {
    update();
    draw(ctx);
    animId = requestAnimationFrame(loop);
  }
  loop();
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseleave", handleMouseLeave);
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div style="position: relative; width: 100%; height: 100%">
    <canvas ref="canvasRef" style="display: block; width: 100%; height: 100%" />
    <div
      style="
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 10;
      "
    >
      <h1
        style="
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #e0e7ff 0%, #818cf8 50%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        "
      >
        Particles System
      </h1>
      <p style="font-size: 1rem; color: rgba(148,163,184,0.7)">
        Move your mouse to interact with the particles
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
