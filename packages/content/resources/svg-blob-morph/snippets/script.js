/**
 * Blob Morph — real path interpolation, zero dependencies.
 *
 * Each shape is a ring of POINTS radial samples around a centre. Because every
 * shape uses the same point count in the same angular order, the shapes are
 * "compatible": morphing is a plain lerp of matching coordinates, then a
 * Catmull-Rom -> cubic Bezier conversion to keep the outline soft and closed.
 */

const POINTS = 8;
const CX = 160;
const CY = 160;
const BASE_R = 108;
const HOLD = 260; // ms paused on each shape before the next transition

const svgPath = document.getElementById("blob");
const ghostPath = document.getElementById("blobGhost");
const stage = document.getElementById("stage");
const toggleBtn = document.getElementById("toggle");
const stepBtn = document.getElementById("step");
const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const outlineInput = document.getElementById("outline");
const readout = document.getElementById("readout");

/* ---------- shape definitions (radius multiplier per angular slot) ---------- */

const SHAPES = [
  [1.0, 0.82, 1.06, 0.88, 1.02, 0.84, 1.08, 0.9],
  [0.86, 1.1, 0.8, 1.04, 0.92, 1.12, 0.82, 1.0],
  [1.12, 0.94, 0.9, 1.1, 0.86, 0.98, 1.06, 0.8],
  [0.94, 1.04, 1.0, 0.82, 1.1, 0.9, 0.96, 1.08],
];

function toPoints(shape) {
  return shape.map((k, i) => {
    const angle = (i / POINTS) * Math.PI * 2 - Math.PI / 2;
    const r = BASE_R * k;
    return [CX + Math.cos(angle) * r, CY + Math.sin(angle) * r];
  });
}

const RINGS = SHAPES.map(toPoints);

/* ---------- geometry helpers ---------- */

function lerpRings(a, b, t) {
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = [a[i][0] + (b[i][0] - a[i][0]) * t, a[i][1] + (b[i][1] - a[i][1]) * t];
  }
  return out;
}

/** Closed Catmull-Rom spline through all points, emitted as cubic Beziers. */
function toPathData(points) {
  const n = points.length;
  const at = (i) => points[(i + n) % n];
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;

  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d} Z`;
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------- animation state ---------- */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const DURATION = 1400; // ms per morph at 1x

let from = 0;
let to = 1;
let progress = 0; // 0..1 within the current morph
let holdLeft = HOLD;
let speed = 1;
let playing = true;
let raf = null;
let last = 0;

function render() {
  const t = easeInOut(progress);
  svgPath.setAttribute("d", toPathData(lerpRings(RINGS[from], RINGS[to], t)));
  ghostPath.setAttribute("d", toPathData(RINGS[to]));
  readout.textContent = `shape ${from + 1} → ${to + 1} · ${Math.round(t * 100)}%`;
}

function advance() {
  from = to;
  to = (to + 1) % RINGS.length;
  progress = 0;
  holdLeft = HOLD;
}

function frame(now) {
  const dt = Math.min(now - last, 64);
  last = now;

  if (holdLeft > 0) {
    holdLeft -= dt * speed;
  } else {
    progress += (dt * speed) / DURATION;
    if (progress >= 1) {
      progress = 1;
      render();
      advance();
      raf = requestAnimationFrame(frame);
      return;
    }
  }

  render();
  raf = requestAnimationFrame(frame);
}

function play() {
  if (raf !== null) return;
  playing = true;
  last = performance.now();
  raf = requestAnimationFrame(frame);
  stage.classList.remove("is-paused");
  toggleBtn.textContent = "Pause";
  toggleBtn.setAttribute("aria-pressed", "false");
}

function pause() {
  if (raf !== null) cancelAnimationFrame(raf);
  raf = null;
  playing = false;
  stage.classList.add("is-paused");
  toggleBtn.textContent = "Play";
  toggleBtn.setAttribute("aria-pressed", "true");
}

/* ---------- controls ---------- */

toggleBtn.addEventListener("click", () => (playing ? pause() : play()));

// Works while paused too: snaps to the next shape (keyboard-friendly stepping).
stepBtn.addEventListener("click", () => {
  progress = 1;
  render();
  advance();
  render();
});

speedInput.addEventListener("input", () => {
  speed = Number(speedInput.value);
  speedValue.textContent = `${speed.toFixed(2)}×`;
});

outlineInput.addEventListener("change", () => {
  stage.classList.toggle("is-outline", outlineInput.checked);
});

// Pause when the tab is hidden so timing never jumps on return.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && playing) {
    cancelAnimationFrame(raf);
    raf = null;
  } else if (!document.hidden && playing && raf === null) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
});

/* ---------- boot ---------- */

render();

if (reduced.matches) {
  // Reduced motion: hold a static blob; the buttons still allow manual stepping.
  pause();
  readout.textContent = "static · reduced motion";
} else {
  play();
}
