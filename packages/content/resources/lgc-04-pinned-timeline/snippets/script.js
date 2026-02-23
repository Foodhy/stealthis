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
  title: "Pinned Scroll Sections",
  category: "scroll",
  tech: ["gsap", "scrolltrigger", "pin"],
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

const dur = (d) => (reduced ? 0 : d);

// ── Helper: update step text + dots ──
function setActiveStep(section, stepIndex) {
  const dots = section.querySelectorAll(".step-dot");
  const texts = section.querySelectorAll(".step-text");

  dots.forEach((dot, i) => dot.classList.toggle("active", i === stepIndex));
  texts.forEach((text, i) => text.classList.toggle("active", i === stepIndex));
}

// ══════════════════════════════════════════════════
// Section 1: Features (Design / Animate / Polish)
// ══════════════════════════════════════════════════

const s1 = document.getElementById("section-features");

const tl1 = gsap.timeline({
  scrollTrigger: {
    trigger: s1,
    pin: true,
    scrub: 1,
    start: "top top",
    end: "+=300%",
  },
});

// Step 0 → 1 transition (Design → Animate)
tl1
  // Step 0: Circle appears
  .to("#vis-circle", { opacity: 1, scale: 1, duration: dur(0.3) }, 0)
  .to(".vis-line-1", { opacity: 1, duration: dur(0.2) }, 0.05)
  // Step 0 → 1: Circle moves, square enters
  .call(() => setActiveStep(s1, 1), [], 0.33)
  .to("#vis-circle", { x: -80, y: -60, scale: 0.8, duration: dur(0.3) }, 0.33)
  .to("#vis-square", { opacity: 1, scale: 1, rotation: 45, duration: dur(0.3) }, 0.33)
  .to(".vis-line-1", { scaleX: 1.5, x: -20, background: "var(--accent)", duration: dur(0.2) }, 0.35)
  .to(".vis-line-2", { opacity: 1, duration: dur(0.2) }, 0.38)
  // Step 1 → 2: All elements arrange, triangle enters
  .call(() => setActiveStep(s1, 2), [], 0.66)
  .to("#vis-circle", { x: -100, y: -80, scale: 0.65, duration: dur(0.3) }, 0.66)
  .to("#vis-square", { x: 80, y: -50, rotation: 90, scale: 0.7, duration: dur(0.3) }, 0.66)
  .to("#vis-triangle", { opacity: 1, y: 60, duration: dur(0.3) }, 0.66)
  .to(".vis-line-3", { opacity: 1, duration: dur(0.2) }, 0.7)
  .to(
    [".vis-line-1", ".vis-line-2", ".vis-line-3"],
    {
      background: "var(--accent)",
      opacity: 0.6,
      duration: dur(0.2),
    },
    0.72
  );

// Initialize step 0
setActiveStep(s1, 0);

// ══════════════════════════════════════════════════
// Section 2: Metrics (Performance / Accessibility / Bundle)
// ══════════════════════════════════════════════════

const s2 = document.getElementById("section-metrics");
const bar1 = s2.querySelector("#bar-1 .bar-fill");
const bar2 = s2.querySelector("#bar-2 .bar-fill");
const bar3 = s2.querySelector("#bar-3 .bar-fill");

const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: s2,
    pin: true,
    scrub: 1,
    start: "top top",
    end: "+=300%",
    onUpdate: (self) => {
      const p = self.progress;

      // Bar 1 fills in step 0 (0–0.33)
      const b1 = gsap.utils.clamp(0, 1, p / 0.33);
      bar1.style.width = `${b1 * 95}%`;

      // Bar 2 fills in step 1 (0.33–0.66)
      const b2 = gsap.utils.clamp(0, 1, (p - 0.33) / 0.33);
      bar2.style.width = `${b2 * 100}%`;

      // Bar 3 fills in step 2 (0.66–1)
      const b3 = gsap.utils.clamp(0, 1, (p - 0.66) / 0.34);
      bar3.style.width = `${b3 * 88}%`;

      // Step indicators
      if (p < 0.33) setActiveStep(s2, 0);
      else if (p < 0.66) setActiveStep(s2, 1);
      else setActiveStep(s2, 2);
    },
  },
});

setActiveStep(s2, 0);

// ── Intro animations ──
if (!reduced) {
  gsap.set(".intro .eyebrow", { opacity: 0, y: 20 });
  gsap.set(".intro h1", { opacity: 0, y: 40 });
  gsap.set(".intro .subtitle", { opacity: 0, y: 25 });

  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .to(".intro .eyebrow", { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
    .to(".intro h1", { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
    .to(".intro .subtitle", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");
}
