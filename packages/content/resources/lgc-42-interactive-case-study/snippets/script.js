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
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, Flip);

initDemoShell({
  title: "Interactive Case Study",
  category: "pages",
  tech: ["gsap", "scrolltrigger", "svg", "flip", "lenis"],
});

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ─── Hero Parallax Depth Cards (Demo 38 technique) ──────────────────────────
const heroCards = document.querySelectorAll(".hero-card");
const depths = [1.0, 0.65, 0.45, 0.8];

heroCards.forEach((card, i) => {
  if (!reduced) {
    gsap.set(card, { opacity: 0, scale: 0.7, y: 40 });
    gsap.to(card, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: "expo.out",
      delay: 0.4 + i * 0.15,
    });
  }
});

// Hero content entrance
if (!reduced) {
  gsap.set([".hero .eyebrow", ".hero h1", ".hero-desc", ".hero-tags"], { opacity: 0, y: 30 });
  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.7, delay: 0.5 })
    .to(".hero h1", { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
    .to(".hero-desc", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".hero-tags span", { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, "-=0.4");

  gsap.set(".hero-tags span", { opacity: 0, y: 15 });
}

// Hero parallax depth on scroll
if (!reduced) {
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: 1,
    onUpdate: (self) => {
      heroCards.forEach((card, i) => {
        const d = depths[i];
        gsap.set(card, { y: self.progress * d * 80, overwrite: "auto" });
      });
    },
  });
}

// ─── Challenge Stats (scroll counter) ────────────────────────────────────────
document.querySelectorAll(".stat-pill").forEach((pill, i) => {
  const valEl = pill.querySelector(".stat-val");
  const target = Number.parseFloat(pill.dataset.target);
  const suffix = pill.dataset.suffix || "";

  if (!reduced) {
    gsap.set(pill, { opacity: 0, x: -20 });
    gsap.to(pill, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".challenge-stats",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    ScrollTrigger.create({
      trigger: pill,
      start: "top 80%",
      end: "top 30%",
      onUpdate: (self) => {
        const val = target * self.progress;
        const display = target % 1 !== 0 ? val.toFixed(1) : Math.round(val);
        valEl.textContent = display + suffix;
      },
    });
  } else {
    valEl.textContent = target + suffix;
  }
});

// Challenge text reveal
document.querySelectorAll(".challenge-text h2, .challenge-text p, .quote-block").forEach((el) => {
  if (!reduced) {
    gsap.set(el, { opacity: 0, y: 25 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse" },
    });
  }
});

// ─── SVG Process Workflow (Demo 40 technique) ────────────────────────────────
const procLines = document.querySelectorAll(".proc-line");

procLines.forEach((path) => {
  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

  if (!reduced) {
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".process-section",
        start: "top 65%",
        end: "bottom 70%",
        scrub: 1.2,
      },
    });
  } else {
    gsap.set(path, { strokeDashoffset: 0 });
  }
});

// Process nodes sequential reveal
const procNodes = ["#pn-1", "#pn-2", "#pn-3", "#pn-4", "#pn-5"];
procNodes.forEach((id, i) => {
  const node = document.querySelector(id);
  if (!node) return;

  if (!reduced) {
    gsap.to(node, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ".process-section",
        start: `top ${72 - i * 5}%`,
        toggleActions: "play none none reverse",
      },
    });
    gsap.set(node, { scale: 0.7 });
  } else {
    gsap.set(node, { opacity: 1 });
  }
});

// ─── Results Counters (Demo 36 technique) ────────────────────────────────────
document.querySelectorAll(".result-card").forEach((card, i) => {
  const valEl = card.querySelector(".result-value");
  const target = Number.parseFloat(card.dataset.target);
  const suffix = card.dataset.suffix || "";

  if (!reduced) {
    gsap.set(card, { opacity: 0, y: 40, scale: 0.9 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".results-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      end: "top 25%",
      onUpdate: (self) => {
        const val = target * self.progress;
        const display = target % 1 !== 0 ? val.toFixed(1) : Math.round(val);
        valEl.textContent = display + suffix;
      },
    });
  } else {
    valEl.textContent = target + suffix;
  }
});

// ─── Testimonial Cards ───────────────────────────────────────────────────────
document.querySelectorAll(".tl-card").forEach((card, i) => {
  if (!reduced) {
    gsap.set(card, { opacity: 0, y: 30 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "expo.out",
      delay: i * 0.12,
      scrollTrigger: {
        trigger: "#tl-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }
});

// ─── Section Headers ─────────────────────────────────────────────────────────
document.querySelectorAll(".section-header").forEach((header) => {
  if (!reduced) {
    gsap.set(header.children, { opacity: 0, y: 25 });
    gsap.to(header.children, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "expo.out",
      scrollTrigger: { trigger: header, start: "top 75%", toggleActions: "play none none reverse" },
    });
  }
});

// ─── CTA ─────────────────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".cta-section h2, .cta-section p, .cta-section a", { opacity: 0, y: 25 });
  gsap.to(".cta-section h2, .cta-section p, .cta-section a", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".cta-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Motion preference ───────────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  if (e.detail.reduced) {
    gsap.globalTimeline.paused(true);
  } else {
    gsap.globalTimeline.paused(false);
  }
});
