// Interactive Particles System — canvas particles with connections and mouse interaction
(function () {
  "use strict";

  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const CONFIG = {
    count: 120,
    color: { r: 99, g: 102, b: 241 },
    connectionDistance: 150,
    particleSizeMin: 1,
    particleSizeMax: 3,
    speed: 0.4,
    mouseRadius: 180,
    mouseForce: 0.08,
  };

  let width, height;
  const particles = [];
  const mouse = { x: -9999, y: -9999, active: false };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.speed * 2,
      vy: (Math.random() - 0.5) * CONFIG.speed * 2,
      size:
        CONFIG.particleSizeMin +
        Math.random() * (CONFIG.particleSizeMax - CONFIG.particleSizeMin),
      opacity: 0.3 + Math.random() * 0.5,
    };
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push(createParticle());
    }
  }

  function update() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse interaction — repulsion
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius && dist > 0) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
          p.vx += (dx / dist) * force * CONFIG.mouseForce;
          p.vy += (dy / dist) * force * CONFIG.mouseForce;
        }
      }

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Clamp velocity
      const maxV = CONFIG.speed * 3;
      p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
      p.vy = Math.max(-maxV, Math.min(maxV, p.vy));

      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > width) { p.x = width; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > height) { p.y = height; p.vy *= -1; }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const { r, g, b } = CONFIG.color;

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const bP = particles[j];
        const dx = a.x - bP.x;
        const dy = a.y - bP.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDistance) {
          const alpha = (1 - dist / CONFIG.connectionDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(bP.x, bP.y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.15})`;
      ctx.fill();
    }

    // Mouse glow
    if (mouse.active) {
      const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, CONFIG.mouseRadius
      );
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.08)`);
      gradient.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, CONFIG.mouseRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  canvas.addEventListener("mouseleave", function () {
    mouse.active = false;
  });

  window.addEventListener("resize", function () {
    resize();
  });

  init();
  loop();
})();
