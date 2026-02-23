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
  title: "Velocity-Aware Scroll + Speed Lines",
  category: "scroll",
  tech: ["lenis", "canvas-2d", "gsap", "velocity"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// --- Canvas Speed Lines Setup ---
const canvas = document.getElementById("speed-canvas");
const ctx = canvas.getContext("2d");
let velocity = 0;
let decayedVelocity = 0; // Smoothly decays when not scrolling

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawSpeedLines(vel) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const absVel = Math.abs(vel);
  const lineCount = Math.floor(Math.min(60, absVel * 4));
  const opacity = Math.min(0.7, absVel * 0.04);
  const maxLength = Math.min(canvas.width, canvas.height) * 0.5 * (absVel * 0.03);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (lineCount < 1 || opacity < 0.01) return;

  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const minDist = 80;
    const startX = cx + Math.cos(angle) * minDist;
    const startY = cy + Math.sin(angle) * minDist;
    const endX = cx + Math.cos(angle) * (minDist + maxLength);
    const endY = cy + Math.sin(angle) * (minDist + maxLength);

    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, `rgba(134, 232, 255, ${opacity})`);
    gradient.addColorStop(1, `rgba(134, 232, 255, 0)`);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(0.5, absVel * 0.1);
    ctx.stroke();
  }
}

// Animation loop
function tick() {
  // Smooth decay toward 0 when not scrolling
  decayedVelocity += (velocity - decayedVelocity) * 0.12;

  if (!reduced) {
    drawSpeedLines(decayedVelocity);
  }

  // Fade velocity toward 0
  velocity *= 0.9;
}

// --- Lenis Setup ---
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

lenis.on("scroll", (e) => {
  // Track velocity from Lenis scroll event
  velocity = e.velocity;
  ScrollTrigger.update();
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
  tick();
});
gsap.ticker.lagSmoothing(0);

// --- Hero Entrance ---
if (!reduced) {
  gsap.set(".hero .eyebrow", { opacity: 0, y: 20 });
  gsap.set(".hero h1", { opacity: 0, y: 40 });
  gsap.set(".hero .subtitle", { opacity: 0, y: 25 });

  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
    .to(".hero h1", { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
    .to(".hero .subtitle", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");
}

// --- Section Reveals ---
document.querySelectorAll(".section").forEach((section, i) => {
  if (!reduced) {
    gsap.set(section, { opacity: 0, y: 40 });
    gsap.to(section, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "expo.out",
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  }
});

document.querySelectorAll(".section h2").forEach((el) => {
  if (!reduced) {
    gsap.set(el, { opacity: 0, x: -20 });
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse" },
    });
  }
});

document.querySelectorAll(".section ul li").forEach((li, i) => {
  if (!reduced) {
    gsap.set(li, { opacity: 0, x: -15 });
    gsap.to(li, {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: "expo.out",
      delay: i * 0.06,
      scrollTrigger: { trigger: li, start: "top 75%", toggleActions: "play none none reverse" },
    });
  }
});

// --- Motion Preference ---
window.addEventListener("motion-preference", (e) => {
  if (e.detail.reduced) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gsap.globalTimeline.paused(true);
  } else {
    gsap.globalTimeline.paused(false);
  }
});
