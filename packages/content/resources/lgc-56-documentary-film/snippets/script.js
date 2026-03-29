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
  title: "Terra Incognita — Documentary Film",
  category: "pages",
  tech: ["gsap", "scroll-trigger", "lenis", "canvas-2d", "clip-path", "libre-baskerville"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Lenis smooth scroll ────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── Grain Canvas ───────────────────────────────────────────────────────────
const grainCanvas = document.getElementById("grain-canvas");
const gctx = grainCanvas.getContext("2d");
let grainW = 0,
  grainH = 0;

function resizeGrain() {
  grainW = grainCanvas.width = window.innerWidth;
  grainH = grainCanvas.height = window.innerHeight;
}
resizeGrain();
window.addEventListener("resize", resizeGrain);

function drawGrain() {
  const imageData = gctx.createImageData(grainW, grainH);
  const buf = imageData.data;
  for (let i = 0; i < buf.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    buf[i] = buf[i + 1] = buf[i + 2] = v;
    buf[i + 3] = 255;
  }
  gctx.putImageData(imageData, 0, 0);
  requestAnimationFrame(drawGrain);
}
drawGrain();

// ── Hero entrance ──────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".hero-meta", { opacity: 0, y: 16 });
  gsap.set(".h1-word", { clipPath: "inset(100% 0 0 0)" });
  gsap.set(".hero-details", { opacity: 0 });
  gsap.set(".hero-tagline", { opacity: 0, y: 12 });
  gsap.set(".hero-scroll", { opacity: 0 });

  gsap
    .timeline({ delay: 0.4, defaults: { ease: "expo.out" } })
    .to(".hero-meta", { opacity: 1, y: 0, duration: 0.6 })
    .to(
      ".h1-word",
      { clipPath: "inset(0% 0 0 0)", duration: 1.1, stagger: 0.15, ease: "expo.out" },
      "-=0.3"
    )
    .to(".hero-details", { opacity: 1, duration: 0.6 }, "-=0.4")
    .to(".hero-tagline", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
    .to(".hero-scroll", { opacity: 1, duration: 0.6 }, "-=0.2");
}

// ── Synopsis reveal ────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".synopsis-quote", { opacity: 0, y: 30 });
  gsap.set(".synopsis-text p", { opacity: 0, y: 20 });

  ScrollTrigger.create({
    trigger: ".synopsis-section",
    start: "top 70%",
    onEnter: () => {
      gsap.to(".synopsis-quote", { opacity: 1, y: 0, duration: 1, ease: "expo.out" });
      gsap.to(".synopsis-text p", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "expo.out",
        delay: 0.3,
      });
    },
  });
}

// ── Chapters reveal ────────────────────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".chapter-item").forEach((item, i) => {
    gsap.set(item, { opacity: 0, x: -40 });
    gsap.to(item, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".chapters-list",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Film stills reveal ─────────────────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".still-item").forEach((item, i) => {
    gsap.set(item, { opacity: 0, scale: 0.97 });
    gsap.to(item, {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: "expo.out",
      delay: i * 0.08,
      scrollTrigger: {
        trigger: ".stills-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Credits reveal ─────────────────────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".credit-row").forEach((row, i) => {
    gsap.set(row, { opacity: 0, y: 20 });
    gsap.to(row, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "expo.out",
      delay: i * 0.06,
      scrollTrigger: {
        trigger: ".credits-list",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Festival badges reveal ─────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".festival-badge", { opacity: 0, scale: 0.85 });
  gsap.to(".festival-badge", {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    stagger: 0.07,
    ease: "back.out(1.5)",
    scrollTrigger: {
      trigger: ".festivals-row",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Watch section reveal ───────────────────────────────────────────────────
if (!reduced) {
  gsap.set([".watch-h2", ".watch-text > p", ".watch-btns"], { opacity: 0, y: 24 });
  gsap.set(".watch-terminal", { opacity: 0, x: 30 });

  ScrollTrigger.create({
    trigger: ".watch-section",
    start: "top 70%",
    onEnter: () => {
      gsap.to([".watch-h2", ".watch-text > p", ".watch-btns"], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "expo.out",
      });
      gsap.to(".watch-terminal", {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "expo.out",
        delay: 0.3,
      });
    },
  });
}

// ── Nav scroll state ───────────────────────────────────────────────────────
ScrollTrigger.create({
  start: "top -80",
  onUpdate: (self) => {
    document.getElementById("nav").classList.toggle("nav--scrolled", self.scroll() > 80);
  },
});

// ── Motion toggle ──────────────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
