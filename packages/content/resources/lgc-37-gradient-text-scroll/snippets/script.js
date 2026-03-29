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
  title: "Gradient Text with Scroll Hue Shift",
  category: "scroll",
  tech: ["gsap", "scrolltrigger", "css-variables"],
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
  gsap.set(".hero .gradient-text", { opacity: 0, y: 40 });
  gsap.set(".hero .subtitle", { opacity: 0, y: 25 });

  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
    .to(".hero .gradient-text", { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
    .to(".hero .subtitle", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");
}

// Hero gradient animation — synced to overall page scroll
if (!reduced) {
  gsap.to(document.documentElement, {
    "--hue-hero": 360,
    duration: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        // Optional: update opacity based on progress
        const progress = self.progress;
        document.documentElement.style.setProperty("--hue-saturation", `${80 + progress * 20}%`);
      },
    },
  });
}

// Section-specific gradient animations
const gradientTexts = document.querySelectorAll(".gradient-text");
gradientTexts.forEach((el, index) => {
  if (el.closest(".hero")) return; // Skip hero, already animated

  // Initial state
  gsap.set(el, { opacity: 0, y: 30 });

  // Entrance animation
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "expo.out",
    scrollTrigger: {
      trigger: el,
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });

  // Section-specific hue shift
  if (!reduced) {
    const startHue = (index * 60) % 360;
    const endHue = (startHue + 120) % 360;

    gsap.to(el, {
      "--hue": endHue,
      duration: 1.2,
      ease: "sine.inOut",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
      },
    });

    gsap.set(el, { "--hue": startHue });
  }
});

// Stagger text content reveals
document
  .querySelectorAll(
    ".spacer p, .spacer h2, .spacer ul, .showcase-1 p, .showcase-2 p, .showcase-3 p"
  )
  .forEach((el) => {
    if (!reduced) {
      gsap.set(el, { opacity: 0, y: 20 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    }
  });

// List items stagger
document.querySelectorAll(".spacer ul li").forEach((li, i) => {
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

// Code and ol elements
document.querySelectorAll(".spacer ol, .spacer code, .showcase-1 code").forEach((el) => {
  if (!reduced) {
    gsap.set(el, { opacity: 0, y: 15 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "expo.out",
      scrollTrigger: {
        trigger: el,
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
