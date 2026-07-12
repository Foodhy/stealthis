(function () {
  "use strict";

  var canvas = document.getElementById("blobs");
  var ctx = canvas.getContext("2d");
  var stage = document.querySelector(".stage");

  // ---- Palettes (each: background base + blob colors) ----
  var PALETTES = {
    aurora: { name: "Aurora", colors: ["#8b5cf6", "#22d3ee", "#34d399", "#6366f1"] },
    ember: { name: "Ember", colors: ["#f87171", "#fbbf24", "#fb7185", "#f97316"] },
    lagoon: { name: "Lagoon", colors: ["#22d3ee", "#0ea5e9", "#34d399", "#2dd4bf"] },
    neon: { name: "Neon", colors: ["#ec4899", "#8b5cf6", "#22d3ee", "#a3e635"] }
  };

  var state = {
    palette: "aurora",
    count: 6,
    speed: 1.0,
    goo: true,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  var blobs = [];
  var pointer = { x: -9999, y: -9999, active: false };
  var cursorBlob = null;
  var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  var W = 0;
  var H = 0;

  // ---- Sizing (HiDPI aware) ----
  function resize() {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // ---- Blob factory ----
  function makeBlob(colorIdx) {
    var minDim = Math.min(W, H);
    return {
      x: rand(0.1, 0.9) * W,
      y: rand(0.1, 0.9) * H,
      vx: rand(-0.4, 0.4),
      vy: rand(-0.4, 0.4),
      r: rand(minDim * 0.14, minDim * 0.26),
      colorIdx: colorIdx,
      phase: rand(0, Math.PI * 2),
      wobble: rand(0.6, 1.4)
    };
  }

  function buildBlobs() {
    blobs = [];
    var colors = PALETTES[state.palette].colors;
    for (var i = 0; i < state.count; i++) {
      blobs.push(makeBlob(i % colors.length));
    }
    // Dedicated pointer-follow blob (last, brightest color)
    cursorBlob = makeBlob(0);
    cursorBlob.r = Math.min(W, H) * 0.16;
    cursorBlob.isCursor = true;
  }

  // ---- Draw a single blob as a radial gradient ----
  function drawBlob(b, colors) {
    var base = colors[b.colorIdx % colors.length];
    var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, base);
    g.addColorStop(0.55, base);
    g.addColorStop(1, hexToRgba(base, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function hexToRgba(hex, a) {
    var h = hex.replace("#", "");
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var bl = parseInt(h.substring(4, 6), 16);
    return "rgba(" + r + "," + g + "," + bl + "," + a + ")";
  }

  // ---- Animation loop ----
  var t = 0;
  var lastFrame = performance.now();
  var fpsEl = document.getElementById("fps");
  var fpsAcc = 0;
  var fpsCount = 0;

  function tick(now) {
    var dt = Math.min(now - lastFrame, 50);
    lastFrame = now;
    t += dt * 0.001;

    // fps meter
    fpsAcc += 1000 / (dt || 16);
    fpsCount++;
    if (fpsCount >= 20) {
      fpsEl.textContent = Math.round(fpsAcc / fpsCount) + " fps";
      fpsAcc = 0;
      fpsCount = 0;
    }

    ctx.clearRect(0, 0, W, H);

    var colors = PALETTES[state.palette].colors;
    var move = state.reduced ? 0 : state.speed;
    var minDim = Math.min(W, H);

    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      // Drift with a gentle sinusoidal wobble
      b.x += (b.vx * move) + Math.sin(t * b.wobble + b.phase) * 0.25 * move;
      b.y += (b.vy * move) + Math.cos(t * b.wobble + b.phase) * 0.25 * move;

      // Bounce off edges with a soft margin
      var m = b.r * 0.4;
      if (b.x < -m) { b.x = -m; b.vx = Math.abs(b.vx); }
      if (b.x > W + m) { b.x = W + m; b.vx = -Math.abs(b.vx); }
      if (b.y < -m) { b.y = -m; b.vy = Math.abs(b.vy); }
      if (b.y > H + m) { b.y = H + m; b.vy = -Math.abs(b.vy); }

      drawBlob(b, colors);
    }

    // Cursor blob eases toward the pointer
    if (cursorBlob) {
      var tx = pointer.active ? pointer.x : W * 0.5 + Math.sin(t * 0.3) * W * 0.25;
      var ty = pointer.active ? pointer.y : H * 0.5 + Math.cos(t * 0.4) * H * 0.2;
      cursorBlob.x += (tx - cursorBlob.x) * 0.08;
      cursorBlob.y += (ty - cursorBlob.y) * 0.08;
      cursorBlob.r = minDim * (pointer.active ? 0.19 : 0.15);
      drawBlob(cursorBlob, colors);
    }

    raf = requestAnimationFrame(tick);
  }

  var raf = null;
  function start() {
    if (raf) cancelAnimationFrame(raf);
    lastFrame = performance.now();
    raf = requestAnimationFrame(tick);
  }

  // ---- Pointer interaction ----
  function toLocal(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  stage.addEventListener("pointermove", function (e) {
    var p = toLocal(e.clientX, e.clientY);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = true;
  });

  stage.addEventListener("pointerleave", function () {
    pointer.active = false;
  });

  // ---- Controls wiring ----
  // Palette swatches
  var palettesEl = document.getElementById("palettes");
  Object.keys(PALETTES).forEach(function (key) {
    var p = PALETTES[key];
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-label", p.name);
    btn.setAttribute("aria-checked", key === state.palette ? "true" : "false");
    btn.dataset.key = key;

    var fill = document.createElement("span");
    fill.className = "swatch-fill";
    fill.style.background =
      "linear-gradient(135deg," + p.colors[0] + "," + p.colors[1] + "," + p.colors[2] + ")";
    btn.appendChild(fill);

    btn.addEventListener("click", function () {
      state.palette = key;
      // Recolor existing blobs without rebuilding positions
      var colors = p.colors;
      blobs.forEach(function (b, i) {
        b.colorIdx = i % colors.length;
      });
      Array.prototype.forEach.call(palettesEl.children, function (c) {
        c.setAttribute("aria-checked", c.dataset.key === key ? "true" : "false");
      });
    });
    palettesEl.appendChild(btn);
  });

  // Count
  var countInput = document.getElementById("count");
  var countVal = document.getElementById("countVal");
  countInput.addEventListener("input", function () {
    state.count = parseInt(countInput.value, 10);
    countVal.textContent = state.count;
    var colors = PALETTES[state.palette].colors;
    // Add or trim blobs to match, preserving existing ones
    while (blobs.length < state.count) blobs.push(makeBlob(blobs.length % colors.length));
    while (blobs.length > state.count) blobs.pop();
  });

  // Speed
  var speedInput = document.getElementById("speed");
  var speedVal = document.getElementById("speedVal");
  speedInput.addEventListener("input", function () {
    state.speed = parseInt(speedInput.value, 10) / 100;
    speedVal.textContent = state.speed.toFixed(1) + "x";
  });

  // Gooey toggle
  var gooToggle = document.getElementById("gooToggle");
  gooToggle.addEventListener("click", function () {
    state.goo = !state.goo;
    gooToggle.setAttribute("aria-checked", state.goo ? "true" : "false");
    stage.classList.toggle("no-goo", !state.goo);
  });

  // Shuffle motion
  document.getElementById("shuffle").addEventListener("click", function () {
    blobs.forEach(function (b) {
      b.vx = rand(-0.4, 0.4);
      b.vy = rand(-0.4, 0.4);
      b.phase = rand(0, Math.PI * 2);
      b.wobble = rand(0.6, 1.4);
    });
  });

  // ---- Init ----
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      // keep blobs in bounds after resize
      blobs.forEach(function (b) {
        b.x = Math.max(0, Math.min(W, b.x));
        b.y = Math.max(0, Math.min(H, b.y));
      });
    }, 120);
  });

  resize();
  buildBlobs();
  start();
})();
