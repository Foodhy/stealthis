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
import { TextPlugin } from "gsap/TextPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

initDemoShell({
  title: "Scroll-Linked Number Counters",
  category: "scroll",
  tech: ["gsap", "scrolltrigger", "textplugin"],
});

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// Intro animation
if (!reduced) {
  gsap.set(".hero .eyebrow", { opacity: 0, y: 20 });
  gsap.set(".hero h1", { opacity: 0, y: 40 });
  gsap.set(".hero .subtitle", { opacity: 0, y: 25 });

  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
    .to(".hero h1", { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
    .to(".hero .subtitle", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");
}

// Counter animation configuration
const metricCards = document.querySelectorAll(".metric-card");

metricCards.forEach((card, index) => {
  const valueEl = card.querySelector(".metric-value");
  const target = Number.parseFloat(valueEl.dataset.target);

  if (!reduced) {
    // Entrance animation
    gsap.set(card, { opacity: 0, y: 40 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "expo.out",
      delay: 0.1 * index,
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  }

  // Counter animation — synced to scroll
  gsap.to(valueEl, {
    text: target,
    duration: 1.5,
    ease: "power1.inOut",
    snap: { text: 1 }, // Only update on integer changes
    scrub: 1, // Link directly to scroll position
    scrollTrigger: {
      trigger: card,
      start: "top 80%",
      end: "top 30%",
      onUpdate: (self) => {
        // Optional: add visual feedback during scroll
        if (self.direction === 1) {
          card.classList.add("scrolling");
        }
      },
    },
  });

  // Remove scrolling class when done
  ScrollTrigger.create({
    trigger: card,
    start: "top 30%",
    onLeave: () => card.classList.remove("scrolling"),
    onEnterBack: () => card.classList.add("scrolling"),
  });
});

// Section reveals
document
  .querySelectorAll(".details-section h2, .details-section h3, .final-section h2")
  .forEach((el) => {
    if (!reduced) {
      gsap.set(el, { opacity: 0, y: 30 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse" },
      });
    }
  });

document
  .querySelectorAll(".details-section p, .details-section ul, .final-section p, .final-section ol")
  .forEach((el) => {
    if (!reduced) {
      gsap.set(el, { opacity: 0, y: 20 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse" },
      });
    }
  });

// Motion preference listener
window.addEventListener("motion-preference", (e) => {
  if (e.detail.reduced) {
    // Pause all animations
    gsap.globalTimeline.paused(true);
  } else {
    // Resume
    gsap.globalTimeline.paused(false);
  }
});
