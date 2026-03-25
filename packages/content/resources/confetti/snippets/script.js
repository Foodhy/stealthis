// Confetti Explosion — canvas-based particle system
(function () {
  "use strict";

  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const PARTICLE_COUNT = 150;
  const GRAVITY = 0.25;
  const DRAG = 0.98;
  const COLORS = [
    "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
    "#10b981", "#ec4899", "#fde68a", "#60a5fa",
  ];
  const SHAPES = ["rect", "circle", "strip"];

  let particles = [];
  let animId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle(x, y) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(6, 14);
    return {
      x,
      y,
      vx: Math.cos(angle) * speed * randomRange(0.5, 1.5),
      vy: Math.sin(angle) * speed * randomRange(0.5, 1) - 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: randomRange(4, 8),
      rotation: randomRange(0, Math.PI * 2),
      rotationSpeed: randomRange(-0.15, 0.15),
      opacity: 1,
      decay: randomRange(0.005, 0.015),
    };
  }

  function explode(x, y) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(x, y));
    }
    if (!animId) tick();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += GRAVITY;
      p.vx *= DRAG;
      p.vy *= DRAG;
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
      animId = requestAnimationFrame(tick);
    } else {
      animId = null;
    }
  }

  const btn = document.getElementById("confetti-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      explode(cx, cy);
    });
  }
})();
