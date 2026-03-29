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

const holder = document.getElementById("scene");
const toggle = document.getElementById("toggleMotion");

let motionEnabled = !window.MotionPreference.prefersReducedMotion();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040a);
scene.fog = new THREE.Fog(0x02040a, 8, 56);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.z = 24;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
holder.appendChild(renderer.domElement);

const particles = 2400;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particles * 3);
const colors = new Float32Array(particles * 3);

const palette = [
  new THREE.Color("#7fd8ff"),
  new THREE.Color("#efe8c4"),
  new THREE.Color("#b483ff"),
  new THREE.Color("#f45dd5"),
];

for (let i = 0; i < particles; i += 1) {
  const i3 = i * 3;
  const angle = Math.random() * Math.PI * 2;
  const radius = 6 + Math.random() * 22;
  const z = -Math.random() * 80;

  positions[i3] = Math.cos(angle) * radius;
  positions[i3 + 1] = Math.sin(angle) * radius;
  positions[i3 + 2] = z;

  const color = palette[Math.floor(Math.random() * palette.length)];
  colors[i3] = color.r;
  colors[i3 + 1] = color.g;
  colors[i3 + 2] = color.b;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.25,
  transparent: true,
  opacity: 0.9,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const cloud = new THREE.Points(geometry, material);
scene.add(cloud);

const ambient = new THREE.AmbientLight(0x9ecbff, 0.6);
scene.add(ambient);

function label() {
  toggle.textContent = motionEnabled ? "Disable motion" : "Enable motion";
}

function animate() {
  requestAnimationFrame(animate);

  if (motionEnabled) {
    cloud.rotation.z += 0.0008;
    const pos = geometry.attributes.position.array;

    for (let i = 2; i < pos.length; i += 3) {
      pos[i] += 0.16;
      if (pos[i] > 5) pos[i] = -80;
    }

    geometry.attributes.position.needsUpdate = true;
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
  label();
});

window.addEventListener("resize", onResize);

label();
animate();
