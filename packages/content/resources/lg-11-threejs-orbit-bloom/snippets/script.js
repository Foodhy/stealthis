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

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const host = document.getElementById("scene");
const toggle = document.getElementById("toggleMotion");
let motionEnabled = !window.MotionPreference.prefersReducedMotion();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 11);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
host.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.9,
  0.5,
  0.15
);
composer.addPass(bloom);

const group = new THREE.Group();
scene.add(group);

const colors = [0x7ed7ff, 0xf3e8b8, 0xbb83ff, 0xf962d8];
for (let i = 0; i < 24; i += 1) {
  const geometry =
    i % 2
      ? new THREE.IcosahedronGeometry(0.25 + Math.random() * 0.3, 1)
      : new THREE.SphereGeometry(0.23 + Math.random() * 0.25, 22, 22);
  const material = new THREE.MeshStandardMaterial({
    color: colors[i % colors.length],
    emissive: colors[i % colors.length],
    emissiveIntensity: 0.45,
    metalness: 0.25,
    roughness: 0.35,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const angle = (i / 24) * Math.PI * 2;
  const radius = 3 + (i % 5) * 0.55;
  mesh.position.set(Math.cos(angle) * radius, ((i % 4) - 1.5) * 0.9, Math.sin(angle) * radius);
  mesh.userData = { angle, radius, speed: 0.15 + (i % 5) * 0.035 };
  group.add(mesh);
}

scene.add(new THREE.AmbientLight(0x9db9ff, 0.45));
const key = new THREE.PointLight(0x78d4ff, 1.3, 45);
key.position.set(6, 7, 7);
scene.add(key);

function setLabel() {
  toggle.textContent = motionEnabled ? "Disable motion" : "Enable motion";
}

function animate(time) {
  requestAnimationFrame(animate);

  if (motionEnabled) {
    const t = time * 0.001;
    group.rotation.y += 0.002;
    group.children.forEach((mesh) => {
      mesh.userData.angle += mesh.userData.speed * 0.002;
      mesh.position.x = Math.cos(mesh.userData.angle + t * 0.5) * mesh.userData.radius;
      mesh.position.z = Math.sin(mesh.userData.angle + t * 0.5) * mesh.userData.radius;
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.008;
    });
  }

  composer.render();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

toggle.addEventListener("click", () => {
  motionEnabled = !motionEnabled;
  setLabel();
});

window.addEventListener("resize", onResize);
setLabel();
animate(0);
