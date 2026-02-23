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
  title: "Scroll Camera Narrative",
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
scene.fog = new THREE.FogExp2(0x050508, 0.018);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

// ─── Lights ──────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0x111122, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(10, 15, 10);
scene.add(dirLight);

const pointLight1 = new THREE.PointLight(0x86e8ff, 3, 30);
pointLight1.position.set(0, 3, 0);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xae52ff, 2, 25);
pointLight2.position.set(-12, 4, -8);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xff40d6, 2, 25);
pointLight3.position.set(15, 2, -15);
scene.add(pointLight3);

// ─── Chapter 1: Origin — Torus Knot + Particle Ring ──────────────────

const torusKnotGeo = new THREE.TorusKnotGeometry(1.2, 0.4, 128, 32);
const torusKnotMat = new THREE.MeshPhysicalMaterial({
  color: 0x86e8ff,
  metalness: 0.8,
  roughness: 0.15,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  emissive: 0x86e8ff,
  emissiveIntensity: 0.15,
});
const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
torusKnot.position.set(0, 0, 0);
scene.add(torusKnot);

// Particle ring around origin
const ringParticleCount = 200;
const ringGeo = new THREE.BufferGeometry();
const ringPositions = new Float32Array(ringParticleCount * 3);
for (let i = 0; i < ringParticleCount; i++) {
  const angle = (i / ringParticleCount) * Math.PI * 2;
  const radius = 3 + (Math.random() - 0.5) * 0.8;
  ringPositions[i * 3] = Math.cos(angle) * radius;
  ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
  ringPositions[i * 3 + 2] = Math.sin(angle) * radius;
}
ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
const ringMat = new THREE.PointsMaterial({
  color: 0x86e8ff,
  size: 0.06,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const ringParticles = new THREE.Points(ringGeo, ringMat);
scene.add(ringParticles);

// ─── Chapter 2: Nebula — Instanced Spheres Cloud ────────────────────

const nebulaCount = 120;
const nebulaSphereGeo = new THREE.SphereGeometry(0.15, 8, 8);
const nebulaMat = new THREE.MeshStandardMaterial({
  color: 0xae52ff,
  emissive: 0xae52ff,
  emissiveIntensity: 0.4,
  transparent: true,
  opacity: 0.7,
});
const nebula = new THREE.InstancedMesh(nebulaSphereGeo, nebulaMat, nebulaCount);
const nebulaCenter = new THREE.Vector3(-12, 3, -8);
const dummy = new THREE.Object3D();

for (let i = 0; i < nebulaCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 1.5 + Math.random() * 2.5;
  dummy.position.set(
    nebulaCenter.x + r * Math.sin(phi) * Math.cos(theta),
    nebulaCenter.y + r * Math.sin(phi) * Math.sin(theta),
    nebulaCenter.z + r * Math.cos(phi)
  );
  const s = 0.4 + Math.random() * 1.2;
  dummy.scale.set(s, s, s);
  dummy.updateMatrix();
  nebula.setMatrixAt(i, dummy.matrix);
}
nebula.instanceMatrix.needsUpdate = true;
scene.add(nebula);

// ─── Chapter 3: Monolith — Tall Reflective Box ──────────────────────

const monolithGeo = new THREE.BoxGeometry(1.5, 6, 0.8);
const monolithMat = new THREE.MeshPhysicalMaterial({
  color: 0x1a1a2e,
  metalness: 1.0,
  roughness: 0.05,
  clearcoat: 1.0,
  clearcoatRoughness: 0.02,
  reflectivity: 1.0,
});
const monolith = new THREE.Mesh(monolithGeo, monolithMat);
monolith.position.set(10, 3, -20);
scene.add(monolith);

// Rim lights for the monolith
const monolithRim = new THREE.PointLight(0xff40d6, 4, 12);
monolithRim.position.set(12, 6, -20);
scene.add(monolithRim);

const monolithRim2 = new THREE.PointLight(0x86e8ff, 3, 12);
monolithRim2.position.set(8, 0, -18);
scene.add(monolithRim2);

// ─── Chapter 4: Orbit — Ring of Icosahedrons ────────────────────────

const orbitCenter = new THREE.Vector3(15, 1, -35);
const icoCount = 12;
const icoGeo = new THREE.IcosahedronGeometry(0.4, 0);
const icoMat = new THREE.MeshPhysicalMaterial({
  color: 0xffcc66,
  metalness: 0.7,
  roughness: 0.2,
  emissive: 0xffcc66,
  emissiveIntensity: 0.2,
});
const icos = [];
for (let i = 0; i < icoCount; i++) {
  const mesh = new THREE.Mesh(icoGeo, icoMat);
  const angle = (i / icoCount) * Math.PI * 2;
  mesh.position.set(
    orbitCenter.x + Math.cos(angle) * 3.5,
    orbitCenter.y + Math.sin(angle * 0.5) * 0.5,
    orbitCenter.z + Math.sin(angle) * 3.5
  );
  mesh.userData.baseAngle = angle;
  scene.add(mesh);
  icos.push(mesh);
}

const orbitLight = new THREE.PointLight(0xffcc66, 3, 20);
orbitLight.position.copy(orbitCenter);
scene.add(orbitLight);

// ─── Ambient Dust Particles ──────────────────────────────────────────

const dustCount = 500;
const dustGeo = new THREE.BufferGeometry();
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPositions[i * 3] = (Math.random() - 0.5) * 60;
  dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.04,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

// ─── Camera Waypoints ────────────────────────────────────────────────

const waypoints = [
  { pos: new THREE.Vector3(0, 2, 10), look: new THREE.Vector3(0, 0, 0) },
  { pos: new THREE.Vector3(-8, 4, -4), look: nebulaCenter.clone() },
  {
    pos: new THREE.Vector3(6, 5, -16),
    look: monolith.position.clone().add(new THREE.Vector3(0, 1, 0)),
  },
  { pos: new THREE.Vector3(10, 3, -30), look: orbitCenter.clone() },
  { pos: new THREE.Vector3(0, 12, -15), look: new THREE.Vector3(0, 0, -15) },
];

// Build CatmullRomCurve3 for camera positions and lookAt targets
const posCurve = new THREE.CatmullRomCurve3(
  waypoints.map((w) => w.pos),
  false,
  "catmullrom",
  0.3
);
const lookCurve = new THREE.CatmullRomCurve3(
  waypoints.map((w) => w.look),
  false,
  "catmullrom",
  0.3
);

// Set initial camera
camera.position.copy(waypoints[0].pos);
camera.lookAt(waypoints[0].look);

// ─── Scroll → Camera Progress ────────────────────────────────────────

const scrollState = { progress: 0 };

gsap.to(scrollState, {
  progress: 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5,
  },
});

// ─── Chapter Panel Visibility ────────────────────────────────────────

const chapters = document.querySelectorAll(".chapter");
chapters.forEach((ch) => {
  ScrollTrigger.create({
    trigger: ch,
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => ch.querySelector(".chapter-panel")?.classList.add("visible"),
    onLeave: () => ch.querySelector(".chapter-panel")?.classList.remove("visible"),
    onEnterBack: () => ch.querySelector(".chapter-panel")?.classList.add("visible"),
    onLeaveBack: () => ch.querySelector(".chapter-panel")?.classList.remove("visible"),
  });
});

// ─── Progress Dots ───────────────────────────────────────────────────

const progressContainer = document.createElement("div");
progressContainer.className = "scroll-progress";
for (let i = 0; i < 5; i++) {
  const dot = document.createElement("div");
  dot.className = "progress-dot";
  progressContainer.appendChild(dot);
}
document.body.appendChild(progressContainer);
const dots = progressContainer.querySelectorAll(".progress-dot");

function updateProgressDots() {
  const activeIndex = Math.min(Math.floor(scrollState.progress * 5), 4);
  dots.forEach((d, i) => d.classList.toggle("active", i === activeIndex));
}

// ─── Animation Loop ──────────────────────────────────────────────────

const clock = new THREE.Clock();
const currentLookAt = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Update camera from scroll progress
  const t = Math.max(0, Math.min(1, scrollState.progress));
  const targetPos = posCurve.getPoint(t);
  const targetLook = lookCurve.getPoint(t);

  camera.position.copy(targetPos);
  currentLookAt.copy(targetLook);
  camera.lookAt(currentLookAt);

  if (!reduced) {
    // Torus knot slow rotation
    torusKnot.rotation.y = elapsed * 0.3;
    torusKnot.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

    // Ring particles rotation
    ringParticles.rotation.y = elapsed * 0.15;

    // Icosahedron orbit
    icos.forEach((ico, i) => {
      const angle = ico.userData.baseAngle + elapsed * 0.4;
      ico.position.x = orbitCenter.x + Math.cos(angle) * 3.5;
      ico.position.z = orbitCenter.z + Math.sin(angle) * 3.5;
      ico.position.y = orbitCenter.y + Math.sin(elapsed + i) * 0.3;
      ico.rotation.x = elapsed * 0.5 + i;
      ico.rotation.z = elapsed * 0.3 + i;
    });

    // Dust subtle drift
    dust.rotation.y = elapsed * 0.01;
  }

  // Update progress dots
  updateProgressDots();

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
  torusKnotGeo.dispose();
  torusKnotMat.dispose();
  nebulaSphereGeo.dispose();
  nebulaMat.dispose();
  monolithGeo.dispose();
  monolithMat.dispose();
  icoGeo.dispose();
  icoMat.dispose();
  ringGeo.dispose();
  ringMat.dispose();
  dustGeo.dispose();
  dustMat.dispose();
  renderer.dispose();
});
