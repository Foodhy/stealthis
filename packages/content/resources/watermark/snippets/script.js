(function () {
  "use strict";

  const target = document.getElementById("wm-target");
  const inputText = document.getElementById("wm-text");
  const inputOpacity = document.getElementById("wm-opacity");
  const inputAngle = document.getElementById("wm-angle");
  const inputSize = document.getElementById("wm-size");
  const inputGap = document.getElementById("wm-gap");

  const valOpacity = document.getElementById("wm-opacity-val");
  const valAngle = document.getElementById("wm-angle-val");
  const valSize = document.getElementById("wm-size-val");
  const valGap = document.getElementById("wm-gap-val");

  if (!target) return;

  // Create canvas
  const canvas = document.createElement("canvas");
  target.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let rafId = null;

  function draw() {
    const text = inputText.value.trim() || "Watermark";
    const opacity = Number(inputOpacity.value) / 100;
    const angle = Number(inputAngle.value) * (Math.PI / 180);
    const fontSize = Number(inputSize.value);
    const gap = Number(inputGap.value);

    // Size canvas to target
    const rect = target.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    // Text style
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "#f2f6ff";
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Tile pattern: iterate across a rotated grid
    // We use a large enough iteration range to cover the canvas even after rotation
    const diagonal = Math.ceil(Math.sqrt(w * w + h * h));
    const cols = Math.ceil(diagonal / gap) + 2;
    const rows = Math.ceil(diagonal / gap) + 2;

    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);

    for (let row = -rows; row <= rows; row++) {
      for (let col = -cols; col <= cols; col++) {
        const x = col * gap;
        const y = row * gap;
        ctx.fillText(text, x, y);
      }
    }

    ctx.restore();
  }

  function scheduleDraw() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(draw);
  }

  // Sync display values
  function syncValues() {
    valOpacity.textContent = inputOpacity.value + "%";
    valAngle.textContent = inputAngle.value + "°";
    valSize.textContent = inputSize.value + "px";
    valGap.textContent = inputGap.value + "px";
  }

  // Bind inputs
  [inputText, inputOpacity, inputAngle, inputSize, inputGap].forEach(function (el) {
    el.addEventListener("input", function () {
      syncValues();
      scheduleDraw();
    });
  });

  // Redraw on resize
  const resizeObserver = new ResizeObserver(scheduleDraw);
  resizeObserver.observe(target);

  // Initial render
  syncValues();
  draw();
})();
