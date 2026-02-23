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

initDemoShell({
  title: "Card Stack Cascade",
  category: "scroll",
  tech: ["gsap", "scrolltrigger", "3d-transforms"],
});

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

const cards = gsap.utils.toArray(".stack-card");
const total = cards.length;

// Initial stacked position: all centered, slight y offsets, increasing scale-down
cards.forEach((card, i) => {
  gsap.set(card, {
    y: i * -8,
    scale: 1 - (total - 1 - i) * 0.04,
    rotateX: 0,
    zIndex: i,
    opacity: i === total - 1 ? 1 : 0.6,
  });
});

if (!reduced) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".stack-section",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
    },
  });

  // Fan out: each card moves to its final position
  cards.forEach((card, i) => {
    const angle = (i - (total - 1) / 2) * 8; // spread angle
    const xOff = (i - (total - 1) / 2) * 120; // horizontal spread
    const yOff = Math.abs(i - (total - 1) / 2) * 30; // arc shape
    const rot = (i - (total - 1) / 2) * 4; // slight rotation

    tl.to(
      card,
      {
        x: xOff,
        y: yOff,
        rotateY: angle,
        rotateZ: rot,
        scale: 1,
        opacity: 1,
        zIndex: i,
        duration: 1,
        ease: "none",
      },
      0
    );
  });

  // Second phase: cards settle into a grid-like arrangement
  cards.forEach((card, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const gridX = (col - 1) * 200;
    const gridY = row * 240 - 120;

    tl.to(
      card,
      {
        x: gridX,
        y: gridY,
        rotateY: 0,
        rotateZ: 0,
        rotateX: 0,
        scale: 0.85,
        duration: 1,
        ease: "none",
      },
      1
    );
  });
}

// Intro animations
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
