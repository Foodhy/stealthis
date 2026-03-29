if (!window.MotionPreference) {
  const __mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const __listeners = new Set();

  const MotionPreference = {
    prefersReducedMotion() {
      return __mql.matches;
    },
    setOverride(value) {
      const reduced = Boolean(value);
      document.documentElement.classList.toggle("reduced-motion", reduced);
      window.dispatchEvent(new CustomEvent("motion-preference", { detail: { reduced } }));
      for (const listener of __listeners) {
        try {
          listener({ reduced, override: reduced, systemReduced: __mql.matches });
        } catch {}
      }
    },
    onChange(listener) {
      __listeners.add(listener);
      try {
        listener({
          reduced: __mql.matches,
          override: null,
          systemReduced: __mql.matches,
        });
      } catch {}
      return () => __listeners.delete(listener);
    },
    getState() {
      return { reduced: __mql.matches, override: null, systemReduced: __mql.matches };
    },
  };

  window.MotionPreference = MotionPreference;
}

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d", { alpha: true });
const toggleBtn = document.getElementById("toggleMotion");

const state = {
  motionEnabled: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  blobs: [],
  raf: 0,
  t: 0,
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  smoothMouseX: window.innerWidth / 2,
  smoothMouseY: window.innerHeight / 2,
};

// ── Palette ──
const palette = [
  { r: 114, g: 178, b: 255 }, // cyan-blue
  { r: 229, g: 247, b: 255 }, // white-blue
  { r: 255, g: 236, b: 183 }, // warm gold
  { r: 174, g: 82, b: 255 }, // purple
  { r: 255, g: 64, b: 214 }, // pink
  { r: 134, g: 232, b: 255 }, // accent cyan
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pickColor() {
  return palette[Math.floor(Math.random() * palette.length)];
}

// ── Blob creation with depth layers ──
function createBlob() {
  const depth = rand(0.2, 1); // 0 = far back, 1 = close
  const maxR = Math.max(50, window.innerWidth * 0.09);
  const baseR = rand(4, maxR);
  const r = baseR * (0.3 + depth * 0.7); // deeper = smaller

  return {
    x: rand(0, window.innerWidth),
    y: rand(0, window.innerHeight),
    r,
    color: pickColor(),
    alpha: 0.15 + depth * 0.4,
    vx: rand(-0.12, 0.12) * depth,
    vy: rand(-0.08, 0.08) * depth,
    depth,
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.002, 0.012),
    blur: (1 - depth) * 6, // far particles are blurrier
  };
}

// ── Resize ──
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.floor((window.innerWidth * window.innerHeight) / 12000);
  state.blobs = Array.from({ length: Math.max(40, count) }, createBlob);
  // Sort by depth so far particles render first
  state.blobs.sort((a, b) => a.depth - b.depth);
}

// ── Draw ──
function drawBlob(b) {
  const pulse = 1 + Math.sin(state.t * 0.01 + b.wobble) * 0.1;
  const radius = b.r * pulse;

  // Mouse-reactive parallax: closer particles move more with mouse
  const mx = (state.smoothMouseX - window.innerWidth / 2) / window.innerWidth;
  const my = (state.smoothMouseY - window.innerHeight / 2) / window.innerHeight;
  const parallaxX = mx * 30 * b.depth;
  const parallaxY = my * 20 * b.depth;

  const drawX = b.x + parallaxX;
  const drawY = b.y + parallaxY;

  // Apply blur for depth-of-field effect
  if (b.blur > 0.5) {
    ctx.filter = `blur(${b.blur}px)`;
  }

  const g = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, radius);
  const { r, g: green, b: blue } = b.color;
  g.addColorStop(0, `rgba(${r}, ${green}, ${blue}, ${Math.min(b.alpha + 0.3, 0.9)})`);
  g.addColorStop(0.4, `rgba(${r}, ${green}, ${blue}, ${b.alpha})`);
  g.addColorStop(1, `rgba(${r}, ${green}, ${blue}, 0)`);

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
  ctx.fill();

  if (b.blur > 0.5) {
    ctx.filter = "none";
  }
}

function stepBlob(b) {
  b.x += b.vx;
  b.y += b.vy;
  b.wobble += b.wobbleSpeed;

  const pad = b.r + 40;
  if (b.x < -pad) b.x = window.innerWidth + pad;
  if (b.x > window.innerWidth + pad) b.x = -pad;
  if (b.y < -pad) b.y = window.innerHeight + pad;
  if (b.y > window.innerHeight + pad) b.y = -pad;
}

// ── Render loop ──
function render() {
  state.t += 1;

  // Smooth mouse interpolation
  state.smoothMouseX += (state.mouseX - state.smoothMouseX) * 0.05;
  state.smoothMouseY += (state.mouseY - state.smoothMouseY) * 0.05;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Subtle dark overlay for trailing
  ctx.fillStyle = "rgba(5, 6, 8, 0.35)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.globalCompositeOperation = "screen";
  for (const b of state.blobs) {
    if (state.motionEnabled) stepBlob(b);
    drawBlob(b);
  }
  ctx.globalCompositeOperation = "source-over";

  state.raf = requestAnimationFrame(render);
}

// ── Motion toggle ──
function setMotionLabel() {
  toggleBtn.textContent = state.motionEnabled ? "Disable Motion" : "Enable Motion";
}

toggleBtn.addEventListener("click", () => {
  state.motionEnabled = !state.motionEnabled;
  setMotionLabel();
});

// ── Mouse tracking ──
document.addEventListener("mousemove", (e) => {
  state.mouseX = e.clientX;
  state.mouseY = e.clientY;
});

// ── Init ──
window.addEventListener("resize", resize);
resize();
setMotionLabel();
state.raf = requestAnimationFrame(render);
