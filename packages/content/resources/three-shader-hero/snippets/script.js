// Shader-lit Hero — raw WebGL fragment shader, zero dependencies.
(function () {
  var canvas = document.getElementById("shader");
  var status = document.getElementById("status");
  var toggle = document.getElementById("toggle");
  var speedIn = document.getElementById("speed");
  var speedOut = document.getElementById("speedOut");
  var hueIn = document.getElementById("hue");
  var hueOut = document.getElementById("hueOut");

  var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    status.textContent = "WebGL unavailable — showing a static gradient fallback.";
    status.dataset.state = "error";
    canvas.style.background =
      "radial-gradient(120% 120% at 75% 25%, #2b6cb0 0%, #4c1d95 45%, #07080c 100%)";
    toggle.disabled = true;
    speedIn.disabled = true;
    hueIn.disabled = true;
    return;
  }

  var VERT = [
    "attribute vec2 aPos;",
    "void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }"
  ].join("\n");

  // Domain-warped fbm noise, colour rotated by a hue uniform.
  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform float uHue;",
    "",
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),",
    "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0, a = 0.5;",
    "  for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }",
    "  return v;",
    "}",
    "vec3 hsl2rgb(vec3 c){",
    "  vec3 k = mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0);",
    "  vec3 rgb = clamp(min(k, 4.0 - k), 0.0, 1.0);",
    "  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));",
    "}",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);",
    "  float t = uTime;",
    "  vec2 q = vec2(fbm(uv * 2.0 + t * 0.08), fbm(uv * 2.0 + vec2(5.2, 1.3) - t * 0.06));",
    "  vec2 r = vec2(fbm(uv * 2.4 + 3.5 * q + t * 0.05), fbm(uv * 2.4 + 3.5 * q + vec2(8.3, 2.8)));",
    "  float f = fbm(uv * 2.0 + 3.2 * r);",
    "  float hue = fract(uHue + f * 0.22 + r.x * 0.12);",
    "  float sat = 0.62 + 0.25 * r.y;",
    "  float lum = 0.10 + 0.55 * pow(f, 1.4);",
    "  vec3 col = hsl2rgb(vec3(hue, sat, lum));",
    "  col += pow(max(0.0, 1.0 - length(uv - vec2(0.55, 0.30))), 4.0) * 0.35;",
    "  col *= 1.0 - 0.35 * length(uv) * 0.6;",          // gentle vignette
    "  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.02;", // dither
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
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

  var program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "link failed");
    }
  } catch (err) {
    status.textContent = "Shader error: " + err.message;
    status.dataset.state = "error";
    return;
  }
  gl.useProgram(program);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(program, "uRes");
  var uTime = gl.getUniformLocation(program, "uTime");
  var uHue = gl.getUniformLocation(program, "uHue");

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var running = !reduce.matches;
  var speed = parseFloat(speedIn.value);
  var hue = parseFloat(hueIn.value) / 360;
  var shaderTime = 0;
  var last = 0;
  var raf = 0;

  function render(now) {
    var dt = last ? (now - last) / 1000 : 0;
    last = now;
    if (running) shaderTime += dt * speed;
    resize();
    gl.uniform1f(uTime, shaderTime);
    gl.uniform1f(uHue, hue);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(render);
  }

  function setRunning(next) {
    running = next;
    toggle.textContent = running ? "Pause" : "Play";
    toggle.setAttribute("aria-pressed", String(running));
    status.textContent = running ? "WebGL active" : "Animation paused";
  }

  toggle.addEventListener("click", function () { setRunning(!running); });

  speedIn.addEventListener("input", function () {
    speed = parseFloat(speedIn.value);
    speedOut.textContent = speed.toFixed(1) + "×";
  });

  hueIn.addEventListener("input", function () {
    hue = parseFloat(hueIn.value) / 360;
    hueOut.textContent = hueIn.value + "°";
  });

  reduce.addEventListener("change", function (e) { if (e.matches) setRunning(false); });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      last = 0;
      raf = requestAnimationFrame(render);
    }
  });

  setRunning(running);
  resize();
  raf = requestAnimationFrame(render);
})();
