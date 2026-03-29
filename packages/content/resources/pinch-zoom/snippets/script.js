const container = document.getElementById("zoomContainer");
const target = document.getElementById("zoomTarget");
const zoomLevelEl = document.getElementById("zoomLevel");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const resetBtn = document.getElementById("resetBtn");

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.5;

let scale = 1;
let tx = 0;
let ty = 0;
let lastScale = 1;
let lastTx = 0;
let lastTy = 0;

// Double-tap detection
let lastTap = 0;

function applyTransform(animated = false) {
  target.style.transition = animated ? "transform 0.25s ease" : "none";
  target.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  zoomLevelEl.textContent = `${scale.toFixed(1)}×`;
}

function clampPan() {
  if (scale <= 1) {
    tx = 0;
    ty = 0;
    return;
  }
  const rect = container.getBoundingClientRect();
  const maxTx = (rect.width * (scale - 1)) / 2;
  const maxTy = (rect.height * (scale - 1)) / 2;
  tx = Math.max(-maxTx, Math.min(maxTx, tx));
  ty = Math.max(-maxTy, Math.min(maxTy, ty));
}

function resetZoom() {
  scale = 1;
  tx = 0;
  ty = 0;
  applyTransform(true);
}

// Touch events
let initialPinchDist = 0;

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

let panStartX = 0;
let panStartY = 0;
let isPanning = false;

container.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      isPanning = false;
      initialPinchDist = getTouchDist(e.touches);
      lastScale = scale;
      lastTx = tx;
      lastTy = ty;
    } else if (e.touches.length === 1) {
      // Pan start or double-tap detection
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double tap — reset
        resetZoom();
        lastTap = 0;
        return;
      }
      lastTap = now;

      if (scale > 1) {
        isPanning = true;
        panStartX = e.touches[0].clientX - tx;
        panStartY = e.touches[0].clientY - ty;
      }
    }
  },
  { passive: true }
);

container.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Pinch zoom
      const dist = getTouchDist(e.touches);
      scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, lastScale * (dist / initialPinchDist)));
      clampPan();
      applyTransform();
    } else if (e.touches.length === 1 && isPanning) {
      // Pan
      tx = e.touches[0].clientX - panStartX;
      ty = e.touches[0].clientY - panStartY;
      clampPan();
      applyTransform();
    }
  },
  { passive: false }
);

container.addEventListener("touchend", () => {
  isPanning = false;
});

// Keyboard zoom
document.addEventListener("keydown", (e) => {
  if (e.key === "+" || e.key === "=") {
    scale = Math.min(MAX_SCALE, scale + ZOOM_STEP);
    clampPan();
    applyTransform(true);
  } else if (e.key === "-") {
    scale = Math.max(MIN_SCALE, scale - ZOOM_STEP);
    clampPan();
    applyTransform(true);
  }
});

// Button controls
zoomInBtn.addEventListener("click", () => {
  scale = Math.min(MAX_SCALE, scale + ZOOM_STEP);
  clampPan();
  applyTransform(true);
});

zoomOutBtn.addEventListener("click", () => {
  scale = Math.max(MIN_SCALE, scale - ZOOM_STEP);
  clampPan();
  applyTransform(true);
});

resetBtn.addEventListener("click", resetZoom);
