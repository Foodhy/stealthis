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

// ─── Shell ────────────────────────────────────────────────────────────────
initDemoShell({
  title: "Software Engineer Portfolio",
  category: "pages",
  tech: ["gsap", "lenis", "scrolltrigger", "splittext"],
});

// ─── Reduced Motion ───────────────────────────────────────────────────────
let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
  ScrollTrigger.refresh();
});

const dur = (d) => (reduced ? 0 : d);

// ─── Lenis ────────────────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ─── Hero ─────────────────────────────────────────────────────────────────
function animateHero() {
  const nameEl = document.getElementById("heroName");
  if (!nameEl) return;

  const split = new SplitText(nameEl, { type: "chars,lines", linesClass: "line" });

  gsap.set(split.chars, { y: "110%", opacity: 0 });

  gsap.to(split.chars, {
    y: "0%",
    opacity: 1,
    duration: dur(1),
    ease: "expo.out",
    stagger: { each: dur(0.025) },
    delay: dur(0.2),
  });

  // Tagline fade in
  gsap.from(".hero__tagline", {
    opacity: 0,
    y: reduced ? 0 : 20,
    duration: dur(0.8),
    ease: "expo.out",
    delay: dur(0.7),
  });

  // Scroll cue fade in
  gsap.from(".hero__scroll-cue", {
    opacity: 0,
    duration: dur(1),
    delay: dur(1.2),
  });
}

// ─── Section Headers ──────────────────────────────────────────────────────
function animateSectionHeaders() {
  document.querySelectorAll(".section__header").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: dur(0.7),
      ease: "expo.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ─── About Bio ────────────────────────────────────────────────────────────
function animateAbout() {
  const textEl = document.getElementById("aboutText");
  if (!textEl) return;

  const split = new SplitText(textEl, { type: "lines", linesClass: "bio-line" });
  gsap.set(split.lines, { opacity: 0, x: reduced ? 0 : -30 });

  gsap.to(split.lines, {
    opacity: 1,
    x: 0,
    duration: dur(0.7),
    ease: "expo.out",
    stagger: { each: dur(0.08) },
    scrollTrigger: {
      trigger: textEl,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Stat Counters ────────────────────────────────────────────────────────
function animateStats() {
  document.querySelectorAll(".stat").forEach((statEl) => {
    const numEl = statEl.querySelector(".stat__num");
    const target = numEl.dataset.target;

    // Skip the infinity symbol
    if (target === "∞" || !target) return;

    const end = Number.parseInt(target, 10);
    const counter = { val: 0 };

    ScrollTrigger.create({
      trigger: statEl,
      start: "top 80%",
      once: true,
      onEnter: () => {
        if (reduced) {
          numEl.textContent = end;
          return;
        }
        gsap.to(counter, {
          val: end,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            numEl.textContent = Math.round(counter.val);
          },
        });
      },
    });
  });
}

// ─── Skills ───────────────────────────────────────────────────────────────
function animateSkills() {
  document.querySelectorAll(".skill-row").forEach((row, i) => {
    const pct = Number.parseInt(row.dataset.pct, 10);
    const fill = row.querySelector(".skill-row__fill");

    // Slide row in
    gsap.to(row, {
      opacity: 1,
      x: 0,
      duration: dur(0.6),
      ease: "expo.out",
      delay: dur(i * 0.07),
      scrollTrigger: {
        trigger: row,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    // Animate bar fill
    ScrollTrigger.create({
      trigger: row,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(fill, {
          width: `${pct}%`,
          duration: dur(1.2),
          ease: "power2.out",
          delay: dur(0.15 + i * 0.07),
        });
      },
    });
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────
function animateProjects() {
  const cards = document.querySelectorAll(".project-card");

  gsap.to(cards, {
    opacity: 1,
    y: 0,
    duration: dur(0.8),
    ease: "expo.out",
    stagger: { each: dur(0.12) },
    scrollTrigger: {
      trigger: ".projects__grid",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Contact CTA ──────────────────────────────────────────────────────────
function animateContact() {
  const ctaEl = document.getElementById("contactCta");
  if (!ctaEl) return;

  const split = new SplitText(ctaEl, { type: "words,chars", wordsClass: "word" });
  gsap.set(split.chars, { y: "110%", opacity: 0 });

  gsap.to(split.chars, {
    y: "0%",
    opacity: 1,
    duration: dur(0.9),
    ease: "expo.out",
    stagger: { each: dur(0.018) },
    scrollTrigger: {
      trigger: ctaEl,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });

  // Email + social fade
  gsap.from(".contact__links", {
    opacity: 0,
    y: reduced ? 0 : 20,
    duration: dur(0.8),
    ease: "expo.out",
    delay: dur(0.3),
    scrollTrigger: {
      trigger: ".contact__inner",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────
animateHero();
animateSectionHeaders();
animateAbout();
animateStats();
animateSkills();
animateProjects();
animateContact();
