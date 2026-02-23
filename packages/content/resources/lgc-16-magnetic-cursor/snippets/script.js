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
  title: "Magnetic Cursor",
  category: "css-canvas",
  tech: ["vanilla-js", "spring-physics"],
});

// ── Reduced motion ──
let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
});

// ── Cursor elements ──
const ring = document.getElementById("cursor-ring");
const dot = document.getElementById("cursor-dot");

// ── State ──
const cursor = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  ringX: window.innerWidth / 2,
  ringY: window.innerHeight / 2,
  dotX: window.innerWidth / 2,
  dotY: window.innerHeight / 2,
  hovering: false,
};

// ── Mouse tracking ──
document.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});

document.addEventListener("mousedown", () => {
  ring.classList.add("clicking");
});

document.addEventListener("mouseup", () => {
  ring.classList.remove("clicking");
});

// ── Magnetic elements ──
const magneticEls = document.querySelectorAll("[data-magnetic]");
const MAGNETIC_RADIUS = 80; // px detection radius

const magneticStates = new Map();
magneticEls.forEach((el) => {
  magneticStates.set(el, { offsetX: 0, offsetY: 0 });

  el.addEventListener("mouseenter", () => {
    cursor.hovering = true;
    ring.classList.add("hovering");
  });

  el.addEventListener("mouseleave", () => {
    cursor.hovering = false;
    ring.classList.remove("hovering");
    // Reset element position
    const state = magneticStates.get(el);
    state.offsetX = 0;
    state.offsetY = 0;
  });
});

// ── Animation loop ──
function tick() {
  if (reduced) {
    requestAnimationFrame(tick);
    return;
  }

  // Ring follows with slower spring (creates trailing feel)
  cursor.ringX += (cursor.x - cursor.ringX) * 0.12;
  cursor.ringY += (cursor.y - cursor.ringY) * 0.12;

  // Dot follows faster (nearly instant)
  cursor.dotX += (cursor.x - cursor.dotX) * 0.35;
  cursor.dotY += (cursor.y - cursor.dotY) * 0.35;

  ring.style.transform = `translate(${cursor.ringX - 20}px, ${cursor.ringY - 20}px)`;
  dot.style.transform = `translate(${cursor.dotX - 3}px, ${cursor.dotY - 3}px)`;

  // Update magnetic elements
  magneticEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = cursor.x - centerX;
    const dy = cursor.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const state = magneticStates.get(el);
    const strength = Number.parseFloat(el.dataset.magneticStrength) || 0.3;

    if (dist < MAGNETIC_RADIUS) {
      // Pull element toward cursor
      const pull = (1 - dist / MAGNETIC_RADIUS) * strength;
      state.offsetX += (dx * pull - state.offsetX) * 0.15;
      state.offsetY += (dy * pull - state.offsetY) * 0.15;
    } else {
      // Spring back to origin
      state.offsetX += (0 - state.offsetX) * 0.1;
      state.offsetY += (0 - state.offsetY) * 0.1;
    }

    // Apply transform
    if (Math.abs(state.offsetX) > 0.01 || Math.abs(state.offsetY) > 0.01) {
      el.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px)`;
    } else {
      el.style.transform = "";
    }
  });

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

// ── Hide cursor when leaving window ──
document.addEventListener("mouseleave", () => {
  ring.style.opacity = "0";
  dot.style.opacity = "0";
});

document.addEventListener("mouseenter", () => {
  ring.style.opacity = "1";
  dot.style.opacity = "1";
});
