/* Canvas Scramble Text
 * DPR-aware Canvas 2D headline that decodes out of random glyphs with an
 * RGB channel-split fringe and a rolling scanline glitch band.
 * Vanilla JS, zero dependencies.
 */
(function () {
  "use strict";

  var canvas = document.getElementById("scramble");
  var screen = document.getElementById("screen");
  var live = document.getElementById("live");
  var hint = document.getElementById("hint");
  var intensityEl = document.getElementById("intensity");
  var intensityVal = document.getElementById("intensity-val");
  var splitEl = document.getElementById("split");
  var nextBtn = document.getElementById("next");
  var metaPhrase = document.getElementById("meta-phrase");
  var metaFps = document.getElementById("meta-fps");

  if (!canvas || !canvas.getContext) {
    // Graceful fallback: no canvas support -> plain text.
    if (screen) screen.textContent = "Canvas Scramble Text";
    return;
  }

  var ctx = canvas.getContext("2d");
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PHRASES = [
    "STEAL THIS",
    "DECODE MODE",
    "GLITCH.EXE",
    "SHIP FAST",
  ];
  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}=+*^?#%@&";

  // ---- state ----
  var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  var cssW = 0;
  var cssH = 0;
  var phraseIndex = 0;
  var chars = []; // per-character resolve state
  var settled = false;
  var settleAt = 0; // timestamp when fully resolved (for auto-cycle)
  var lastFrame = 0;
  var fpsSmooth = 60;
  var scanline = 0; // 0..1 vertical position of glitch band
  var intensity = 0.55;
  var splitOn = true;

  function rand(pool) {
    return pool.charAt((Math.random() * pool.length) | 0);
  }

  // ---- sizing (DPR aware) ----
  function resize() {
    var rect = canvas.getBoundingClientRect();
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels, crisp on retina
  }

  // ---- (re)start a scramble for the current phrase ----
  function start() {
    var text = PHRASES[phraseIndex];
    chars = [];
    for (var i = 0; i < text.length; i++) {
      var target = text.charAt(i);
      chars.push({
        target: target,
        current: target === " " ? " " : rand(GLYPHS),
        // spaces resolve instantly; others get a staggered start + duration
        startDelay: target === " " ? 0 : Math.random() * 420,
        duration: 260 + Math.random() * 560,
        elapsed: 0,
        resolved: target === " ",
        flicker: 0,
      });
    }
    settled = false;
    if (screen) screen.classList.add("is-busy");
    if (metaPhrase) metaPhrase.textContent =
      "phrase " + (phraseIndex + 1) + " / " + PHRASES.length;
    if (live) live.textContent = "Decoding: " + text;
  }

  function nextPhrase() {
    phraseIndex = (phraseIndex + 1) % PHRASES.length;
    start();
  }

  // ---- per-frame simulation ----
  function update(dt) {
    if (settled) return;
    var allDone = true;
    var flickerRate = 0.4 + intensity * 0.55; // higher intensity = faster churn
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      if (c.resolved) continue;
      allDone = false;
      c.elapsed += dt;
      if (c.elapsed < c.startDelay) continue;
      var t = (c.elapsed - c.startDelay) / c.duration;
      if (t >= 1) {
        c.current = c.target;
        c.resolved = true;
      } else {
        // churn the glyph occasionally rather than every frame
        c.flicker += dt;
        var step = 34 + (1 - flickerRate) * 60;
        if (c.flicker >= step) {
          c.flicker = 0;
          c.current = rand(GLYPHS);
        }
      }
    }
    if (allDone && !settled) {
      settled = true;
      settleAt = performance.now();
      if (screen) screen.classList.remove("is-busy");
      if (live) live.textContent = "Resolved: " + PHRASES[phraseIndex];
    }
  }

  // ---- rendering ----
  function fontSize() {
    // fit the longest phrase to width
    var longest = 0;
    for (var i = 0; i < PHRASES.length; i++)
      longest = Math.max(longest, PHRASES[i].length);
    var byWidth = (cssW * 1.7) / longest;
    return Math.max(20, Math.min(64, byWidth));
  }

  function draw(now) {
    ctx.clearRect(0, 0, cssW, cssH);

    var fs = fontSize();
    ctx.font = "700 " + fs + "px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    var str = "";
    for (var i = 0; i < chars.length; i++) str += chars[i].current;

    var cx = cssW / 2;
    var cy = cssH / 2;

    // channel-split offset scales with intensity and eases out once settled
    var restAmp = settled ? Math.max(0, 1 - (now - settleAt) / 700) : 1;
    var amp = (1.5 + intensity * 7) * (0.35 + 0.65 * restAmp);

    if (splitOn && amp > 0.4) {
      var jx = (Math.random() - 0.5) * amp;
      var jy = (Math.random() - 0.5) * amp * 0.5;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(248, 113, 113, 0.9)"; // red channel
      ctx.fillText(str, cx - amp + jx, cy + jy);
      ctx.fillStyle = "rgba(34, 211, 238, 0.9)"; // cyan channel
      ctx.fillText(str, cx + amp - jx, cy - jy);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(233, 234, 240, 0.96)"; // white core
      ctx.fillText(str, cx, cy);
    } else {
      ctx.fillStyle = "#e9eaf0";
      ctx.fillText(str, cx, cy);
    }

    // rolling scanline glitch band
    if (!prefersReduced && intensity > 0.02) {
      var speed = 0.00035 + intensity * 0.0009;
      scanline = (scanline + speed * 16) % 1.4;
      var bandY = (scanline - 0.2) * cssH;
      var bandH = 6 + intensity * 22;
      var grad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
      grad.addColorStop(0, "rgba(139,92,246,0)");
      grad.addColorStop(0.5, "rgba(139,92,246," + (0.12 + intensity * 0.16) + ")");
      grad.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, bandY, cssW, bandH);

      // occasional horizontal tear slice on the text row
      if (Math.random() < intensity * 0.25) {
        var sliceH = 4 + Math.random() * 10;
        var sliceY = cy - fs / 2 + Math.random() * fs;
        var shift = (Math.random() - 0.5) * intensity * 26;
        try {
          var slice = ctx.getImageData(0, sliceY * dpr, canvas.width, sliceH * dpr);
          ctx.putImageData(slice, shift * dpr, sliceY * dpr);
        } catch (e) {
          /* getImageData can throw in rare tainted contexts — ignore */
        }
      }
    }

    // faint scan-grid texture
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;
    for (var y = 0; y < cssH; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(cssW, y + 0.5);
      ctx.stroke();
    }
  }

  // ---- main loop ----
  function loop(now) {
    var dt = lastFrame ? now - lastFrame : 16;
    lastFrame = now;
    if (dt > 0) {
      var fps = 1000 / dt;
      fpsSmooth += (fps - fpsSmooth) * 0.1;
      if (metaFps) metaFps.textContent = Math.round(fpsSmooth) + " fps";
    }

    update(dt);
    draw(now);

    // auto-cycle a couple seconds after settling
    if (settled && now - settleAt > 2200) {
      nextPhrase();
    }
    requestAnimationFrame(loop);
  }

  // ---- controls ----
  intensityEl.addEventListener("input", function () {
    intensity = intensityEl.value / 100;
    intensityVal.textContent = intensityEl.value + "%";
  });

  splitEl.addEventListener("change", function () {
    splitOn = splitEl.checked;
  });

  nextBtn.addEventListener("click", nextPhrase);

  function retrigger() {
    if (!settled) return; // don't interrupt an in-progress decode
    // re-scramble current phrase
    start();
  }
  screen.addEventListener("mouseenter", retrigger);
  screen.addEventListener("click", retrigger);

  // keyboard access on the canvas region
  screen.tabIndex = 0;
  screen.setAttribute("role", "button");
  screen.setAttribute("aria-label", "Re-trigger scramble effect");
  screen.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      retrigger();
    }
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // ---- init ----
  intensity = intensityEl.value / 100;
  intensityVal.textContent = intensityEl.value + "%";
  splitOn = splitEl.checked;
  resize();
  start();
  requestAnimationFrame(loop);
})();
