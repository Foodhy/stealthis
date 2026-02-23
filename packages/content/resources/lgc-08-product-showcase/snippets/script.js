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

import * as THREE from "three";

initDemoShell({
  title: "3D Product Showcase",
  category: "3d",
  tech: ["three.js", "pbr-material", "lighting"],
});

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");
window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
});

// State
let orbiting = true;
let colorIndex = 0;
const colors = [
  new THREE.Color("#86e8ff"),
  new THREE.Color("#ae52ff"),
  new THREE.Color("#ff40d6"),
  new THREE.Color("#ffcc66"),
  new THREE.Color("#50c878"),
];

// Scene
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#050508");

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// Lights — three-point setup
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x86e8ff, 1.0);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xae52ff, 1.5);
rimLight.position.set(0, -3, -5);
scene.add(rimLight);

scene.add(new THREE.AmbientLight(0x111122, 0.5));

// Object — Torus Knot
const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 200, 32);
const material = new THREE.MeshPhysicalMaterial({
  color: colors[0],
  metalness: 0.9,
  roughness: 0.12,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  reflectivity: 1.0,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Ground reflection plane (subtle)
const planeGeo = new THREE.PlaneGeometry(20, 20);
const planeMat = new THREE.MeshStandardMaterial({
  color: 0x050508,
  metalness: 0.8,
  roughness: 0.3,
});
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -2;
scene.add(plane);

// Mouse
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
document.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Controls
document.getElementById("btn-pause").addEventListener("click", () => {
  orbiting = !orbiting;
  document.getElementById("btn-pause").textContent = orbiting ? "Pause Orbit" : "Resume Orbit";
});

document.getElementById("btn-color").addEventListener("click", () => {
  colorIndex = (colorIndex + 1) % colors.length;
  material.color.copy(colors[colorIndex]);
});

// Animation
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (!reduced) {
    // Smooth mouse
    mouse.sx += (mouse.x - mouse.sx) * 0.03;
    mouse.sy += (mouse.y - mouse.sy) * 0.03;

    if (orbiting) {
      mesh.rotation.y = t * 0.4;
      mesh.rotation.x = Math.sin(t * 0.2) * 0.15;
    }

    // Mouse influence on camera
    camera.position.x = mouse.sx * 1.5;
    camera.position.y = 1 + mouse.sy * 0.8;
    camera.lookAt(0, 0, 0);

    // Floating bob
    mesh.position.y = Math.sin(t * 0.8) * 0.1;
  }

  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("beforeunload", () => {
  geometry.dispose();
  material.dispose();
  renderer.dispose();
});
