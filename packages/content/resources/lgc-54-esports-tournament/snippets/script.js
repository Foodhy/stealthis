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
  title: "NEXUS Esports Tournament",
  category: "pages",
  tech: ["gsap", "scroll-trigger", "lenis", "canvas-2d", "rajdhani"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// Hero canvas — particle field
const heroCanvas = document.getElementById("hero-canvas");
const hCtx = heroCanvas.getContext("2d");
let hW, hH;
function resizeHero() {
  hW = heroCanvas.width = window.innerWidth;
  hH = heroCanvas.height = window.innerHeight;
}
resizeHero();
window.addEventListener("resize", resizeHero);

const particles = Array.from({ length: 80 }, () => ({
  x: Math.random(),
  y: Math.random(),
  vx: (Math.random() - 0.5) * 0.0003,
  vy: (Math.random() - 0.5) * 0.0003,
  size: Math.random() * 1.5 + 0.5,
  alpha: Math.random() * 0.4 + 0.1,
  lime: Math.random() > 0.7,
}));

if (!reduced) {
  function drawHero() {
    hCtx.clearRect(0, 0, hW, hH);
    particles.forEach((p) => {
      p.x = (p.x + p.vx + 1) % 1;
      p.y = (p.y + p.vy + 1) % 1;
      hCtx.beginPath();
      hCtx.arc(p.x * hW, p.y * hH, p.size, 0, Math.PI * 2);
      hCtx.fillStyle = p.lime
        ? `rgba(163,255,18,${p.alpha})`
        : `rgba(232,238,240,${p.alpha * 0.4})`;
      hCtx.fill();
    });
    // Grid lines
    hCtx.strokeStyle = "rgba(30,36,40,0.8)";
    hCtx.lineWidth = 1;
    for (let x = 0; x < hW; x += 60) {
      hCtx.beginPath();
      hCtx.moveTo(x, 0);
      hCtx.lineTo(x, hH);
      hCtx.stroke();
    }
    for (let y = 0; y < hH; y += 60) {
      hCtx.beginPath();
      hCtx.moveTo(0, y);
      hCtx.lineTo(hW, y);
      hCtx.stroke();
    }
    requestAnimationFrame(drawHero);
  }
  requestAnimationFrame(drawHero);
}

// Prize counter
const prizeEl = document.getElementById("prize-count");
if (!reduced) {
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom center",
    onUpdate: (self) => {
      const val = Math.round(2100000 * self.progress);
      prizeEl.textContent = "$" + val.toLocaleString();
    },
  });
} else {
  prizeEl.textContent = "$2,100,000";
}

// Hero stats counters
document.querySelectorAll(".hsr-num").forEach((el) => {
  const target = Number.parseInt(el.dataset.target);
  if (!reduced) {
    ScrollTrigger.create({
      trigger: ".hero-stats-row",
      start: "top 80%",
      end: "top 30%",
      onUpdate: (self) => {
        const val = Math.round(target * self.progress);
        el.textContent =
          target >= 1000000 ? (val / 1000000).toFixed(1) + "M" : val.toLocaleString();
      },
    });
  } else {
    el.textContent =
      target >= 1000000 ? (target / 1000000).toFixed(1) + "M" : target.toLocaleString();
  }
});

// Hero entrance
if (!reduced) {
  gsap.set([".hero-badge", ".hero-h1", ".hero-prize", ".hero-ctas", ".hero-stats-row"], {
    opacity: 0,
    y: 30,
  });
  gsap
    .timeline({ delay: 0.3, defaults: { ease: "expo.out" } })
    .to(".hero-badge", { opacity: 1, y: 0, duration: 0.6 })
    .to(".hero-h1", { opacity: 1, y: 0, duration: 1 }, "-=0.3")
    .to(".hero-prize", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".hero-ctas", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
    .to(".hero-stats-row", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
}

// Bracket reveal
if (!reduced) {
  document.querySelectorAll(".bt-match").forEach((m, i) => {
    gsap.set(m, { opacity: 0, x: -15 });
    gsap.to(m, {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: "expo.out",
      delay: i * 0.08,
      scrollTrigger: {
        trigger: ".bracket-teams",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// Players reveal
if (!reduced) {
  document.querySelectorAll(".player-card").forEach((card, i) => {
    gsap.set(card, { opacity: 0, y: 20 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".players-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

// Prize bars
document.querySelectorAll(".pb-fill").forEach((fill, i) => {
  if (!reduced) {
    gsap.to(fill, {
      scaleX: 1,
      duration: 1.2,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: {
        trigger: ".prize-bars",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  } else {
    fill.style.transform = "scaleX(1)";
  }
});

window.addEventListener("motion-preference", (e) => {
  gsap.globalTimeline.paused(e.detail.reduced);
});
