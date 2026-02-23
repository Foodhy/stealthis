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

import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

initDemoShell({
  title: "Premium Velocity Experience",
  category: "pages",
  tech: ["three.js", "lenis", "gsap", "canvas-2d", "velocity"],
});

const reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ─── Lenis Setup ──────────────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);

// ─── Three.js Hero ───────────────────────────────────────────────────────────
const heroCanvas = document.getElementById("hero-canvas");
const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// Icosahedron wireframe
const geo = new THREE.IcosahedronGeometry(1.8, 2);
const mat = new THREE.MeshBasicMaterial({
  color: 0x86e8ff,
  wireframe: true,
  transparent: true,
  opacity: 0.18,
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// Inner sphere
const innerGeo = new THREE.SphereGeometry(0.9, 16, 16);
const innerMat = new THREE.MeshBasicMaterial({
  color: 0xae52ff,
  wireframe: true,
  transparent: true,
  opacity: 0.1,
});
const innerMesh = new THREE.Mesh(innerGeo, innerMat);
scene.add(innerMesh);

// Ambient particles
const particleCount = 600;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const partGeo = new THREE.BufferGeometry();
partGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const partMat = new THREE.PointsMaterial({
  color: 0x86e8ff,
  size: 0.03,
  transparent: true,
  opacity: 0.4,
});
const particles = new THREE.Points(partGeo, partMat);
scene.add(particles);

// Scroll-driven rotation
let scrollProgress = 0;
ScrollTrigger.create({
  trigger: document.body,
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    scrollProgress = self.progress;
  },
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Velocity Canvas (Demo 39 technique) ─────────────────────────────────────
const velCanvas = document.getElementById("velocity-canvas");
const ctx = velCanvas.getContext("2d");
let velocity = 0;
let smoothVelocity = 0;

function resizeVelCanvas() {
  velCanvas.width = window.innerWidth;
  velCanvas.height = window.innerHeight;
}
resizeVelCanvas();
window.addEventListener("resize", resizeVelCanvas);

function drawSpeedLines(vel) {
  const cx = velCanvas.width / 2;
  const cy = velCanvas.height / 2;
  const absVel = Math.abs(vel);
  const count = Math.floor(Math.min(80, absVel * 5));
  const opacity = Math.min(0.65, absVel * 0.045);
  const maxLen = Math.min(velCanvas.width, velCanvas.height) * 0.45 * Math.min(1, absVel * 0.025);

  ctx.clearRect(0, 0, velCanvas.width, velCanvas.height);
  if (count < 1 || opacity < 0.02) return;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const minR = 60;
    const sx = cx + Math.cos(angle) * minR;
    const sy = cy + Math.sin(angle) * minR;
    const ex = cx + Math.cos(angle) * (minR + maxLen);
    const ey = cy + Math.sin(angle) * (minR + maxLen);

    const grad = ctx.createLinearGradient(sx, sy, ex, ey);
    grad.addColorStop(0, `rgba(134, 232, 255, ${opacity})`);
    grad.addColorStop(0.5, `rgba(174, 82, 255, ${opacity * 0.5})`);
    grad.addColorStop(1, "rgba(134, 232, 255, 0)");

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(0.5, absVel * 0.12);
    ctx.stroke();
  }
}

// Speed indicator UI
const speedFill = document.getElementById("speed-fill");
const speedValue = document.getElementById("speed-value");

// ─── Lenis scroll event ───────────────────────────────────────────────────────
lenis.on("scroll", (e) => {
  velocity = e.velocity;

  // Update speed UI
  const absVel = Math.abs(velocity);
  const pct = Math.min(100, absVel * 6);
  if (speedFill) speedFill.style.width = pct + "%";
  if (speedValue) speedValue.textContent = absVel.toFixed(1);
});

// ─── Main Animation Loop ──────────────────────────────────────────────────────
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);

  // Smooth velocity decay
  smoothVelocity += (velocity - smoothVelocity) * 0.1;
  velocity *= 0.92;

  if (!reduced) {
    // Draw speed lines
    drawSpeedLines(smoothVelocity);

    // Rotate Three.js meshes
    const t = time * 0.3;
    mesh.rotation.x = t * 0.4 + scrollProgress * Math.PI * 2;
    mesh.rotation.y = t * 0.6;
    innerMesh.rotation.x = -t * 0.5;
    innerMesh.rotation.y = t * 0.8 + scrollProgress * Math.PI;
    particles.rotation.y = t * 0.08;

    // Velocity effect on mesh scale
    const absVel = Math.abs(smoothVelocity);
    const scalePulse = 1 + absVel * 0.008;
    mesh.scale.setScalar(scalePulse);
  }

  renderer.render(scene, camera);
});

// ─── Gradient hue shift on scroll ────────────────────────────────────────────
if (!reduced) {
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      document.documentElement.style.setProperty("--hue-shift", `${self.progress * 300}deg`);
    },
  });
}

// ─── Hero entrance ────────────────────────────────────────────────────────────
if (!reduced) {
  gsap.set([".hero-tag", ".hero h1", ".hero-desc", ".speed-indicator"], { opacity: 0, y: 30 });
  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .to(".hero-tag", { opacity: 1, y: 0, duration: 0.7, delay: 0.5 })
    .to(".hero h1", { opacity: 1, y: 0, duration: 1 }, "-=0.4")
    .to(".hero-desc", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
    .to(".speed-indicator", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
}

// ─── Depth cards entrance (Demo 38 technique) ─────────────────────────────────
document.querySelectorAll(".depth-card").forEach((card, i) => {
  const depth = Number.parseFloat(card.style.getPropertyValue("--depth")) || 0.5;

  if (!reduced) {
    gsap.set(card, { opacity: 0, y: 60, rotationX: 15, scale: 0.85 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      scale: 1,
      duration: 1,
      ease: "expo.out",
      delay: depth * 0.3,
      scrollTrigger: {
        trigger: ".depth-section",
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
    });

    card.addEventListener("mouseenter", () =>
      gsap.to(card, { y: -12, duration: 0.4, overwrite: "auto" })
    );
    card.addEventListener("mouseleave", () =>
      gsap.to(card, { y: 0, duration: 0.4, overwrite: "auto" })
    );
  }
});

// ─── Stats counters ───────────────────────────────────────────────────────────
document.querySelectorAll(".stat-card").forEach((card, i) => {
  const valEl = card.querySelector(".stat-value");
  const target = Number.parseFloat(card.dataset.target);
  const suffix = card.dataset.suffix || "";

  if (!reduced) {
    gsap.set(card, { opacity: 0, y: 30 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "expo.out",
      delay: i * 0.08,
      scrollTrigger: {
        trigger: ".stats-grid",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      end: "top 25%",
      onUpdate: (self) => {
        const val = target * self.progress;
        const display = target % 1 !== 0 ? val.toFixed(1) : Math.round(val);
        valEl.textContent = display + suffix;
      },
    });
  } else {
    valEl.textContent = target + suffix;
  }
});

// ─── Features list ────────────────────────────────────────────────────────────
document.querySelectorAll(".feature-item").forEach((item, i) => {
  if (!reduced) {
    gsap.set(item, { opacity: 0, x: -30 });
    gsap.to(item, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "expo.out",
      delay: i * 0.1,
      scrollTrigger: { trigger: item, start: "top 75%", toggleActions: "play none none reverse" },
    });
  }
});

// Section headers
document.querySelectorAll(".section-header").forEach((h) => {
  if (!reduced) {
    gsap.set(h.children, { opacity: 0, y: 25 });
    gsap.to(h.children, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "expo.out",
      scrollTrigger: { trigger: h, start: "top 75%", toggleActions: "play none none reverse" },
    });
  }
});

// CTA
if (!reduced) {
  gsap.set(".cta-section h2, .cta-section p, .cta-section a", { opacity: 0, y: 25 });
  gsap.to(".cta-section h2, .cta-section p, .cta-section a", {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".cta-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

// ─── Motion preference ────────────────────────────────────────────────────────
window.addEventListener("motion-preference", (e) => {
  if (e.detail.reduced) {
    gsap.globalTimeline.paused(true);
    ctx.clearRect(0, 0, velCanvas.width, velCanvas.height);
  } else {
    gsap.globalTimeline.paused(false);
  }
});
