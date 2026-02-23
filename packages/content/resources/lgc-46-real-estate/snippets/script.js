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
  title: "Real Estate — Light Minimal",
  category: "pages",
  tech: ["gsap", "scroll-trigger", "lenis", "fraunces", "inter"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── Nav scroll state ──────────────────────────────────────────────────────────
const nav = document.getElementById("nav");
ScrollTrigger.create({
  start: "top -60px",
  onUpdate: (self) => {
    nav.classList.toggle("scrolled", self.scroll() > 60);
  },
});

// ── Hero entrance ─────────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".hero-label", { opacity: 0, y: 12 });
  gsap.set(".hero-h1", { opacity: 0, y: 25 });
  gsap.set(".hero-body", { opacity: 0, y: 18 });
  gsap.set(".hero-btns", { opacity: 0, y: 15 });
  gsap.set(".hero-metric-row", { opacity: 0 });
  gsap.set(".hero-img--main", { opacity: 0, scale: 1.04 });
  gsap.set(".hero-img--sub", { opacity: 0, y: 20 });

  gsap
    .timeline({ delay: 0.3, defaults: { ease: "expo.out" } })
    .to(".hero-label", { opacity: 1, y: 0, duration: 0.7 })
    .to(".hero-h1", { opacity: 1, y: 0, duration: 1 }, "-=0.4")
    .to(".hero-body", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
    .to(".hero-btns", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".hero-metric-row", { opacity: 1, duration: 0.6 }, "-=0.4")
    .to(".hero-img--main", { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0.5)
    .to(".hero-img--sub", { opacity: 1, y: 0, duration: 0.9 }, "-=0.5");
}

// ── Parallax on hero images ───────────────────────────────────────────────────
if (!reduced) {
  gsap.to(".hero-img--main", {
    yPercent: -8,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.5,
    },
  });

  gsap.to(".hero-img--sub", {
    yPercent: -14,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 2,
    },
  });
}

// ── Metric numbers count up ───────────────────────────────────────────────────
const metrics = document.querySelectorAll(".hero-metric .hm-num");
metrics.forEach((el) => {
  const target = Number.parseFloat(el.textContent);
  if (!reduced) {
    ScrollTrigger.create({
      trigger: ".hero-metric-row",
      start: "top 85%",
      end: "top 40%",
      onUpdate: (self) => {
        const val = target * self.progress;
        el.textContent = Number.isInteger(target) ? Math.round(val) : val.toFixed(1);
      },
    });
  }
});

// ── Filter bar interaction ────────────────────────────────────────────────────
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ── Listing cards reveal ──────────────────────────────────────────────────────
document.querySelectorAll(".listing-card").forEach((card, i) => {
  if (!reduced) {
    gsap.set(card, { opacity: 0, y: 35 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".listings-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }
});

// ── Listings header reveal ────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".listings-header h2, .listings-header .section-eyebrow", { opacity: 0, y: 20 });
  gsap.to(".listings-header h2, .listings-header .section-eyebrow", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".listings-header",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Process steps reveal ──────────────────────────────────────────────────────
if (!reduced) {
  // Left column — heading
  gsap.set(".process-left > *", { opacity: 0, x: -25 });
  gsap.to(".process-left > *", {
    opacity: 1,
    x: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".process-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  // Steps — each step line
  document.querySelectorAll(".step").forEach((step, i) => {
    gsap.set(step, { opacity: 0, x: 20 });
    gsap.to(step, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".process-steps",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── About section reveal ──────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".ab-img--main", { opacity: 0, scale: 1.03 });
  gsap.to(".ab-img--main", {
    opacity: 1,
    scale: 1,
    duration: 1.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".ab-img--secondary", { opacity: 0, y: 25 });
  gsap.to(".ab-img--secondary", {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "expo.out",
    delay: 0.3,
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".about-content > *", { opacity: 0, y: 22 });
  gsap.to(".about-content > *", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    delay: 0.15,
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Contact section reveal ────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".contact-left > *", { opacity: 0, y: 20 });
  gsap.to(".contact-left > *", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".contact-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".form-field", { opacity: 0, y: 18 });
  gsap.to(".form-field", {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "expo.out",
    delay: 0.2,
    scrollTrigger: {
      trigger: ".contact-form",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Subtle section divider line animations ────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".step").forEach((step) => {
    step.addEventListener("mouseenter", () => {
      gsap.to(step.querySelector(".step-num"), {
        color: "#c4856a",
        duration: 0.3,
        ease: "power2.out",
      });
    });
    step.addEventListener("mouseleave", () => {
      gsap.to(step.querySelector(".step-num"), {
        color: "#c4856a",
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
}

// ── Motion preference toggle ──────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  if (e.detail.reduced) {
    gsap.globalTimeline.paused(true);
  } else {
    gsap.globalTimeline.paused(false);
  }
});
