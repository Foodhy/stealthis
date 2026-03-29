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

// ── Demo shell ──
initDemoShell({
  title: "Shader Background",
  category: "3d",
  tech: ["three.js", "glsl", "simplex-noise"],
});

let reduced = prefersReducedMotion();
if (reduced) document.documentElement.classList.add("reduced-motion");

window.addEventListener("motion-preference", (e) => {
  reduced = e.detail.reduced;
});

// ── Mouse ──
const mouse = { x: 0.5, y: 0.5, smoothX: 0.5, smoothY: 0.5 };
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX / window.innerWidth;
  mouse.y = 1.0 - e.clientY / window.innerHeight;
});

// ── Fragment shader with simplex noise ──
const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
         + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
               dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x_) - 0.5;
  vec3 ox = floor(x_ + 0.5);
  vec3 a0 = x_ - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal brownian motion
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv * vec2(aspect, 1.0);

  float t = uTime * 0.15;

  // Mouse influence — subtle bend of the noise field
  vec2 mouseInfluence = (uMouse - 0.5) * 0.3;

  // Layer 1: Large flowing bands
  float n1 = fbm(p * 1.5 + vec2(t * 0.4, t * 0.2) + mouseInfluence);

  // Layer 2: Medium detail
  float n2 = fbm(p * 3.0 + vec2(-t * 0.3, t * 0.5) + mouseInfluence * 0.5);

  // Layer 3: Fine detail
  float n3 = snoise(p * 5.0 + vec2(t * 0.6, -t * 0.2));

  // Combine layers
  float combined = n1 * 0.6 + n2 * 0.3 + n3 * 0.1;

  // Aurora color palette
  vec3 deepBlue  = vec3(0.02, 0.03, 0.08);
  vec3 teal      = vec3(0.1, 0.6, 0.7);
  vec3 cyan      = vec3(0.3, 0.85, 1.0);
  vec3 purple    = vec3(0.5, 0.15, 0.8);
  vec3 pink      = vec3(0.9, 0.2, 0.6);

  // Map noise to colors
  vec3 color = deepBlue;
  float band = smoothstep(-0.1, 0.3, combined);
  color = mix(color, teal, band * 0.5);

  float highlight = smoothstep(0.15, 0.5, combined);
  color = mix(color, cyan, highlight * 0.4);

  float peak = smoothstep(0.35, 0.65, combined);
  color = mix(color, purple, peak * 0.35);

  float hotspot = smoothstep(0.5, 0.8, combined);
  color = mix(color, pink, hotspot * 0.2);

  // Vertical fade (aurora tends to be in upper portion)
  float vertFade = smoothstep(0.0, 0.6, uv.y);
  color *= (0.4 + vertFade * 0.6);

  // Subtle vignette
  float vig = 1.0 - length((uv - 0.5) * 1.3);
  vig = smoothstep(0.0, 1.0, vig);
  color *= vig;

  // Boost brightness slightly
  color *= 1.3;

  gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// ── Scene setup ──
const container = document.getElementById("canvas-container");
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
};

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
});

// Full-screen quad
const geometry = new THREE.PlaneGeometry(2, 2);
scene.add(new THREE.Mesh(geometry, material));

// ── Render loop ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (!reduced) {
    uniforms.uTime.value = clock.getElapsedTime();

    // Smooth mouse
    mouse.smoothX += (mouse.x - mouse.smoothX) * 0.03;
    mouse.smoothY += (mouse.y - mouse.smoothY) * 0.03;
    uniforms.uMouse.value.set(mouse.smoothX, mouse.smoothY);
  }

  renderer.render(scene, camera);
}

animate();

// ── Resize ──
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

// ── Cleanup ──
window.addEventListener("beforeunload", () => {
  geometry.dispose();
  material.dispose();
  renderer.dispose();
});
