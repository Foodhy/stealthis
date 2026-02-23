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
  title: "Theme Transition",
  category: "transitions",
  tech: ["view-transitions-api", "clip-path"],
});

// ── Check support ──
const supportsVT = typeof document.startViewTransition === "function";
if (!supportsVT) document.body.classList.add("no-vt");

// ── Refs ──
const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const label = document.getElementById("toggle-label");

function getCurrentTheme() {
  return root.getAttribute("data-theme") || "dark";
}

function updateLabel() {
  const theme = getCurrentTheme();
  label.textContent = theme === "dark" ? "Switch to Light" : "Switch to Dark";
}

// ── Toggle handler ──
toggle.addEventListener("click", (e) => {
  const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";

  // Set CSS custom properties for click position (used in clip-path animation)
  const rect = toggle.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  root.style.setProperty("--click-x", `${x}px`);
  root.style.setProperty("--click-y", `${y}px`);

  const applyTheme = () => {
    root.setAttribute("data-theme", nextTheme);
    updateLabel();
  };

  if (supportsVT && !prefersReducedMotion()) {
    const transition = document.startViewTransition(applyTheme);
  } else {
    applyTheme();
  }
});

// ── Init ──
updateLabel();
