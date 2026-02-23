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

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 0.4, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
host.appendChild(renderer.domElement);

const points = new THREE.Group();
scene.add(points);
const palette = [0x8adfff, 0xbf8cff, 0xf2e4b0, 0xef5dd9];
for (let i = 0; i < 140; i += 1) {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.11 + Math.random() * 0.28, 14, 14),
    new THREE.MeshStandardMaterial({
      color: palette[i % palette.length],
      emissive: palette[i % palette.length],
      emissiveIntensity: 0.28,
      roughness: 0.35,
      metalness: 0.2,
    })
  );
  sphere.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, -i * 0.48);
  points.add(sphere);
}

scene.add(new THREE.AmbientLight(0x9dbfff, 0.44));
const key = new THREE.PointLight(0x9be0ff, 1.3, 40);
key.position.set(5, 6, 6);
scene.add(key);

const chapters = [
  { pos: new THREE.Vector3(0, 0.4, 12), look: new THREE.Vector3(0, 0, -2) },
  { pos: new THREE.Vector3(2.6, 0.8, -1), look: new THREE.Vector3(0, 0, -12) },
  { pos: new THREE.Vector3(-1.8, 0.6, -16), look: new THREE.Vector3(0.5, 0, -26) },
  { pos: new THREE.Vector3(0, 1.2, -33), look: new THREE.Vector3(0, 0, -46) },
];

function progress() {
  const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function setLabel() {
  toggle.textContent = motionEnabled ? "Disable motion" : "Enable motion";
}

function interpolateChapter(p) {
  const scaled = p * (chapters.length - 1);
  const i = Math.floor(scaled);
  const t = Math.min(1, scaled - i);
  const from = chapters[i];
  const to = chapters[Math.min(chapters.length - 1, i + 1)];
  const pos = from.pos.clone().lerp(to.pos, t);
  const look = from.look.clone().lerp(to.look, t);
  return { pos, look };
}

function animate() {
  requestAnimationFrame(animate);

  const p = motionEnabled ? progress() : 0;
  const rail = interpolateChapter(p);
  camera.position.lerp(rail.pos, 0.08);
  camera.lookAt(rail.look);

  points.children.forEach((m, i) => {
    if (!motionEnabled) return;
    m.position.y += Math.sin(performance.now() * 0.001 + i) * 0.0009;
    m.rotation.y += 0.004;
  });

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
