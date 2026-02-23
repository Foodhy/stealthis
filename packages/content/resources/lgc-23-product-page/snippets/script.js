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
import Lenis from "lenis";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

// ── Demo Shell ──
initDemoShell({
  title: "Product Landing Page",
  category: "pages",
  tech: ["three.js", "gsap", "lenis", "splittext"],
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
// THREE.JS SETUP
// ═══════════════════════════════════════════════════════════════════════

const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0a0a0f");

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
container.appendChild(renderer.domElement);

// ── Lighting ──
scene.add(new THREE.AmbientLight(0x111122, 0.4));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(4, 5, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x2997ff, 1.2);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xbf5af2, 1.5);
rimLight.position.set(0, -2, -5);
scene.add(rimLight);

// ── Product — AirPods-style Earbuds ──
const productMat = new THREE.MeshPhysicalMaterial({
  color: 0xf5f5f7,
  metalness: 0.95,
  roughness: 0.05,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  reflectivity: 1.0,
});

// Earbud body profile (LatheGeometry) — traces cross-section of an earbud
const earbudProfile = [
  new THREE.Vector2(0.0, -0.3), // Bottom center (stem junction)
  new THREE.Vector2(0.12, -0.25), // Slight outward taper at base
  new THREE.Vector2(0.22, -0.15), // Widening toward body
  new THREE.Vector2(0.32, 0.0), // Main body widest point (lower)
  new THREE.Vector2(0.35, 0.15), // Body maximum width
  new THREE.Vector2(0.34, 0.3), // Still wide, slight taper
  new THREE.Vector2(0.3, 0.42), // Tapering toward speaker face
  new THREE.Vector2(0.24, 0.5), // Speaker face edge
  new THREE.Vector2(0.15, 0.55), // Speaker face rounding
  new THREE.Vector2(0.0, 0.57), // Top center (speaker face)
];

function createEarbud() {
  const group = new THREE.Group();

  // Body — revolved earbud shape
  const bodyGeo = new THREE.LatheGeometry(earbudProfile, 48);
  const bodyMesh = new THREE.Mesh(bodyGeo, productMat);
  group.add(bodyMesh);

  // Stem — capsule extending downward
  const stemGeo = new THREE.CapsuleGeometry(0.04, 0.52, 8, 16);
  const stemMesh = new THREE.Mesh(stemGeo, productMat);
  stemMesh.position.y = -0.56;
  group.add(stemMesh);

  return { group, bodyGeo, stemGeo };
}

const leftEarbud = createEarbud();
const rightEarbud = createEarbud();

// Position pair: tilted outward like resting earbuds
leftEarbud.group.position.x = -0.55;
leftEarbud.group.rotation.z = 0.15;

rightEarbud.group.position.x = 0.55;
rightEarbud.group.rotation.z = -0.15;

// Parent group — this is the `product` used by all animation code
const product = new THREE.Group();
product.add(leftEarbud.group);
product.add(rightEarbud.group);
product.position.set(0, 0.3, 0);
scene.add(product);

// ── Fog ──
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.03);

// ── Animation state ──
const state = {
  productScale: 0.6,
  productX: 0,
  productRotY: 0,
  activeFeature: 0,
};

// ═══════════════════════════════════════════════════════════════════════
// HERO ENTRANCE
// ═══════════════════════════════════════════════════════════════════════

const heroTitle = document.querySelector(".hero-title");
const heroTagline = document.querySelector(".hero-tagline");

// SplitText for hero
const titleSplit = new SplitText(heroTitle, { type: "chars", charsClass: "char" });
gsap.set(titleSplit.chars, {
  opacity: 0,
  y: reduced ? 0 : 60,
  rotateX: reduced ? 0 : -90,
});

const heroTl = gsap.timeline({ delay: 0.3 });

// Scale product in
heroTl
  .to(state, {
    productScale: 1,
    duration: dur(1.4),
    ease: "expo.out",
  })
  .to(
    titleSplit.chars,
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: dur(0.6),
      ease: "back.out(1.4)",
      stagger: { each: 0.03 },
    },
    0.3
  )
  .to(
    heroTagline,
    {
      opacity: 1,
      y: 0,
      duration: dur(0.8),
      ease: "expo.out",
    },
    0.7
  )
  .to(
    "#scroll-indicator",
    {
      opacity: 1,
      duration: dur(0.6),
      ease: "expo.out",
    },
    1.2
  );

// ═══════════════════════════════════════════════════════════════════════
// SCROLL: Hero → Features transition (product shifts right)
// ═══════════════════════════════════════════════════════════════════════

gsap.to(state, {
  productX: 2.5,
  productScale: 0.7,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "bottom bottom",
    end: "+=300",
    scrub: 1.5,
  },
});

// ═══════════════════════════════════════════════════════════════════════
// FEATURES: Pinned section with content swap
// ═══════════════════════════════════════════════════════════════════════

const featureCards = document.querySelectorAll(".feature-card");
const stepDots = document.querySelectorAll(".step-dot");

// Show first card initially
featureCards[0].classList.add("active");

// Feature stat targets
const statTargets = [
  { id: "stat-anc", target: 40, suffix: "" },
  { id: "stat-spatial", target: 360, suffix: "°" },
  { id: "stat-battery", target: 50, suffix: "" },
];

// Product rotation angles per feature
const featureRotations = [0, Math.PI * 0.6, Math.PI * 1.2];
const featureColors = [
  new THREE.Color(0xf5f5f7), // White/silver
  new THREE.Color(0x2997ff), // Blue
  new THREE.Color(0xffd60a), // Gold
];

function setActiveFeature(index) {
  if (index === state.activeFeature && featureCards[index].classList.contains("active")) return;

  featureCards.forEach((c) => c.classList.remove("active"));
  stepDots.forEach((d) => d.classList.remove("active"));

  featureCards[index].classList.add("active");
  stepDots[index].classList.add("active");

  // Animate product rotation and color
  if (!reduced) {
    gsap.to(state, {
      productRotY: featureRotations[index],
      duration: 0.8,
      ease: "expo.out",
    });
  }

  // Animate counter
  const stat = statTargets[index];
  const el = document.getElementById(stat.id);
  if (el && el.dataset.animated !== "true") {
    el.dataset.animated = "true";
    if (reduced) {
      el.textContent = stat.target + stat.suffix;
    } else {
      const counter = { val: 0 };
      gsap.to(counter, {
        val: stat.target,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(counter.val) + stat.suffix;
        },
      });
    }
  }

  state.activeFeature = index;
}

// ScrollTrigger for feature track
ScrollTrigger.create({
  trigger: ".feature-track",
  start: "top top",
  end: "bottom bottom",
  scrub: 0,
  onUpdate: (self) => {
    const p = self.progress;
    if (p < 0.33) setActiveFeature(0);
    else if (p < 0.66) setActiveFeature(1);
    else setActiveFeature(2);

    // Color lerp
    const colorProgress = p * (featureColors.length - 1);
    const ci = Math.floor(colorProgress);
    const ct = colorProgress - ci;
    const c1 = featureColors[Math.min(ci, featureColors.length - 1)];
    const c2 = featureColors[Math.min(ci + 1, featureColors.length - 1)];
    productMat.color.lerpColors(c1, c2, ct);
  },
});

// ═══════════════════════════════════════════════════════════════════════
// SPECS GRID: Staggered entrance
// ═══════════════════════════════════════════════════════════════════════

const specsHeading = document.querySelector(".specs-heading");
if (specsHeading) {
  const specsSplit = new SplitText(specsHeading, { type: "chars", charsClass: "char" });
  gsap.set(specsSplit.chars, { opacity: 0, y: reduced ? 0 : 30 });

  gsap.to(specsSplit.chars, {
    opacity: 1,
    y: 0,
    duration: dur(0.5),
    ease: "back.out(1.2)",
    stagger: { each: 0.02 },
    scrollTrigger: {
      trigger: ".specs-section",
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

gsap.to(".spec-card", {
  opacity: 1,
  y: 0,
  scale: 1,
  duration: dur(0.6),
  ease: "expo.out",
  stagger: {
    each: 0.08,
    from: "center",
    grid: [2, 3],
  },
  scrollTrigger: {
    trigger: ".specs-grid",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

// ═══════════════════════════════════════════════════════════════════════
// CTA: ScrambleText price reveal
// ═══════════════════════════════════════════════════════════════════════

const ctaPrice = document.getElementById("cta-price");

if (reduced) {
  ctaPrice.textContent = "$299";
  gsap.set(".cta-tagline", { opacity: 1 });
  gsap.set(".btn", { opacity: 1, y: 0 });
} else {
  gsap.set(ctaPrice, { opacity: 0 });

  ScrollTrigger.create({
    trigger: ".cta-section",
    start: "top 60%",
    once: true,
    onEnter: () => {
      const ctaTl = gsap.timeline();

      ctaTl
        .to(ctaPrice, { opacity: 1, duration: 0.1 })
        .to(ctaPrice, {
          duration: 1.0,
          scrambleText: {
            text: "$299",
            chars: "0123456789$",
            speed: 0.3,
          },
        })
        .to(
          ".cta-tagline",
          {
            opacity: 1,
            duration: 0.6,
            ease: "expo.out",
          },
          "-=0.3"
        )
        .to(
          ".btn",
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
            stagger: 0.1,
          },
          "-=0.2"
        );
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════
// THREE.JS ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════════════

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Apply scale and position from scroll state
  product.scale.setScalar(state.productScale);
  product.position.x = state.productX;

  // Rotation: base from scroll + slow auto-rotation
  if (!reduced) {
    product.rotation.y = state.productRotY + elapsed * 0.15;
    product.rotation.x = Math.sin(elapsed * 0.1) * 0.05;
  } else {
    product.rotation.y = state.productRotY;
  }

  renderer.render(scene, camera);
}

animate();

// ── Resize ──
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Cleanup ──
window.addEventListener("beforeunload", () => {
  leftEarbud.bodyGeo.dispose();
  leftEarbud.stemGeo.dispose();
  rightEarbud.bodyGeo.dispose();
  rightEarbud.stemGeo.dispose();
  productMat.dispose();
  renderer.dispose();
});
