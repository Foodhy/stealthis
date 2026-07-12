/* Image Dissolve Shader — vanilla WebGL displacement/dissolve between two textures.
   A fBm noise map drives a per-pixel dissolve threshold; an RGB-shift tears the edge.
   Falls back to a CSS crossfade if WebGL or texture decode fails. */
(function () {
  "use strict";

  var canvas = document.getElementById("gl");
  var card = document.getElementById("card");
  var fallbackEl = document.getElementById("fallback");
  var cssA = fallbackEl.querySelector(".css-a");
  var cssB = fallbackEl.querySelector(".css-b");
  var statusEl = document.getElementById("status");
  var captionText = document.getElementById("captionText");

  var progressEl = document.getElementById("progress");
  var edgeEl = document.getElementById("edge");
  var shiftEl = document.getElementById("shift");
  var scaleEl = document.getElementById("scale");
  var progressVal = document.getElementById("progressVal");
  var edgeVal = document.getElementById("edgeVal");
  var shiftVal = document.getElementById("shiftVal");
  var scaleVal = document.getElementById("scaleVal");
  var pairsEl = document.getElementById("pairs");
  var noiseToggle = document.getElementById("noiseToggle");
  var autoToggle = document.getElementById("autoToggle");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cross-origin Unsplash pairs (with a generated gradient backup per slot).
  var PAIRS = [
    {
      a: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1000&q=70",
      b: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=70",
      ca: ["#0ea5e9", "#22d3ee", "#0c4a6e"],
      cb: ["#f59e0b", "#fbbf24", "#7c2d12"],
    },
    {
      a: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=70",
      b: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=70",
      ca: ["#166534", "#22c55e", "#052e16"],
      cb: ["#1e3a8a", "#60a5fa", "#0f172a"],
    },
    {
      a: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=70",
      b: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=70",
      ca: ["#7c3aed", "#c026d3", "#1e1b4b"],
      cb: ["#b91c1c", "#f97316", "#450a0a"],
    },
  ];

  var state = {
    pair: 0,
    target: 0, // hover target progress
    progress: 0, // eased actual progress
    manual: false, // slider is driving
    auto: false,
    showNoise: false,
    edge: parseFloat(edgeEl.value),
    shift: parseFloat(shiftEl.value),
    scale: parseFloat(scaleEl.value),
  };

  function setStatus(msg, kind) {
    statusEl.className = "status" + (kind ? " " + kind : "");
    statusEl.innerHTML = msg;
  }

  /* ---------- generated backup texture (used before/if Unsplash fails) ---------- */
  function gradientCanvas(colors) {
    var c = document.createElement("canvas");
    c.width = 512;
    c.height = 320;
    var ctx = c.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, colors[0]);
    g.addColorStop(0.55, colors[1]);
    g.addColorStop(1, colors[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    // soft blobs for texture
    for (var i = 0; i < 5; i++) {
      var rg = ctx.createRadialGradient(
        Math.random() * c.width,
        Math.random() * c.height,
        10,
        Math.random() * c.width,
        Math.random() * c.height,
        200
      );
      rg.addColorStop(0, "rgba(255,255,255,0.16)");
      rg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, c.width, c.height);
    }
    return c;
  }

  /* ---------- WebGL setup ---------- */
  var gl = null;
  try {
    gl =
      canvas.getContext("webgl", { premultipliedAlpha: false, antialias: true }) ||
      canvas.getContext("experimental-webgl");
  } catch (e) {
    gl = null;
  }

  var VERT = [
    "attribute vec2 a_pos;",
    "varying vec2 v_uv;",
    "void main(){",
    "  v_uv = a_pos * 0.5 + 0.5;",
    "  gl_Position = vec4(a_pos, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "varying vec2 v_uv;",
    "uniform sampler2D u_texA;",
    "uniform sampler2D u_texB;",
    "uniform float u_progress;",
    "uniform float u_edge;",
    "uniform float u_shift;",
    "uniform float u_scale;",
    "uniform float u_time;",
    "uniform float u_aspect;",
    "uniform float u_showNoise;",
    // hash + value noise + fBm
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p);",
    "  vec2 u = f*f*(3.0-2.0*f);",
    "  float a = hash(i);",
    "  float b = hash(i+vec2(1.0,0.0));",
    "  float c = hash(i+vec2(0.0,1.0));",
    "  float d = hash(i+vec2(1.0,1.0));",
    "  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0; float amp = 0.5;",
    "  for(int i=0;i<5;i++){ v += amp*noise(p); p*=2.02; amp*=0.5; }",
    "  return v;",
    "}",
    "// cover-fit an image texture into the card aspect",
    "vec2 coverUV(vec2 uv){",
    "  vec2 c = uv - 0.5;",
    "  if(u_aspect > 1.0){ c.x /= 1.0; } // texture ~ square; light correction",
    "  return c + 0.5;",
    "}",
    "void main(){",
    "  vec2 uv = v_uv;",
    "  vec2 np = uv * u_scale;",
    "  np.x *= u_aspect;",
    "  float n = fbm(np + vec2(u_time*0.03, u_time*0.02));",
    "  n = clamp(n, 0.0, 1.0);",
    "  if(u_showNoise > 0.5){",
    "    vec3 col = mix(vec3(0.05,0.06,0.09), vec3(0.55,0.36,0.98), n);",
    "    // draw the current threshold line",
    "    float thr = mix(-u_edge, 1.0+u_edge, u_progress);",
    "    float band = smoothstep(u_edge, 0.0, abs(n - thr));",
    "    col = mix(col, vec3(0.13,0.83,0.93), band*0.9);",
    "    gl_FragColor = vec4(col, 1.0);",
    "    return;",
    "  }",
    "  // dissolve threshold sweeps as progress goes 0 -> 1",
    "  float thr = mix(-u_edge, 1.0 + u_edge, u_progress);",
    "  float m = smoothstep(thr - u_edge, thr + u_edge, n);",
    "  // m: 0 = image A, 1 = image B. Edge is where |m-0.5| small.",
    "  float edgeMask = 1.0 - abs(m - 0.5) * 2.0; // peaks at the transition",
    "  edgeMask = pow(clamp(edgeMask,0.0,1.0), 2.0);",
    "  float sh = u_shift * edgeMask;",
    "  vec2 dir = normalize(vec2(0.6, 0.4));",
    "  // sample both textures with a per-channel RGB offset near the edge",
    "  vec2 offR = dir * sh;",
    "  vec2 offB = -dir * sh;",
    "  vec4 a = vec4(",
    "    texture2D(u_texA, uv + offR).r,",
    "    texture2D(u_texA, uv).g,",
    "    texture2D(u_texA, uv + offB).b, 1.0);",
    "  vec4 b = vec4(",
    "    texture2D(u_texB, uv + offR).r,",
    "    texture2D(u_texB, uv).g,",
    "    texture2D(u_texB, uv + offB).b, 1.0);",
    "  vec3 color = mix(a.rgb, b.rgb, m);",
    "  // brighten the tearing edge with an accent fringe",
    "  color += vec3(0.35,0.18,0.55) * edgeMask * (u_shift*4.0);",
    "  gl_FragColor = vec4(color, 1.0);",
    "}",
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader compile failed");
    }
    return s;
  }

  var program, loc, texA, texB;

  function makeTexture(source) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  function updateTexture(t, source) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error("image failed"));
      };
      img.src = url;
    });
  }

  // Load a pair: show generated gradients instantly, upgrade to photos when ready.
  function loadPair(idx, initial) {
    var p = PAIRS[idx];
    var gA = gradientCanvas(p.ca);
    var gB = gradientCanvas(p.cb);
    if (gl) {
      updateTexture(texA, gA);
      updateTexture(texB, gB);
    }
    // CSS fallback backgrounds
    cssA.style.backgroundImage = "url('" + p.a + "'), " + cssGrad(p.ca);
    cssB.style.backgroundImage = "url('" + p.b + "'), " + cssGrad(p.cb);

    setStatus("Loading textures for <b>pair " + (idx + 1) + "</b>…", "");
    Promise.all([loadImage(p.a), loadImage(p.b)])
      .then(function (imgs) {
        if (state.pair !== idx) return; // pair changed while loading
        if (gl) {
          updateTexture(texA, imgs[0]);
          updateTexture(texB, imgs[1]);
          setStatus(
            "Renderer <b>WebGL</b> · textures loaded · " +
              imgs[0].naturalWidth +
              "×" +
              imgs[0].naturalHeight,
            "ok"
          );
        }
      })
      .catch(function () {
        if (gl) {
          setStatus(
            "Photos blocked (offline / CORS) — running on <b>generated textures</b>.",
            "warn"
          );
        }
      });
  }

  function cssGrad(c) {
    return "linear-gradient(135deg," + c[0] + "," + c[1] + " 55%," + c[2] + ")";
  }

  /* ---------- CSS-only fallback path ---------- */
  function activateFallback(reason) {
    canvas.style.display = "none";
    fallbackEl.classList.add("active");
    var p = PAIRS[state.pair];
    cssA.style.backgroundImage = "url('" + p.a + "'), " + cssGrad(p.ca);
    cssB.style.backgroundImage = "url('" + p.b + "'), " + cssGrad(p.cb);
    setStatus("WebGL unavailable (" + reason + ") — using <b>CSS crossfade</b> fallback.", "warn");
    // hover drives the crossfade
    function reveal(on) {
      fallbackEl.classList.toggle("reveal", on);
      captionText.textContent = on ? "Revealed (fallback)" : "Hover / focus to reveal";
    }
    card.addEventListener("mouseenter", function () {
      reveal(true);
    });
    card.addEventListener("mouseleave", function () {
      reveal(false);
    });
    card.addEventListener("focus", function () {
      reveal(true);
    });
    card.addEventListener("blur", function () {
      reveal(false);
    });
  }

  if (!gl) {
    initControlsForFallback();
    activateFallback("no context");
    return;
  }

  try {
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "link failed");
    }
    gl.useProgram(program);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    var aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    loc = {
      texA: gl.getUniformLocation(program, "u_texA"),
      texB: gl.getUniformLocation(program, "u_texB"),
      progress: gl.getUniformLocation(program, "u_progress"),
      edge: gl.getUniformLocation(program, "u_edge"),
      shift: gl.getUniformLocation(program, "u_shift"),
      scale: gl.getUniformLocation(program, "u_scale"),
      time: gl.getUniformLocation(program, "u_time"),
      aspect: gl.getUniformLocation(program, "u_aspect"),
      showNoise: gl.getUniformLocation(program, "u_showNoise"),
    };

    texA = makeTexture(gradientCanvas(PAIRS[0].ca));
    texB = makeTexture(gradientCanvas(PAIRS[0].cb));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.uniform1i(loc.texA, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texB);
    gl.uniform1i(loc.texB, 1);
  } catch (err) {
    initControlsForFallback();
    activateFallback("shader error");
    return;
  }

  /* ---------- sizing ---------- */
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var aspect = 1;
  function resize() {
    var w = canvas.clientWidth || card.clientWidth;
    var h = canvas.clientHeight || card.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(card);
  } else {
    window.addEventListener("resize", resize);
  }

  /* ---------- interaction ---------- */
  card.addEventListener("mouseenter", function () {
    if (!state.manual && !state.auto) state.target = 1;
  });
  card.addEventListener("mouseleave", function () {
    if (!state.manual && !state.auto) state.target = 0;
  });
  card.addEventListener("focus", function () {
    if (!state.manual && !state.auto) state.target = 1;
  });
  card.addEventListener("blur", function () {
    if (!state.manual && !state.auto) state.target = 0;
  });
  card.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (state.manual || state.auto) return;
      state.target = state.target > 0.5 ? 0 : 1;
    }
  });

  progressEl.addEventListener("input", function () {
    state.manual = true;
    state.auto = false;
    autoToggle.setAttribute("aria-pressed", "false");
    state.progress = state.target = parseFloat(progressEl.value);
    progressVal.textContent = state.progress.toFixed(2);
    captionText.textContent = "Manual scrub";
  });
  progressEl.addEventListener("change", function () {
    // hand control back to hover after a manual scrub
    state.manual = false;
    state.target = state.progress;
  });

  edgeEl.addEventListener("input", function () {
    state.edge = parseFloat(edgeEl.value);
    edgeVal.textContent = state.edge.toFixed(2);
  });
  shiftEl.addEventListener("input", function () {
    state.shift = parseFloat(shiftEl.value);
    shiftVal.textContent = state.shift.toFixed(2);
  });
  scaleEl.addEventListener("input", function () {
    state.scale = parseFloat(scaleEl.value);
    scaleVal.textContent = state.scale.toFixed(1);
  });

  pairsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".pair");
    if (!btn) return;
    var idx = parseInt(btn.getAttribute("data-pair"), 10);
    state.pair = idx;
    [].forEach.call(pairsEl.querySelectorAll(".pair"), function (b) {
      b.setAttribute("aria-checked", b === btn ? "true" : "false");
    });
    loadPair(idx, false);
  });

  noiseToggle.addEventListener("click", function () {
    state.showNoise = !state.showNoise;
    noiseToggle.setAttribute("aria-pressed", String(state.showNoise));
    noiseToggle.textContent = state.showNoise ? "Hide noise map" : "Show noise map";
  });

  autoToggle.addEventListener("click", function () {
    state.auto = !state.auto;
    autoToggle.setAttribute("aria-pressed", String(state.auto));
    autoToggle.textContent = state.auto ? "Stop auto loop" : "Auto loop";
    if (state.auto) {
      state.manual = false;
      captionText.textContent = "Auto loop";
    } else {
      state.target = 0;
      captionText.textContent = "Hover / focus to reveal";
    }
  });

  /* ---------- render loop ---------- */
  var start = performance.now();
  var autoT = 0;
  function frame(now) {
    var t = (now - start) / 1000;

    if (state.auto) {
      autoT += 0.006;
      // smooth ping-pong 0..1
      state.progress = 0.5 - 0.5 * Math.cos(autoT);
      state.target = state.progress;
      progressEl.value = state.progress;
      progressVal.textContent = state.progress.toFixed(2);
    } else if (!state.manual) {
      // eased spring toward hover target
      var ease = reduceMotion ? 0.5 : 0.08;
      state.progress += (state.target - state.progress) * ease;
      if (Math.abs(state.target - state.progress) < 0.001) state.progress = state.target;
      progressEl.value = state.progress;
      progressVal.textContent = state.progress.toFixed(2);
      if (state.target === 1 && state.progress > 0.02) captionText.textContent = "Dissolving →";
      else if (state.target === 0 && state.progress < 0.02)
        captionText.textContent = "Hover / focus to reveal";
    }

    gl.uniform1f(loc.progress, state.progress);
    gl.uniform1f(loc.edge, state.edge);
    gl.uniform1f(loc.shift, state.shift);
    gl.uniform1f(loc.scale, state.scale);
    gl.uniform1f(loc.time, t);
    gl.uniform1f(loc.aspect, aspect);
    gl.uniform1f(loc.showNoise, state.showNoise ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(frame);
  }

  function initControlsForFallback() {
    // wire read-only-ish controls so the CSS path still updates labels
    progressEl.addEventListener("input", function () {
      progressVal.textContent = parseFloat(progressEl.value).toFixed(2);
      fallbackEl.classList.toggle("reveal", parseFloat(progressEl.value) > 0.5);
    });
    edgeEl.addEventListener("input", function () {
      edgeVal.textContent = parseFloat(edgeEl.value).toFixed(2);
    });
    shiftEl.addEventListener("input", function () {
      shiftVal.textContent = parseFloat(shiftEl.value).toFixed(2);
    });
    scaleEl.addEventListener("input", function () {
      scaleVal.textContent = parseFloat(scaleEl.value).toFixed(1);
    });
    pairsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".pair");
      if (!btn) return;
      state.pair = parseInt(btn.getAttribute("data-pair"), 10);
      [].forEach.call(pairsEl.querySelectorAll(".pair"), function (b) {
        b.setAttribute("aria-checked", b === btn ? "true" : "false");
      });
      var p = PAIRS[state.pair];
      cssA.style.backgroundImage = "url('" + p.a + "'), " + cssGrad(p.ca);
      cssB.style.backgroundImage = "url('" + p.b + "'), " + cssGrad(p.cb);
    });
    noiseToggle.disabled = true;
    autoToggle.disabled = true;
  }

  // go
  resize();
  loadPair(0, true);
  requestAnimationFrame(frame);
})();
