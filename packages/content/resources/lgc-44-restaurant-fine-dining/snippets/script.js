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
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

initDemoShell({
  title: "Fine Dining Restaurant",
  category: "pages",
  tech: ["gsap", "splittext", "scrolltrigger", "lenis"],
});

const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Nav scroll effect ────────────────────────────────────
const nav = document.getElementById("nav");
ScrollTrigger.create({
  start: "top -80",
  onUpdate: (self) => {
    nav.classList.toggle("scrolled", self.scroll() > 80);
  },
});

// ── Hero entrance ────────────────────────────────────────
if (!reduced) {
  gsap.set(".hero-pre", { opacity: 0, y: 15 });
  gsap.set(".hero-desc", { opacity: 0, y: 20 });
  gsap.set(".hero-actions", { opacity: 0, y: 20 });
  gsap.set(".hero-scroll", { opacity: 0 });

  const heroSplit = new SplitText(".hero-title .line", { type: "chars" });
  gsap.set(heroSplit.chars, { opacity: 0, y: 60, rotationX: -30 });

  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to(".hero-pre", { opacity: 1, y: 0, duration: 0.9, delay: 0.5 })
    .to(heroSplit.chars, { opacity: 1, y: 0, rotationX: 0, duration: 1.2, stagger: 0.025 }, "-=0.5")
    .to(".hero-desc", { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
    .to(".hero-actions", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".hero-scroll", { opacity: 1, duration: 0.6 }, "-=0.2");
}

// ── Hero parallax ─────────────────────────────────────────
if (!reduced) {
  gsap.to(".hero-image", {
    yPercent: 25,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  gsap.to(".hero-content", {
    yPercent: 15,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "60% top", end: "bottom top", scrub: true },
  });
}

// ── Philosophy ───────────────────────────────────────────
if (!reduced) {
  gsap.set(".deco-circle", { scale: 0.6, opacity: 0 });
  gsap.to(".deco-circle", {
    scale: 1,
    opacity: 1,
    duration: 1.5,
    ease: "expo.out",
    scrollTrigger: { trigger: ".philosophy-section", start: "top 70%" },
  });

  const philSplit = new SplitText(".philosophy-text h2", { type: "lines" });
  gsap.set(philSplit.lines, { opacity: 0, y: 40 });
  gsap.to(philSplit.lines, {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.15,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".philosophy-text",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".attr, .body-text", { opacity: 0, y: 20 });
  gsap.to(".attr, .body-text", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".philosophy-text",
      start: "top 65%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Menu items stagger ───────────────────────────────────
document.querySelectorAll(".menu-item").forEach((item, i) => {
  if (!reduced) {
    gsap.set(item, { opacity: 0, y: 50 });
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: item, start: "top 80%", toggleActions: "play none none reverse" },
    });

    // Image parallax within item
    const img = item.querySelector(".menu-img");
    if (img) {
      gsap.to(img, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
      });
    }
  }
});

// Menu header
if (!reduced) {
  gsap.set(".menu-header .section-label, .menu-header h2", { opacity: 0, y: 30 });
  gsap.to(".menu-header .section-label, .menu-header h2", {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".menu-header",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Story section ────────────────────────────────────────
if (!reduced) {
  // Images reveal
  gsap.set(".story-img--main", { opacity: 0, scale: 1.05 });
  gsap.to(".story-img--main", {
    opacity: 1,
    scale: 1,
    duration: 1.3,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".story-grid",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".story-img--accent", { opacity: 0, x: 30 });
  gsap.to(".story-img--accent", {
    opacity: 1,
    x: 0,
    duration: 1,
    delay: 0.3,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".story-grid",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  // Story year parallax
  gsap.to(".story-year", {
    yPercent: -20,
    ease: "none",
    scrollTrigger: {
      trigger: ".story-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  // Text reveal
  const storySplit = new SplitText(".story-content h2", { type: "lines" });
  gsap.set(storySplit.lines, { opacity: 0, y: 30 });
  gsap.to(storySplit.lines, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".story-content",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".story-content p", { opacity: 0, y: 20 });
  gsap.to(".story-content p", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".story-content",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  // Awards counter reveal
  gsap.set(".award", { opacity: 0, y: 25 });
  gsap.to(".award", {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: "back.out(1.5)",
    scrollTrigger: {
      trigger: ".story-awards",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Reservation ──────────────────────────────────────────
if (!reduced) {
  gsap.set(".res-inner > *", { opacity: 0, y: 30 });
  gsap.to(".res-inner > *", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".reservation-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Motion preference ────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
