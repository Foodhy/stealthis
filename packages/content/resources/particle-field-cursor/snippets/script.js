(function () {
  "use strict";

  var canvas = document.getElementById("field");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  // Graceful fallback if Canvas 2D is unavailable.
  if (!ctx) {
    if (canvas) {
      canvas.setAttribute("aria-hidden", "false");
      canvas.outerHTML =
        '<p style="position:absolute;inset:0;display:grid;place-items:center;color:#9a9cab">' +
        "Canvas 2D is not supported in this browser.</p>";
    }
    return;
  }

  // --- Controls -------------------------------------------------------------
  var countEl = document.getElementById("count");
  var countOut = document.getElementById("countOut");
  var distEl = document.getElementById("dist");
  var distOut = document.getElementById("distOut");
  var toggleBtn = document.getElementById("toggle");
  var fpsEl = document.getElementById("fps");
  var linkCountEl = document.getElementById("linkCount");
  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg__btn"));

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- State ----------------------------------------------------------------
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0; // CSS pixels
  var H = 0;
  var particles = [];
  var targetCount = parseInt(countEl.value, 10);
  var linkDist = parseInt(distEl.value, 10);
  var mode = "attract"; // 'attract' | 'repel'
  var running = !reduceMotion;

  var pointer = { x: -9999, y: -9999, active: false };
  var CURSOR_RADIUS = 150; // influence radius in CSS px
  var CURSOR_FORCE = 0.55;

  // Accent colors sampled from the design tokens.
  var PARTICLE_RGB = [186, 176, 255]; // soft violet-white
  var LINE_RGB = [139, 92, 246]; // --accent

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: rand(-0.35, 0.35),
      vy: rand(-0.35, 0.35),
      r: rand(0.8, 2.2),
    };
  }

  function syncCount() {
    while (particles.length < targetCount) particles.push(makeParticle());
    if (particles.length > targetCount) particles.length = targetCount;
  }

  // --- Sizing (DPR-aware) ---------------------------------------------------
  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  // --- Physics --------------------------------------------------------------
  function step() {
    var i, p;
    for (i = 0; i < particles.length; i++) {
      p = particles[i];

      // Cursor force
      if (pointer.active) {
        var dx = p.x - pointer.x;
        var dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        var R = CURSOR_RADIUS;
        if (d2 < R * R && d2 > 0.01) {
          var d = Math.sqrt(d2);
          var falloff = (1 - d / R) * CURSOR_FORCE;
          var nx = dx / d;
          var ny = dy / d;
          var sign = mode === "repel" ? 1 : -1;
          p.vx += nx * falloff * sign;
          p.vy += ny * falloff * sign;
        }
      }

      // Integrate + gentle damping so the field settles back to a drift.
      p.vx *= 0.96;
      p.vy *= 0.96;
      // Keep a minimum ambient drift alive.
      var speed = Math.hypot(p.vx, p.vy);
      if (speed < 0.12) {
        p.vx += rand(-0.06, 0.06);
        p.vy += rand(-0.06, 0.06);
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges.
      if (p.x < -5) p.x = W + 5;
      else if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      else if (p.y > H + 5) p.y = -5;
    }
  }

  // --- Rendering with a spatial grid for the connection pass -----------------
  var links = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    links = 0;

    var cell = linkDist;
    var cols = Math.max(1, Math.ceil(W / cell));
    var rows = Math.max(1, Math.ceil(H / cell));
    var grid = new Array(cols * rows);
    var i, p;

    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      var cx = Math.min(cols - 1, Math.max(0, (p.x / cell) | 0));
      var cy = Math.min(rows - 1, Math.max(0, (p.y / cell) | 0));
      var idx = cy * cols + cx;
      p._cx = cx;
      p._cy = cy;
      (grid[idx] || (grid[idx] = [])).push(p);
    }

    // Connection lines — only compare against neighbouring cells.
    var maxD2 = linkDist * linkDist;
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      for (var oy = -1; oy <= 1; oy++) {
        for (var ox = -1; ox <= 1; ox++) {
          var gx = p._cx + ox;
          var gy = p._cy + oy;
          if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;
          var bucket = grid[gy * cols + gx];
          if (!bucket) continue;
          for (var j = 0; j < bucket.length; j++) {
            var q = bucket[j];
            if (q === p) continue;
            // Avoid drawing each pair twice.
            if (q.x < p.x || (q.x === p.x && q.y <= p.y)) continue;
            var ddx = p.x - q.x;
            var ddy = p.y - q.y;
            var dd2 = ddx * ddx + ddy * ddy;
            if (dd2 > maxD2) continue;
            var alpha = (1 - Math.sqrt(dd2) / linkDist) * 0.55;
            ctx.strokeStyle =
              "rgba(" + LINE_RGB[0] + "," + LINE_RGB[1] + "," + LINE_RGB[2] + "," + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            links++;
          }
        }
      }
    }

    // Particles on top.
    var pr = PARTICLE_RGB;
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      var glow = 0;
      if (pointer.active) {
        var mdx = p.x - pointer.x;
        var mdy = p.y - pointer.y;
        var md2 = mdx * mdx + mdy * mdy;
        if (md2 < CURSOR_RADIUS * CURSOR_RADIUS) {
          glow = 1 - Math.sqrt(md2) / CURSOR_RADIUS;
        }
      }
      var rr = p.r + glow * 1.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
      ctx.fillStyle =
        "rgba(" + pr[0] + "," + pr[1] + "," + pr[2] + "," + (0.55 + glow * 0.45) + ")";
      ctx.fill();
    }

    // Cursor influence ring.
    if (pointer.active) {
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, CURSOR_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34,211,238,0.14)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // --- Loop with FPS metering ----------------------------------------------
  var lastFrame = performance.now();
  var fpsAcc = 0;
  var fpsFrames = 0;
  var lastFpsUpdate = lastFrame;
  var rafId = null;

  function frame(now) {
    var dt = now - lastFrame;
    lastFrame = now;

    if (running) step();
    draw();

    // FPS (smoothed, updated ~4x/sec).
    fpsAcc += dt;
    fpsFrames++;
    if (now - lastFpsUpdate > 250) {
      var fps = Math.round(1000 / (fpsAcc / fpsFrames));
      fpsEl.textContent = String(Math.max(0, Math.min(fps, 120)));
      linkCountEl.textContent = String(links);
      fpsAcc = 0;
      fpsFrames = 0;
      lastFpsUpdate = now;
    }

    rafId = requestAnimationFrame(frame);
  }

  // --- Pointer --------------------------------------------------------------
  function setPointer(e) {
    var rect = canvas.getBoundingClientRect();
    var pt = e.touches ? e.touches[0] : e;
    pointer.x = pt.clientX - rect.left;
    pointer.y = pt.clientY - rect.top;
    pointer.active = true;
  }
  canvas.addEventListener("mousemove", setPointer);
  canvas.addEventListener(
    "touchmove",
    function (e) {
      setPointer(e);
      e.preventDefault();
    },
    { passive: false }
  );
  canvas.addEventListener("mouseleave", function () {
    pointer.active = false;
    pointer.x = pointer.y = -9999;
  });
  canvas.addEventListener("touchend", function () {
    pointer.active = false;
  });

  // --- Control wiring --------------------------------------------------------
  countEl.addEventListener("input", function () {
    targetCount = parseInt(countEl.value, 10);
    countOut.textContent = String(targetCount);
    syncCount();
  });

  distEl.addEventListener("input", function () {
    linkDist = parseInt(distEl.value, 10);
    distOut.innerHTML = linkDist + '<span class="u">px</span>';
  });

  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      mode = btn.getAttribute("data-mode");
    });
  });

  toggleBtn.addEventListener("click", function () {
    running = !running;
    toggleBtn.textContent = running ? "Pause" : "Resume";
    toggleBtn.setAttribute("aria-pressed", String(!running));
  });

  // --- Boot -----------------------------------------------------------------
  resize();
  syncCount();

  if (reduceMotion) {
    // Respect reduced-motion: render a single static frame, let user resume.
    running = false;
    toggleBtn.textContent = "Resume";
    toggleBtn.setAttribute("aria-pressed", "true");
    draw();
  }

  rafId = requestAnimationFrame(frame);
})();
