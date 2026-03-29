<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const DEFAULT_EMOJIS = [
  "\u2728",
  "\u2B50",
  "\u2764\uFE0F",
  "\uD83D\uDD25",
  "\uD83C\uDF89",
  "\uD83C\uDF1F",
  "\uD83D\uDCAB",
  "\uD83C\uDF08",
  "\uD83D\uDE80",
  "\uD83C\uDF88",
  "\uD83C\uDF81",
  "\uD83C\uDF82",
  "\uD83C\uDF86",
  "\uD83C\uDF87",
  "\u2604\uFE0F",
];

const particleCount = 15;
const gravity = 0.12;
const fadeSpeed = 0.015;

const containerEl = ref(null);
let particles = [];
let animRunning = false;
let animFrame = 0;

function animate() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += gravity;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x += p.vx;
    p.y += p.vy;
    p.opacity -= fadeSpeed;
    p.rotation += p.rotationSpeed;

    if (p.opacity <= 0) {
      p.el.parentNode?.removeChild(p.el);
      particles.splice(i, 1);
      continue;
    }

    p.el.style.transform = `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`;
    p.el.style.left = `${p.x}px`;
    p.el.style.top = `${p.y}px`;
    p.el.style.opacity = String(p.opacity);
  }

  if (particles.length > 0) {
    animFrame = requestAnimationFrame(animate);
  } else {
    animRunning = false;
  }
}

function spawnParticles(x, y) {
  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement("span");
    el.style.position = "fixed";
    el.style.pointerEvents = "none";
    el.style.zIndex = "9999";
    el.style.lineHeight = "1";
    el.style.userSelect = "none";
    el.style.willChange = "transform, opacity";
    el.style.fontSize = `${14 + Math.random() * 16}px`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)];
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;

    particles.push({
      el,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      opacity: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      scale: 0.5 + Math.random() * 0.8,
    });
  }

  if (!animRunning) {
    animRunning = true;
    animFrame = requestAnimationFrame(animate);
  }
}

function handleClick(e) {
  spawnParticles(e.clientX, e.clientY);
}

onMounted(() => {
  containerEl.value?.addEventListener("click", handleClick);
});

onUnmounted(() => {
  containerEl.value?.removeEventListener("click", handleClick);
  cancelAnimationFrame(animFrame);
  for (const p of particles) {
    p.el.parentNode?.removeChild(p.el);
  }
  particles = [];
});
</script>

<template>
  <div ref="containerEl">
    <div style="width: 100vw; height: 100vh; background: #0a0a0a; display: grid; place-items: center; font-family: system-ui, -apple-system, sans-serif; color: #f1f5f9;">
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
        <h1 style="font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(135deg, #fbbf24 0%, #f97316 40%, #ef4444 70%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          Cool Mode
        </h1>
        <p style="font-size: 1rem; color: rgba(148,163,184,0.7);">Click anywhere for emoji explosions!</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
          <button style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; font-family: inherit; color: white; transition: all 0.2s; background: rgba(239,68,68,0.15);">
            <span>&#10084;&#65039;</span> Like
          </button>
          <button style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: 1px solid rgba(250,204,21,0.3); border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; font-family: inherit; color: white; transition: all 0.2s; background: rgba(250,204,21,0.12);">
            <span>&#11088;</span> Star
          </button>
          <button style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; font-family: inherit; color: white; transition: all 0.2s; background: rgba(168,85,247,0.12);">
            <span>&#127881;</span> Party
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
