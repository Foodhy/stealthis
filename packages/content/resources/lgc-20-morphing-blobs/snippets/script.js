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

function prefersReducedMotion() {
  return window.MotionPreference.prefersReducedMotion();
}

function initDemoShell() {
  // No-op shim in imported standalone snippets.
}

initDemoShell({
  title: "Morphing Blobs",
  category: "css-canvas",
  tech: ["css-border-radius", "svg-path", "canvas-bezier"],
});

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ─── SVG Path Morphing ───────────────────────────────────────────────

const svgPath = document.getElementById("svg-morph-path");

// Two blob shapes with matching point counts (cubic bezier, 6 segments)
const shapeA = [
  [100, 20],
  [160, 30],
  [190, 80],
  [180, 140],
  [150, 180],
  [90, 190],
  [30, 160],
  [10, 100],
  [20, 50],
  [60, 20],
];

const shapeB = [
  [100, 10],
  [170, 40],
  [195, 100],
  [170, 160],
  [130, 195],
  [70, 185],
  [20, 150],
  [5, 90],
  [30, 40],
  [70, 10],
];

const shapeC = [
  [110, 15],
  [180, 50],
  [185, 110],
  [160, 170],
  [110, 190],
  [50, 175],
  [15, 130],
  [10, 70],
  [40, 25],
  [80, 10],
];

const svgShapes = [shapeA, shapeB, shapeC, shapeB];

function pointsToPath(points) {
  if (points.length < 3) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[(i + 1) % points.length];

    const cpx1 = prev[0] + (curr[0] - prev[0]) * 0.5;
    const cpy1 = prev[1] + (curr[1] - prev[1]) * 0.5;
    const cpx2 = curr[0] - (next[0] - prev[0]) * 0.15;
    const cpy2 = curr[1] - (next[1] - prev[1]) * 0.15;

    d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr[0]} ${curr[1]}`;
  }
  d += " Z";
  return d;
}

function lerpPoints(a, b, t) {
  return a.map((pt, i) => [pt[0] + (b[i][0] - pt[0]) * t, pt[1] + (b[i][1] - pt[1]) * t]);
}

let svgTime = 0;
const SVG_SEGMENT_DURATION = 2000; // ms per transition
let svgRAF;

function animateSVG(timestamp) {
  svgTime += 16.67; // ~60fps timestep
  const totalDuration = SVG_SEGMENT_DURATION * svgShapes.length;
  const loopTime = svgTime % totalDuration;
  const segIndex = Math.floor(loopTime / SVG_SEGMENT_DURATION);
  const segT = (loopTime % SVG_SEGMENT_DURATION) / SVG_SEGMENT_DURATION;

  // Smooth easing
  const eased = segT < 0.5 ? 4 * segT * segT * segT : 1 - Math.pow(-2 * segT + 2, 3) / 2;

  const from = svgShapes[segIndex];
  const to = svgShapes[(segIndex + 1) % svgShapes.length];
  const interpolated = lerpPoints(from, to, eased);

  svgPath.setAttribute("d", pointsToPath(interpolated));
  svgRAF = requestAnimationFrame(animateSVG);
}

// Set initial shape
svgPath.setAttribute("d", pointsToPath(shapeA));

if (!reduced) {
  svgRAF = requestAnimationFrame(animateSVG);
}

// ─── Canvas Bezier Blob ──────────────────────────────────────────────

const canvas = document.getElementById("canvas-blob");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;
const CX = W / 2;
const CY = H / 2;

const NUM_POINTS = 8;
const BASE_RADIUS = 80;
const WOBBLE = 25;

// Each point has a unique frequency and phase
const blobPoints = Array.from({ length: NUM_POINTS }, (_, i) => ({
  angle: (i / NUM_POINTS) * Math.PI * 2,
  freq: 0.5 + Math.random() * 1.5,
  phase: Math.random() * Math.PI * 2,
  amp: WOBBLE * (0.6 + Math.random() * 0.4),
}));

let canvasTime = 0;
let canvasRAF;

function drawBlob() {
  canvasTime += 0.015;
  ctx.clearRect(0, 0, W, H);

  // Calculate points on the blob
  const pts = blobPoints.map((p) => {
    const r = BASE_RADIUS + Math.sin(canvasTime * p.freq + p.phase) * p.amp;
    return {
      x: CX + Math.cos(p.angle) * r,
      y: CY + Math.sin(p.angle) * r,
    };
  });

  // Draw using smooth bezier curves (Catmull-Rom to Bezier conversion)
  const gradient = ctx.createRadialGradient(CX - 20, CY - 20, 10, CX, CY, BASE_RADIUS + WOBBLE);
  gradient.addColorStop(0, "rgba(134, 232, 255, 0.9)");
  gradient.addColorStop(0.5, "rgba(61, 158, 255, 0.7)");
  gradient.addColorStop(1, "rgba(174, 82, 255, 0.4)");

  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const p3 = pts[(i + 2) % pts.length];

    if (i === 0) {
      ctx.moveTo(p1.x, p1.y);
    }

    // Catmull-Rom to cubic bezier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();

  // Subtle inner glow
  ctx.shadowColor = "rgba(134, 232, 255, 0.3)";
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowBlur = 0;

  canvasRAF = requestAnimationFrame(drawBlob);
}

// Draw static blob for reduced motion
function drawStaticBlob() {
  ctx.clearRect(0, 0, W, H);
  const pts = blobPoints.map((p) => ({
    x: CX + Math.cos(p.angle) * BASE_RADIUS,
    y: CY + Math.sin(p.angle) * BASE_RADIUS,
  }));

  const gradient = ctx.createRadialGradient(CX - 20, CY - 20, 10, CX, CY, BASE_RADIUS);
  gradient.addColorStop(0, "rgba(134, 232, 255, 0.9)");
  gradient.addColorStop(0.5, "rgba(61, 158, 255, 0.7)");
  gradient.addColorStop(1, "rgba(174, 82, 255, 0.4)");

  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const p3 = pts[(i + 2) % pts.length];

    if (i === 0) ctx.moveTo(p1.x, p1.y);

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
}

if (!reduced) {
  canvasRAF = requestAnimationFrame(drawBlob);
} else {
  drawStaticBlob();
}

// ─── Motion Preference Toggle ────────────────────────────────────────

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);

  if (reduced) {
    // Stop SVG animation
    cancelAnimationFrame(svgRAF);
    // Stop canvas animation, draw static
    cancelAnimationFrame(canvasRAF);
    drawStaticBlob();
  } else {
    // Resume SVG
    svgRAF = requestAnimationFrame(animateSVG);
    // Resume canvas
    canvasRAF = requestAnimationFrame(drawBlob);
  }
});
