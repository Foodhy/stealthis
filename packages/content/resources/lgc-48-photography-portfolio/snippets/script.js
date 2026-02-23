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
  title: "Photography Portfolio — Dark Film",
  category: "pages",
  tech: ["gsap", "scroll-trigger", "lenis", "eb-garamond", "geist-mono"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── Nav scroll state ──────────────────────────────────────────────────────────
const nav = document.getElementById("nav");
ScrollTrigger.create({
  start: "top -80px",
  onUpdate: (self) => {
    nav.classList.toggle("scrolled", self.scroll() > 80);
  },
});

// ── Hero entrance ─────────────────────────────────────────────────────────────
if (!reduced) {
  // Staggered entrance — calm and deliberate, like a photograph developing
  gsap.set(".hero-eyebrow", { opacity: 0 });
  gsap.set(".hero-h1", { opacity: 0, y: 20 });
  gsap.set(".hf-img--main", { opacity: 0, scale: 1.03 });
  gsap.set(".hf-caption", { opacity: 0 });
  gsap.set(".hero-scroll-hint", { opacity: 0 });

  gsap
    .timeline({ delay: 0.5, defaults: { ease: "power2.out" } })
    .to(".hero-eyebrow", { opacity: 1, duration: 1 })
    .to(".hero-h1", { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" }, "-=0.5")
    .to(".hf-img--main", { opacity: 1, scale: 1, duration: 1.6 }, "-=1")
    .to(".hf-caption", { opacity: 1, duration: 0.8 }, "-=0.4")
    .to(".hero-scroll-hint", { opacity: 1, duration: 0.8 }, "-=0.3");
}

// ── Photo grid — staggered reveal ─────────────────────────────────────────────
document.querySelectorAll(".photo-item").forEach((item, i) => {
  if (!reduced) {
    gsap.set(item, { opacity: 0 });
    gsap.to(item, {
      opacity: 1,
      duration: 1.2,
      ease: "power1.out",
      delay: (i % 3) * 0.15,
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  }
});

// ── Parallax on masonry images ────────────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".pi-img").forEach((img, i) => {
    const speed = 0.05 + (i % 3) * 0.02;
    gsap.to(img, {
      yPercent: -8 * speed * 10,
      ease: "none",
      scrollTrigger: {
        trigger: img.closest(".photo-item"),
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  });
}

// ── Series items reveal ───────────────────────────────────────────────────────
document.querySelectorAll(".series-item").forEach((item, i) => {
  if (!reduced) {
    gsap.set(item, { opacity: 0, x: -15 });
    gsap.to(item, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: "expo.out",
      delay: i * 0.12,
      scrollTrigger: {
        trigger: ".series-list",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    // Reveal preview images staggered
    const imgs = item.querySelectorAll(".si-img");
    gsap.set(imgs, { opacity: 0, y: 10 });
    gsap.to(imgs, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.4 + i * 0.12,
      scrollTrigger: {
        trigger: ".series-list",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }
});

// ── Italic number animation on series ────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".si-number").forEach((num) => {
    num.addEventListener("mouseenter", () => {
      gsap.to(num, { color: "rgba(200, 169, 110, 0.4)", duration: 0.4, ease: "power2.out" });
    });
    num.addEventListener("mouseleave", () => {
      gsap.to(num, { color: "rgba(58, 52, 42, 1)", duration: 0.4, ease: "power2.out" });
    });
  });
}

// ── Info section reveal ───────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".info-h2", { opacity: 0, y: 25 });
  gsap.to(".info-h2", {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".info-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".info-bio", { opacity: 0, y: 18 });
  gsap.to(".info-bio", {
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.15,
    ease: "expo.out",
    delay: 0.2,
    scrollTrigger: {
      trigger: ".info-right",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });

  // Stats count up
  document.querySelectorAll(".is-num").forEach((el) => {
    const text = el.textContent.trim();
    const hasPlus = text.includes("+");
    const target = Number.parseFloat(text);

    ScrollTrigger.create({
      trigger: ".info-stats",
      start: "top 80%",
      end: "top 35%",
      onUpdate: (self) => {
        const val = Math.round(target * self.progress);
        el.textContent = val + (hasPlus ? "+" : "");
      },
    });
  });

  // Portrait fade in
  gsap.set(".ip-img", { opacity: 0, scale: 1.02 });
  gsap.to(".ip-img", {
    opacity: 1,
    scale: 1,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".info-portrait",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Contact section reveal ────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".contact-h2", { opacity: 0, y: 30 });
  gsap.to(".contact-h2", {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".contact-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".cl-item", { opacity: 0, y: 12 });
  gsap.to(".cl-item", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    delay: 0.2,
    scrollTrigger: {
      trigger: ".contact-body",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".contact-availability > *", { opacity: 0, y: 12 });
  gsap.to(".contact-availability > *", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "expo.out",
    delay: 0.35,
    scrollTrigger: {
      trigger: ".contact-body",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Slow scroll‐driven parallax on hero image ─────────────────────────────────
if (!reduced) {
  gsap.to(".hf-img--main", {
    yPercent: -6,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 2,
    },
  });
}

// ── Section label fade-in ─────────────────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".section-label").forEach((label) => {
    gsap.set(label, { opacity: 0 });
    gsap.to(label, {
      opacity: 1,
      duration: 1,
      ease: "power1.out",
      scrollTrigger: {
        trigger: label,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
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
