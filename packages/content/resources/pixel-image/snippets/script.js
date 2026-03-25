// Pixel Image — scatter and assemble pixels from a generated gradient image
(function () {
  "use strict";

  const canvas = document.getElementById("pixel-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const PIXEL_SIZE = 4;
  const ANIM_DURATION = 2000;

  let pixels = [];
  let animating = false;
  let scattered = true;
  let startTime = 0;
  let imgWidth = 0;
  let imgHeight = 0;

  // Generate a demo gradient image since we can't load external images in sandboxed iframe
  function generateDemoImage() {
    const w = Math.min(400, window.innerWidth - 40);
    const h = Math.min(300, window.innerHeight - 160);
    imgWidth = w;
    imgHeight = h;
    canvas.width = w;
    canvas.height = h;

    // Draw a beautiful gradient with shapes
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tctx = tempCanvas.getContext("2d");

    // Background gradient
    const bg = tctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#1e1b4b");
    bg.addColorStop(0.3, "#312e81");
    bg.addColorStop(0.6, "#4338ca");
    bg.addColorStop(1, "#6366f1");
    tctx.fillStyle = bg;
    tctx.fillRect(0, 0, w, h);

    // Draw circles
    for (let i = 0; i < 6; i++) {
      const cx = w * (0.15 + Math.random() * 0.7);
      const cy = h * (0.15 + Math.random() * 0.7);
      const r = 20 + Math.random() * 60;
      const grad = tctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${167 + Math.random()*60}, ${139 + Math.random()*60}, 250, 0.6)`);
      grad.addColorStop(1, "transparent");
      tctx.beginPath();
      tctx.arc(cx, cy, r, 0, Math.PI * 2);
      tctx.fillStyle = grad;
      tctx.fill();
    }

    // Draw a star shape in center
    tctx.save();
    tctx.translate(w / 2, h / 2);
    tctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    tctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * 50;
      const y = Math.sin(angle) * 50;
      if (i === 0) tctx.moveTo(x, y);
      else tctx.lineTo(x, y);
    }
    tctx.closePath();
    tctx.fill();
    tctx.restore();

    return tctx.getImageData(0, 0, w, h);
  }

  function extractPixels(imageData) {
    pixels = [];
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    for (let y = 0; y < h; y += PIXEL_SIZE) {
      for (let x = 0; x < w; x += PIXEL_SIZE) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 10) continue;

        pixels.push({
          targetX: x,
          targetY: y,
          currentX: Math.random() * w * 2 - w * 0.5,
          currentY: Math.random() * h * 2 - h * 0.5,
          startX: 0,
          startY: 0,
          color: `rgba(${r},${g},${b},${a / 255})`,
          delay: Math.random() * 0.3,
        });
      }
    }
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInCubic(t) {
    return t * t * t;
  }

  function startAnimation() {
    if (animating) return;
    animating = true;
    startTime = performance.now();

    // Save start positions
    for (const p of pixels) {
      p.startX = p.currentX;
      p.startY = p.currentY;
    }

    requestAnimationFrame(animate);
  }

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / ANIM_DURATION, 1);

    ctx.clearRect(0, 0, imgWidth, imgHeight);

    for (const p of pixels) {
      const adjustedProgress = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));

      if (scattered) {
        // Assembling: scattered -> target
        const ease = easeOutCubic(adjustedProgress);
        p.currentX = p.startX + (p.targetX - p.startX) * ease;
        p.currentY = p.startY + (p.targetY - p.startY) * ease;
      } else {
        // Scattering: target -> random
        const ease = easeInCubic(adjustedProgress);
        const randX = Math.random() * imgWidth * 2 - imgWidth * 0.5;
        const randY = Math.random() * imgHeight * 2 - imgHeight * 0.5;
        p.currentX = p.startX + (randX - p.startX) * ease;
        p.currentY = p.startY + (randY - p.startY) * ease;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = scattered ? adjustedProgress : 1 - adjustedProgress * 0.5;
      ctx.fillRect(p.currentX, p.currentY, PIXEL_SIZE, PIXEL_SIZE);
    }
    ctx.globalAlpha = 1;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      animating = false;
      scattered = !scattered;
    }
  }

  function drawCurrent() {
    ctx.clearRect(0, 0, imgWidth, imgHeight);
    for (const p of pixels) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.currentX, p.currentY, PIXEL_SIZE, PIXEL_SIZE);
    }
  }

  // Init
  const imageData = generateDemoImage();
  extractPixels(imageData);
  drawCurrent();

  // Auto-assemble on load
  setTimeout(function () {
    startAnimation();
  }, 500);

  // Click to toggle
  document.querySelector(".pixel-wrapper").addEventListener("click", function () {
    startAnimation();
  });
})();
