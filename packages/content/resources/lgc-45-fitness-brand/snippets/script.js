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
  title: "Fitness Brand — Brutalist",
  category: "pages",
  tech: ["gsap", "splittext", "scrolltrigger", "lenis"],
});

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Hero entrance — slammed in hard ─────────────────────
if (!reduced) {
  gsap.set(".hero-tag", { opacity: 0, x: -30 });
  const heroLines = document.querySelectorAll(".hero-line");
  heroLines.forEach((line, i) => gsap.set(line, { opacity: 0, y: 80 + i * 20, skewY: 5 }));
  gsap.set(".hero-sub", { opacity: 0, y: 20 });
  gsap.set(".hero-ctas", { opacity: 0, y: 20 });

  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to(".hero-tag", { opacity: 1, x: 0, duration: 0.6, delay: 0.3 })
    .to(heroLines, { opacity: 1, y: 0, skewY: 0, duration: 0.7, stagger: 0.07 }, "-=0.3")
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
    .to(".hero-ctas", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
}

// ── Stats Bar — scroll counters ──────────────────────────
document.querySelectorAll(".stat-big").forEach((el) => {
  const target = Number.parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || "";

  if (!reduced) {
    ScrollTrigger.create({
      trigger: ".stats-bar",
      start: "top 80%",
      end: "top 20%",
      onUpdate: (self) => {
        const val = target * self.progress;
        el.textContent = (target % 1 !== 0 ? val.toFixed(0) : Math.round(val)) + suffix;
      },
    });

    gsap.set(el, { opacity: 0, y: 30 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "expo.out",
      scrollTrigger: {
        trigger: ".stats-bar",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  } else {
    el.textContent = target + suffix;
  }
});

// ── Programs — hard entrance ─────────────────────────────
if (!reduced) {
  const hSplit = new SplitText(".programs-header h2", { type: "lines" });
  gsap.set(hSplit.lines, { opacity: 0, y: 50 });
  gsap.to(hSplit.lines, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".programs-header",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  document.querySelectorAll(".program-card").forEach((card, i) => {
    gsap.set(card, { opacity: 0, y: 60 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".programs-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Transform section ────────────────────────────────────
if (!reduced) {
  const tSplit = new SplitText(".transform-text h2", { type: "lines" });
  gsap.set(tSplit.lines, { opacity: 0, x: -40 });
  gsap.to(tSplit.lines, {
    opacity: 1,
    x: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".transform-section",
      start: "top 65%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".result-list li", { opacity: 0, x: -20 });
  gsap.to(".result-list li", {
    opacity: 1,
    x: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".result-list",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set([".tv-box--before", ".tv-arrow", ".tv-box--after"], { opacity: 0, scale: 0.85 });
  gsap.to([".tv-box--before", ".tv-arrow", ".tv-box--after"], {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    stagger: 0.15,
    ease: "back.out(1.4)",
    scrollTrigger: {
      trigger: ".transform-visual",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Testimonials ─────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".testi-card").forEach((card, i) => {
    gsap.set(card, { opacity: 0, y: 40 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: i * 0.1,
      ease: "expo.out",
      scrollTrigger: {
        trigger: ".testi-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── CTA join — big slam ──────────────────────────────────
if (!reduced) {
  const jSplit = new SplitText(".join-inner h2", { type: "lines" });
  gsap.set(jSplit.lines, { opacity: 0, y: 80 });
  gsap.to(jSplit.lines, {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".join-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".join-inner p, .btn-giant", { opacity: 0, y: 25 });
  gsap.to(".join-inner p, .btn-giant", {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.15,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".join-section",
      start: "top 60%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Motion preference ────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
