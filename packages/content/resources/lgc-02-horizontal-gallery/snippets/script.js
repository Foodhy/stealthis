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
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ── Demo shell ──
initDemoShell({
  title: "Horizontal Scroll Gallery",
  category: "scroll",
  tech: ["gsap", "lenis", "scrolltrigger"],
});

// ── Lenis ──
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  document.documentElement.classList.toggle("reduced-motion", e.detail.reduced);
  ScrollTrigger.refresh();
});

// ── Refs ──
const track = document.getElementById("horizontal-track");
const panels = gsap.utils.toArray(".panel");
const progressFill = document.getElementById("progress-fill");
const progressBar = document.querySelector(".progress-bar");

// ── Calculate total scroll distance ──
function getScrollWidth() {
  return track.scrollWidth - window.innerWidth;
}

// ── Horizontal scroll pin ──
const horizontalTween = gsap.to(track, {
  x: () => -getScrollWidth(),
  ease: "none",
  scrollTrigger: {
    trigger: ".horizontal-wrap",
    pin: true,
    scrub: 1,
    end: () => `+=${getScrollWidth()}`,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      // Update progress bar
      progressFill.style.width = `${self.progress * 100}%`;
    },
    onEnter: () => progressBar.classList.add("visible"),
    onLeave: () => progressBar.classList.remove("visible"),
    onEnterBack: () => progressBar.classList.add("visible"),
    onLeaveBack: () => progressBar.classList.remove("visible"),
  },
});

// ── Panel entrance animations ──
if (!reduced) {
  panels.forEach((panel) => {
    const inner = panel.querySelector(".panel-inner");

    gsap.set(inner, { opacity: 0.3, scale: 0.88 });

    gsap.to(inner, {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: panel,
        containerAnimation: horizontalTween,
        start: "left 80%",
        end: "left 30%",
        scrub: 1,
      },
    });
  });
}

// ── Intro animations ──
if (!reduced) {
  const introTl = gsap.timeline({ defaults: { ease: "expo.out" } });

  gsap.set(".intro .eyebrow", { opacity: 0, y: 20 });
  gsap.set(".intro h1", { opacity: 0, y: 40 });
  gsap.set(".intro .subtitle", { opacity: 0, y: 25 });
  gsap.set(".intro .scroll-hint", { opacity: 0 });

  introTl
    .to(".intro .eyebrow", { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
    .to(".intro h1", { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
    .to(".intro .subtitle", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".intro .scroll-hint", { opacity: 1, duration: 0.5 }, "-=0.3");
}

// ── Outro reveal ──
if (!reduced) {
  gsap.set(".outro h2", { opacity: 0, y: 40 });
  gsap.set(".btn-back", { opacity: 0, y: 20 });

  gsap.to(".outro h2", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "expo.out",
    scrollTrigger: { trigger: ".outro", start: "top 70%" },
  });

  gsap.to(".btn-back", {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "expo.out",
    scrollTrigger: { trigger: ".outro", start: "top 60%" },
  });
}

// ── Handle resize ──
window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});
