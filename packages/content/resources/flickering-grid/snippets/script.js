// Flickering Grid — Canvas-based animated grid with randomly flickering cells.
(function () {
  "use strict";

  const canvas = document.querySelector(".flicker-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Configuration
  const CELL_SIZE = 24;
  const GAP = 2;
  const BASE_OPACITY = 0.06;
  const MAX_OPACITY = 0.35;
  const FLICKER_CHANCE = 0.005; // chance per cell per frame
  const LERP_SPEED = 0.04;
  const COLOR = { r: 16, g: 185, b: 129 }; // emerald

  let cols = 0;
  let rows = 0;
  let cells = [];
  let animId = null;
  let dpr = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);

    cols = Math.ceil(rect.width / (CELL_SIZE + GAP));
    rows = Math.ceil(rect.height / (CELL_SIZE + GAP));

    // Re-initialize cells
    cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({
          x: c * (CELL_SIZE + GAP),
          y: r * (CELL_SIZE + GAP),
          opacity: BASE_OPACITY + Math.random() * 0.03,
          target: BASE_OPACITY,
        });
      }
    }
  }

  function animate() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      // Random chance to start a flicker
      if (Math.random() < FLICKER_CHANCE) {
        cell.target = BASE_OPACITY + Math.random() * (MAX_OPACITY - BASE_OPACITY);
      }

      // Lerp opacity toward target
      cell.opacity += (cell.target - cell.opacity) * LERP_SPEED;

      // Fade target back to base
      cell.target += (BASE_OPACITY - cell.target) * 0.01;

      // Draw
      ctx.fillStyle = `rgba(${COLOR.r}, ${COLOR.g}, ${COLOR.b}, ${cell.opacity})`;
      ctx.beginPath();
      ctx.roundRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE, 2);
      ctx.fill();
    }

    animId = requestAnimationFrame(animate);
  }

  // Initialize
  resize();
  animate();

  // Handle window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resize();
      animate();
    }, 100);
  });

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(animId);
  });
})();
