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
  title: "Image Gallery Transitions",
  category: "transitions",
  tech: ["view-transitions-api", "crossfade"],
});

const supportsVT = typeof document.startViewTransition === "function";
const heroImage = document.getElementById("hero-image");
const heroNumber = document.getElementById("hero-number");
const heroLabel = document.getElementById("hero-label");
const thumbs = document.querySelectorAll(".thumb");

let currentIndex = 0;

function selectImage(index) {
  if (index === currentIndex) return;

  const thumb = document.querySelector(`.thumb[data-index="${index}"]`);
  if (!thumb) return;

  const hue = thumb.dataset.hue;
  const label = thumb.dataset.label;
  const num = String(index + 1).padStart(2, "0");

  const updateDOM = () => {
    heroImage.style.setProperty("--hue", hue);
    heroNumber.textContent = num;
    heroLabel.textContent = label;

    thumbs.forEach((t, i) => t.classList.toggle("active", i === index));
    currentIndex = index;
  };

  if (supportsVT && !prefersReducedMotion()) {
    document.startViewTransition(updateDOM);
  } else {
    updateDOM();
  }
}

// Click handlers
thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    selectImage(Number.parseInt(thumb.dataset.index, 10));
  });
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    selectImage(Math.min(currentIndex + 1, thumbs.length - 1));
  } else if (e.key === "ArrowLeft") {
    selectImage(Math.max(currentIndex - 1, 0));
  }
});
