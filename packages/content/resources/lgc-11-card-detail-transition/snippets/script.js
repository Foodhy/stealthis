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
  title: "Card Grid Transition",
  category: "transitions",
  tech: ["view-transitions-api", "css"],
});

// ── Check support ──
const supportsVT = typeof document.startViewTransition === "function";
if (!supportsVT) {
  document.body.classList.add("no-vt");
}

// ── Card data ──
const cardData = {
  1: {
    title: "Kinetic Typography",
    desc: "Motion-driven text that responds to scroll, time, and user interaction.",
    hue: 200,
  },
  2: {
    title: "Particle Systems",
    desc: "Thousands of elements choreographed into flowing, organic formations.",
    hue: 270,
  },
  3: {
    title: "Scroll Choreography",
    desc: "Precisely timed sequences that unfold as the user scrolls through content.",
    hue: 330,
  },
  4: {
    title: "Shader Art",
    desc: "GPU-powered visuals that create mesmerizing patterns in real-time.",
    hue: 45,
  },
  5: {
    title: "3D Environments",
    desc: "Immersive three-dimensional spaces built with WebGL and Three.js.",
    hue: 160,
  },
  6: {
    title: "Magnetic Interactions",
    desc: "Elements that attract, repel, and respond to cursor proximity with spring physics.",
    hue: 15,
  },
};

// ── DOM refs ──
const gridView = document.getElementById("grid-view");
const detailView = document.getElementById("detail-view");
const detailImage = document.getElementById("detail-image");
const detailNumber = document.getElementById("detail-number");
const detailTitle = document.getElementById("detail-title");
const detailDesc = document.getElementById("detail-desc");
const backBtn = document.getElementById("back-btn");

let currentId = null;

// ── Navigate to detail ──
function showDetail(id) {
  const data = cardData[id];
  if (!data) return;

  currentId = id;

  const updateDOM = () => {
    // Set view-transition-name on detail elements to match the card
    detailImage.style.viewTransitionName = `card-image-${id}`;
    detailTitle.style.viewTransitionName = `card-title-${id}`;

    // Update detail content
    detailImage.style.background = `linear-gradient(135deg, hsl(${data.hue} 60% 15%), hsl(${data.hue} 80% 25%), hsl(${data.hue + 40} 70% 20%))`;
    detailNumber.textContent = String(id).padStart(2, "0");
    detailTitle.textContent = data.title;
    detailDesc.textContent = data.desc;

    // Clear view-transition-name on the card's elements so they don't conflict
    const cardImage = document.querySelector(`[data-id="${id}"] .card-image`);
    const cardTitle = document.querySelector(`[data-id="${id}"] h3`);
    if (cardImage) cardImage.style.viewTransitionName = "none";
    if (cardTitle) cardTitle.style.viewTransitionName = "none";

    // Swap views
    gridView.classList.remove("active");
    detailView.classList.add("active");
  };

  if (supportsVT && !prefersReducedMotion()) {
    document.startViewTransition(updateDOM);
  } else {
    updateDOM();
  }
}

// ── Navigate back to grid ──
function showGrid() {
  const id = currentId;

  const updateDOM = () => {
    // Restore view-transition-name on original card elements
    if (id) {
      const cardImage = document.querySelector(`[data-id="${id}"] .card-image`);
      const cardTitle = document.querySelector(`[data-id="${id}"] h3`);
      if (cardImage) cardImage.style.viewTransitionName = `card-image-${id}`;
      if (cardTitle) cardTitle.style.viewTransitionName = `card-title-${id}`;
    }

    // Clear detail transition names
    detailImage.style.viewTransitionName = "none";
    detailTitle.style.viewTransitionName = "none";

    // Swap views
    detailView.classList.remove("active");
    gridView.classList.add("active");

    currentId = null;
  };

  if (supportsVT && !prefersReducedMotion()) {
    document.startViewTransition(updateDOM);
  } else {
    updateDOM();
  }
}

// ── Event listeners ──
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    const id = card.dataset.id;
    showDetail(id);
  });
});

backBtn.addEventListener("click", showGrid);

// ── Keyboard navigation ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && detailView.classList.contains("active")) {
    showGrid();
  }
});
