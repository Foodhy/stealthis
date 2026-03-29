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
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// ── Inline shaders (Vite can't import .vert/.frag by default) ──
const vertexShader = `
uniform float uTime;
uniform float uPixelRatio;

attribute float aSize;
attribute float aSpeed;
attribute float aOffset;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec3 pos = position;
  float z = mod(pos.z + uTime * aSpeed * 0.5, 200.0) - 100.0;
  pos.z = z;
  float angle = uTime * 0.1 * aSpeed + aOffset;
  pos.x += sin(angle) * 2.0;
  pos.y += cos(angle) * 2.0;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float dist = -mvPosition.z;
  float size = aSize * uPixelRatio * (120.0 / max(dist, 1.0));
  gl_PointSize = max(size, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  vColor = aColor;
  float fadeFar = smoothstep(100.0, 50.0, dist);
  float fadeNear = smoothstep(0.0, 10.0, dist);
  vAlpha = fadeFar * fadeNear;
}
`;

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  alpha *= alpha;
  gl_FragColor = vec4(vColor, alpha * vAlpha);
}
`;

// ── Demo shell ──
initDemoShell({
  title: "Particle Tunnel",
  category: "3d",
  tech: ["three.js", "shaders", "postprocessing"],
});

// ── State ──
let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
  document.documentElement.classList.toggle("reduced-motion", reduced);
});

const mouse = { x: 0, y: 0, smoothX: 0, smoothY: 0 };
document.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ── Scene setup ──
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.008);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);
container.appendChild(renderer.domElement);

// ── Post-processing ──
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // strength
  0.4, // radius
  0.15 // threshold
);
composer.addPass(bloomPass);

// ── Particle system ──
const PARTICLE_COUNT = 6000;

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);
const speeds = new Float32Array(PARTICLE_COUNT);
const offsets = new Float32Array(PARTICLE_COUNT);
const colors = new Float32Array(PARTICLE_COUNT * 3);

// Color palette
const colorPalette = [
  new THREE.Color("#86e8ff"), // cyan
  new THREE.Color("#ae52ff"), // purple
  new THREE.Color("#ff40d6"), // pink
  new THREE.Color("#ffffff"), // white
  new THREE.Color("#6ec1ff"), // soft blue
  new THREE.Color("#ffcc66"), // warm gold
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;

  // Cylindrical distribution
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 25;
  positions[i3] = Math.cos(angle) * radius;
  positions[i3 + 1] = Math.sin(angle) * radius;
  positions[i3 + 2] = Math.random() * 200 - 100;

  sizes[i] = 0.5 + Math.random() * 3.5;
  speeds[i] = 0.3 + Math.random() * 1.5;
  offsets[i] = Math.random() * Math.PI * 2;

  // Random color from palette
  const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
  colors[i3] = color.r;
  colors[i3 + 1] = color.g;
  colors[i3 + 2] = color.b;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// ── Animation loop ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  if (!reduced) {
    material.uniforms.uTime.value = elapsed;

    // Smooth mouse following for camera rotation
    mouse.smoothX += (mouse.x - mouse.smoothX) * 0.03;
    mouse.smoothY += (mouse.y - mouse.smoothY) * 0.03;

    camera.rotation.x = mouse.smoothY * 0.15;
    camera.rotation.y = mouse.smoothX * 0.15;

    // Subtle camera drift
    camera.position.x = Math.sin(elapsed * 0.1) * 0.5;
    camera.position.y = Math.cos(elapsed * 0.08) * 0.3;
  }

  composer.render();
}

animate();

// ── Resize ──
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloomPass.resolution.set(w, h);
}

window.addEventListener("resize", onResize);

// ── Cleanup ──
window.addEventListener("beforeunload", () => {
  geometry.dispose();
  material.dispose();
  renderer.dispose();
});
