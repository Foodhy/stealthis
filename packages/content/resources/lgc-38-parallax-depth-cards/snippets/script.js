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
  title: "Parallax Depth Card Grid",
  category: "scroll",
  tech: ["gsap", "scrolltrigger", "css-3d-transforms"],
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

// Card entrance animations with depth stagger
const cards = document.querySelectorAll(".card");
cards.forEach((card) => {
  const depth = Number.parseFloat(card.style.getPropertyValue("--depth")) || 0.5;
  const index = Number.parseInt(card.style.getPropertyValue("--index"), 10) || 0;

  // Initial state
  gsap.set(card, {
    opacity: 0,
    y: 80,
    scale: 0.8,
    rotationY: -15,
    rotationX: 10,
  });

  if (!reduced) {
    // Entrance animation with depth-based delay
    gsap.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationY: 0,
      rotationX: 0,
      duration: 1,
      ease: "expo.out",
      delay: depth * 0.3, // Depth determines stagger
      scrollTrigger: {
        trigger: ".cards-container",
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
    });

    // Hover lift effect
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -20,
        boxShadow: "0 30px 60px rgba(134, 232, 255, 0.2)",
        duration: 0.4,
        overwrite: "auto",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        duration: 0.4,
        overwrite: "auto",
      });
    });
  }
});

// Parallax depth during scroll
if (!reduced) {
  gsap.to(".cards-grid", {
    scrollTrigger: {
      trigger: ".cards-container",
      start: "top center",
      end: "bottom center",
      scrub: 1,
      onUpdate: (self) => {
        cards.forEach((card, i) => {
          const depth = Number.parseFloat(card.style.getPropertyValue("--depth")) || 0.5;
          const offset = self.progress * depth * 50; // Parallax amount
          gsap.set(card, { y: offset, overwrite: "auto" });
        });
      },
    },
  });
}

// Details section reveals
document.querySelectorAll(".details h2, .details h3, .details p, .details ul").forEach((el) => {
  if (!reduced) {
    gsap.set(el, { opacity: 0, y: 30 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "expo.out",
      scrollTrigger: {
        trigger: el,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }
});

// List items
document.querySelectorAll(".details ul li").forEach((li, i) => {
  if (!reduced) {
    gsap.set(li, { opacity: 0, x: -20 });
    gsap.to(li, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "expo.out",
      delay: 0.05 * i,
      scrollTrigger: {
        trigger: li,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }
});

// Motion preference listener
window.addEventListener("motion-preference", (e) => {
  if (e.detail.reduced) {
    gsap.globalTimeline.paused(true);
  } else {
    gsap.globalTimeline.paused(false);
  }
});
