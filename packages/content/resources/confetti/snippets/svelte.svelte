<script>
import { onMount, onDestroy } from "svelte";

const DEFAULT_COLORS = [
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#ec4899",
  "#fde68a",
  "#60a5fa",
];
const SHAPES = ["rect", "circle", "strip"];
const particleCount = 150;
const gravity = 0.25;
const drag = 0.98;

let canvasEl;
let particles = [];
let animRef = null;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

onMount(() => {
  if (!canvasEl) return;
  const resize = () => {
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
  return () => window.removeEventListener("resize", resize);
});

function tick() {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += gravity;
    p.vx *= drag;
    p.vy *= drag;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.opacity -= p.decay;

    if (p.opacity <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    } else if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size * 0.15, p.size, p.size * 0.3);
    }
    ctx.restore();
  }

  if (particles.length > 0) {
    animRef = requestAnimationFrame(tick);
  } else {
    animRef = null;
  }
}

function fire(x, y) {
  for (let i = 0; i < particleCount; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(6, 14);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * randomRange(0.5, 1.5),
      vy: Math.sin(angle) * speed * randomRange(0.5, 1) - 4,
      color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: randomRange(4, 8),
      rotation: randomRange(0, Math.PI * 2),
      rotationSpeed: randomRange(-0.15, 0.15),
      opacity: 1,
      decay: randomRange(0.005, 0.015),
    });
  }
  if (!animRef) tick();
}

function handleClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  fire(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

onDestroy(() => {
  if (animRef) cancelAnimationFrame(animRef);
});
</script>

<div style="width: 100vw; height: 100vh; background: #0a0a0a; display: grid; place-items: center; position: relative; font-family: system-ui, -apple-system, sans-serif;">
  <canvas
    bind:this={canvasEl}
    style="position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"
  ></canvas>
  <div style="position: relative; z-index: 10; text-align: center;">
    <h1 style="font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem;">
      Confetti
    </h1>
    <p style="font-size: clamp(0.875rem, 2vw, 1.125rem); color: rgba(148, 163, 184, 0.8); margin-bottom: 2rem;">
      Click the button for a burst of joy
    </p>
    <button
      on:click={handleClick}
      style="padding: 0.875rem 2.5rem; font-size: 1.125rem; font-weight: 700; color: #0a0a0a; background: linear-gradient(135deg, #fde68a, #f59e0b); border: none; border-radius: 9999px; cursor: pointer; box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); transition: transform 0.2s ease, box-shadow 0.2s ease;"
      on:mouseenter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.5)'; }}
      on:mouseleave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.3)'; }}
    >
      Celebrate!
    </button>
  </div>
</div>
