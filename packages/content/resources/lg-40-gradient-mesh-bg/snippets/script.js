(function () {
  "use strict";

  const canvas = document.getElementById("canvas");
  const ctx    = canvas.getContext("2d");
  const DPR    = window.devicePixelRatio || 1;

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
  window.addEventListener("resize", () => { resize(); initOrbs(); });

  // ── Orb definitions ──────────────────────────────────────────
  const ORB_CONFIGS = [
    { color: "rgba(56,189,248,0.55)",  fx: 0.35, fy: 0.28, ax: 0.30, ay: 0.25, px: 0.0, py: 0.0 },
    { color: "rgba(129,140,248,0.55)", fx: 0.22, fy: 0.40, ax: 0.35, ay: 0.30, px: 1.2, py: 0.8 },
    { color: "rgba(244,114,182,0.45)", fx: 0.50, fy: 0.18, ax: 0.25, ay: 0.35, px: 2.5, py: 1.5 },
    { color: "rgba(34,211,238,0.40)",  fx: 0.18, fy: 0.55, ax: 0.40, ay: 0.20, px: 0.7, py: 3.1 },
    { color: "rgba(167,139,250,0.40)", fx: 0.42, fy: 0.32, ax: 0.28, ay: 0.28, px: 4.0, py: 0.5 },
  ];

  let orbs = [];

  function initOrbs() {
    orbs = ORB_CONFIGS.map((cfg, i) => ({
      ...cfg,
      cx: W * (0.15 + (i / ORB_CONFIGS.length) * 0.7),
      cy: H * (0.2  + (i % 3) * 0.3),
      r:  Math.min(W, H) * (0.35 + Math.random() * 0.25),
    }));
  }
  initOrbs();

  // ── Animation loop ───────────────────────────────────────────
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0;

  function draw() {
    // Dark base
    ctx.fillStyle = "#050910";
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "screen";

    orbs.forEach((orb) => {
      const speed = reduced ? 0 : 1;
      const x = orb.cx + Math.sin(t * orb.fx + orb.px) * orb.ax * W * speed;
      const y = orb.cy + Math.cos(t * orb.fy + orb.py) * orb.ay * H * speed;

      const g = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
      g.addColorStop(0, orb.color);
      g.addColorStop(0.5, orb.color.replace(/[\d.]+\)$/, "0.15)"));
      g.addColorStop(1, "transparent");

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.globalCompositeOperation = "source-over";

    // Subtle noise overlay (vignette)
    const vignette = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.85);
    vignette.addColorStop(0, "transparent");
    vignette.addColorStop(1, "rgba(5,9,16,0.55)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    t += 0.004;
    requestAnimationFrame(draw);
  }

  draw();
})();
