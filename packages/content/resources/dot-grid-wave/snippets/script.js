/* Dot Grid Ripple — DPR-aware canvas wave that reacts to pointer + click ripples. */
(function () {
  "use strict";

  var canvas = document.getElementById("grid");
  var ctx = canvas.getContext("2d");

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = reduceQuery.matches;

  // ---- state / config -----------------------------------------------------
  var config = {
    spacing: 30,      // css px between dots
    speed: 1,         // idle wave speed multiplier
    radius: 150,      // cursor influence radius (css px)
    color: "mono",    // mono | dual | spectrum
    idle: true
  };

  var dpr = 1;
  var W = 0;          // css pixel width
  var H = 0;          // css pixel height
  var dots = [];      // {x, y, s} where s is eased scale 0..1
  var ripples = [];   // {x, y, t0, life}
  var pointer = { x: -9999, y: -9999, active: false };

  var lastFrame = performance.now();
  var fpsAccum = 0, fpsFrames = 0, fps = 0;

  var statDots = document.getElementById("stat-dots");
  var statFps = document.getElementById("stat-fps");
  var reducedNote = document.getElementById("reduced-note");

  // ---- grid build ----------------------------------------------------------
  function buildGrid() {
    dots.length = 0;
    var gap = config.spacing;
    // center the lattice with a symmetric margin
    var cols = Math.max(1, Math.floor((W - gap) / gap));
    var rows = Math.max(1, Math.floor((H - gap) / gap));
    var offX = (W - cols * gap) / 2 + gap / 2;
    var offY = (H - rows * gap) / 2 + gap / 2;
    for (var r = 0; r <= rows; r++) {
      for (var c = 0; c <= cols; c++) {
        dots.push({ x: offX + c * gap, y: offY + r * gap, s: 0 });
      }
    }
    if (statDots) statDots.textContent = dots.length.toLocaleString();
  }

  // ---- resize (DPR aware) --------------------------------------------------
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
  }

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  // ---- interaction ---------------------------------------------------------
  function relPos(evt) {
    var rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  canvas.addEventListener("pointermove", function (e) {
    var p = relPos(e);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = true;
  });

  canvas.addEventListener("pointerleave", function () {
    pointer.active = false;
    pointer.x = -9999;
    pointer.y = -9999;
  });

  function addRipple(x, y) {
    var maxDim = Math.hypot(W, H);
    ripples.push({ x: x, y: y, t0: performance.now(), life: 1100, reach: maxDim });
    if (ripples.length > 24) ripples.shift();
  }

  canvas.addEventListener("pointerdown", function (e) {
    var p = relPos(e);
    addRipple(p.x, p.y);
  });

  // occasional automatic ripples so the surface never feels dead (unless reduced)
  var autoTimer = 0;

  // ---- color helpers -------------------------------------------------------
  function dotColor(intensity, phase) {
    // intensity 0..1 -> brightness; phase used by spectrum/dual
    var a = 0.12 + intensity * 0.88;
    if (config.color === "mono") {
      // violet -> light
      var l = 55 + intensity * 40;
      return "hsla(258, 85%, " + l + "%, " + a + ")";
    }
    if (config.color === "dual") {
      // blend violet(258) and cyan(188) by phase
      var hue = 188 + (258 - 188) * (0.5 + 0.5 * Math.sin(phase));
      return "hsla(" + hue.toFixed(0) + ", 85%, " + (58 + intensity * 32) + "%, " + a + ")";
    }
    // spectrum: hue rotates with phase + intensity
    var h = ((phase * 40) + intensity * 60) % 360;
    return "hsla(" + h.toFixed(0) + ", 90%, " + (58 + intensity * 30) + "%, " + a + ")";
  }

  // ---- main loop -----------------------------------------------------------
  function frame(now) {
    var dt = Math.min(now - lastFrame, 50);
    lastFrame = now;

    // fps meter (smoothed)
    fpsAccum += dt;
    fpsFrames++;
    if (fpsAccum >= 500) {
      fps = Math.round((fpsFrames * 1000) / fpsAccum);
      if (statFps) statFps.textContent = fps;
      fpsAccum = 0;
      fpsFrames = 0;
    }

    // auto ripple scheduling
    if (!reduced) {
      autoTimer += dt;
      if (autoTimer > 2600) {
        autoTimer = 0;
        addRipple(Math.random() * W, Math.random() * H);
      }
    }

    ctx.clearRect(0, 0, W, H);

    var time = now * 0.001 * config.speed;
    var baseR = config.radius;
    var idleAmp = (config.idle && !reduced) ? 1 : 0;

    // prune dead ripples
    for (var i = ripples.length - 1; i >= 0; i--) {
      if (now - ripples[i].t0 > ripples[i].life) ripples.splice(i, 1);
    }

    var maxR = 3.4; // px base dot radius
    var ease = 1 - Math.pow(0.001, dt / 1000); // frame-rate independent easing

    for (var d = 0; d < dots.length; d++) {
      var dot = dots[d];
      var target = 0.14; // baseline scale

      // continuous idle wave (diagonal traveling sine)
      if (idleAmp) {
        var wave = Math.sin((dot.x + dot.y) * 0.012 - time * 1.6);
        target += (0.5 + 0.5 * wave) * 0.28;
      }

      // pointer halo
      if (pointer.active) {
        var pdx = dot.x - pointer.x;
        var pdy = dot.y - pointer.y;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pd < baseR) {
          var pf = 1 - pd / baseR;
          target += pf * pf * 0.9;
        }
      }

      // click ripples (expanding rings)
      for (var ri = 0; ri < ripples.length; ri++) {
        var rp = ripples[ri];
        var age = (now - rp.t0) / rp.life; // 0..1
        var ringR = age * rp.reach * 0.62;
        var rdx = dot.x - rp.x;
        var rdy = dot.y - rp.y;
        var rd = Math.sqrt(rdx * rdx + rdy * rdy);
        var band = 46; // ring thickness in px
        var diff = Math.abs(rd - ringR);
        if (diff < band) {
          var rf = (1 - diff / band) * (1 - age);
          target += rf * rf * 1.15;
        }
      }

      if (target > 1.35) target = 1.35;

      // ease current scale toward target
      dot.s += (target - dot.s) * ease;

      var intensity = Math.min(1, dot.s);
      var radius = maxR * (0.55 + intensity * 1.15);
      var phase = (dot.x + dot.y) * 0.01 + time;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = dotColor(intensity, phase);
      ctx.fill();

      // glow for hot dots
      if (intensity > 0.72) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius * 2.1, 0, Math.PI * 2);
        ctx.fillStyle = dotColor(intensity, phase).replace(/[\d.]+\)$/, (0.08 * intensity).toFixed(3) + ")");
        ctx.fill();
      }
    }

    requestAnimationFrame(frame);
  }

  // ---- controls wiring -----------------------------------------------------
  function bindRange(id, outId, fmt, key, rebuild) {
    var input = document.getElementById(id);
    var out = document.getElementById(outId);
    function apply() {
      var v = parseFloat(input.value);
      config[key] = v;
      out.textContent = fmt(v);
      if (rebuild) buildGrid();
    }
    input.addEventListener("input", apply);
    apply();
  }

  bindRange("spacing", "spacing-out", function (v) { return v + "px"; }, "spacing", true);
  bindRange("speed", "speed-out", function (v) { return v.toFixed(1) + "×"; }, "speed", false);
  bindRange("radius", "radius-out", function (v) { return v + "px"; }, "radius", false);

  var segBtns = document.querySelectorAll(".seg-btn");
  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      config.color = btn.getAttribute("data-color");
    });
  });

  var idleBtn = document.getElementById("idle");
  idleBtn.addEventListener("click", function () {
    config.idle = !config.idle;
    idleBtn.classList.toggle("is-on", config.idle);
    idleBtn.setAttribute("aria-checked", config.idle ? "true" : "false");
  });

  document.getElementById("burst").addEventListener("click", function () {
    // fire a small cluster of ripples from the center
    var cx = W / 2, cy = H / 2;
    addRipple(cx, cy);
    setTimeout(function () { addRipple(cx, cy); }, 140);
    setTimeout(function () { addRipple(cx, cy); }, 300);
  });

  // reduced motion handling
  function syncReduced() {
    reduced = reduceQuery.matches;
    if (reducedNote) reducedNote.hidden = !reduced;
    if (reduced) {
      config.idle = false;
      idleBtn.classList.remove("is-on");
      idleBtn.setAttribute("aria-checked", "false");
    }
  }
  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener("change", syncReduced);
  } else if (reduceQuery.addListener) {
    reduceQuery.addListener(syncReduced);
  }
  syncReduced();

  // ---- boot ----------------------------------------------------------------
  resize();
  requestAnimationFrame(frame);
})();
