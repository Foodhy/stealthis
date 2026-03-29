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

// ── Demo shell ──
initDemoShell({
  title: "Spotlight Reveal",
  category: "css-canvas",
  tech: ["css-mask", "mouse-tracking"],
});

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
});

// ── Refs ──
const coverLayer = document.getElementById("cover-layer");
const trailContainer = document.getElementById("trail");

// ── Mouse state ──
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const smooth = { x: mouse.x, y: mouse.y };
let spotlightRadius = 140;
let targetRadius = 140;

// ── Trail system ──
const TRAIL_COUNT = 8;
const trailDots = [];

for (let i = 0; i < TRAIL_COUNT; i++) {
  const dot = document.createElement("div");
  dot.className = "trail-dot";
  dot.style.opacity = String(1 - (i / TRAIL_COUNT) * 0.8);
  dot.style.width = `${8 - i * 0.6}px`;
  dot.style.height = `${8 - i * 0.6}px`;
  trailContainer.appendChild(dot);
  trailDots.push({ el: dot, x: mouse.x, y: mouse.y });
}

// ── Events ──
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  targetRadius = 140;
});

document.addEventListener("mousedown", () => {
  targetRadius = 220; // expand spotlight on click
});

document.addEventListener("mouseup", () => {
  targetRadius = 140;
});

// ── Animation loop ──
function tick() {
  if (reduced) {
    requestAnimationFrame(tick);
    return;
  }

  // Smooth mouse
  smooth.x += (mouse.x - smooth.x) * 0.12;
  smooth.y += (mouse.y - smooth.y) * 0.12;

  // Smooth radius
  spotlightRadius += (targetRadius - spotlightRadius) * 0.08;

  // Update cover layer mask
  const maskValue = `radial-gradient(circle ${spotlightRadius}px at ${smooth.x}px ${smooth.y}px, transparent 0%, transparent 60%, black 100%)`;
  coverLayer.style.webkitMaskImage = maskValue;
  coverLayer.style.maskImage = maskValue;

  // Update trail dots (each follows the previous with delay)
  for (let i = 0; i < trailDots.length; i++) {
    const target = i === 0 ? smooth : trailDots[i - 1];
    const dot = trailDots[i];
    const lerp = 0.2 - i * 0.015;

    dot.x += (target.x - dot.x) * Math.max(lerp, 0.04);
    dot.y += (target.y - dot.y) * Math.max(lerp, 0.04);

    dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px)`;
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

// ── Hide trail when mouse leaves ──
document.addEventListener("mouseleave", () => {
  trailContainer.style.opacity = "0";
});

document.addEventListener("mouseenter", () => {
  trailContainer.style.opacity = "1";
});
