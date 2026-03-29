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
scene.background = new THREE.Color(0x02040a);
scene.fog = new THREE.Fog(0x02040a, 8, 70);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 0, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
host.appendChild(renderer.domElement);

const count = 1800;
const geometry = new THREE.IcosahedronGeometry(0.11, 0);
const material = new THREE.MeshStandardMaterial({
  color: 0x88dcff,
  emissive: 0x2f6782,
  emissiveIntensity: 0.35,
  roughness: 0.35,
  metalness: 0.25,
});
const instanced = new THREE.InstancedMesh(geometry, material, count);
scene.add(instanced);

const dummy = new THREE.Object3D();
const data = [];
for (let i = 0; i < count; i += 1) {
  data.push({
    x: (Math.random() - 0.5) * 28,
    y: (Math.random() - 0.5) * 16,
    z: -Math.random() * 80,
    speed: 0.08 + Math.random() * 0.16,
    rot: Math.random() * Math.PI,
  });
}

scene.add(new THREE.AmbientLight(0x9abfff, 0.42));
const key = new THREE.PointLight(0x9fe1ff, 1.2, 55);
key.position.set(8, 8, 10);
scene.add(key);

function setLabel() {
  toggle.textContent = motionEnabled ? "Disable motion" : "Enable motion";
}

function animate() {
  requestAnimationFrame(animate);

  for (let i = 0; i < count; i += 1) {
    const d = data[i];
    if (motionEnabled) {
      d.z += d.speed;
      d.rot += 0.015;
      if (d.z > 8) d.z = -80;
    }

    dummy.position.set(d.x, d.y, d.z);
    dummy.rotation.set(d.rot, d.rot * 0.6, d.rot * 1.1);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
  }

  instanced.instanceMatrix.needsUpdate = true;
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
animate();
