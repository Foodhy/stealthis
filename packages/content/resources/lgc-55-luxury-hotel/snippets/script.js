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
  title: "Grand Résidence — Luxury Hotel",
  category: "pages",
  tech: ["gsap", "css-scroll-snap", "lenis", "playfair", "lato"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// Nav color based on panel
const nav = document.getElementById("nav");
const snapContainer = document.getElementById("snap-container");
const panels = document.querySelectorAll(".snap-panel");
const lightPanels = new Set(["panel-room", "panel-dining"]);

function updateNav() {
  const containerRect = snapContainer.getBoundingClientRect();
  let visiblePanel = null;
  panels.forEach((p) => {
    const r = p.getBoundingClientRect();
    const overlap = Math.min(r.bottom, containerRect.bottom) - Math.max(r.top, containerRect.top);
    if (!visiblePanel || overlap > 0) visiblePanel = p;
  });
  if (visiblePanel) {
    const isLight = lightPanels.has(
      [...visiblePanel.classList].find((c) => c.startsWith("panel-"))
    );
    nav.classList.toggle("on-light", !!isLight);
  }
}

snapContainer.addEventListener("scroll", updateNav);
updateNav();

// Hero entrance
if (!reduced) {
  gsap.set([".ph-season", ".ph-center > *", ".ph-bottom"], { opacity: 0, y: 20 });
  gsap
    .timeline({ delay: 0.5, defaults: { ease: "expo.out" } })
    .to(".ph-season", { opacity: 1, y: 0, duration: 0.8 })
    .to(".ph-center > *", { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, "-=0.4")
    .to(".ph-bottom", { opacity: 1, y: 0, duration: 0.7 }, "-=0.3");
}

// IntersectionObserver for panel entrance animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || reduced) return;
      const panel = entry.target;

      if (panel.classList.contains("panel-room")) {
        gsap.set([".pr-content > *"], { opacity: 0, x: 30 });
        gsap.to(".pr-content > *", {
          opacity: 1,
          x: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          delay: 0.2,
        });
        gsap.set(".pr-image--1", { scale: 1.05 });
        gsap.to(".pr-image--1", { scale: 1, duration: 1.2, ease: "power2.out" });
      }

      if (panel.classList.contains("panel-amenities")) {
        gsap.set(".amen-item", { opacity: 0, y: 20 });
        gsap.to(".amen-item", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "expo.out",
          delay: 0.3,
        });
      }

      if (panel.classList.contains("panel-dining")) {
        gsap.set([".pd-content > *"], { opacity: 0, x: 30 });
        gsap.to(".pd-content > *", {
          opacity: 1,
          x: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          delay: 0.2,
        });
      }

      if (panel.classList.contains("panel-contact")) {
        gsap.set([".pc2-content > *", ".rf-field", ".rf-row"], { opacity: 0, y: 18 });
        gsap.to([".pc2-content > *", ".rf-row", ".rf-field", ".btn-submit"], {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "expo.out",
          delay: 0.2,
        });
      }

      observer.unobserve(panel);
    });
  },
  { root: snapContainer, threshold: 0.5 }
);

panels.forEach((p) => observer.observe(p));

// Amenity icon hover sparkle
if (!reduced) {
  document.querySelectorAll(".amen-item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      gsap.to(item.querySelector(".ai-icon"), { rotation: 45, duration: 0.3, ease: "back.out(2)" });
    });
    item.addEventListener("mouseleave", () => {
      gsap.to(item.querySelector(".ai-icon"), { rotation: 0, duration: 0.3, ease: "back.out(2)" });
    });
  });
}

// Hero scroll hint button click → scroll snap to room panel
document.getElementById("hero-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("rooms").scrollIntoView({ behavior: "smooth" });
});

window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
