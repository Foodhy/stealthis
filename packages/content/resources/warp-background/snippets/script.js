// Warp Background — canvas animation drawing a warped grid mesh with sine-wave distortions
(function () {
  "use strict";

  const canvas = document.getElementById("warp-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Configuration
  const GRID_COLS = 40;
  const GRID_ROWS = 30;
  const SPEED = 0.0008;
  const AMPLITUDE_X = 30;
  const AMPLITUDE_Y = 25;
  const FREQUENCY = 0.06;

  // Colors
  const COLOR_R = 139;
  const COLOR_G = 92;
  const COLOR_B = 246;

  let dpr = 1;
  let width = 0;
  let height = 0;
  let time = 0;
  let animId;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  function getWarpedPoint(col, row, t) {
    const baseX = (col / GRID_COLS) * width;
    const baseY = (row / GRID_ROWS) * height;

    // Layer 1: Primary wave
    const dx1 = Math.sin(baseY * FREQUENCY + t * 1.3) * AMPLITUDE_X;
    const dy1 = Math.cos(baseX * FREQUENCY + t * 1.1) * AMPLITUDE_Y;

    // Layer 2: Secondary smaller wave
    const dx2 =
      Math.sin(baseX * FREQUENCY * 1.5 + baseY * FREQUENCY * 0.5 + t * 0.7) * AMPLITUDE_X * 0.5;
    const dy2 =
      Math.cos(baseY * FREQUENCY * 1.3 + baseX * FREQUENCY * 0.4 + t * 0.9) * AMPLITUDE_Y * 0.5;

    // Layer 3: Micro turbulence
    const dx3 = Math.sin(baseX * FREQUENCY * 3 + t * 2.1) * AMPLITUDE_X * 0.15;
    const dy3 = Math.cos(baseY * FREQUENCY * 2.8 + t * 1.8) * AMPLITUDE_Y * 0.15;

    return {
      x: baseX + dx1 + dx2 + dx3,
      y: baseY + dy1 + dy2 + dy3,
      displacement: Math.sqrt((dx1 + dx2) * (dx1 + dx2) + (dy1 + dy2) * (dy1 + dy2)),
    };
  }

  function draw(timestamp) {
    time = timestamp * SPEED;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Build the warped grid points
    const points = [];
    for (let r = 0; r <= GRID_ROWS; r++) {
      points[r] = [];
      for (let c = 0; c <= GRID_COLS; c++) {
        points[r][c] = getWarpedPoint(c, r, time);
      }
    }

    // Draw horizontal lines
    for (let r = 0; r <= GRID_ROWS; r++) {
      ctx.beginPath();
      for (let c = 0; c <= GRID_COLS; c++) {
        const pt = points[r][c];
        const alpha = 0.04 + (pt.displacement / (AMPLITUDE_X + AMPLITUDE_Y)) * 0.18;

        if (c === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      // Use average displacement for line alpha
      const avgDisp = points[r].reduce((sum, p) => sum + p.displacement, 0) / points[r].length;
      const lineAlpha = 0.03 + (avgDisp / (AMPLITUDE_X + AMPLITUDE_Y)) * 0.15;
      ctx.strokeStyle = `rgba(${COLOR_R}, ${COLOR_G}, ${COLOR_B}, ${lineAlpha.toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Draw vertical lines
    for (let c = 0; c <= GRID_COLS; c++) {
      ctx.beginPath();
      for (let r = 0; r <= GRID_ROWS; r++) {
        const pt = points[r][c];

        if (r === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      let totalDisp = 0;
      for (let r = 0; r <= GRID_ROWS; r++) totalDisp += points[r][c].displacement;
      const avgDisp = totalDisp / (GRID_ROWS + 1);
      const lineAlpha = 0.03 + (avgDisp / (AMPLITUDE_X + AMPLITUDE_Y)) * 0.15;
      ctx.strokeStyle = `rgba(${COLOR_R}, ${COLOR_G}, ${COLOR_B}, ${lineAlpha.toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Draw glow nodes at intersections with high displacement
    for (let r = 0; r <= GRID_ROWS; r += 2) {
      for (let c = 0; c <= GRID_COLS; c += 2) {
        const pt = points[r][c];
        const normalizedDisp = pt.displacement / (AMPLITUDE_X + AMPLITUDE_Y);

        if (normalizedDisp > 0.3) {
          const dotAlpha = (normalizedDisp - 0.3) * 0.6;
          const dotRadius = 1 + normalizedDisp * 2;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${COLOR_R}, ${COLOR_G}, ${COLOR_B}, ${dotAlpha.toFixed(3)})`;
          ctx.fill();

          // Outer glow
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dotRadius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${COLOR_R}, ${COLOR_G}, ${COLOR_B}, ${(dotAlpha * 0.15).toFixed(3)})`;
          ctx.fill();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  resize();
  animId = requestAnimationFrame(draw);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
})();
