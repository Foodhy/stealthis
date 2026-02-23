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
  title: "Video Scroll Scrub",
  category: "scroll",
  tech: ["gsap", "scroll-trigger", "lenis", "video-currenttime", "canvas-2d"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── Canvas setup ──────────────────────────────────────────────────────────────
const canvas = document.getElementById("video-canvas");
const ctx = canvas.getContext("2d");
const fallback = document.getElementById("video-fallback");

function resizeCanvas() {
  const wrap = canvas.parentElement;
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}

// ── Synthetic video frames (CSS-gradient simulation) ──────────────────────────
// Since we can't ship a real video file in this demo, we generate
// procedural "film frames" on Canvas that look like a scrubbing video.
// In production: replace with a real <video> element and draw to canvas.

const TOTAL_DURATION = 8; // simulated seconds
let currentProgress = 0;
const animating = false;

const scenes = [
  { at: 0.0, label: "Opening", hue1: 220, hue2: 240, sat1: 30, sat2: 25, lig1: 8, lig2: 12 },
  { at: 0.2, label: "Act I", hue1: 15, hue2: 30, sat1: 40, sat2: 30, lig1: 10, lig2: 15 },
  { at: 0.42, label: "Rising", hue1: 200, hue2: 220, sat1: 50, sat2: 40, lig1: 12, lig2: 18 },
  { at: 0.65, label: "Climax", hue1: 350, hue2: 330, sat1: 55, sat2: 45, lig1: 14, lig2: 20 },
  { at: 0.82, label: "Resolution", hue1: 270, hue2: 290, sat1: 35, sat2: 25, lig1: 10, lig2: 15 },
  { at: 0.95, label: "End Credits", hue1: 220, hue2: 240, sat1: 15, sat2: 10, lig1: 6, lig2: 8 },
];

function getSceneAt(progress) {
  let scene = scenes[0];
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (progress >= scenes[i].at) {
      scene = scenes[i];
      break;
    }
  }
  return scene;
}

function lerpColor(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function drawFrame(progress) {
  const w = canvas.width;
  const h = canvas.height;

  // Find scene blend
  let sceneA = scenes[0],
    sceneB = scenes[1],
    blendT = 0;
  for (let i = 0; i < scenes.length - 1; i++) {
    if (progress >= scenes[i].at && progress < scenes[i + 1].at) {
      sceneA = scenes[i];
      sceneB = scenes[i + 1];
      const range = scenes[i + 1].at - scenes[i].at;
      blendT = (progress - scenes[i].at) / range;
      break;
    }
  }
  if (progress >= scenes[scenes.length - 1].at) {
    sceneA = sceneB = scenes[scenes.length - 1];
    blendT = 0;
  }

  // Interpolate hues
  const h1 = lerpColor(sceneA.hue1, sceneB.hue1, blendT);
  const h2 = lerpColor(sceneA.hue2, sceneB.hue2, blendT);
  const s1 = lerpColor(sceneA.sat1, sceneB.sat1, blendT);
  const s2 = lerpColor(sceneA.sat2, sceneB.sat2, blendT);
  const l1 = lerpColor(sceneA.lig1, sceneB.lig1, blendT);
  const l2 = lerpColor(sceneA.lig2, sceneB.lig2, blendT);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, `hsl(${h1}, ${s1}%, ${l1}%)`);
  grad.addColorStop(0.35, `hsl(${h2}, ${s2}%, ${l2}%)`);
  grad.addColorStop(0.65, `hsl(${h1 + 20}, ${s1}%, ${l1 + 3}%)`);
  grad.addColorStop(1, `hsl(${h2 + 10}, ${s2}%, ${l2 + 2}%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Light leak / lens flare effect
  const flareX = w * (0.2 + progress * 0.6);
  const flareGrad = ctx.createRadialGradient(flareX, h * 0.3, 0, flareX, h * 0.3, w * 0.5);
  flareGrad.addColorStop(0, `hsla(${h1 + 30}, 80%, 70%, ${0.04 + blendT * 0.06})`);
  flareGrad.addColorStop(1, "transparent");
  ctx.fillStyle = flareGrad;
  ctx.fillRect(0, 0, w, h);

  // Horizon line — simulates ground/horizon in a cinematic shot
  const horizonY = h * (0.48 + Math.sin(progress * Math.PI * 2) * 0.04);
  const horizonGrad = ctx.createLinearGradient(0, horizonY - 2, 0, horizonY + 2);
  horizonGrad.addColorStop(0, "transparent");
  horizonGrad.addColorStop(0.5, `hsla(${h1 + 15}, 60%, 55%, 0.12)`);
  horizonGrad.addColorStop(1, "transparent");
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, horizonY - 2, w, 4);

  // Film grain (subtle noise dots)
  ctx.save();
  ctx.globalAlpha = 0.025;
  for (let i = 0; i < 800; i++) {
    const gx = Math.random() * w;
    const gy = Math.random() * h;
    const size = Math.random() * 1.5;
    ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(gx, gy, size, size);
  }
  ctx.restore();

  // Vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0, 0, 0, 0.6)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Timestamp / frame counter
  const simTime = progress * TOTAL_DURATION;
  const mins = Math.floor(simTime / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(simTime % 60)
    .toString()
    .padStart(2, "0");
  ctx.font = '11px "SF Mono", monospace';
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.textAlign = "right";
  ctx.fillText(
    `${mins}:${secs} | FRAME ${Math.round(progress * 240)
      .toString()
      .padStart(5, "0")}`,
    w - 16,
    h - 16
  );
}

// ── UI updates ────────────────────────────────────────────────────────────────
const soFill = document.getElementById("so-fill");
const soTime = document.getElementById("so-time");
const scText = document.getElementById("sc-text");

function updateUI(progress) {
  soFill.style.width = `${progress * 100}%`;
  const simTime = progress * TOTAL_DURATION;
  const mins = Math.floor(simTime / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(simTime % 60)
    .toString()
    .padStart(2, "0");
  soTime.textContent = `${mins}:${secs}`;
  const scene = getSceneAt(progress);
  scText.textContent = scene.label;
}

// ── ScrollTrigger for scrub ───────────────────────────────────────────────────
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
drawFrame(0);

if (!reduced) {
  ScrollTrigger.create({
    trigger: "#scrub-section",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5,
    onUpdate: (self) => {
      currentProgress = self.progress;
      drawFrame(currentProgress);
      updateUI(currentProgress);
    },
  });
} else {
  // In reduced motion mode, just show a static frame and update on scroll
  window.addEventListener("scroll", () => {
    const section = document.getElementById("scrub-section");
    const rect = section.getBoundingClientRect();
    const spacer = section.querySelector(".scrub-spacer");
    const scrollable = section.offsetHeight - window.innerHeight;
    const prog = Math.max(0, Math.min(1, -rect.top / spacer.offsetHeight));
    drawFrame(prog);
    updateUI(prog);
  });
}

// ── Intro animations ──────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set(".intro h1, .intro p, .scroll-hint", { opacity: 0, y: 20 });
  gsap
    .timeline({ delay: 0.3, defaults: { ease: "expo.out" } })
    .to(".intro h1", { opacity: 1, y: 0, duration: 1 })
    .to(".intro p", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
    .to(".scroll-hint", { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");
}

// ── Chapter reveals ───────────────────────────────────────────────────────────
if (!reduced) {
  document.querySelectorAll(".chapter").forEach((ch, i) => {
    gsap.set(ch, { opacity: 0, x: -20 });
    gsap.to(ch, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".chapters",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// ── Motion toggle ─────────────────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
