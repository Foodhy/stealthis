// Aurora Text — the core effect is CSS-only.
// This optional script adds a subtle canvas aurora backdrop for enhanced depth.
(function () {
  "use strict";

  const wrapper = document.querySelector(".aurora-wrapper");
  if (!wrapper) return;

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 200;
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "0",
    opacity: "0.3",
    pointerEvents: "none",
    filter: "blur(40px)",
  });
  canvas.setAttribute("aria-hidden", "true");
  wrapper.style.position = "relative";
  wrapper.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    // Draw flowing aurora bands
    for (let i = 0; i < 3; i++) {
      const offset = i * 1.2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      for (let x = 0; x <= w; x += 4) {
        const y =
          h * 0.5 +
          Math.sin((x / w) * Math.PI * 2 + t * 0.8 + offset) * 30 +
          Math.sin((x / w) * Math.PI * 3 + t * 1.2 + offset) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const colors = [
        "rgba(0, 255, 135, 0.4)",
        "rgba(124, 58, 237, 0.4)",
        "rgba(0, 212, 255, 0.4)",
      ];
      ctx.fillStyle = colors[i];
      ctx.fill();
    }

    t += 0.015;
    requestAnimationFrame(draw);
  }

  draw();
})();
