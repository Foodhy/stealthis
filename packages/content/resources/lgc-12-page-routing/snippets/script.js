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
  title: "Page Routing Transitions",
  category: "transitions",
  tech: ["view-transitions-api", "spa-routing"],
});

const supportsVT = typeof document.startViewTransition === "function";
const pages = ["home", "about", "work", "contact"];
let currentPage = "home";
let currentIndex = 0;

const navLinks = document.querySelectorAll(".nav-link");

function navigateTo(pageName) {
  if (pageName === currentPage) return;

  const newIndex = pages.indexOf(pageName);
  const goingForward = newIndex > currentIndex;

  const updateDOM = () => {
    // Hide current page
    document.getElementById(`page-${currentPage}`).classList.remove("active");

    // Show new page
    document.getElementById(`page-${pageName}`).classList.add("active");

    // Update nav
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.page === pageName);
    });

    currentPage = pageName;
    currentIndex = newIndex;
  };

  if (supportsVT && !prefersReducedMotion()) {
    // Set direction class for CSS animation direction
    document.documentElement.classList.toggle("nav-back", !goingForward);

    document.startViewTransition(updateDOM);
  } else {
    updateDOM();
  }
}

// Nav click handlers
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo(link.dataset.page);
  });
});

// Handle hash-based navigation
function handleHash() {
  const hash = window.location.hash.replace("#", "") || "home";
  if (pages.includes(hash)) {
    navigateTo(hash);
  }
}

window.addEventListener("hashchange", handleHash);

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    const next = pages[Math.min(currentIndex + 1, pages.length - 1)];
    navigateTo(next);
    window.location.hash = next;
  } else if (e.key === "ArrowLeft") {
    const prev = pages[Math.max(currentIndex - 1, 0)];
    navigateTo(prev);
    window.location.hash = prev;
  }
});
