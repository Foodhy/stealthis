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

/**
 * 35-gamedev-portfolio — main.js
 * Retro pixel art game developer portfolio
 * Canvas starfield + pixel character, GSAP, Lenis, View Transitions
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ─── Init demo shell ─────────────────────────────────────────────
initDemoShell({
  title: "Game Developer Portfolio",
  category: "pages",
  tech: ["canvas-2d", "gsap", "lenis", "view-transitions-api", "css-animation"],
});

// ─── Reduced motion ───────────────────────────────────────────────
let reducedMotion = prefersReducedMotion();
window.addEventListener("motion-preference", (e) => {
  reducedMotion = e.detail?.reduced ?? prefersReducedMotion();
});

// ─── Loading Screen ───────────────────────────────────────────────
const overlay = document.getElementById("loadingOverlay");
const bar = document.getElementById("loadingBar");
const pct = document.getElementById("loadingPct");

function runLoadingScreen() {
  return new Promise((resolve) => {
    let progress = 0;
    const steps = [12, 8, 15, 5, 20, 10, 18, 12];
    let stepIndex = 0;

    function tick() {
      if (stepIndex >= steps.length) {
        bar.style.width = "100%";
        pct.textContent = "100%";
        setTimeout(() => {
          overlay.classList.add("hidden");
          setTimeout(resolve, 400);
        }, 300);
        return;
      }
      progress = Math.min(100, progress + steps[stepIndex]);
      bar.style.width = progress + "%";
      pct.textContent = progress + "%";
      stepIndex++;
      setTimeout(tick, 80 + Math.random() * 120);
    }

    tick();
  });
}

// ─── Lenis smooth scroll ──────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ─── Canvas setup ─────────────────────────────────────────────────
const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ─── Starfield ────────────────────────────────────────────────────
const stars = Array.from({ length: 150 }, () => ({
  x: Math.random(), // normalized 0-1
  y: Math.random(),
  size: Math.random() * 2 + 1, // 1-3px
  twinkle: Math.random() * Math.PI * 2,
  speed: 0.02 + Math.random() * 0.04,
  color: Math.random() < 0.1 ? (Math.random() < 0.5 ? "#ff6b9d" : "#4ecdc4") : "#ffffff",
}));

function drawStars(time) {
  const w = canvas.width;
  const h = canvas.height;
  stars.forEach((s) => {
    const alpha = 0.4 + Math.sin(s.twinkle + time * s.speed * 30) * 0.4;
    ctx.fillStyle =
      s.color === "#ffffff"
        ? `rgba(255, 255, 255, ${alpha})`
        : s.color +
          Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0");
    // pixel-crisp: use fillRect for square pixels, no antialiasing
    ctx.fillRect(Math.round(s.x * w), Math.round(s.y * h), s.size, s.size);
  });
}

// ─── Pixel Character ─────────────────────────────────────────────
// 8x12 pixel grid; each cell = PIXEL_SCALE px square
const PIXEL_SCALE = 4;
const COLORS = {
  0: null, // transparent
  1: "#f4c88a", // skin
  2: "#3d2314", // hair / dark
  3: "#4ecdc4", // body (teal armor)
  4: "#ffdd57", // accent (yellow visor / details)
  5: "#ff6b9d", // accent-2 (pink trim)
  6: "#1a1a3a", // shadow / dark belt
  7: "#ffffff", // white
  8: "#ff4757", // red detail
};

// 8-frame walk cycle — 8 columns wide, 12 rows tall
// frame index selects leg pattern (bottom 4 rows vary)
const FRAME_TOPS = [
  // rows 0-7: shared upper body (helmet, visor, torso, arms)
  [0, 0, 2, 2, 2, 2, 0, 0], // 0 — helmet top
  [0, 2, 4, 4, 4, 4, 2, 0], // 1 — visor
  [2, 2, 4, 4, 4, 4, 2, 2], // 2 — visor lower / helmet side
  [0, 2, 1, 1, 1, 1, 2, 0], // 3 — face
  [0, 0, 1, 1, 1, 1, 0, 0], // 4 — chin
  [5, 3, 3, 3, 3, 3, 3, 5], // 5 — shoulders
  [0, 3, 3, 6, 6, 3, 3, 0], // 6 — torso / belt
  [0, 3, 3, 6, 6, 3, 3, 0], // 7 — lower torso
];

// Leg frames — 4 rows, cycled across 8 animation frames
const LEG_FRAMES = [
  // frame 0: stand
  [
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 0, 0, 0, 0, 3, 0],
    [0, 4, 0, 0, 0, 0, 4, 0],
  ],
  // frame 1: step right fwd
  [
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 0, 3, 3, 0, 3, 0, 0],
    [0, 0, 4, 4, 0, 4, 0, 0],
  ],
  // frame 2: step right
  [
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 0, 0, 3, 0, 3, 0, 0],
    [0, 0, 0, 4, 0, 4, 0, 0],
  ],
  // frame 3: step right back
  [
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 0, 3, 0, 0, 3, 3, 0],
    [0, 0, 4, 0, 0, 4, 4, 0],
  ],
  // frame 4: stand (mirror)
  [
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 0, 0, 0, 0, 3, 0],
    [0, 4, 0, 0, 0, 0, 4, 0],
  ],
  // frame 5: step left fwd
  [
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 0, 0, 3, 3, 0, 0],
    [0, 4, 0, 0, 4, 4, 0, 0],
  ],
  // frame 6: step left
  [
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 0, 0, 3, 0, 0, 0],
    [0, 4, 0, 0, 4, 0, 0, 0],
  ],
  // frame 7: step left back
  [
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 3, 3, 0],
    [0, 3, 3, 0, 0, 0, 3, 0],
    [0, 4, 4, 0, 0, 0, 4, 0],
  ],
];

function drawPixelChar(cx, cy, frameIndex) {
  const ps = PIXEL_SCALE;
  const fi = frameIndex % LEG_FRAMES.length;

  // upper body (shared)
  FRAME_TOPS.forEach((row, ry) => {
    row.forEach((colorKey, rx) => {
      if (!colorKey) return;
      ctx.fillStyle = COLORS[colorKey];
      ctx.fillRect(Math.round(cx + rx * ps - 4 * ps), Math.round(cy + ry * ps - 6 * ps), ps, ps);
    });
  });

  // legs (animated)
  LEG_FRAMES[fi].forEach((row, ry) => {
    row.forEach((colorKey, rx) => {
      if (!colorKey) return;
      ctx.fillStyle = COLORS[colorKey];
      ctx.fillRect(
        Math.round(cx + rx * ps - 4 * ps),
        Math.round(cy + (ry + 8) * ps - 6 * ps),
        ps,
        ps
      );
    });
  });
}

// ─── Animation loop ───────────────────────────────────────────────
let animFrame = 0;
let lastFrameTime = 0;
const FRAME_INTERVAL = 120; // ms per walk frame
let charY = 0; // slight bob

function animate(time) {
  if (!canvas.width || !canvas.height) {
    requestAnimationFrame(animate);
    return;
  }

  const w = canvas.width;
  const h = canvas.height;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Deep space gradient bg
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#0a0a1a");
  grad.addColorStop(1, "#0f0f2a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Stars
  drawStars(time / 1000);

  // Subtle ground grid
  if (!reducedMotion) {
    ctx.strokeStyle = "rgba(78, 205, 196, 0.07)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    const scrollOffset = (time * 0.02) % gridSize;
    for (let x = 0; x < w + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - scrollOffset, h * 0.7);
      ctx.lineTo(x - scrollOffset, h);
      ctx.stroke();
    }
    for (let y = h * 0.7; y < h; y += gridSize * 0.5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  // Advance walk frame
  if (!reducedMotion && time - lastFrameTime > FRAME_INTERVAL) {
    animFrame = (animFrame + 1) % 8;
    lastFrameTime = time;
  }

  // Character bob
  if (!reducedMotion) {
    charY = Math.sin(time / 500) * 3;
  }

  // Draw character at center, slightly below mid
  const charX = w / 2;
  const charCy = h * 0.65 + charY;
  drawPixelChar(charX, charCy, animFrame);

  // Glow under character
  const glowGrad = ctx.createRadialGradient(charX, charCy + 20, 0, charX, charCy + 20, 40);
  glowGrad.addColorStop(0, "rgba(78, 205, 196, 0.15)");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(charX - 40, charCy, 80, 40);

  requestAnimationFrame(animate);
}

// ─── Score counter ────────────────────────────────────────────────
const scoreEl = document.getElementById("scoreVal");
let score = 0;
function tickScore() {
  if (reducedMotion) return;
  score += Math.floor(Math.random() * 37 + 1);
  if (score > 999999) score = 0;
  scoreEl.textContent = String(score).padStart(6, "0");
  setTimeout(tickScore, 80 + Math.random() * 140);
}

// ─── Pixel Nav visibility ─────────────────────────────────────────
const nav = document.getElementById("pixelNav");
const heroSection = document.getElementById("hero");

ScrollTrigger.create({
  trigger: heroSection,
  start: "bottom 80%",
  onEnter: () => nav.classList.add("visible"),
  onLeaveBack: () => nav.classList.remove("visible"),
});

// ─── Active nav link on scroll ────────────────────────────────────
const sections = ["hero", "stats", "games", "tech", "contact"];
sections.forEach((id) => {
  ScrollTrigger.create({
    trigger: `#${id}`,
    start: "top 50%",
    end: "bottom 50%",
    onToggle: ({ isActive }) => {
      const link = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (link) link.classList.toggle("active", isActive);
    },
  });
});

// ─── View Transition helper ───────────────────────────────────────
const vtOverlay = document.getElementById("vtOverlay");

function triggerViewTransition(targetId) {
  if (reducedMotion) {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const supportsVT = typeof document.startViewTransition === "function";

  if (supportsVT) {
    document.startViewTransition(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "instant" });
    });
  } else {
    // Fallback: manual overlay
    vtOverlay.classList.add("active");
    setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "instant" });
      setTimeout(() => vtOverlay.classList.remove("active"), 300);
    }, 250);
  }
}

// Nav link click handler
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.section;
    triggerViewTransition(target);
  });
});

// ─── Stat bars — animate on scroll enter ─────────────────────────
function initStatAnimations() {
  const statCards = document.querySelectorAll(".stat-card");

  statCards.forEach((card) => {
    const bar = card.querySelector(".stat-bar");
    const numEl = card.querySelector(".stat-num");
    const barWidth = Number.parseInt(bar?.dataset.width || "0", 10);
    const numTarget = Number.parseInt(numEl?.dataset.target || "0", 10);

    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      once: true,
      onEnter: () => {
        if (reducedMotion) {
          if (bar) bar.style.width = barWidth + "%";
          if (numEl) numEl.textContent = numTarget;
          return;
        }
        // Animate bar
        if (bar) {
          gsap.to(bar, {
            width: barWidth + "%",
            duration: 1.2,
            ease: "steps(20)",
          });
        }
        // Count up number
        if (numEl) {
          gsap.to(
            { val: 0 },
            {
              val: numTarget,
              duration: 1.4,
              ease: "steps(20)",
              onUpdate: function () {
                numEl.textContent = Math.round(this.targets()[0].val);
              },
            }
          );
        }
      },
    });
  });

  // XP bar
  const xpBar = document.querySelector(".xp-bar-inner");
  const xpNum = document.querySelector(".xp-pct-num");

  if (xpBar) {
    ScrollTrigger.create({
      trigger: xpBar,
      start: "top 85%",
      once: true,
      onEnter: () => {
        const target = Number.parseInt(xpBar.dataset.xp || "0", 10);
        if (reducedMotion) {
          xpBar.style.width = target + "%";
          if (xpNum) xpNum.textContent = target;
          return;
        }
        gsap.to(xpBar, { width: target + "%", duration: 1.5, ease: "steps(25)" });
        if (xpNum) {
          gsap.to(
            { val: 0 },
            {
              val: target,
              duration: 1.5,
              ease: "steps(25)",
              onUpdate: function () {
                xpNum.textContent = Math.round(this.targets()[0].val);
              },
            }
          );
        }
      },
    });
  }
}

// ─── Section reveal animations ────────────────────────────────────
function initSectionReveals() {
  if (reducedMotion) return;

  // Stat cards stagger
  gsap.from(".stat-card", {
    scrollTrigger: {
      trigger: ".stats-grid",
      start: "top 85%",
    },
    y: 20,
    opacity: 0,
    duration: 0.4,
    ease: "steps(4)",
    stagger: 0.08,
  });

  // Game cards
  gsap.from(".game-card", {
    scrollTrigger: {
      trigger: ".games-grid",
      start: "top 85%",
    },
    y: 30,
    opacity: 0,
    duration: 0.5,
    ease: "steps(5)",
    stagger: 0.12,
  });

  // Inventory items
  gsap.from(".inv-item", {
    scrollTrigger: {
      trigger: ".inventory-grid",
      start: "top 85%",
    },
    scale: 0.9,
    opacity: 0,
    duration: 0.3,
    ease: "steps(3)",
    stagger: 0.06,
  });

  // Contact section
  gsap.from(".contact-screen > *", {
    scrollTrigger: {
      trigger: ".contact-screen",
      start: "top 85%",
    },
    y: 16,
    opacity: 0,
    duration: 0.4,
    ease: "steps(4)",
    stagger: 0.1,
  });

  // Section headers
  document.querySelectorAll(".section-header-pixel").forEach((header) => {
    gsap.from(header, {
      scrollTrigger: { trigger: header, start: "top 90%" },
      x: -20,
      opacity: 0,
      duration: 0.5,
      ease: "steps(5)",
    });
  });
}

// ─── Hero entrance animation ──────────────────────────────────────
function animateHeroEntrance() {
  if (reducedMotion) return;

  const tl = gsap.timeline({ delay: 0.2 });
  tl.from(".hero-eyebrow", { opacity: 0, y: -10, duration: 0.4, ease: "steps(4)" })
    .from(".hero-name", { opacity: 0, y: 20, duration: 0.5, ease: "steps(5)" }, "-=0.1")
    .from(".hero-subtitle", { opacity: 0, duration: 0.3, ease: "steps(3)" }, "-=0.1")
    .from(
      ".hero-tags .hero-tag",
      {
        opacity: 0,
        y: 8,
        duration: 0.3,
        ease: "steps(3)",
        stagger: 0.07,
      },
      "-=0.1"
    )
    .from(".hero-scroll-cue", { opacity: 0, duration: 0.4, ease: "steps(4)" }, "-=0.1")
    .from(".hud-corner", { opacity: 0, duration: 0.3, ease: "steps(3)", stagger: 0.15 }, "-=0.2")
    .from(".hud-score", { opacity: 0, duration: 0.3, ease: "steps(3)" }, "-=0.1");
}

// ─── "No" button easter egg ───────────────────────────────────────
const btnNo = document.getElementById("btnNo");
let noClicks = 0;
const noMessages = [
  "✕ ARE YOU SURE?",
  "✕ REALLY SURE?",
  "✕ FINAL ANSWER?",
  "✕ WELL OK THEN",
  "✕ YOUR LOSS!",
  "✕ ...JUST KIDDING!",
];
if (btnNo) {
  btnNo.addEventListener("click", () => {
    noClicks = Math.min(noClicks + 1, noMessages.length - 1);
    btnNo.textContent = noMessages[noClicks];
    if (noClicks === noMessages.length - 1) {
      setTimeout(() => {
        noClicks = 0;
        btnNo.textContent = "✕ NO / QUIT";
      }, 2000);
    }
  });
}

// ─── Keyboard: any key → scroll to stats ─────────────────────────
let hasScrolled = false;
function onAnyKey(e) {
  if (hasScrolled) return;
  if (["Tab", "Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
  hasScrolled = true;
  triggerViewTransition("stats");
  window.removeEventListener("keydown", onAnyKey);
}
window.addEventListener("keydown", onAnyKey);

// ─── Boot sequence ────────────────────────────────────────────────
async function boot() {
  await runLoadingScreen();

  // Start canvas animation loop
  requestAnimationFrame(animate);

  // Start score counter
  tickScore();

  // GSAP animations
  initSectionReveals();
  initStatAnimations();
  animateHeroEntrance();
}

boot();
