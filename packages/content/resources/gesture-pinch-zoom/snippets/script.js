/**
 * Pinch-zoom surface: two-pointer pinch, one-pointer pan, wheel zoom, keyboard fallback.
 * Transform model: screen = point * scale + offset, applied as translate() scale().
 */
const viewport = document.getElementById("viewport");
const canvas = document.getElementById("canvas");
const range = document.getElementById("zoomRange");
const zoomOut = document.getElementById("zoomOut");
const status = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const hint = document.getElementById("hint");

const MIN = 1;
const MAX = 6;

let scale = 1;
let x = 0;
let y = 0;

/** Active pointers, keyed by pointerId. */
const pointers = new Map();
/** Snapshot of the pinch gesture when the second pointer lands. */
let pinch = null;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Keep the image covering the viewport: offsets bounded by the overflow at current scale. */
function clampOffsets() {
  const r = viewport.getBoundingClientRect();
  const maxX = r.width * (scale - 1);
  const maxY = r.height * (scale - 1);
  x = clamp(x, -maxX, 0);
  y = clamp(y, -maxY, 0);
}

function render() {
  clampOffsets();
  canvas.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
  range.value = String(scale);
  zoomOut.textContent = `${scale.toFixed(2)}×`;
  status.textContent = `scale ${scale.toFixed(2)}× · offset ${Math.round(x)}, ${Math.round(y)}`;
}

/** Zoom to `next`, keeping the viewport-local point (px, py) anchored under the fingers/cursor. */
function zoomAt(next, px, py) {
  const target = clamp(next, MIN, MAX);
  const ratio = target / scale;
  x = px - (px - x) * ratio;
  y = py - (py - y) * ratio;
  scale = target;
  render();
}

function localPoint(clientX, clientY) {
  const r = viewport.getBoundingClientRect();
  return [clientX - r.left, clientY - r.top];
}

function animate(fn) {
  canvas.dataset.animating = "true";
  fn();
  const done = () => {
    canvas.dataset.animating = "false";
    canvas.removeEventListener("transitionend", done);
  };
  canvas.addEventListener("transitionend", done);
  setTimeout(done, 320);
}

/* ---------- pointer gestures ---------- */

viewport.addEventListener("pointerdown", (e) => {
  viewport.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  hint.dataset.faded = "true";
  canvas.dataset.animating = "false";

  if (pointers.size === 1) {
    viewport.dataset.panning = "true";
  } else if (pointers.size === 2) {
    pinch = snapshot();
  }
});

function snapshot() {
  const [a, b] = [...pointers.values()];
  const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
  const [cx, cy] = localPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
  return { dist, cx, cy, scale, x, y };
}

viewport.addEventListener("pointermove", (e) => {
  const prev = pointers.get(e.pointerId);
  if (!prev) return;
  const dx = e.clientX - prev.x;
  const dy = e.clientY - prev.y;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size >= 2 && pinch) {
    const [a, b] = [...pointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const [cx, cy] = localPoint((a.x + b.x) / 2, (a.y + b.y) / 2);

    // Scale relative to the gesture start, then re-anchor on the moving midpoint
    // so the pinch also pans (two-finger drag) naturally.
    const target = clamp(pinch.scale * (dist / pinch.dist), MIN, MAX);
    const ratio = target / pinch.scale;
    x = cx - (pinch.cx - pinch.x) * ratio;
    y = cy - (pinch.cy - pinch.y) * ratio;
    scale = target;
    render();
  } else if (pointers.size === 1 && scale > MIN) {
    x += dx;
    y += dy;
    render();
  }
});

function endPointer(e) {
  if (!pointers.delete(e.pointerId)) return;
  if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);

  if (pointers.size < 2) pinch = null;
  if (pointers.size === 1) pinch = null; // restart pan cleanly from remaining finger
  if (pointers.size === 0) {
    viewport.dataset.panning = "false";
    // Snap back to fit when the user releases just below 1.05×.
    if (scale < 1.05 && scale !== MIN) {
      animate(() => {
        scale = MIN;
        x = 0;
        y = 0;
        render();
      });
    }
  }
}

["pointerup", "pointercancel", "pointerleave"].forEach((t) =>
  viewport.addEventListener(t, endPointer)
);

/* ---------- wheel / trackpad ---------- */

viewport.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const [px, py] = localPoint(e.clientX, e.clientY);
    zoomAt(scale * Math.exp(-e.deltaY * 0.0015), px, py);
  },
  { passive: false }
);

/* ---------- keyboard fallback ---------- */

viewport.addEventListener("keydown", (e) => {
  const step = e.shiftKey ? 60 : 24;
  const r = viewport.getBoundingClientRect();
  const cx = r.width / 2;
  const cy = r.height / 2;
  const keys = {
    ArrowLeft: () => (x += step),
    ArrowRight: () => (x -= step),
    ArrowUp: () => (y += step),
    ArrowDown: () => (y -= step),
    "+": () => zoomAt(scale * 1.25, cx, cy),
    "=": () => zoomAt(scale * 1.25, cx, cy),
    "-": () => zoomAt(scale / 1.25, cx, cy),
    _: () => zoomAt(scale / 1.25, cx, cy),
    0: () => animate(() => { scale = 1; x = 0; y = 0; }),
  };
  const fn = keys[e.key];
  if (!fn) return;
  e.preventDefault();
  hint.dataset.faded = "true";
  fn();
  render();
});

/* ---------- controls ---------- */

range.addEventListener("input", () => {
  const r = viewport.getBoundingClientRect();
  zoomAt(Number(range.value), r.width / 2, r.height / 2);
});

resetBtn.addEventListener("click", () => {
  animate(() => {
    scale = 1;
    x = 0;
    y = 0;
    render();
  });
  viewport.focus();
});

window.addEventListener("resize", render);
render();
