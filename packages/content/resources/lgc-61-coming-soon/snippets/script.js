(function () {
  "use strict";

  // ── Countdown ─────────────────────────────────────────────────
  const TARGET = new Date("2026-09-01T00:00:00Z");

  function pad(n) { return String(n).padStart(2, "0"); }

  function updateCountdown() {
    const now  = new Date();
    const diff = Math.max(0, TARGET - now);
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    const d = document.getElementById("cd-days");
    const h = document.getElementById("cd-hours");
    const m = document.getElementById("cd-mins");
    const s = document.getElementById("cd-secs");
    if (d) d.textContent = pad(days);
    if (h) h.textContent = pad(hours);
    if (m) m.textContent = pad(mins);
    if (s) s.textContent = pad(secs);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── Waitlist form ──────────────────────────────────────────────
  const form    = document.getElementById("cs-form");
  const input   = document.getElementById("cs-email");
  const error   = document.getElementById("cs-error");
  const success = document.getElementById("cs-success");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      error.hidden = valid;
      if (!valid) { input.focus(); return; }
      form.hidden = true;
      success.hidden = false;
    });
  }

  // ── Canvas particles ───────────────────────────────────────────
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
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

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.5,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    a: Math.random() * 0.4 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
