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

const host = document.getElementById("scene");
const toggle = document.getElementById("toggleMotion");
let motionEnabled = !window.MotionPreference.prefersReducedMotion();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03050c);
scene.fog = new THREE.Fog(0x03050c, 10, 40);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.7, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
host.appendChild(renderer.domElement);

const product = new THREE.Group();
scene.add(product);

const body = new THREE.Mesh(
  new THREE.CylinderGeometry(1.2, 1.2, 2.4, 48),
  new THREE.MeshStandardMaterial({ color: 0x1e2c47, metalness: 0.6, roughness: 0.25 })
);
product.add(body);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.22, 0.08, 24, 80),
  new THREE.MeshStandardMaterial({
    color: 0x90e8ff,
    emissive: 0x478eb0,
    emissiveIntensity: 0.7,
    metalness: 0.4,
    roughness: 0.2,
  })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.7;
product.add(ring);

const cap = new THREE.Mesh(
  new THREE.CylinderGeometry(1.15, 1.15, 0.35, 48),
  new THREE.MeshStandardMaterial({ color: 0xbccae0, metalness: 0.85, roughness: 0.18 })
);
cap.position.y = 1.35;
product.add(cap);

scene.add(new THREE.AmbientLight(0x98b7ff, 0.45));
const key = new THREE.SpotLight(0x9edbff, 2.2, 60, 0.45, 0.35);
key.position.set(7, 8, 6);
scene.add(key);
const rim = new THREE.PointLight(0xd07cff, 0.8, 30);
rim.position.set(-6, 2, -5);
scene.add(rim);

function getScrollProgress() {
  const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function setLabel() {
  toggle.textContent = motionEnabled ? "Disable motion" : "Enable motion";
}

function animate(time) {
  requestAnimationFrame(animate);
  const t = time * 0.001;
  const p = motionEnabled ? getScrollProgress() : 0;

  const angle = -0.7 + p * 1.35;
  const radius = 7 - p * 2.1;
  camera.position.x += (Math.cos(angle) * radius - camera.position.x) * 0.08;
  camera.position.z += (Math.sin(angle) * radius - camera.position.z) * 0.08;
  camera.position.y += (0.5 + p * 1.4 - camera.position.y) * 0.08;
  camera.lookAt(0, 0.35, 0);

  if (motionEnabled) {
    product.rotation.y += 0.004;
    ring.rotation.z = Math.sin(t * 1.2) * 0.2;
  }

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

toggle.addEventListener("click", () => {
  motionEnabled = !motionEnabled;
  setLabel();
});

window.addEventListener("resize", onResize);
setLabel();
animate(0);
