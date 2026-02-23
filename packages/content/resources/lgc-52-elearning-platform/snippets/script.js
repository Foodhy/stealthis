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
  title: "Meridian — E-Learning Platform",
  category: "pages",
  tech: ["gsap", "scroll-trigger", "lenis", "accordion", "canvas-2d", "outfit"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Lenis ─────────────────────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── Nav ───────────────────────────────────────────────────────────────────────
// Nav is always visible (solid), no scroll-triggered changes needed

// ── Hero entrance ─────────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set([".hero-badge", ".hero-h1", ".hero-p", ".hero-actions", ".hero-stats"], {
    opacity: 0,
    y: 20,
  });
  gsap.set(".progress-card", { opacity: 0, x: 30 });
  gsap.set(".skill-badge", { opacity: 0, scale: 0.8 });

  gsap
    .timeline({ delay: 0.3, defaults: { ease: "expo.out" } })
    .to(".hero-badge", { opacity: 1, y: 0, duration: 0.6 })
    .to(".hero-h1", { opacity: 1, y: 0, duration: 0.9 }, "-=0.3")
    .to(".hero-p", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".hero-actions", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
    .to(".hero-stats", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
    .to(".progress-card", { opacity: 1, x: 0, duration: 0.9, ease: "back.out(1.5)" }, 0.5)
    .to(
      ".skill-badge",
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(2)" },
      0.8
    );
}

// ── Hero stat counters ────────────────────────────────────────────────────────
document.querySelectorAll(".hs-num").forEach((el) => {
  const target = Number.parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || "";
  if (!reduced) {
    ScrollTrigger.create({
      trigger: ".hero-stats",
      start: "top 85%",
      end: "top 30%",
      onUpdate: (self) => {
        const val = Math.round(target * self.progress);
        el.textContent = val.toLocaleString() + suffix;
      },
    });
  } else {
    el.textContent = target.toLocaleString() + suffix;
  }
});

// ── Progress card animation ───────────────────────────────────────────────────
if (!reduced) {
  // Animate progress bar to 37%
  gsap.to("#pc-fill", {
    width: "37%",
    duration: 1.5,
    ease: "expo.out",
    delay: 1.2,
    onUpdate: function () {
      const w = Number.parseFloat(this.targets()[0].style.width);
      document.getElementById("pc-pct").textContent = Math.round(w) + "%";
    },
  });

  // Floating skill badges gently float
  document.querySelectorAll(".skill-badge").forEach((badge, i) => {
    gsap.to(badge, {
      y: -8 + (i % 2) * 16,
      duration: 2 + i * 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.5,
    });
  });
} else {
  document.getElementById("pc-fill").style.width = "37%";
  document.getElementById("pc-pct").textContent = "37%";
}

// ── Skill tree canvas ─────────────────────────────────────────────────────────
const treeCanvas = document.getElementById("tree-canvas");
if (treeCanvas) {
  const tctx = treeCanvas.getContext("2d");
  function drawTree() {
    treeCanvas.width = treeCanvas.offsetWidth;
    treeCanvas.height = treeCanvas.offsetHeight;

    const COL_W = 110;
    const ROW_H = 60;
    const X_OFF = 60; // center of first col

    // Connections: [fromCol, fromRow, toCol, toRow, done]
    const connections = [
      [2, 1, 1, 2, true],
      [2, 1, 3, 2, true],
      [1, 2, 2, 3, false],
      [3, 2, 2, 3, false],
      [2, 3, 1, 4, false],
      [2, 3, 3, 4, false],
      [1, 4, 2, 5, false],
      [3, 4, 2, 5, false],
      [2, 5, 1, 6, false],
      [2, 5, 3, 6, false],
    ];

    connections.forEach(([c1, r1, c2, r2, done]) => {
      const x1 = (c1 - 1) * COL_W + X_OFF + 50;
      const y1 = (r1 - 1) * ROW_H + 28;
      const x2 = (c2 - 1) * COL_W + X_OFF + 50;
      const y2 = (r2 - 1) * ROW_H + 28;

      tctx.beginPath();
      tctx.moveTo(x1, y1);
      tctx.bezierCurveTo(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);
      tctx.strokeStyle = done ? "rgba(5, 150, 105, 0.5)" : "rgba(255, 255, 255, 0.08)";
      tctx.lineWidth = 1.5;
      tctx.stroke();
    });
  }
  drawTree();
  window.addEventListener("resize", drawTree);
}

// ── Course progress bars animate on scroll ────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".cc-progress-fill").forEach((fill, i) => {
    gsap.to(fill, {
      scaleX: 1,
      duration: 1,
      ease: "expo.out",
      delay: i * 0.08,
      scrollTrigger: {
        trigger: ".courses-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Course cards reveal ───────────────────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".course-card").forEach((card, i) => {
    gsap.set(card, { opacity: 0, y: 30 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "expo.out",
      delay: i * 0.08,
      scrollTrigger: {
        trigger: ".courses-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
document.querySelectorAll(".ft-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ft-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    // In a real implementation: filter .course-card by data-category
    // Here we just toggle the active class for the demo
  });
});

// ── Pricing cards reveal ──────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".price-card", { opacity: 0, y: 25 });
  gsap.to(".price-card", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".pricing-grid",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Skill tree nodes reveal ───────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".st-node", { opacity: 0, scale: 0.8 });
  gsap.to(".st-node", {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    stagger: 0.07,
    ease: "back.out(1.5)",
    scrollTrigger: {
      trigger: ".skill-tree",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
const DURATION = reduced ? 0 : 0.4;

document.querySelectorAll("#faq-acc .acc-trigger").forEach((trigger) => {
  const item = trigger.closest(".acc-item");
  const body = item.querySelector(".acc-body");
  const arrow = trigger.querySelector(".at-arrow");
  gsap.set(body, { height: 0, overflow: "hidden" });

  trigger.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    // Close all
    document.querySelectorAll("#faq-acc .acc-item").forEach((other) => {
      if (other !== item && other.classList.contains("is-open")) {
        other.classList.remove("is-open");
        other.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
        gsap.to(other.querySelector(".acc-body"), {
          height: 0,
          duration: DURATION,
          ease: "expo.in",
          overwrite: true,
        });
        gsap.to(other.querySelector(".at-arrow"), {
          rotation: 0,
          duration: DURATION * 0.7,
          ease: "power2.in",
          overwrite: true,
        });
      }
    });

    if (isOpen) {
      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      gsap.to(body, { height: 0, duration: DURATION, ease: "expo.in", overwrite: true });
      gsap.to(arrow, { rotation: 0, duration: DURATION * 0.7, ease: "power2.in", overwrite: true });
    } else {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      gsap.to(body, { height: "auto", duration: DURATION, ease: "expo.out", overwrite: true });
      gsap.to(arrow, { rotation: 45, duration: DURATION, ease: "back.out(2)", overwrite: true });
    }
  });
});

// ── Motion toggle ─────────────────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
