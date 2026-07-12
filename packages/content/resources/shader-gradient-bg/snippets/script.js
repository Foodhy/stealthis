/* Shader Gradient Background — vanilla WebGL, no libraries. */
(function () {
  "use strict";

  // ---- Color schemes: 4 stops each, normalized 0..1 RGB ----
  const HEX = (h) => [
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255,
  ];

  const SCHEMES = [
    { id: "aurora", label: "Aurora", colors: ["#8b5cf6", "#22d3ee", "#34d399", "#0c0d10"] },
    { id: "ember", label: "Ember", colors: ["#f87171", "#fbbf24", "#8b5cf6", "#1d1f27"] },
    { id: "mint", label: "Mint", colors: ["#34d399", "#22d3ee", "#0ea5e9", "#0c0d10"] },
    { id: "candy", label: "Candy", colors: ["#f472b6", "#a78bfa", "#22d3ee", "#15161b"] },
    { id: "dusk", label: "Dusk", colors: ["#1e3a8a", "#8b5cf6", "#f472b6", "#fbbf24"] },
  ];

  const canvas = document.getElementById("gl");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    scheme: 0,
    speed: 1.0,
    warp: 0.55,
    grain: 0.06,
    paused: reduceMotion,
  };

  // ---------- Shader sources ----------
  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform float u_warp;
    uniform float u_grain;
    uniform vec3  u_c0;
    uniform vec3  u_c1;
    uniform vec3  u_c2;
    uniform vec3  u_c3;

    // hash + value noise
    float hash(vec2 p){
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }
    float noise(vec2 p){
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++){
        v += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
      }
      return v;
    }
    float rand(vec2 co){
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      float aspect = u_res.x / u_res.y;
      vec2 p = uv;
      p.x *= aspect;

      float t = u_time * 0.15;

      // domain warp — feed noise into noise
      vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t * 0.8)));
      vec2 r = vec2(
        fbm(p + u_warp * 2.0 * q + vec2(1.7, 9.2) + 0.15 * t),
        fbm(p + u_warp * 2.0 * q + vec2(8.3, 2.8) - 0.12 * t)
      );
      float f = fbm(p + u_warp * 2.0 * r);

      // map field to palette across three blends
      vec3 col = mix(u_c0, u_c1, clamp(f * 1.7, 0.0, 1.0));
      col = mix(col, u_c2, clamp(length(q) * 0.9, 0.0, 1.0));
      col = mix(col, u_c3, clamp(r.x * 0.65, 0.0, 1.0));

      // subtle vignette for depth
      float vig = smoothstep(1.25, 0.25, distance(uv, vec2(0.5)));
      col *= 0.65 + 0.35 * vig;

      // film grain
      float g = (rand(uv * u_res.xy + u_time) - 0.5) * u_grain;
      col += g;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // ---------- WebGL bootstrap ----------
  function createShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function initGL() {
    const gl =
      canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) return null;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return null;
    }
    gl.useProgram(prog);

    // full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    return {
      gl,
      prog,
      u: {
        res: gl.getUniformLocation(prog, "u_res"),
        time: gl.getUniformLocation(prog, "u_time"),
        warp: gl.getUniformLocation(prog, "u_warp"),
        grain: gl.getUniformLocation(prog, "u_grain"),
        c0: gl.getUniformLocation(prog, "u_c0"),
        c1: gl.getUniformLocation(prog, "u_c1"),
        c2: gl.getUniformLocation(prog, "u_c2"),
        c3: gl.getUniformLocation(prog, "u_c3"),
      },
    };
  }

  const ctx = initGL();
  const engineBadge = document.getElementById("engine-badge");
  const resEl = document.getElementById("res");
  const fpsEl = document.getElementById("fps");

  // ---------- Fallback path ----------
  if (!ctx) {
    canvas.classList.add("css-fallback");
    engineBadge.textContent = "CSS fallback · WebGL unavailable";
    engineBadge.style.borderColor = "var(--warn)";
    resEl.textContent = "no GPU context";
    fpsEl.textContent = "—";
    // Fallback scheme swap still works via gradient stops.
    buildSwatches(false);
    setupSlidersInert();
    return;
  }

  const { gl, u } = ctx;

  // ---------- Sizing ----------
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    resEl.textContent = w + "×" + h + " @" + dpr + "x";
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  // ---------- Palette upload ----------
  function applyScheme(idx) {
    state.scheme = idx;
    const c = SCHEMES[idx].colors.map(HEX);
    gl.uniform3fv(u.c0, c[0]);
    gl.uniform3fv(u.c1, c[1]);
    gl.uniform3fv(u.c2, c[2]);
    gl.uniform3fv(u.c3, c[3]);
    document.querySelectorAll(".swatch").forEach((el, i) => {
      el.setAttribute("aria-checked", i === idx ? "true" : "false");
      el.tabIndex = i === idx ? 0 : -1;
    });
  }

  // ---------- Render loop ----------
  let t = 0;
  let last = performance.now();
  let frames = 0;
  let fpsLast = last;

  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;
    if (!state.paused) t += dt * state.speed;

    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, t);
    gl.uniform1f(u.warp, state.warp);
    gl.uniform1f(u.grain, state.grain);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    frames++;
    if (now - fpsLast >= 500) {
      fpsEl.textContent = Math.round((frames * 1000) / (now - fpsLast));
      frames = 0;
      fpsLast = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------- UI wiring ----------
  buildSwatches(true);
  applyScheme(0);

  const speed = document.getElementById("speed");
  const warp = document.getElementById("warp");
  const grain = document.getElementById("grain");
  const speedVal = document.getElementById("speed-val");
  const warpVal = document.getElementById("warp-val");
  const grainVal = document.getElementById("grain-val");

  function syncLabels() {
    speedVal.textContent = state.speed.toFixed(1) + "×";
    warpVal.textContent = state.warp.toFixed(2);
    grainVal.textContent = state.grain.toFixed(2);
  }

  speed.addEventListener("input", () => {
    state.speed = speed.value / 100;
    syncLabels();
  });
  warp.addEventListener("input", () => {
    state.warp = warp.value / 100;
    syncLabels();
  });
  grain.addEventListener("input", () => {
    state.grain = grain.value / 100;
    syncLabels();
  });
  syncLabels();

  // pause
  const pauseBtn = document.getElementById("pause-btn");
  const pauseLabel = document.getElementById("pause-label");
  function setPaused(v) {
    state.paused = v;
    pauseBtn.setAttribute("aria-pressed", String(v));
    pauseLabel.textContent = v ? "Play" : "Pause";
  }
  pauseBtn.addEventListener("click", () => setPaused(!state.paused));
  if (reduceMotion) setPaused(true);

  // randomize
  document.getElementById("random-btn").addEventListener("click", () => {
    applyScheme(Math.floor(Math.random() * SCHEMES.length));
    speed.value = 40 + Math.floor(Math.random() * 200);
    warp.value = 25 + Math.floor(Math.random() * 65);
    grain.value = Math.floor(Math.random() * 18);
    state.speed = speed.value / 100;
    state.warp = warp.value / 100;
    state.grain = grain.value / 100;
    syncLabels();
    if (state.paused) setPaused(false);
  });

  // collapse
  const panel = document.getElementById("panel");
  const collapseBtn = document.getElementById("collapse-btn");
  collapseBtn.addEventListener("click", () => {
    const open = panel.classList.toggle("collapsed");
    collapseBtn.setAttribute("aria-expanded", String(!open));
  });

  // ---------- Swatch builder (shared with fallback) ----------
  function buildSwatches(interactive) {
    const wrap = document.getElementById("schemes");
    wrap.innerHTML = "";
    SCHEMES.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "swatch";
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", i === 0 ? "true" : "false");
      b.setAttribute("aria-label", s.label);
      b.title = s.label;
      b.tabIndex = i === 0 ? 0 : -1;
      b.style.background =
        "linear-gradient(135deg," + s.colors[0] + "," + s.colors[1] + "," + s.colors[2] + ")";

      b.addEventListener("click", () => selectScheme(i, interactive));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          selectScheme((i + 1) % SCHEMES.length, interactive, true);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          selectScheme((i - 1 + SCHEMES.length) % SCHEMES.length, interactive, true);
        }
      });
      wrap.appendChild(b);
    });
  }

  function selectScheme(i, interactive, focus) {
    if (interactive) {
      applyScheme(i);
    } else {
      // fallback: swap the CSS gradient stops
      const c = SCHEMES[i].colors;
      canvas.style.background =
        "linear-gradient(120deg," + c[0] + "," + c[1] + "," + c[2] + "," + c[3] + ")";
      canvas.style.backgroundSize = "300% 300%";
      document.querySelectorAll(".swatch").forEach((el, k) => {
        el.setAttribute("aria-checked", k === i ? "true" : "false");
        el.tabIndex = k === i ? 0 : -1;
      });
    }
    if (focus) document.querySelectorAll(".swatch")[i].focus();
  }

  // ---------- Fallback: disable live-only sliders ----------
  function setupSlidersInert() {
    ["speed", "warp", "grain"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.disabled = true;
        el.title = "Requires WebGL";
      }
    });
    const pb = document.getElementById("pause-btn");
    if (pb) pb.disabled = true;
  }
})();
