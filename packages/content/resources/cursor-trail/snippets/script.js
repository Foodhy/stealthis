(function () {
  "use strict";

  const container = document.getElementById("trail-container");
  const countSlider = document.getElementById("count-slider");
  const sizeSlider = document.getElementById("size-slider");
  const speedSlider = document.getElementById("speed-slider");
  const colorBtns = document.querySelectorAll(".color-btn");

  const colorSchemes = {
    purple: { base: [167, 139, 250], glow: "rgba(139,92,246,0.4)" },
    cyan: { base: [34, 211, 238], glow: "rgba(34,211,238,0.4)" },
    rose: { base: [251, 113, 133], glow: "rgba(251,113,133,0.4)" },
    green: { base: [74, 222, 128], glow: "rgba(74,222,128,0.4)" },
  };

  let currentColor = "purple";
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // Trail state
  let dots = [];
  let points = [];

  function createDots(count) {
    // Remove existing
    dots.forEach((d) => d.el.remove());
    dots = [];
    points = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "trail-dot";
      container.appendChild(el);
      dots.push({ el });
      points.push({ x: mouseX, y: mouseY });
    }

    updateDotStyles();
  }

  function updateDotStyles() {
    const baseSize = Number(sizeSlider.value);
    const scheme = colorSchemes[currentColor];
    const [r, g, b] = scheme.base;

    dots.forEach((dot, i) => {
      const t = i / dots.length;
      const size = baseSize * (1 - t * 0.7);
      const opacity = 1 - t * 0.85;

      dot.el.style.width = size + "px";
      dot.el.style.height = size + "px";
      dot.el.style.background = `rgba(${r},${g},${b},${opacity})`;
      dot.el.style.boxShadow = `0 0 ${size * 1.5}px rgba(${r},${g},${b},${opacity * 0.5})`;
    });
  }

  // ── Mouse tracking ──
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // ── Animation loop ──
  function animate() {
    const ease = Number(speedSlider.value) / 100;

    // First point follows mouse
    if (points.length > 0) {
      points[0].x += (mouseX - points[0].x) * ease;
      points[0].y += (mouseY - points[0].y) * ease;
    }

    // Each subsequent point follows the previous
    for (let i = 1; i < points.length; i++) {
      points[i].x += (points[i - 1].x - points[i].x) * (ease * 0.85);
      points[i].y += (points[i - 1].y - points[i].y) * (ease * 0.85);
    }

    // Apply positions
    const baseSize = Number(sizeSlider.value);
    for (let i = 0; i < dots.length; i++) {
      const t = i / dots.length;
      const size = baseSize * (1 - t * 0.7);
      dots[i].el.style.transform =
        `translate(${points[i].x - size / 2}px, ${points[i].y - size / 2}px)`;
    }

    requestAnimationFrame(animate);
  }

  // ── Event listeners ──
  countSlider.addEventListener("input", () => {
    createDots(Number(countSlider.value));
  });

  sizeSlider.addEventListener("input", updateDotStyles);

  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentColor = btn.dataset.color;
      updateDotStyles();
    });
  });

  // ── Init ──
  createDots(Number(countSlider.value));
  requestAnimationFrame(animate);
})();
