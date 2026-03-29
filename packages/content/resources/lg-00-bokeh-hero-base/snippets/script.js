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
};

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.floor((window.innerWidth * window.innerHeight) / 13000);
  state.blobs = Array.from({ length: Math.max(35, count) }, createBlob);
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pickColor() {
  const palette = [
    "rgba(114, 178, 255, 0.45)",
    "rgba(229, 247, 255, 0.52)",
    "rgba(255, 236, 183, 0.42)",
    "rgba(174, 82, 255, 0.36)",
    "rgba(255, 64, 214, 0.34)",
  ];
  return palette[Math.floor(Math.random() * palette.length)];
}

function createBlob() {
  return {
    x: rand(0, window.innerWidth),
    y: rand(0, window.innerHeight),
    r: rand(8, Math.max(40, window.innerWidth * 0.08)),
    color: pickColor(),
    vx: rand(-0.11, 0.11),
    vy: rand(-0.08, 0.08),
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.002, 0.011),
  };
}

function drawBlob(b) {
  const pulse = 1 + Math.sin(state.t * 0.01 + b.wobble) * 0.08;
  const radius = b.r * pulse;

  const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
  g.addColorStop(0, b.color.replace(/0\.[0-9]+\)/, "0.85)"));
  g.addColorStop(0.45, b.color);
  g.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function stepBlob(b) {
  b.x += b.vx;
  b.y += b.vy;
  b.wobble += b.wobbleSpeed;

  if (b.x < -b.r) b.x = window.innerWidth + b.r;
  if (b.x > window.innerWidth + b.r) b.x = -b.r;
  if (b.y < -b.r) b.y = window.innerHeight + b.r;
  if (b.y > window.innerHeight + b.r) b.y = -b.r;
}

function render() {
  state.t += 1;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "rgba(3, 6, 10, 0.38)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.globalCompositeOperation = "screen";
  for (const b of state.blobs) {
    if (state.motionEnabled) stepBlob(b);
    drawBlob(b);
  }
  ctx.globalCompositeOperation = "source-over";

  state.raf = requestAnimationFrame(render);
}

function setMotionLabel() {
  toggleBtn.textContent = state.motionEnabled ? "Disable Motion" : "Enable Motion";
}

toggleBtn.addEventListener("click", () => {
  state.motionEnabled = !state.motionEnabled;
  setMotionLabel();
});

window.addEventListener("resize", resize);

resize();
setMotionLabel();
state.raf = requestAnimationFrame(render);
