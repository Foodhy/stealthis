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
  title: "SaaS Landing Page",
  category: "pages",
  tech: ["gsap", "lenis", "scrolltrigger", "splittext"],
});

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
  ScrollTrigger.refresh();
});

const dur = (d) => (reduced ? 0 : d);

// ═══════════════════════════════════════════════════════════════════════
// HERO ENTRANCE
// ═══════════════════════════════════════════════════════════════════════

const heroTitle = document.querySelector(".hero-title");
const heroSubtitle = document.querySelector(".hero-subtitle");
const heroButtons = document.querySelectorAll(".hero-buttons .btn");
const heroVisual = document.querySelector(".hero-visual");

// SplitText word-by-word reveal for headline
const titleSplit = new SplitText(heroTitle, { type: "words", wordsClass: "word" });
gsap.set(titleSplit.words, {
  opacity: 0,
  y: reduced ? 0 : 30,
});

const heroTl = gsap.timeline({ delay: 0.4 });

heroTl
  .to(titleSplit.words, {
    opacity: 1,
    y: 0,
    duration: dur(0.7),
    ease: "expo.out",
    stagger: { each: 0.06 },
  })
  .to(
    heroSubtitle,
    {
      opacity: 1,
      y: 0,
      duration: dur(0.6),
      ease: "expo.out",
    },
    "-=0.3"
  )
  .to(
    heroButtons,
    {
      opacity: 1,
      y: 0,
      duration: dur(0.5),
      ease: "back.out(1.7)",
      stagger: { each: 0.1 },
    },
    "-=0.3"
  )
  .fromTo(
    heroVisual,
    {
      opacity: 0,
      y: reduced ? 0 : 40,
      scale: reduced ? 1 : 0.95,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: dur(0.8),
      ease: "expo.out",
    },
    "-=0.4"
  );

// ═══════════════════════════════════════════════════════════════════════
// FEATURES: Pinned section with content + device swap
// ═══════════════════════════════════════════════════════════════════════

const featureCards = document.querySelectorAll(".feature-card");
const featureDevices = document.querySelectorAll(".feature-device");
const stepDots = document.querySelectorAll(".step-dot");

let activeFeature = 0;

// First card and device already have .active in HTML

function setActiveFeature(index) {
  if (index === activeFeature) return;

  // Cards
  featureCards.forEach((c) => c.classList.remove("active"));
  featureCards[index].classList.add("active");

  // Devices
  featureDevices.forEach((d) => d.classList.remove("active"));
  featureDevices[index].classList.add("active");

  // Dots
  stepDots.forEach((d) => d.classList.remove("active"));
  stepDots[index].classList.add("active");

  activeFeature = index;
}

ScrollTrigger.create({
  trigger: ".feature-track",
  start: "top top",
  end: "bottom bottom",
  scrub: 0,
  onUpdate: (self) => {
    const p = self.progress;
    if (p < 0.33) setActiveFeature(0);
    else if (p < 0.66) setActiveFeature(1);
    else setActiveFeature(2);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// PRICING: Heading + card stagger
// ═══════════════════════════════════════════════════════════════════════

const pricingHeading = document.querySelector(".pricing-heading");
if (pricingHeading) {
  const pricingSplit = new SplitText(pricingHeading, { type: "words", wordsClass: "word" });
  gsap.set(pricingSplit.words, { opacity: 0, y: reduced ? 0 : 25 });

  gsap.to(pricingSplit.words, {
    opacity: 1,
    y: 0,
    duration: dur(0.5),
    ease: "expo.out",
    stagger: { each: 0.04 },
    scrollTrigger: {
      trigger: ".pricing-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

const pricingCards = document.querySelectorAll(".pricing-card");
gsap.set(pricingCards, {
  opacity: 0,
  y: reduced ? 0 : 40,
});

gsap.to(pricingCards, {
  opacity: 1,
  y: 0,
  duration: dur(0.6),
  ease: "expo.out",
  stagger: {
    each: 0.1,
    from: "center",
  },
  scrollTrigger: {
    trigger: ".pricing-grid",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
  onComplete: () => {
    // Ensure popular card retains its scale after animation
    const popular = document.querySelector(".pricing-card.popular");
    if (popular) {
      gsap.set(popular, { scale: 1.02 });
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════
// TESTIMONIALS: Heading + card stagger with depth
// ═══════════════════════════════════════════════════════════════════════

const testimonialsHeading = document.querySelector(".testimonials-heading");
if (testimonialsHeading) {
  const testimonialsSplit = new SplitText(testimonialsHeading, {
    type: "words",
    wordsClass: "word",
  });
  gsap.set(testimonialsSplit.words, { opacity: 0, y: reduced ? 0 : 25 });

  gsap.to(testimonialsSplit.words, {
    opacity: 1,
    y: 0,
    duration: dur(0.5),
    ease: "expo.out",
    stagger: { each: 0.04 },
    scrollTrigger: {
      trigger: ".testimonials-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

const testimonialCards = document.querySelectorAll(".testimonial-card");
gsap.set(testimonialCards, {
  opacity: 0,
  y: reduced ? 0 : 30,
  rotateX: reduced ? 0 : -5,
});

gsap.to(testimonialCards, {
  opacity: 1,
  y: 0,
  rotateX: 0,
  duration: dur(0.6),
  ease: "expo.out",
  stagger: { each: 0.12 },
  scrollTrigger: {
    trigger: ".testimonials-grid",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

// ═══════════════════════════════════════════════════════════════════════
// CTA: Char-by-char SplitText + subtitle + button
// ═══════════════════════════════════════════════════════════════════════

const ctaTitle = document.querySelector(".cta-title");
const ctaSubtitle = document.querySelector(".cta-subtitle");
const ctaBtn = document.querySelector(".cta-section .btn");

if (ctaTitle) {
  const ctaSplit = new SplitText(ctaTitle, { type: "chars", charsClass: "char" });
  gsap.set(ctaSplit.chars, {
    opacity: 0,
    y: reduced ? 0 : 20,
  });

  const ctaTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".cta-section",
      start: "top 65%",
      toggleActions: "play none none reverse",
    },
  });

  ctaTl
    .to(ctaSplit.chars, {
      opacity: 1,
      y: 0,
      duration: dur(0.4),
      ease: "expo.out",
      stagger: { each: 0.02 },
    })
    .to(
      ctaSubtitle,
      {
        opacity: 1,
        y: 0,
        duration: dur(0.6),
        ease: "expo.out",
      },
      "-=0.2"
    )
    .to(
      ctaBtn,
      {
        opacity: 1,
        y: 0,
        duration: dur(0.5),
        ease: "back.out(1.7)",
      },
      "-=0.3"
    );
}
