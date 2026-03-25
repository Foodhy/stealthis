// Interactive 3D Globe — canvas dot-sphere with drag rotation
(function () {
  "use strict";

  const canvas = document.getElementById("globe-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const DOT_COUNT = 800;
  const DOT_RADIUS = 1.8;
  const AUTO_ROTATE_SPEED = 0.003;
  const PERSPECTIVE = 600;
  const DOT_COLOR = { r: 6, g: 182, b: 212 }; // cyan-500
  const GLOW_COLOR = "rgba(6, 182, 212, 0.15)";

  let width, height, radius;
  let rotY = 0;
  let rotX = 0.3;
  let isDragging = false;
  let lastMouse = { x: 0, y: 0 };
  let autoRotate = true;
  let dragTimeout;

  // Generate Fibonacci sphere points
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < DOT_COUNT; i++) {
    const y = 1 - (i / (DOT_COUNT - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push({
      x: Math.cos(theta) * radiusAtY,
      y: y,
      z: Math.sin(theta) * radiusAtY,
    });
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = Math.min(width, height) * 0.3;
  }
  resize();
  window.addEventListener("resize", resize);

  function rotatePoint(p, ry, rx) {
    // Rotate around Y axis
    let x = p.x * Math.cos(ry) - p.z * Math.sin(ry);
    let z = p.x * Math.sin(ry) + p.z * Math.cos(ry);
    let y = p.y;

    // Rotate around X axis
    const y2 = y * Math.cos(rx) - z * Math.sin(rx);
    const z2 = y * Math.sin(rx) + z * Math.cos(rx);

    return { x, y: y2, z: z2 };
  }

  function project(p) {
    const scale = PERSPECTIVE / (PERSPECTIVE + p.z * radius);
    return {
      x: p.x * radius * scale + width / 2,
      y: p.y * radius * scale + height / 2 + 60,
      scale,
      z: p.z,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw glow behind globe
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2 + 60, radius * 0.2,
      width / 2, height / 2 + 60, radius * 1.2
    );
    gradient.addColorStop(0, GLOW_COLOR);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Sort by z for proper depth rendering
    const projected = points.map((p) => {
      const rotated = rotatePoint(p, rotY, rotX);
      return project(rotated);
    });
    projected.sort((a, b) => a.z - b.z);

    for (const p of projected) {
      // Dots facing camera are brighter
      const alpha = Math.max(0.08, (p.z + 1) / 2);
      const dotSize = DOT_RADIUS * p.scale;

      ctx.beginPath();
      ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${DOT_COLOR.r}, ${DOT_COLOR.g}, ${DOT_COLOR.b}, ${alpha})`;
      ctx.fill();

      // Highlight glow on front-facing dots
      if (p.z > 0.3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotSize * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_COLOR.r}, ${DOT_COLOR.g}, ${DOT_COLOR.b}, ${alpha * 0.15})`;
        ctx.fill();
      }
    }
  }

  function tick() {
    if (autoRotate && !isDragging) {
      rotY += AUTO_ROTATE_SPEED;
    }
    draw();
    requestAnimationFrame(tick);
  }

  // Mouse interaction
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    clearTimeout(dragTimeout);
    autoRotate = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    rotY += dx * 0.005;
    rotX += dy * 0.005;
    rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
    lastMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    dragTimeout = setTimeout(() => {
      autoRotate = true;
    }, 2000);
  });

  // Touch interaction
  canvas.addEventListener("touchstart", (e) => {
    isDragging = true;
    const t = e.touches[0];
    lastMouse = { x: t.clientX, y: t.clientY };
    clearTimeout(dragTimeout);
    autoRotate = false;
  }, { passive: true });

  canvas.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dx = t.clientX - lastMouse.x;
    const dy = t.clientY - lastMouse.y;
    rotY += dx * 0.005;
    rotX += dy * 0.005;
    rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
    lastMouse = { x: t.clientX, y: t.clientY };
  }, { passive: true });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
    dragTimeout = setTimeout(() => {
      autoRotate = true;
    }, 2000);
  });

  tick();
})();
