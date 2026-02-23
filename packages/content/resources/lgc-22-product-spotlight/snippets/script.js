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
  title: "3D Product Spotlight",
  category: "3d",
  tech: ["three.js", "gsap", "lenis", "scrolltrigger"],
});

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

// ─── Lenis smooth scroll ─────────────────────────────────────────────

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ─── Three.js Setup ──────────────────────────────────────────────────

const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#050508");

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ─── Three-Point Lighting ────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
scene.add(ambientLight);

// Key light — white, strong, casts shadows
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(5, 6, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 20;
scene.add(keyLight);

// Fill light — cyan accent
const fillLight = new THREE.DirectionalLight(0x86e8ff, 1.0);
fillLight.position.set(-4, 3, -3);
scene.add(fillLight);

// Rim light — purple accent
const rimLight = new THREE.DirectionalLight(0xae52ff, 1.8);
rimLight.position.set(0, -2, -6);
scene.add(rimLight);

// Accent point light that follows camera angle
const accentLight = new THREE.PointLight(0x86e8ff, 1.5, 15);
scene.add(accentLight);

// ─── Product — Torus Knot (PBR) ─────────────────────────────────────

const productGeo = new THREE.TorusKnotGeometry(1.0, 0.35, 200, 32);
const productMat = new THREE.MeshPhysicalMaterial({
  color: 0x86e8ff,
  metalness: 0.95,
  roughness: 0.08,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  reflectivity: 1.0,
  envMapIntensity: 1.0,
});
const product = new THREE.Mesh(productGeo, productMat);
product.position.set(0, 0.5, 0);
product.castShadow = true;
product.receiveShadow = true;
scene.add(product);

// ─── Ground Plane ────────────────────────────────────────────────────

const groundGeo = new THREE.CircleGeometry(8, 64);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a14,
  metalness: 0.8,
  roughness: 0.4,
  transparent: true,
  opacity: 0.6,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.2;
ground.receiveShadow = true;
scene.add(ground);

// ─── Subtle Fog ──────────────────────────────────────────────────────

scene.fog = new THREE.FogExp2(0x050508, 0.04);

// ─── Camera Rail — Smooth Orbital Path ───────────────────────────────

const railPoints = [
  new THREE.Vector3(5, 3, 5), // Front-right, elevated
  new THREE.Vector3(0, 2.5, 6), // Front center
  new THREE.Vector3(-5, 2, 4), // Left side
  new THREE.Vector3(-5.5, 3.5, -2), // Left-back, higher
  new THREE.Vector3(-3, 4.5, -5), // Behind, high angle
  new THREE.Vector3(2, 4, -5.5), // Behind-right, high
  new THREE.Vector3(5.5, 2, -3), // Right side
  new THREE.Vector3(6, 1.8, 2), // Right-front, lower
  new THREE.Vector3(5, 3, 5), // Return to start
];

const rail = new THREE.CatmullRomCurve3(railPoints, false, "catmullrom", 0.4);
const productCenter = new THREE.Vector3(0, 0.5, 0);

// Set initial camera position
const initialPos = rail.getPoint(0);
camera.position.copy(initialPos);
camera.lookAt(productCenter);

// ─── Scroll → Orbit Progress ─────────────────────────────────────────

const scrollState = { progress: 0 };
const orbitFill = document.getElementById("orbit-fill");

gsap.to(scrollState, {
  progress: 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-track",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5,
    onUpdate: () => {
      if (orbitFill) {
        orbitFill.style.width = `${scrollState.progress * 100}%`;
      }
    },
  },
});

// ─── Info Card Visibility ────────────────────────────────────────────

const sections = document.querySelectorAll(".rail-section");
sections.forEach((section) => {
  const card = section.querySelector(".info-card");
  if (!card) return;

  ScrollTrigger.create({
    trigger: section,
    start: "top 55%",
    end: "bottom 45%",
    onEnter: () => card.classList.add("visible"),
    onLeave: () => card.classList.remove("visible"),
    onEnterBack: () => card.classList.add("visible"),
    onLeaveBack: () => card.classList.remove("visible"),
  });
});

// ─── Color Shifting ──────────────────────────────────────────────────

const productColors = [
  new THREE.Color(0x86e8ff), // Cyan
  new THREE.Color(0xae52ff), // Purple
  new THREE.Color(0xff40d6), // Pink
  new THREE.Color(0xffcc66), // Gold
];

function getInterpolatedColor(progress) {
  const segment = progress * (productColors.length - 1);
  const index = Math.floor(segment);
  const t = segment - index;
  const c1 = productColors[Math.min(index, productColors.length - 1)];
  const c2 = productColors[Math.min(index + 1, productColors.length - 1)];
  return new THREE.Color().lerpColors(c1, c2, t);
}

// ─── Animation Loop ──────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Update camera position from scroll progress along the rail
  const t = Math.max(0, Math.min(1, scrollState.progress));
  const cameraPos = rail.getPoint(t);
  camera.position.copy(cameraPos);
  camera.lookAt(productCenter);

  // Place accent light near camera but offset
  accentLight.position.set(cameraPos.x * 0.6, cameraPos.y + 1, cameraPos.z * 0.6);

  // Shift product color based on scroll progress
  const color = getInterpolatedColor(t);
  productMat.color.copy(color);

  if (!reduced) {
    // Slow product rotation on its own axis
    product.rotation.y = elapsed * 0.15;
    product.rotation.x = Math.sin(elapsed * 0.1) * 0.05;
  }

  renderer.render(scene, camera);
}

animate();

// ─── Resize ──────────────────────────────────────────────────────────

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Motion Preference ───────────────────────────────────────────────

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
  ScrollTrigger.refresh();
});

// ─── Cleanup ─────────────────────────────────────────────────────────

window.addEventListener("beforeunload", () => {
  productGeo.dispose();
  productMat.dispose();
  groundGeo.dispose();
  groundMat.dispose();
  renderer.dispose();
});
