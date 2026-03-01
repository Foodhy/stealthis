(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;

  let W, H;
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(DPR, DPR);
  }
  resize();
  window.addEventListener("resize", resize);

  // ── Particle ──────────────────────────────────────────────────
  class Particle {
    constructor(x, y) {
      this.x  = x;
      this.y  = y;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5 - 0.5;
      this.radius = Math.random() * 4 + 2;
      this.alpha  = 1;
      this.hue    = Math.random() * 60 + 180; // 180–240: cyan/blue/indigo
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.radius *= 0.96;
      this.alpha  -= 0.018;
    }

    draw() {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      g.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${this.alpha})`);
      g.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    isDead() { return this.alpha <= 0 || this.radius <= 0.3; }
  }

  let particles = [];
  let mx = W / 2, my = H / 2;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    for (let i = 0; i < 4; i++) {
      particles.push(new Particle(mx, my));
    }
  });

  // Touch support
  document.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    for (let i = 0; i < 4; i++) {
      particles.push(new Particle(t.clientX, t.clientY));
    }
  }, { passive: true });

  function loop() {
    // Semi-transparent clear — creates trail persistence
    ctx.fillStyle = "rgba(5, 9, 16, 0.18)";
    ctx.fillRect(0, 0, W, H);

    // Update + draw
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isDead()) particles.splice(i, 1);
    }

    requestAnimationFrame(loop);
  }

  loop();
})();
