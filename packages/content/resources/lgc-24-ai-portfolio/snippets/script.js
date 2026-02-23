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
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, TextPlugin);

// ── Demo Shell ──
initDemoShell({
  title: "AI Engineer Portfolio",
  category: "pages",
  tech: ["canvas-2d", "gsap", "scrambletext", "lenis"],
});

// ── Lenis ──
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
// SECTION 1: Neural Network Canvas Background
// ═══════════════════════════════════════════════════════════════════════

const neuralCanvas = document.getElementById("neural-canvas");
const nCtx = neuralCanvas.getContext("2d");
let nodes = [];
let connections = [];
const pulses = [];
let mouseX = -1000,
  mouseY = -1000;
let neuralRAF = 0;

function resizeNeuralCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  neuralCanvas.width = Math.floor(window.innerWidth * dpr);
  neuralCanvas.height = Math.floor(window.innerHeight * dpr);
  neuralCanvas.style.width = window.innerWidth + "px";
  neuralCanvas.style.height = window.innerHeight + "px";
  nCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  initNetwork();
}

function initNetwork() {
  nodes = [];
  connections = [];
  const w = window.innerWidth;
  const h = window.innerHeight;
  const layers = 5;
  const nodesPerLayer = Math.floor(w < 600 ? 8 : 14);

  for (let l = 0; l < layers; l++) {
    const x = (w / (layers + 1)) * (l + 1);
    for (let n = 0; n < nodesPerLayer; n++) {
      const y = (h / (nodesPerLayer + 1)) * (n + 1);
      nodes.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 30,
        layer: l,
        baseAlpha: 0.15 + Math.random() * 0.15,
        alpha: 0.15,
        radius: 2 + Math.random() * 2,
      });
    }
  }

  // Connect adjacent layers
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (nodes[j].layer === nodes[i].layer + 1) {
        if (Math.random() < 0.3) {
          connections.push({ from: i, to: j, alpha: 0.04 + Math.random() * 0.06 });
        }
      }
    }
  }
}

function spawnPulse() {
  if (connections.length === 0) return;
  const conn = connections[Math.floor(Math.random() * connections.length)];
  pulses.push({ conn, progress: 0, speed: 0.008 + Math.random() * 0.012 });
}

function renderNeural() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  nCtx.clearRect(0, 0, w, h);

  // Connections
  for (const c of connections) {
    const a = nodes[c.from];
    const b = nodes[c.to];
    nCtx.strokeStyle = `rgba(0, 255, 135, ${c.alpha})`;
    nCtx.lineWidth = 0.5;
    nCtx.beginPath();
    nCtx.moveTo(a.x, a.y);
    nCtx.lineTo(b.x, b.y);
    nCtx.stroke();
  }

  // Pulses
  if (!reduced) {
    if (Math.random() < 0.03) spawnPulse();
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed;
      if (p.progress > 1) {
        pulses.splice(i, 1);
        continue;
      }
      const a = nodes[p.conn.from];
      const b = nodes[p.conn.to];
      const px = a.x + (b.x - a.x) * p.progress;
      const py = a.y + (b.y - a.y) * p.progress;
      const grad = nCtx.createRadialGradient(px, py, 0, px, py, 8);
      grad.addColorStop(0, "rgba(0, 255, 135, 0.8)");
      grad.addColorStop(1, "rgba(0, 255, 135, 0)");
      nCtx.fillStyle = grad;
      nCtx.beginPath();
      nCtx.arc(px, py, 8, 0, Math.PI * 2);
      nCtx.fill();
    }
  }

  // Nodes
  for (const node of nodes) {
    const dx = mouseX - node.x;
    const dy = mouseY - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const mouseInfluence = dist < 150 ? (1 - dist / 150) * 0.65 : 0;
    node.alpha = node.baseAlpha + mouseInfluence;

    nCtx.fillStyle = `rgba(0, 255, 135, ${node.alpha})`;
    nCtx.beginPath();
    nCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    nCtx.fill();

    if (mouseInfluence > 0.1) {
      const glowGrad = nCtx.createRadialGradient(
        node.x,
        node.y,
        0,
        node.x,
        node.y,
        node.radius * 4
      );
      glowGrad.addColorStop(0, `rgba(0, 255, 135, ${mouseInfluence * 0.3})`);
      glowGrad.addColorStop(1, "rgba(0, 255, 135, 0)");
      nCtx.fillStyle = glowGrad;
      nCtx.beginPath();
      nCtx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
      nCtx.fill();
    }
  }

  neuralRAF = requestAnimationFrame(renderNeural);
}

resizeNeuralCanvas();
window.addEventListener("resize", resizeNeuralCanvas);
neuralRAF = requestAnimationFrame(renderNeural);

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 2: Hero Terminal ScrambleText
// ═══════════════════════════════════════════════════════════════════════

const scrambleChars = "01!<>-_\\/[]{}=+*^?#";

if (reduced) {
  // Show text immediately in reduced motion
  document.querySelector(".cmd-text").textContent = "kai.init()";
  document.querySelector(".name-text").textContent = "Kai Nomura";
  document.querySelector(".role-text").textContent = "AI/ML Engineer";
  document.querySelector(".tagline1-text").textContent = "Building intelligent systems";
  document.querySelector(".tagline2-text").textContent = "that understand the world.";
  document.getElementById("cursor").style.display = "none";
  gsap.set("#scroll-hint", { opacity: 1 });
} else {
  const heroTl = gsap.timeline({ delay: 0.5 });

  heroTl
    .to(".cmd-text", {
      duration: 0.8,
      scrambleText: { text: "kai.init()", chars: scrambleChars, speed: 0.4 },
    })
    .to(
      ".name-text",
      {
        duration: 0.6,
        scrambleText: { text: "Kai Nomura", chars: scrambleChars, speed: 0.3 },
      },
      "+=0.3"
    )
    .to(
      ".role-text",
      {
        duration: 0.5,
        scrambleText: { text: "AI/ML Engineer", chars: scrambleChars, speed: 0.3 },
      },
      "+=0.1"
    )
    .to(
      ".tagline1-text",
      {
        duration: 0.8,
        scrambleText: { text: "Building intelligent systems", chars: scrambleChars, speed: 0.3 },
      },
      "+=0.4"
    )
    .to(
      ".tagline2-text",
      {
        duration: 0.7,
        scrambleText: { text: "that understand the world.", chars: scrambleChars, speed: 0.3 },
      },
      "+=0.1"
    )
    .to("#scroll-hint", { opacity: 1, duration: 0.6, ease: "expo.out" }, "+=0.5");
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 3: About — Bio Text Reveal + Stat Counters
// ═══════════════════════════════════════════════════════════════════════

// Bio text — line reveal
const bioText = document.querySelector(".bio-text");
if (bioText) {
  const bioSplit = new SplitText(bioText, { type: "lines", linesClass: "line" });
  gsap.set(bioSplit.lines, { opacity: 0, x: reduced ? 0 : -40 });

  gsap.to(bioSplit.lines, {
    opacity: 1,
    x: 0,
    duration: dur(0.7),
    ease: "expo.out",
    stagger: { each: 0.1 },
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}

// Section label
const aboutLabel = document.querySelector(".about-section .section-label");
if (aboutLabel) {
  gsap.set(aboutLabel, { opacity: 0, y: reduced ? 0 : 15 });
  gsap.to(aboutLabel, {
    opacity: 1,
    y: 0,
    duration: dur(0.5),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// Stat counters
document.querySelectorAll(".stat-card").forEach((card, i) => {
  gsap.set(card, { opacity: 0, x: reduced ? 0 : 40 });

  gsap.to(card, {
    opacity: 1,
    x: 0,
    duration: dur(0.6),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 65%",
      toggleActions: "play none none reverse",
    },
    delay: i * 0.15,
  });

  // Counter animation
  const numberEl = card.querySelector(".stat-number");
  const target = Number.parseInt(numberEl.dataset.target, 10);
  const suffix = numberEl.dataset.suffix || "";
  const counter = { val: 0 };

  ScrollTrigger.create({
    trigger: card,
    start: "top 80%",
    once: true,
    onEnter: () => {
      if (reduced) {
        numberEl.textContent = target + suffix;
        return;
      }
      gsap.to(counter, {
        val: target,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          numberEl.textContent = Math.round(counter.val) + suffix;
        },
      });
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SECTION 4: Projects — Card Entrance + Canvas Visualizations
// ═══════════════════════════════════════════════════════════════════════

// Projects section label
const projLabel = document.querySelector(".projects-section .section-label");
if (projLabel) {
  gsap.set(projLabel, { opacity: 0, y: reduced ? 0 : 15 });
  gsap.to(projLabel, {
    opacity: 1,
    y: 0,
    duration: dur(0.5),
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".projects-section",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

// Card entrance animations
document.querySelectorAll(".project-card").forEach((card) => {
  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: dur(0.8),
    ease: "expo.out",
    scrollTrigger: {
      trigger: card,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
});

// ── Project Visualizations ──

function setupVizCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  let animating = false;
  let raf = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    canvas,
    ctx,
    resize,
    get w() {
      return canvas.parentElement.getBoundingClientRect().width;
    },
    get h() {
      return canvas.parentElement.getBoundingClientRect().height;
    },
    start(renderFn) {
      if (animating) return;
      animating = true;
      const loop = () => {
        if (!animating) return;
        renderFn();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    },
    stop() {
      animating = false;
      cancelAnimationFrame(raf);
    },
  };
}

// ── Viz 1: NeuroVox — Audio Waveform ──

const vizNV = setupVizCanvas("viz-neurovox");
if (vizNV) {
  let nvTime = 0;

  function renderNeurovox() {
    const { ctx, w, h } = vizNV;
    ctx.clearRect(0, 0, w, h);
    nvTime += 0.03;

    const centerY = h / 2;
    const barCount = Math.floor(w / 6);

    for (let i = 0; i < barCount; i++) {
      const x = (i / barCount) * w;
      const freq1 = Math.sin(i * 0.15 + nvTime * 2) * 0.6;
      const freq2 = Math.sin(i * 0.08 + nvTime * 1.3) * 0.3;
      const freq3 = Math.cos(i * 0.22 + nvTime * 0.7) * 0.1;
      const amplitude = (freq1 + freq2 + freq3) * (h * 0.35);

      const barHeight = Math.abs(amplitude);
      const alpha = 0.3 + Math.abs(freq1) * 0.7;

      ctx.fillStyle = `rgba(0, 255, 135, ${alpha})`;
      ctx.fillRect(x, centerY - barHeight / 2, 3, barHeight);
    }
  }

  ScrollTrigger.create({
    trigger: "#viz-neurovox",
    start: "top 90%",
    end: "bottom 10%",
    onEnter: () => {
      vizNV.resize();
      vizNV.start(renderNeurovox);
    },
    onLeave: () => vizNV.stop(),
    onEnterBack: () => {
      vizNV.resize();
      vizNV.start(renderNeurovox);
    },
    onLeaveBack: () => vizNV.stop(),
  });

  if (reduced) {
    // Render a single static frame
    vizNV.resize();
    renderNeurovox();
  }
}

// ── Viz 2: DeepSight — Particle Eye Cluster ──

const vizDS = setupVizCanvas("viz-deepsight");
if (vizDS) {
  let dsTime = 0;
  const dsParticles = [];
  const particleCount = 200;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 80;
    dsParticles.push({
      baseAngle: angle,
      baseRadius: radius,
      speed: 0.002 + Math.random() * 0.008,
      size: 1 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function renderDeepsight() {
    const { ctx, w, h } = vizDS;
    ctx.clearRect(0, 0, w, h);
    dsTime += 0.02;

    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / 250;

    for (const p of dsParticles) {
      // Eye shape: elliptical orbit squashed vertically
      const angle = p.baseAngle + dsTime * p.speed;
      const r = p.baseRadius * scale;
      const eyeSquash = 0.4 + Math.sin(angle * 2) * 0.15;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * eyeSquash;

      const pulse = 0.5 + Math.sin(dsTime * 2 + p.phase) * 0.3;

      ctx.fillStyle = `rgba(255, 184, 0, ${pulse})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size * scale * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central "pupil" glow
    const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15 * scale);
    pupilGrad.addColorStop(0, "rgba(255, 184, 0, 0.6)");
    pupilGrad.addColorStop(0.5, "rgba(255, 184, 0, 0.15)");
    pupilGrad.addColorStop(1, "rgba(255, 184, 0, 0)");
    ctx.fillStyle = pupilGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 15 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  ScrollTrigger.create({
    trigger: "#viz-deepsight",
    start: "top 90%",
    end: "bottom 10%",
    onEnter: () => {
      vizDS.resize();
      vizDS.start(renderDeepsight);
    },
    onLeave: () => vizDS.stop(),
    onEnterBack: () => {
      vizDS.resize();
      vizDS.start(renderDeepsight);
    },
    onLeaveBack: () => vizDS.stop(),
  });

  if (reduced) {
    vizDS.resize();
    renderDeepsight();
  }
}

// ── Viz 3: SynthMind — Cellular Automata Grid ──

const vizSM = setupVizCanvas("viz-synthmind");
if (vizSM) {
  let smTime = 0;

  function renderSynthmind() {
    const { ctx, w, h } = vizSM;
    ctx.clearRect(0, 0, w, h);
    smTime += 0.04;

    const cellSize = 12;
    const cols = Math.ceil(w / cellSize);
    const rows = Math.ceil(h / cellSize);

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = col * cellSize;
        const y = row * cellSize;

        // Wave pattern across the grid
        const wave1 = Math.sin(col * 0.3 + smTime) * 0.5 + 0.5;
        const wave2 = Math.cos(row * 0.25 + smTime * 0.7) * 0.5 + 0.5;
        const wave3 = Math.sin((col + row) * 0.15 + smTime * 1.3) * 0.5 + 0.5;

        const intensity = (wave1 * wave2 + wave3) / 2;
        const alpha = intensity * 0.5;

        if (alpha > 0.08) {
          ctx.fillStyle = `rgba(74, 158, 255, ${alpha})`;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        }
      }
    }
  }

  ScrollTrigger.create({
    trigger: "#viz-synthmind",
    start: "top 90%",
    end: "bottom 10%",
    onEnter: () => {
      vizSM.resize();
      vizSM.start(renderSynthmind);
    },
    onLeave: () => vizSM.stop(),
    onEnterBack: () => {
      vizSM.resize();
      vizSM.start(renderSynthmind);
    },
    onLeaveBack: () => vizSM.stop(),
  });

  if (reduced) {
    vizSM.resize();
    renderSynthmind();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 5: Contact Terminal
// ═══════════════════════════════════════════════════════════════════════

const contactLines = ["Email:    kai@example.dev", "GitHub:   @kai-nomura", "Twitter:  @kai_ml"];

if (reduced) {
  const cmdEl = document.querySelector(".contact-cmd");
  if (cmdEl) cmdEl.textContent = "kai.contact()";
  document.querySelectorAll(".contact-line").forEach((el, i) => {
    el.textContent = contactLines[i];
  });
} else {
  ScrollTrigger.create({
    trigger: ".contact-section",
    start: "top 60%",
    once: true,
    onEnter: () => {
      const contactTl = gsap.timeline();

      contactTl.to(".contact-cmd", {
        duration: 0.6,
        scrambleText: { text: "kai.contact()", chars: scrambleChars, speed: 0.4 },
      });

      document.querySelectorAll(".contact-line").forEach((el, i) => {
        contactTl.to(
          el,
          {
            duration: 0.5,
            scrambleText: { text: contactLines[i], chars: scrambleChars, speed: 0.3 },
          },
          `+=${i === 0 ? 0.3 : 0.1}`
        );
      });
    },
  });
}
