/* Product 360 viewer — raw WebGL, no libraries.
   Builds a lathed "speaker" mesh, shades it with Lambert + rim light,
   and orbits it with pointer drag, keyboard, sliders and wheel zoom. */

const canvas = document.querySelector("#glcanvas");
const fallback = document.querySelector("#fallback");
const readout = document.querySelector("#scene-readout");
const yawEl = document.querySelector("#yaw");
const pitchEl = document.querySelector("#pitch");
const yawOut = document.querySelector("#yaw-out");
const pitchOut = document.querySelector("#pitch-out");
const spinEl = document.querySelector("#spin");

const gl = canvas.getContext("webgl", { antialias: true, alpha: false });

if (!gl) {
  fallback.hidden = false;
} else {
  start();
}

/* ---------- math helpers (column-major 4x4) ---------- */
const perspective = (fovy, aspect, near, far) => {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
};

const multiply = (a, b) => {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  }
  return o;
};

const translation = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const rotX = (t) => {
  const c = Math.cos(t), s = Math.sin(t);
  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
};
const rotY = (t) => {
  const c = Math.cos(t), s = Math.sin(t);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
};
/* upper-left 3x3 of a rotation-only matrix is its own normal matrix */
const mat3 = (m) => [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]];

/* ---------- geometry: lathe a profile around Y ---------- */
function lathe(profile, segments) {
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];
  const rings = profile.length;

  for (let i = 0; i < rings; i++) {
    const [r, y, tint] = profile[i];
    const prev = profile[Math.max(i - 1, 0)];
    const next = profile[Math.min(i + 1, rings - 1)];
    // profile tangent -> 2D normal (dy, -dr)
    const dr = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const nl = Math.hypot(dr, dy) || 1;
    const nr = dy / nl;
    const ny = -dr / nl;

    for (let s = 0; s <= segments; s++) {
      const a = (s / segments) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      positions.push(r * ca, y, r * sa);
      normals.push(nr * ca, ny, nr * sa);
      colors.push(tint[0], tint[1], tint[2]);
    }
  }

  const stride = segments + 1;
  for (let i = 0; i < rings - 1; i++) {
    for (let s = 0; s < segments; s++) {
      const a = i * stride + s;
      const b = a + stride;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices),
  };
}

const SHELL = [0.28, 0.31, 0.38];
const TRIM = [0.43, 0.66, 1.0];
const CONE = [0.11, 0.12, 0.16];

/* radius, y, colour — a speaker: base, body, grille, cone dish, cap */
const PROFILE = [
  [0.001, -0.95, SHELL],
  [0.62, -0.95, SHELL],
  [0.66, -0.86, SHELL],
  [0.66, -0.30, SHELL],
  [0.70, -0.24, TRIM],
  [0.70, 0.42, TRIM],
  [0.66, 0.50, SHELL],
  [0.60, 0.66, SHELL],
  [0.58, 0.74, CONE],
  [0.34, 0.70, CONE],
  [0.16, 0.80, CONE],
  [0.10, 0.92, TRIM],
  [0.001, 0.95, TRIM],
];

/* ---------- shaders ---------- */
const VS = `
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec3 aColor;
uniform mat4 uProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormalMat;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vViewPos;
void main() {
  vec4 world = uModel * vec4(aPos, 1.0);
  vec4 view = uView * world;
  vNormal = normalize(uNormalMat * aNormal);
  vColor = aColor;
  vViewPos = view.xyz;
  gl_Position = uProj * view;
}`;

const FS = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vViewPos;
void main() {
  vec3 n = normalize(vNormal);
  vec3 key = normalize(vec3(0.5, 0.8, 0.6));
  vec3 fill = normalize(vec3(-0.7, 0.1, 0.4));
  vec3 eye = normalize(-vViewPos);

  float lambert = max(dot(n, key), 0.0);
  float fillAmt = max(dot(n, fill), 0.0) * 0.28;
  float rim = pow(1.0 - max(dot(n, eye), 0.0), 3.0);
  vec3 h = normalize(key + eye);
  float spec = pow(max(dot(n, h), 0.0), 48.0) * 0.5;

  vec3 col = vColor * (0.18 + lambert * 0.9 + fillAmt);
  col += vec3(0.35, 0.52, 0.85) * rim * 0.55;
  col += vec3(spec);
  gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
}`;

function compile(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh));
  }
  return sh;
}

/* ---------- state ---------- */
const HOME = { yaw: 24, pitch: -14, dist: 4.2 };
const state = { yaw: HOME.yaw, pitch: HOME.pitch, dist: HOME.dist, velocity: 0 };
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function start() {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(program);
  gl.useProgram(program);

  const mesh = lathe(PROFILE, 72);

  const bind = (name, data, size) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };
  bind("aPos", mesh.positions, 3);
  bind("aNormal", mesh.normals, 3);
  bind("aColor", mesh.colors, 3);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  const uProj = gl.getUniformLocation(program, "uProj");
  const uView = gl.getUniformLocation(program, "uView");
  const uModel = gl.getUniformLocation(program, "uModel");
  const uNormalMat = gl.getUniformLocation(program, "uNormalMat");

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    resize();

    if (!dragging) {
      state.yaw += state.velocity * dt;
      state.velocity *= Math.exp(-4 * dt); // inertia decay
      if (spinEl.checked && !reduceMotion && Math.abs(state.velocity) < 4) {
        state.yaw += 14 * dt;
      }
      if (state.yaw > 180) state.yaw -= 360;
      if (state.yaw < -180) state.yaw += 360;
      syncInputs();
    }

    gl.clearColor(0.027, 0.031, 0.047, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = canvas.width / canvas.height || 1;
    const model = multiply(rotX((state.pitch * Math.PI) / 180), rotY((state.yaw * Math.PI) / 180));

    gl.uniformMatrix4fv(uProj, false, new Float32Array(perspective(Math.PI / 4, aspect, 0.1, 50)));
    gl.uniformMatrix4fv(uView, false, new Float32Array(translation(0, 0, -state.dist)));
    gl.uniformMatrix4fv(uModel, false, new Float32Array(model));
    gl.uniformMatrix3fv(uNormalMat, false, new Float32Array(mat3(model)));

    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- interaction ---------- */
let dragging = false;
let lastX = 0;
let lastY = 0;

function syncInputs() {
  yawEl.value = String(Math.round(state.yaw));
  pitchEl.value = String(Math.round(state.pitch));
  yawOut.textContent = `${Math.round(state.yaw)}°`;
  pitchOut.textContent = `${Math.round(state.pitch)}°`;
}

const clampPitch = (v) => Math.max(-70, Math.min(70, v));

canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  state.velocity = 0;
  canvas.setPointerCapture(e.pointerId);
  readout.textContent = "Rotating…";
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  state.yaw += dx * 0.45;
  state.pitch = clampPitch(state.pitch + dy * 0.3);
  state.velocity = dx * 12;
  syncInputs();
});

const endDrag = () => {
  if (!dragging) return;
  dragging = false;
  readout.textContent = "Drag to rotate";
};
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    state.dist = Math.max(2.6, Math.min(7, state.dist + e.deltaY * 0.003));
  },
  { passive: false }
);

canvas.addEventListener("keydown", (e) => {
  const step = e.shiftKey ? 15 : 5;
  if (e.key === "ArrowLeft") state.yaw -= step;
  else if (e.key === "ArrowRight") state.yaw += step;
  else if (e.key === "ArrowUp") state.pitch = clampPitch(state.pitch - step);
  else if (e.key === "ArrowDown") state.pitch = clampPitch(state.pitch + step);
  else return;
  e.preventDefault();
  state.velocity = 0;
  spinEl.checked = false;
  syncInputs();
});

yawEl.addEventListener("input", () => {
  state.yaw = Number(yawEl.value);
  state.velocity = 0;
  spinEl.checked = false;
  syncInputs();
});

pitchEl.addEventListener("input", () => {
  state.pitch = Number(pitchEl.value);
  syncInputs();
});

document.querySelector("#reset-scene").addEventListener("click", () => {
  Object.assign(state, HOME, { velocity: 0 });
  syncInputs();
  readout.textContent = "View reset · drag to rotate";
});

if (reduceMotion) spinEl.checked = false;
syncInputs();
