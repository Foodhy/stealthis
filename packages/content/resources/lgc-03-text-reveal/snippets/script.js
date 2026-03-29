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

// ── Demo shell ──
initDemoShell({
  title: "Text Reveal on Scroll",
  category: "scroll",
  tech: ["gsap", "splittext", "scrolltrigger"],
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

// ── Hero entrance (no scroll trigger) ──
const heroLabel = document.querySelector(".hero-section .label");
const heroH1 = document.querySelector(".hero-section h1");
const heroSub = document.querySelector(".hero-section .split-sub");

gsap.set([heroLabel, heroSub], { opacity: 0, y: reduced ? 0 : 20 });

const heroSplit = new SplitText(heroH1, { type: "chars", charsClass: "char" });

gsap.set(heroSplit.chars, { opacity: 0, y: reduced ? 0 : 40, rotateX: reduced ? 0 : -60 });

const heroTl = gsap.timeline({ delay: 0.4 });
heroTl
  .to(heroLabel, { opacity: 1, y: 0, duration: dur(0.6), ease: "expo.out" })
  .to(
    heroSplit.chars,
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: dur(0.6),
      ease: "back.out(1.4)",
      stagger: { each: 0.03, from: "start" },
    },
    "-=0.3"
  )
  .to(heroSub, { opacity: 1, y: 0, duration: dur(0.7), ease: "expo.out" }, "-=0.4");

// ── Character reveals ──
document.querySelectorAll(".split-chars:not(.hero-section h1)").forEach((el) => {
  const split = new SplitText(el, { type: "chars", charsClass: "char" });

  gsap.set(split.chars, {
    opacity: 0,
    y: reduced ? 0 : 50,
    rotateX: reduced ? 0 : -45,
  });

  gsap.to(split.chars, {
    opacity: 1,
    y: 0,
    rotateX: 0,
    duration: dur(0.5),
    ease: "back.out(1.2)",
    stagger: { each: 0.025, from: "start" },
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
});

// ── Word reveals ──
document.querySelectorAll(".split-words").forEach((el) => {
  const split = new SplitText(el, { type: "words", wordsClass: "word" });

  gsap.set(split.words, {
    opacity: 0,
    y: reduced ? 0 : 35,
    scale: reduced ? 1 : 0.95,
  });

  gsap.to(split.words, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: dur(0.6),
    ease: "expo.out",
    stagger: { each: 0.06, from: "start" },
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
});

// ── Line reveals ──
document.querySelectorAll(".split-lines").forEach((el) => {
  const split = new SplitText(el, { type: "lines", linesClass: "line" });

  gsap.set(split.lines, {
    opacity: 0,
    y: reduced ? 0 : 30,
  });

  gsap.to(split.lines, {
    opacity: 1,
    y: 0,
    duration: dur(0.7),
    ease: "power3.out",
    stagger: { each: 0.1, from: "start" },
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
  });
});

// ── Line heading reveals ──
document.querySelectorAll(".split-lines-heading").forEach((el) => {
  const split = new SplitText(el, { type: "lines", linesClass: "line" });

  gsap.set(split.lines, {
    opacity: 0,
    x: reduced ? 0 : -40,
  });

  gsap.to(split.lines, {
    opacity: 1,
    x: 0,
    duration: dur(0.8),
    ease: "expo.out",
    stagger: { each: 0.12, from: "start" },
    scrollTrigger: {
      trigger: el,
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
});

// ── Scrub-linked character reveal ──
document.querySelectorAll(".scrub-chars").forEach((el) => {
  const split = new SplitText(el, { type: "chars", charsClass: "char" });

  gsap.set(split.chars, {
    opacity: 0.15,
    color: "#263249",
  });

  gsap.to(split.chars, {
    opacity: 1,
    color: "#f0f4fb",
    duration: dur(0.3),
    stagger: { each: 0.03, from: "start" },
    scrollTrigger: {
      trigger: el,
      start: "top 70%",
      end: "top 30%",
      scrub: 1,
    },
  });
});

// ── Labels entrance ──
document.querySelectorAll(".section:not(.hero-section) .label").forEach((el) => {
  gsap.set(el, { opacity: 0, y: reduced ? 0 : 15 });

  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: dur(0.5),
    ease: "expo.out",
    scrollTrigger: {
      trigger: el.closest(".section"),
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
});
