<script>
import { onMount, onDestroy } from "svelte";

export let count = 120;
export let color = { r: 99, g: 102, b: 241 };
export let connectionDistance = 150;
export let speed = 0.4;
export let mouseRadius = 180;
export let className = "";

let canvasEl;
let particles = [];
let mouse = { x: -9999, y: -9999, active: false };
let animId = 0;
let sizeState = { w: 0, h: 0 };

function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * speed * 2,
    vy: (Math.random() - 0.5) * speed * 2,
    size: 1 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.5,
  };
}

function resize() {
  const parent = canvasEl.parentElement;
  if (!parent) return;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  canvasEl.width = w;
  canvasEl.height = h;
  sizeState = { w, h };
}

function init() {
  resize();
  const { w, h } = sizeState;
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(w, h));
  }
}

function update() {
  const { w, h } = sizeState;
  const mouseForce = 0.08;
  const maxV = speed * 3;

  for (const p of particles) {
    if (mouse.active) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouseRadius && dist > 0) {
        const force = (mouseRadius - dist) / mouseRadius;
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
  const { r, g, b } = color;

  ctx.clearRect(0, 0, w, h);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const bp = particles[j];
      const dx = a.x - bp.x;
      const dy = a.y - bp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < connectionDistance) {
        const alpha = (1 - dist / connectionDistance) * 0.3;
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
    const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouseRadius);
    gradient.addColorStop(0, `rgba(${r},${g},${b},0.08)`);
    gradient.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouseRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function handleMouseMove(e) {
  const rect = canvasEl.getBoundingClientRect();
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

onMount(() => {
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  canvasEl.addEventListener("mousemove", handleMouseMove);
  canvasEl.addEventListener("mouseleave", handleMouseLeave);
  window.addEventListener("resize", handleResize);

  init();

  function loop() {
    update();
    draw(ctx);
    animId = requestAnimationFrame(loop);
  }
  loop();
});

onDestroy(() => {
  cancelAnimationFrame(animId);
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleResize);
  }
});
</script>

<div class={className} style="position: relative; width: 100%; height: 100%;">
  <canvas bind:this={canvasEl} style="display: block; width: 100%; height: 100%;" />
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
    <p style="font-size: 1rem; color: rgba(148,163,184,0.7);">
      Move your mouse to interact with the particles
    </p>
  </div>
</div>

