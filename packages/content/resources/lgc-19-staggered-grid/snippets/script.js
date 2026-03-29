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
  title: "Staggered Grid Entrance",
  category: "css-canvas",
  tech: ["intersection-observer", "css-keyframes"],
});

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
});

// ── Config ──
const ITEM_COUNT = 24;
const grid = document.getElementById("grid");
let currentStyle = "fade-up";
let observer = null;

// ── Labels for items ──
const labels = [
  "Motion",
  "Design",
  "Scroll",
  "Canvas",
  "WebGL",
  "Shader",
  "Particle",
  "Spring",
  "Easing",
  "Timeline",
  "Trigger",
  "Parallax",
  "Morph",
  "Blend",
  "Filter",
  "Stagger",
  "Pinch",
  "Orbit",
  "Flow",
  "Ripple",
  "Glow",
  "Pulse",
  "Wave",
  "Drift",
];

// ── Generate grid items ──
function generateItems() {
  grid.innerHTML = "";

  for (let i = 0; i < ITEM_COUNT; i++) {
    const item = document.createElement("div");
    item.className = `grid-item anim-${currentStyle}`;

    // Compute grid position for stagger delay
    const cols = getColumnCount();
    const row = Math.floor(i / cols);
    const col = i % cols;
    const delay = row * 0.05 + col * 0.08;
    item.style.setProperty("--delay", `${delay}s`);

    // Hue based on position
    const hue = (i / ITEM_COUNT) * 360;
    item.style.setProperty("--item-hue", String(Math.round(hue)));

    // For slide-sides: alternate direction based on column
    item.style.setProperty("--slide-dir", col % 2 === 0 ? "-1" : "1");

    item.innerHTML = `
      <span class="item-number">${String(i + 1).padStart(2, "0")}</span>
      <span class="item-label">${labels[i] || "Item"}</span>
    `;

    grid.appendChild(item);
  }

  setupObserver();
}

// ── Get current column count ──
function getColumnCount() {
  if (grid.children.length === 0) return 4;
  const gridStyle = getComputedStyle(grid);
  const cols = gridStyle.gridTemplateColumns.split(" ").length;
  return cols;
}

// ── IntersectionObserver ──
function setupObserver() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
  );

  document.querySelectorAll(".grid-item").forEach((item) => {
    if (!reduced) {
      observer.observe(item);
    } else {
      item.classList.add("visible");
    }
  });
}

// ── Style picker ──
document.querySelectorAll(".style-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".style-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentStyle = btn.dataset.style;

    // Reset and regenerate
    generateItems();

    // Scroll back to grid to re-trigger animations
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ── Recalculate delays on resize ──
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const cols = getColumnCount();
    document.querySelectorAll(".grid-item").forEach((item, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const delay = row * 0.05 + col * 0.08;
      item.style.setProperty("--delay", `${delay}s`);
      item.style.setProperty("--slide-dir", col % 2 === 0 ? "-1" : "1");
    });
  }, 200);
});

// ── Init ──
generateItems();
