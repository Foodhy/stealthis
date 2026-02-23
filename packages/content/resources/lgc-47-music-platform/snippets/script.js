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
  title: "FREQ — Music Platform",
  category: "pages",
  tech: ["gsap", "scroll-trigger", "lenis", "canvas-2d", "space-mono"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── Canvas Waveform Background ────────────────────────────────────────────────
const canvas = document.getElementById("waveform-canvas");
const ctx = canvas.getContext("2d");
let w, h;
let scrollY = 0;

function resizeCanvas() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

lenis.on("scroll", (e) => {
  scrollY = e.scroll;
});

function drawWaveform(time) {
  ctx.clearRect(0, 0, w, h);

  const numWaves = 4;
  const waveConfigs = [
    { color: "rgba(255,45,120,", freq: 0.003, amp: 60, speed: 0.4, y: h * 0.3 },
    { color: "rgba(155,77,255,", freq: 0.004, amp: 40, speed: 0.6, y: h * 0.5 },
    { color: "rgba(0,229,255,", freq: 0.0025, amp: 50, speed: 0.3, y: h * 0.7 },
    { color: "rgba(168,255,62,", freq: 0.005, amp: 25, speed: 0.8, y: h * 0.85 },
  ];

  const scrollOffset = scrollY * 0.3;

  waveConfigs.forEach((cfg, idx) => {
    ctx.beginPath();
    const opacity = 0.08 - idx * 0.015;

    for (let x = 0; x <= w; x += 2) {
      const y =
        cfg.y +
        Math.sin((x + scrollOffset) * cfg.freq + time * cfg.speed) * cfg.amp +
        Math.sin((x * 0.7 + scrollOffset * 0.8) * cfg.freq * 1.6 + time * cfg.speed * 1.3) *
          (cfg.amp * 0.4);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `${cfg.color}${opacity})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Subtle horizontal grid lines
  ctx.strokeStyle = "rgba(30, 30, 56, 0.6)";
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Vertical grid lines
  for (let x = 0; x < w; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}

// ── Main animation loop ───────────────────────────────────────────────────────
if (!reduced) {
  let startTime = null;
  function tick(ts) {
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000;
    drawWaveform(elapsed);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Hero entrance ─────────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set([".hero-tag", ".hero-h1 .h1-line", ".hero-sub", ".hero-actions", ".eq-bars"], {
    opacity: 0,
    y: 30,
  });
  gsap.set(".now-playing", { opacity: 0, x: 30 });

  gsap
    .timeline({ delay: 0.4, defaults: { ease: "expo.out" } })
    .to(".hero-tag", { opacity: 1, y: 0, duration: 0.7 })
    .to(".h1-line:nth-child(1)", { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
    .to(".h1-line:nth-child(2)", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
    .to(".hero-actions", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
    .to(".eq-bars", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
    .to(".now-playing", { opacity: 1, x: 0, duration: 0.8, ease: "back.out(1.2)" }, "-=0.6");
}

// ── Now Playing progress animation ───────────────────────────────────────────
gsap.to(".np-progress", {
  width: "75%",
  duration: 30,
  ease: "none",
  repeat: -1,
  yoyo: true,
});

// ── Shows section reveal ──────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".shows-header > *", { opacity: 0, y: 20 });
  gsap.to(".shows-header > *", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".shows-header",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });

  document.querySelectorAll(".show-card").forEach((card, i) => {
    gsap.set(card, { opacity: 0 });
    gsap.to(card, {
      opacity: 1,
      duration: 0.6,
      delay: i * 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".shows-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Charts — bar reveal on scroll ────────────────────────────────────────────
document.querySelectorAll(".ci-bar").forEach((bar, i) => {
  if (!reduced) {
    gsap.to(bar, {
      scaleX: 1,
      duration: 1,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".chart-list",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  } else {
    bar.style.transform = "scaleX(1)";
  }
});

if (!reduced) {
  document.querySelectorAll(".chart-item").forEach((item, i) => {
    gsap.set(item, { opacity: 0, x: -20 });
    gsap.to(item, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "expo.out",
      delay: i * 0.08,
      scrollTrigger: {
        trigger: ".chart-list",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // Hover glitch on chart items
  document.querySelectorAll(".chart-item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      if (reduced) return;
      gsap.to(item, { x: 4, duration: 0.05, yoyo: true, repeat: 2, ease: "power1.inOut" });
    });
  });
}

// ── Platform stats counters ───────────────────────────────────────────────────
document.querySelectorAll(".ps-num").forEach((el) => {
  const target = Number.parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || "";
  const isDecimal = !Number.isInteger(target);

  if (!reduced) {
    ScrollTrigger.create({
      trigger: ".platform-stats",
      start: "top 80%",
      end: "top 30%",
      onUpdate: (self) => {
        const val = target * self.progress;
        el.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
      },
    });
  } else {
    el.textContent = target + suffix;
  }
});

// ── Terminal typing effect ────────────────────────────────────────────────────
if (!reduced) {
  const terminal = document.querySelector(".terminal-body");
  const lines = terminal.querySelectorAll("p");

  lines.forEach((line, i) => {
    gsap.set(line, { opacity: 0 });
    gsap.to(line, {
      opacity: 1,
      duration: 0.01,
      delay: i * 0.25,
      scrollTrigger: {
        trigger: ".studio-terminal",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Studio section reveal ─────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".studio-left > *", { opacity: 0, y: 20 });
  gsap.to(".studio-left > *", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".studio-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });

  gsap.set(".studio-terminal", { opacity: 0, y: 25 });
  gsap.to(".studio-terminal", {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "expo.out",
    delay: 0.2,
    scrollTrigger: {
      trigger: ".studio-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ── Marquee pause on hover ────────────────────────────────────────────────────
const marqueeTrack = document.getElementById("marquee-track");
if (marqueeTrack) {
  marqueeTrack.addEventListener("mouseenter", () => {
    marqueeTrack.style.animationPlayState = "paused";
  });
  marqueeTrack.addEventListener("mouseleave", () => {
    marqueeTrack.style.animationPlayState = "running";
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
