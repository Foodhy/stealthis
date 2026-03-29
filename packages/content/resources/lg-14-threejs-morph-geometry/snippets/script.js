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
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
host.appendChild(renderer.domElement);

const count = 3800;
const from = new Float32Array(count * 3);
const to = new Float32Array(count * 3);
const current = new Float32Array(count * 3);

for (let i = 0; i < count; i += 1) {
  const i3 = i * 3;
  from[i3] = (Math.random() - 0.5) * 5.5;
  from[i3 + 1] = (Math.random() - 0.5) * 5.5;
  from[i3 + 2] = (Math.random() - 0.5) * 5.5;

  const u = Math.random() * 2 - 1;
  const a = Math.random() * Math.PI * 2;
  const r = 2.9;
  const s = Math.sqrt(1 - u * u);
  to[i3] = r * s * Math.cos(a);
  to[i3 + 1] = r * u;
  to[i3 + 2] = r * s * Math.sin(a);

  current[i3] = from[i3];
  current[i3 + 1] = from[i3 + 1];
  current[i3 + 2] = from[i3 + 2];
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(current, 3));
const material = new THREE.PointsMaterial({
  size: 0.06,
  color: 0x9adfff,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const cloud = new THREE.Points(geometry, material);
scene.add(cloud);
scene.add(new THREE.AmbientLight(0xa2bfff, 0.42));

function setLabel() {
  toggle.textContent = motionEnabled ? "Disable motion" : "Enable motion";
}

function animate(time) {
  requestAnimationFrame(animate);

  const t = motionEnabled ? Math.sin(time * 0.0007) * 0.5 + 0.5 : 0;
  const pos = geometry.attributes.position.array;
  for (let i = 0; i < pos.length; i += 1) pos[i] = from[i] + (to[i] - from[i]) * t;
  geometry.attributes.position.needsUpdate = true;

  if (motionEnabled) {
    cloud.rotation.y += 0.0025;
    cloud.rotation.x += 0.0012;
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
