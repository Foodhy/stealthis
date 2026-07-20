// Cursor-reactive mesh: a grid of spring-loaded points that are pushed by the
// pointer and dragged along by its velocity, then pulled back to their rest
// position. Rendered on a 2D canvas, zero dependencies.

(() => {
  const canvas = document.getElementById("field");
  const readout = document.getElementById("readout");
  const radiusInput = document.getElementById("radius");
  const stiffInput = document.getElementById("stiff");
  const linksInput = document.getElementById("links");
  const ctx = canvas.getContext("2d");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPACING = 34;
  const DAMPING = 0.86;

  let dpr = 1;
  let w = 0;
  let h = 0;
  let cols = 0;
  let rows = 0;
  let points = [];

  // Pointer state: target (raw input), smoothed position, and velocity.
  const p = { tx: -9999, ty: -9999, x: -9999, y: -9999, vx: 0, vy: 0, active: false };
  const keys = new Set();

  function build() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.max(2, Math.floor(w / SPACING));
    rows = Math.max(2, Math.floor(h / SPACING));
    const gx = w / (cols - 1);
    const gy = h / (rows - 1);

    points = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const ox = i * gx;
        const oy = j * gy;
        points.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
      }
    }
  }

  function setTarget(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    p.tx = clientX - r.left;
    p.ty = clientY - r.top;
    p.active = true;
  }

  canvas.addEventListener("pointermove", (e) => setTarget(e.clientX, e.clientY));
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    setTarget(e.clientX, e.clientY);
  });
  canvas.addEventListener("pointerleave", () => {
    p.active = false;
    p.tx = -9999;
    p.ty = -9999;
  });

  // Keyboard fallback: arrow keys steer a virtual cursor.
  const ARROWS = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  canvas.addEventListener("keydown", (e) => {
    if (!ARROWS[e.key]) return;
    e.preventDefault();
    if (!p.active) {
      p.active = true;
      p.tx = w / 2;
      p.ty = h / 2;
      p.x = p.tx;
      p.y = p.ty;
    }
    keys.add(e.key);
  });
  canvas.addEventListener("keyup", (e) => keys.delete(e.key));
  canvas.addEventListener("blur", () => keys.clear());

  function stepPointer() {
    if (keys.size) {
      const step = 9;
      for (const k of keys) {
        p.tx += ARROWS[k][0] * step;
        p.ty += ARROWS[k][1] * step;
      }
      p.tx = Math.max(0, Math.min(w, p.tx));
      p.ty = Math.max(0, Math.min(h, p.ty));
    }

    if (!p.active) {
      p.vx *= 0.9;
      p.vy *= 0.9;
      return;
    }
    if (p.x < -1000) {
      p.x = p.tx;
      p.y = p.ty;
    }
    const nx = p.x + (p.tx - p.x) * 0.22;
    const ny = p.y + (p.ty - p.y) * 0.22;
    p.vx = nx - p.x;
    p.vy = ny - p.y;
    p.x = nx;
    p.y = ny;
  }

  function simulate() {
    const radius = Number(radiusInput.value);
    const k = Number(stiffInput.value) / 1000;
    const r2 = radius * radius;
    const speed = Math.hypot(p.vx, p.vy);

    for (const pt of points) {
      // Spring back to rest position.
      pt.vx += (pt.ox - pt.x) * k;
      pt.vy += (pt.oy - pt.y) * k;

      if (p.active) {
        const dx = pt.x - p.x;
        const dy = pt.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 0.001;
          const falloff = 1 - d / radius; // 0..1
          const push = falloff * falloff * 1.6;
          // Radial repulsion away from the cursor...
          pt.vx += (dx / d) * push;
          pt.vy += (dy / d) * push;
          // ...plus drag along the cursor's velocity vector.
          pt.vx += p.vx * falloff * 0.45;
          pt.vy += p.vy * falloff * 0.45;
        }
      }

      pt.vx *= DAMPING;
      pt.vy *= DAMPING;
      pt.x += pt.vx;
      pt.y += pt.vy;
    }

    readout.textContent = "v " + speed.toFixed(2);
  }

  function render() {
    ctx.clearRect(0, 0, w, h);

    const radius = Number(radiusInput.value);

    // Soft glow following the cursor.
    if (p.active) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      g.addColorStop(0, "rgba(120, 220, 255, 0.16)");
      g.addColorStop(1, "rgba(120, 220, 255, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    if (linksInput.checked) {
      ctx.lineWidth = 1;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const a = points[j * cols + i];
          if (i < cols - 1) strokeLink(a, points[j * cols + i + 1]);
          if (j < rows - 1) strokeLink(a, points[(j + 1) * cols + i]);
        }
      }
    }

    for (const pt of points) {
      const disp = Math.hypot(pt.x - pt.ox, pt.y - pt.oy);
      const t = Math.min(1, disp / 40);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.1 + t * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${120 + t * 100}, ${220 - t * 40}, 255, ${0.35 + t * 0.6})`;
      ctx.fill();
    }
  }

  function strokeLink(a, b) {
    const stretch = Math.abs(Math.hypot(a.x - b.x, a.y - b.y) - Math.hypot(a.ox - b.ox, a.oy - b.oy));
    const alpha = 0.06 + Math.min(0.5, stretch / 28);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(140, 200, 255, ${alpha})`;
    ctx.stroke();
  }

  function frame() {
    stepPointer();
    simulate();
    render();
    requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(build);
  ro.observe(canvas);

  build();
  if (reduced) {
    // Still interactive, but no idle animation loop: redraw on input only.
    const once = () => {
      stepPointer();
      simulate();
      render();
    };
    canvas.addEventListener("pointermove", once);
    canvas.addEventListener("keydown", once);
    [radiusInput, stiffInput, linksInput].forEach((el) => el.addEventListener("input", once));
    once();
  } else {
    requestAnimationFrame(frame);
  }
})();
