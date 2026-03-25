// Interactive Grid Pattern — cells illuminate based on mouse proximity
(function () {
  "use strict";

  const canvas = document.getElementById("grid-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const CELL_SIZE = 32;
  const GAP = 2;
  const CORNER_RADIUS = 3;
  const ILLUMINATION_RADIUS = 200;
  const TRAIL_RADIUS = 120;

  let mouseX = -1000;
  let mouseY = -1000;
  let targetX = -1000;
  let targetY = -1000;
  let cols = 0;
  let rows = 0;
  let dpr = 1;
  let animId;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(dpr, dpr);

    cols = Math.ceil(window.innerWidth / (CELL_SIZE + GAP)) + 1;
    rows = Math.ceil(window.innerHeight / (CELL_SIZE + GAP)) + 1;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function draw() {
    // Smooth mouse following
    mouseX = lerp(mouseX, targetX, 0.15);
    mouseY = lerp(mouseY, targetY, 0.15);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * (CELL_SIZE + GAP);
        const y = r * (CELL_SIZE + GAP);
        const centerX = x + CELL_SIZE / 2;
        const centerY = y + CELL_SIZE / 2;

        const dx = centerX - mouseX;
        const dy = centerY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Intensity falls off smoothly
        const intensity = Math.max(0, 1 - dist / ILLUMINATION_RADIUS);
        const smoothIntensity = intensity * intensity; // Quadratic falloff

        // Trail glow (softer, wider)
        const trailIntensity = Math.max(0, 1 - dist / (ILLUMINATION_RADIUS + TRAIL_RADIUS));
        const smoothTrail = trailIntensity * trailIntensity * 0.3;

        const finalIntensity = Math.min(1, smoothIntensity + smoothTrail);

        // Base: dim grid line / Lit: bright emerald
        const baseR = 255, baseG = 255, baseB = 255, baseA = 0.04;
        const glowR = 52, glowG = 211, glowB = 153;

        const alpha = baseA + finalIntensity * 0.55;
        const red = Math.round(lerp(baseR * baseA, glowR, finalIntensity) / Math.max(alpha, 0.01));
        const green = Math.round(lerp(baseG * baseA, glowG, finalIntensity) / Math.max(alpha, 0.01));
        const blue = Math.round(lerp(baseB * baseA, glowB, finalIntensity) / Math.max(alpha, 0.01));

        ctx.fillStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${alpha.toFixed(3)})`;

        if (finalIntensity > 0.01) {
          // Draw brighter cells
          ctx.shadowColor = `rgba(${glowR}, ${glowG}, ${glowB}, ${(finalIntensity * 0.6).toFixed(3)})`;
          ctx.shadowBlur = finalIntensity * 12;
        } else {
          // Dim base cells
          ctx.fillStyle = `rgba(255, 255, 255, 0.04)`;
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        roundRect(x, y, CELL_SIZE, CELL_SIZE, CORNER_RADIUS);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // Subtle border for lit cells
        if (finalIntensity > 0.1) {
          ctx.strokeStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${(finalIntensity * 0.3).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          roundRect(x, y, CELL_SIZE, CELL_SIZE, CORNER_RADIUS);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  canvas.parentElement.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  canvas.parentElement.addEventListener("mouseleave", () => {
    targetX = -1000;
    targetY = -1000;
  });

  // Touch support
  canvas.parentElement.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    targetX = touch.clientX;
    targetY = touch.clientY;
  }, { passive: true });

  canvas.parentElement.addEventListener("touchend", () => {
    targetX = -1000;
    targetY = -1000;
  });

  resize();
  draw();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
})();
