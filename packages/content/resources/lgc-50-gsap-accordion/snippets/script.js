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

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

initDemoShell({
  title: "GSAP Accordion",
  category: "css-canvas",
  tech: ["gsap", "height-auto", "spring-ease", "a11y"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Core accordion logic ──────────────────────────────────────────────────────
// duration and ease shared across all variants
const DURATION = reduced ? 0 : 0.45;
const EASE_OPEN = "expo.out";
const EASE_CLOSE = "expo.in";

/**
 * Open a panel
 * @param {HTMLElement} item  - .acc-item
 * @param {boolean} instant  - skip animation (reduced motion)
 */
function openPanel(item, instant = false) {
  const body = item.querySelector(".acc-body");
  const trigger = item.querySelector(".acc-trigger");
  const arrow = trigger.querySelector(".at-arrow");

  item.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");

  if (instant) {
    gsap.set(body, { height: "auto", overflow: "hidden" });
  } else {
    gsap.to(body, {
      height: "auto",
      duration: DURATION,
      ease: EASE_OPEN,
      overwrite: true,
      onStart: () => {
        body.style.overflow = "hidden";
      },
    });
    gsap.to(arrow, {
      rotation: 180,
      duration: DURATION * 0.8,
      ease: "back.out(2)",
      overwrite: true,
    });
  }
}

/**
 * Close a panel
 * @param {HTMLElement} item  - .acc-item
 * @param {boolean} instant  - skip animation
 */
function closePanel(item, instant = false) {
  const body = item.querySelector(".acc-body");
  const trigger = item.querySelector(".acc-trigger");
  const arrow = trigger.querySelector(".at-arrow");

  item.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");

  if (instant) {
    gsap.set(body, { height: 0 });
  } else {
    gsap.to(body, {
      height: 0,
      duration: DURATION * 0.8,
      ease: EASE_CLOSE,
      overwrite: true,
    });
    gsap.to(arrow, {
      rotation: 0,
      duration: DURATION * 0.6,
      ease: "power2.in",
      overwrite: true,
    });
  }
}

// ── Initialize each accordion ─────────────────────────────────────────────────
document.querySelectorAll(".accordion").forEach((accordion) => {
  const mode = accordion.dataset.mode; // 'exclusive' | 'multi'
  const items = accordion.querySelectorAll(".acc-item");

  // Set initial state — items marked open start open, rest start closed
  items.forEach((item) => {
    const body = item.querySelector(".acc-body");
    const isInitiallyOpen =
      item.classList.contains("acc-item--open") || item.hasAttribute("data-open");

    if (isInitiallyOpen) {
      gsap.set(body, { height: "auto", overflow: "hidden" });
      item.classList.add("is-open");
      const trigger = item.querySelector(".acc-trigger");
      const arrow = trigger.querySelector(".at-arrow");
      if (arrow) gsap.set(arrow, { rotation: 180 });
      trigger.setAttribute("aria-expanded", "true");
    } else {
      gsap.set(body, { height: 0, overflow: "hidden" });
    }

    // Click handler
    item.querySelector(".acc-trigger").addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      if (mode === "exclusive") {
        // Close all other open items first
        items.forEach((other) => {
          if (other !== item && other.classList.contains("is-open")) {
            closePanel(other, reduced);
          }
        });
      }

      if (isOpen) {
        closePanel(item, reduced);
      } else {
        openPanel(item, reduced);
      }
    });
  });
});

// ── Minimal variant: arrow rotates to + / × ──────────────────────────────────
// The minimal accordion uses '+' which rotates to '×' on open
// This is already handled by the rotation tween in openPanel/closePanel

// ── Entrance animations ───────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".page-header > *", { opacity: 0, y: 16 });
  gsap.to(".page-header > *", {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: "expo.out",
    delay: 0.3,
  });

  document.querySelectorAll(".demo-section").forEach((sec, i) => {
    gsap.set(sec, { opacity: 0, y: 24 });
    gsap.to(sec, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "expo.out",
      scrollTrigger: {
        trigger: sec,
        start: "top 78%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Motion toggle ─────────────────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
