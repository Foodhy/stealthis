// Icon Cloud — 3D rotating sphere of icons
(function () {
  "use strict";

  const container = document.getElementById("icon-cloud");
  if (!container) return;

  const ICONS = [
    "\u269B\uFE0F", // React
    "\u{1F310}", // Globe (Web)
    "\u26A1", // Zap (Vite)
    "\u{1F4E6}", // Package (npm)
    "\u{1F680}", // Rocket (Deploy)
    "\u{1F3A8}", // Art (CSS)
    "\u{1F527}", // Wrench (Tools)
    "\u{1F4BB}", // Laptop (Dev)
    "\u2728", // Sparkles
    "\u{1F50D}", // Search
    "\u{1F4CA}", // Chart
    "\u{1F512}", // Lock (Security)
    "\u2601\uFE0F", // Cloud
    "\u{1F916}", // Robot (AI)
    "\u{1F9E9}", // Puzzle
    "\u{1F4A1}", // Lightbulb
    "\u{1F525}", // Fire
    "\u{1F48E}", // Gem
    "\u{1F3AF}", // Target
    "\u{1F30A}", // Wave
  ];

  const ROTATE_SPEED = 0.004;
  const PERSPECTIVE = 500;
  const TILT_SENSITIVITY = 0.0003;

  let rotY = 0;
  let rotX = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let tiltX = 0;
  let tiltY = 0;

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const count = ICONS.length;

  // Generate sphere points
  const points = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push({
      x: Math.cos(theta) * r,
      y: y,
      z: Math.sin(theta) * r,
    });
  }

  // Create DOM elements
  const elements = ICONS.map((icon) => {
    const el = document.createElement("div");
    el.className = "cloud-icon";
    el.textContent = icon;
    container.appendChild(el);
    return el;
  });

  // Mouse tilt
  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    targetTiltY = (e.clientX - cx) * TILT_SENSITIVITY;
    targetTiltX = (e.clientY - cy) * TILT_SENSITIVITY;
  });

  container.addEventListener("mouseleave", () => {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  function rotatePoint(p, ry, rx) {
    let x = p.x * Math.cos(ry) - p.z * Math.sin(ry);
    let z = p.x * Math.sin(ry) + p.z * Math.cos(ry);
    let y2 = p.y * Math.cos(rx) - z * Math.sin(rx);
    let z2 = p.y * Math.sin(rx) + z * Math.cos(rx);
    return { x, y: y2, z: z2 };
  }

  const size = container.clientWidth / 2;

  function tick() {
    rotY += ROTATE_SPEED;

    // Smooth tilt interpolation
    tiltX += (targetTiltX - tiltX) * 0.05;
    tiltY += (targetTiltY - tiltY) * 0.05;

    const totalRotX = rotX + tiltX;
    const totalRotY = rotY + tiltY;

    for (let i = 0; i < count; i++) {
      const rotated = rotatePoint(points[i], totalRotY, totalRotX);
      const scale = PERSPECTIVE / (PERSPECTIVE + rotated.z * size);
      const px = rotated.x * size * scale;
      const py = rotated.y * size * scale;

      const opacity = Math.max(0.15, (rotated.z + 1) / 2);
      const s = 0.6 + scale * 0.5;

      elements[i].style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px) scale(${s})`;
      elements[i].style.opacity = opacity;
      elements[i].style.zIndex = Math.round(scale * 100);
    }

    requestAnimationFrame(tick);
  }

  tick();
})();
