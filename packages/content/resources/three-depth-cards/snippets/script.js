(() => {
  const stack = document.getElementById("stack");
  const status = document.getElementById("status");
  const canvas = document.getElementById("glow");
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll(".card"));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const MAX = 14; // max tilt in degrees

  let px = 0, py = 0; // target, normalised -1..1
  let cx = 0, cy = 0; // eased current
  let raf = 0;

  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  function sizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = stack.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paintGlow(w, h) {
    if (!ctx || reduce.matches) return;
    ctx.clearRect(0, 0, w, h);
    const gx = w / 2 + cx * w * 0.34;
    const gy = h / 2 + cy * h * 0.3;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.55);
    g.addColorStop(0, "rgba(120,169,255,0.34)");
    g.addColorStop(0.45, "rgba(140,110,255,0.14)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function apply() {
    for (const card of cards) {
      const d = parseFloat(card.dataset.depth || "1");
      card.style.setProperty("--ry", (cx * MAX * d).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-cy * MAX * d).toFixed(2) + "deg");
      card.style.setProperty("--tx", (cx * 26 * d).toFixed(1) + "px");
      card.style.setProperty("--ty", (cy * 16 * d).toFixed(1) + "px");
      card.style.setProperty("--mx", (50 + cx * 45).toFixed(1) + "%");
      card.style.setProperty("--my", (50 + cy * 45).toFixed(1) + "%");
    }
    const r = stack.getBoundingClientRect();
    paintGlow(r.width, r.height);
    if (status) {
      status.textContent =
        "Tilt " + (cx * MAX).toFixed(1) + "° / " + (-cy * MAX).toFixed(1) + "°";
    }
  }

  function loop() {
    const ease = reduce.matches ? 1 : 0.14;
    cx += (px - cx) * ease;
    cy += (py - cy) * ease;
    if (Math.abs(px - cx) < 0.0005 && Math.abs(py - cy) < 0.0005) {
      cx = px; cy = py; raf = 0; apply(); return;
    }
    apply();
    raf = requestAnimationFrame(loop);
  }

  function setTarget(nx, ny) {
    px = Math.max(-1, Math.min(1, nx));
    py = Math.max(-1, Math.min(1, ny));
    if (!raf) raf = requestAnimationFrame(loop);
  }

  const sheen = (v) => { for (const c of cards) c.style.setProperty("--sheen", v); };

  stack.addEventListener("pointermove", (e) => {
    const r = stack.getBoundingClientRect();
    setTarget(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    sheen("1");
  });

  stack.addEventListener("pointerleave", () => { setTarget(0, 0); sheen("0"); });

  // Keyboard fallback: arrows tilt, Esc/Home recenter.
  const STEP = 0.2;
  const MAP = {
    ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0],
    ArrowUp: [0, -STEP], ArrowDown: [0, STEP]
  };
  for (const card of cards) {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Home") {
        e.preventDefault(); setTarget(0, 0); sheen("0"); return;
      }
      const d = MAP[e.key];
      if (!d) return;
      e.preventDefault();
      setTarget(px + d[0], py + d[1]);
      sheen("1");
    });
    card.addEventListener("blur", () => {
      if (!stack.matches(":hover")) { setTarget(0, 0); sheen("0"); }
    });
  }

  addEventListener("resize", () => { sizeCanvas(); apply(); });
  sizeCanvas();
  apply();
})();
