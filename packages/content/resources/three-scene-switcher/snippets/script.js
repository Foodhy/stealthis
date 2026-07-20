/* WebGL Scene Switcher — one canvas, one render loop, three raw GL scenes. */
(() => {
  const canvas = document.getElementById("gl");
  const fallback = document.getElementById("fallback");
  const hudScene = document.getElementById("hud-scene");
  const hudFps = document.getElementById("hud-fps");
  const speedEl = document.getElementById("speed");
  const toggleEl = document.getElementById("toggle");
  const tabs = [...document.querySelectorAll(".chip")];

  const gl =
    canvas.getContext("webgl", { antialias: true, alpha: false }) ||
    canvas.getContext("experimental-webgl");

  if (!gl) {
    canvas.hidden = true;
    fallback.hidden = false;
    tabs.forEach((t) => (t.disabled = true));
    toggleEl.disabled = true;
    speedEl.disabled = true;
    return;
  }

  /* ---------- GL helpers ---------- */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader compile failed");
    }
    return s;
  }

  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "program link failed");
    }
    return p;
  }

  function buffer(data) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return b;
  }

  function bindAttrib(prog, name, buf, size, stride, offset) {
    const loc = gl.getAttribLocation(prog, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride * 4, offset * 4);
  }

  /* ---------- Scene 1: rotating gradient triangle ---------- */
  const triProg = program(
    `attribute vec2 aPos; attribute vec3 aColor;
     uniform float uTime; uniform float uAspect;
     varying vec3 vColor;
     void main() {
       float a = uTime * 0.9;
       mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));
       vec2 p = rot * aPos * (0.72 + 0.08 * sin(uTime * 2.0));
       p.x /= uAspect;
       vColor = aColor;
       gl_Position = vec4(p, 0.0, 1.0);
     }`,
    `precision mediump float; varying vec3 vColor;
     void main() { gl_FragColor = vec4(vColor, 1.0); }`
  );
  // interleaved: x, y, r, g, b
  const triBuf = buffer([
    0.0, 0.9, 0.38, 0.89, 0.76,
    -0.85, -0.6, 0.25, 0.45, 0.95,
    0.85, -0.6, 0.95, 0.38, 0.62,
  ]);

  /* ---------- Scene 2: animated wireframe grid ---------- */
  const gridProg = program(
    `attribute vec2 aPos; uniform float uTime; uniform float uAspect;
     varying float vDepth;
     void main() {
       float w = sin(aPos.x * 3.0 + uTime * 1.6) * 0.12
               + cos(aPos.y * 3.4 - uTime * 1.1) * 0.12;
       vec2 p = aPos;
       p.y += w;
       p *= 0.85;
       p.x /= uAspect;
       vDepth = w;
       gl_Position = vec4(p, 0.0, 1.0);
     }`,
    `precision mediump float; varying float vDepth;
     void main() {
       float t = clamp(vDepth * 3.0 + 0.5, 0.0, 1.0);
       gl_FragColor = vec4(mix(vec3(0.13,0.28,0.45), vec3(0.38,0.89,0.76), t), 1.0);
     }`
  );
  const gridVerts = [];
  const N = 18;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 2 - 1;
    gridVerts.push(t, -1, t, 1); // vertical line
    gridVerts.push(-1, t, 1, t); // horizontal line
  }
  const gridBuf = buffer(gridVerts);
  const gridCount = gridVerts.length / 2;

  /* ---------- Scene 3: fullscreen plasma ---------- */
  const quadProg = program(
    `attribute vec2 aPos; varying vec2 vUv;
     void main() { vUv = aPos; gl_Position = vec4(aPos, 0.0, 1.0); }`,
    `precision highp float; varying vec2 vUv;
     uniform float uTime; uniform float uAspect;
     void main() {
       vec2 p = vec2(vUv.x * uAspect, vUv.y) * 2.2;
       float v = sin(p.x + uTime)
               + sin(p.y * 1.3 - uTime * 0.7)
               + sin((p.x + p.y) * 0.9 + uTime * 0.5)
               + sin(length(p) * 2.0 - uTime * 1.4);
       v *= 0.25;
       vec3 col = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.66) + v));
       col *= vec3(0.55, 1.0, 0.92);
       gl_FragColor = vec4(col, 1.0);
     }`
  );
  const quadBuf = buffer([-1, -1, 3, -1, -1, 3]);

  const scenes = {
    triangle(time, aspect) {
      gl.clearColor(0.03, 0.035, 0.05, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(triProg);
      gl.uniform1f(gl.getUniformLocation(triProg, "uTime"), time);
      gl.uniform1f(gl.getUniformLocation(triProg, "uAspect"), aspect);
      bindAttrib(triProg, "aPos", triBuf, 2, 5, 0);
      bindAttrib(triProg, "aColor", triBuf, 3, 5, 2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    grid(time, aspect) {
      gl.clearColor(0.02, 0.03, 0.04, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(gridProg);
      gl.uniform1f(gl.getUniformLocation(gridProg, "uTime"), time);
      gl.uniform1f(gl.getUniformLocation(gridProg, "uAspect"), aspect);
      bindAttrib(gridProg, "aPos", gridBuf, 2, 2, 0);
      gl.drawArrays(gl.LINES, 0, gridCount);
    },
    plasma(time, aspect) {
      gl.useProgram(quadProg);
      gl.uniform1f(gl.getUniformLocation(quadProg, "uTime"), time);
      gl.uniform1f(gl.getUniformLocation(quadProg, "uAspect"), aspect);
      bindAttrib(quadProg, "aPos", quadBuf, 2, 2, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };

  /* ---------- State + single render loop ---------- */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = "triangle";
  let playing = !reduced;
  let speed = Number(speedEl.value);
  let clock = 0;
  let last = 0;
  let frames = 0;
  let fpsAt = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (playing) clock += dt * speed;

    resize();
    scenes[current](clock, canvas.width / canvas.height);

    frames++;
    if (now - fpsAt > 500) {
      hudFps.textContent = Math.round((frames * 1000) / (now - fpsAt)) + " fps";
      frames = 0;
      fpsAt = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Controls ---------- */
  function select(name, focus) {
    current = name;
    hudScene.textContent = name;
    tabs.forEach((t) => {
      const on = t.dataset.scene === name;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => select(tab.dataset.scene, false));
  });

  document.querySelector(".controls").addEventListener("keydown", (e) => {
    const i = tabs.findIndex((t) => t.dataset.scene === current);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const d = e.key === "ArrowRight" ? 1 : -1;
      select(tabs[(i + d + tabs.length) % tabs.length].dataset.scene, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(tabs[0].dataset.scene, true);
    } else if (e.key === "End") {
      e.preventDefault();
      select(tabs[tabs.length - 1].dataset.scene, true);
    }
  });

  speedEl.addEventListener("input", () => {
    speed = Number(speedEl.value);
  });

  function setPlaying(next) {
    playing = next;
    toggleEl.textContent = playing ? "Pause" : "Play";
    toggleEl.setAttribute("aria-pressed", String(!playing));
  }
  toggleEl.addEventListener("click", () => setPlaying(!playing));
  setPlaying(playing);
})();
