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
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
host.appendChild(renderer.domElement);

const uniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;

    float noise(vec2 p){
      return sin(p.x) * sin(p.y);
    }

    void main() {
      vec2 uv = vUv;
      vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
      float t = uTime * 0.25;

      float wave = sin(p.x * 3.2 + t) * 0.12 + cos(p.y * 2.4 - t * 1.2) * 0.1;
      vec2 q = p + vec2(wave, wave * 0.7);

      float d = length(q);
      float glow = 0.25 / (d + 0.12);
      float grain = noise(q * 8.0 + t);

      vec3 col = vec3(0.03, 0.05, 0.12);
      col += vec3(0.15, 0.32, 0.55) * glow;
      col += vec3(0.35, 0.18, 0.6) * max(0.0, sin(q.x * 6.0 + t));
      col += grain * 0.015;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
});

const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(quad);

function setLabel() {
  toggle.textContent = motionEnabled ? "Disable motion" : "Enable motion";
}

function animate() {
  requestAnimationFrame(animate);
  if (motionEnabled) uniforms.uTime.value += 0.016;
  renderer.render(scene, camera);
}

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}

toggle.addEventListener("click", () => {
  motionEnabled = !motionEnabled;
  setLabel();
});

window.addEventListener("resize", onResize);
setLabel();
animate();
