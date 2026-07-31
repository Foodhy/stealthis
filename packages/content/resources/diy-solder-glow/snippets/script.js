/* Fenwick & Sale — Solder Bench 03
   Canvas soldering-iron cursor effect: sparks, heat glow, cooling solder blobs. */
(function () {
  "use strict";

  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");
  var iron = document.getElementById("iron");
  var stageWrap = canvas.parentElement;
  var badge = document.getElementById("stageBadge");

  var densityEl = document.getElementById("density");
  var tempEl = document.getElementById("temp");
  var gravityEl = document.getElementById("gravity");
  var trailEl = document.getElementById("trailToggle");
  var clearBtn = document.getElementById("clearBtn");

  var densityVal = document.getElementById("densityVal");
  var tempVal = document.getElementById("tempVal");
  var gravityVal = document.getElementById("gravityVal");
  var pCountEl = document.getElementById("pCount");
  var bCountEl = document.getElementById("bCount");
  var fpsEl = document.getElementById("fps");
  var jointCountEl = document.getElementById("jointCount");
  var progressFill = document.getElementById("progressFill");
  var jointListEl = document.getElementById("jointList");
  var toastWrap = document.getElementById("toastWrap");

  var W = canvas.width, H = canvas.height;
  var MAX_PARTICLES = 900;
  var MAX_BLOBS = 90;
  var HOLD_MS = 900; // hold time to complete a joint

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- joints ---------- */
  var JOINTS = [
    { id: "J1", ref: "R14", name: "1k5 pull-up resistor", x: 170, y: 150, legDir: "up" },
    { id: "J2", ref: "C09", name: "100nF decoupling cap", x: 380, y: 118, legDir: "up" },
    { id: "J3", ref: "D03", name: "1N4148 signal diode", x: 610, y: 165, legDir: "right" },
    { id: "J4", ref: "Q02", name: "BC547 transistor base", x: 250, y: 380, legDir: "down" },
    { id: "J5", ref: "U01", name: "DIP-8 op-amp pin 3", x: 505, y: 415, legDir: "down" },
    { id: "J6", ref: "K07", name: "Screw terminal live", x: 735, y: 350, legDir: "right" }
  ];
  JOINTS.forEach(function (j) { j.done = false; j.charge = 0; });

  /* ---------- state ---------- */
  var particles = [];
  var blobs = [];
  var tip = { x: W * 0.5, y: H * 0.55 };
  var pointerInside = false;
  var hot = false;
  var keyboardMode = false;
  var completed = 0;
  var celebrated = false;

  /* ---------- helpers ---------- */
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  function heatMix() { return Number(tempEl.value) / 100; } // 0 cool silver → 1 hot orange

  // Blend cool silver → hot orange based on the temperature slider.
  function heatColor(t, lightness, alpha) {
    var m = heatMix();
    var h = 24 * m + 205 * (1 - m);       // 205 (steel blue) → 24 (orange)
    var s = 95 * m + 18 * (1 - m);
    var l = lightness;
    return "hsla(" + h.toFixed(0) + "," + s.toFixed(0) + "%," + l.toFixed(0) + "%," + alpha + ")";
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- board rendering (static layer, cached) ---------- */
  var board = document.createElement("canvas");
  board.width = W; board.height = H;
  drawBoard(board.getContext("2d"));

  function drawBoard(c) {
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#123024");
    g.addColorStop(0.5, "#0d2419");
    g.addColorStop(1, "#081711");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    // solder-mask speckle
    c.globalAlpha = 0.05;
    for (var i = 0; i < 700; i++) {
      c.fillStyle = i % 3 === 0 ? "#8fffcf" : "#000";
      c.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    c.globalAlpha = 1;

    // copper traces
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = "rgba(196,142,62,0.55)";
    c.lineWidth = 5;
    var traces = [
      [[60, 470], [60, 150], [170, 150], [300, 150], [300, 90], [380, 90], [380, 118]],
      [[170, 150], [170, 250], [250, 250], [250, 380]],
      [[610, 165], [700, 165], [700, 260], [820, 260]],
      [[505, 415], [505, 490], [300, 490], [300, 470], [60, 470]],
      [[735, 350], [640, 350], [640, 415], [505, 415]],
      [[380, 118], [470, 118], [470, 210], [610, 210], [610, 165]],
      [[820, 90], [820, 200], [860, 200]]
    ];
    traces.forEach(function (pts) {
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (var k = 1; k < pts.length; k++) c.lineTo(pts[k][0], pts[k][1]);
      c.stroke();
    });

    // via holes
    c.fillStyle = "rgba(196,142,62,0.5)";
    for (var v = 0; v < 26; v++) {
      var vx = 40 + Math.random() * (W - 80), vy = 40 + Math.random() * (H - 80);
      c.beginPath(); c.arc(vx, vy, 3.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = "rgba(8,23,17,0.9)";
      c.beginPath(); c.arc(vx, vy, 1.4, 0, Math.PI * 2); c.fill();
      c.fillStyle = "rgba(196,142,62,0.5)";
    }

    // silkscreen component outlines
    c.strokeStyle = "rgba(226,240,232,0.42)";
    c.lineWidth = 1.6;
    c.font = "600 11px 'JetBrains Mono', monospace";
    c.fillStyle = "rgba(226,240,232,0.55)";
    JOINTS.forEach(function (j) {
      var bx = j.x, by = j.y;
      var ox = j.legDir === "right" ? 62 : 0;
      var oy = j.legDir === "up" ? -62 : j.legDir === "down" ? 62 : 0;
      c.strokeRect(bx + ox - 22, by + oy - 12, 44, 24);
      c.beginPath();
      c.moveTo(bx, by);
      c.lineTo(bx + ox * 0.55, by + oy * 0.55);
      c.strokeStyle = "rgba(190,198,205,0.75)";
      c.lineWidth = 3;
      c.stroke();
      c.strokeStyle = "rgba(226,240,232,0.42)";
      c.lineWidth = 1.6;
      c.fillText(j.ref, bx + ox - 20, by + oy + 26);
    });
  }

  function drawPads(c) {
    JOINTS.forEach(function (j) {
      // annular ring
      c.beginPath();
      c.arc(j.x, j.y, 15, 0, Math.PI * 2);
      c.fillStyle = j.done ? "rgba(178,190,200,0.95)" : "rgba(150,110,50,0.9)";
      c.fill();
      c.strokeStyle = j.done ? "rgba(230,240,245,0.9)" : "rgba(226,240,232,0.35)";
      c.lineWidth = 2;
      c.stroke();

      if (j.done) {
        // solder fillet: cone of cooled tin
        var fg = c.createRadialGradient(j.x - 4, j.y - 5, 1, j.x, j.y, 16);
        fg.addColorStop(0, "#f2f6f8");
        fg.addColorStop(0.5, "#b9c4cc");
        fg.addColorStop(1, "#7d8891");
        c.beginPath();
        c.moveTo(j.x - 16, j.y + 9);
        c.quadraticCurveTo(j.x, j.y - 17, j.x + 16, j.y + 9);
        c.closePath();
        c.fillStyle = fg;
        c.fill();
      } else {
        // hole
        c.beginPath();
        c.arc(j.x, j.y, 5, 0, Math.PI * 2);
        c.fillStyle = "#08170f";
        c.fill();
        // charge ring
        if (j.charge > 0.01) {
          c.beginPath();
          c.arc(j.x, j.y, 19, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, j.charge));
          c.strokeStyle = heatColor(1, 62, 0.95);
          c.lineWidth = 4;
          c.lineCap = "round";
          c.stroke();
        }
      }
    });
  }

  /* ---------- particles & blobs ---------- */
  function emit(n) {
    for (var i = 0; i < n && particles.length < MAX_PARTICLES; i++) {
      var a = rand(-Math.PI, 0) + rand(-0.4, 0.4);
      var sp = rand(40, 320);
      particles.push({
        x: tip.x + rand(-3, 3),
        y: tip.y + rand(-3, 3),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(0.35, 1.15),
        age: 0,
        r: rand(0.8, 2.4)
      });
    }
  }

  function addBlob(x, y) {
    if (blobs.length >= MAX_BLOBS) blobs.shift();
    blobs.push({ x: x + rand(-4, 4), y: y + rand(-4, 4), r: rand(3, 7), age: 0, life: rand(1.6, 2.6) });
  }

  /* ---------- loop ---------- */
  var last = performance.now();
  var fpsAcc = 0, fpsFrames = 0, blobTimer = 0;

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // fps readout
    fpsAcc += dt; fpsFrames++;
    if (fpsAcc >= 0.5) {
      fpsEl.textContent = Math.round(fpsFrames / fpsAcc);
      fpsAcc = 0; fpsFrames = 0;
    }

    var trails = trailEl.getAttribute("aria-checked") === "true" && !reduceMotion;

    if (trails) {
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(board, 0, 0);
      // re-draw faded previous frame is expensive; instead we fade particle alpha
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(board, 0, 0);
    }

    drawPads(ctx);

    // --- cooling solder blobs ---
    ctx.globalCompositeOperation = "source-over";
    for (var b = blobs.length - 1; b >= 0; b--) {
      var bl = blobs[b];
      bl.age += dt;
      var k = bl.age / bl.life;
      if (k >= 1) { blobs.splice(b, 1); continue; }
      // bright yellow → dull grey
      var hue = 48 - 8 * k;
      var sat = 100 * (1 - k);
      var lig = 78 - 34 * k;
      ctx.beginPath();
      ctx.arc(bl.x, bl.y, bl.r * (1 - 0.15 * k), 0, Math.PI * 2);
      ctx.fillStyle = "hsla(" + hue + "," + sat.toFixed(0) + "%," + lig.toFixed(0) + "%,0.95)";
      ctx.fill();
      if (k < 0.5) {
        ctx.beginPath();
        ctx.arc(bl.x, bl.y, bl.r * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(42,100%,60%," + (0.18 * (1 - k * 2)).toFixed(3) + ")";
        ctx.fill();
      }
    }

    // --- heat glow at tip ---
    if (pointerInside || keyboardMode) {
      var gr = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, hot ? 92 : 46);
      gr.addColorStop(0, heatColor(1, 72, hot ? 0.5 : 0.24));
      gr.addColorStop(0.45, heatColor(1, 55, hot ? 0.2 : 0.09));
      gr.addColorStop(1, heatColor(1, 45, 0));
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, hot ? 92 : 46, 0, Math.PI * 2);
      ctx.fillStyle = gr;
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    // --- particles ---
    if (!reduceMotion) {
      if (hot) {
        emit(Math.round(Number(densityEl.value) * dt * 60));
        blobTimer += dt;
        if (blobTimer > 0.09) { blobTimer = 0; addBlob(tip.x, tip.y); }
      }
      var g = Number(gravityEl.value) / 100 * 900;
      ctx.globalCompositeOperation = "lighter";
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.age += dt;
        if (p.age >= p.life) { particles.splice(i, 1); continue; }
        p.vy += g * dt;
        p.vx *= 0.995;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y > H - 2 && p.vy > 0) { p.y = H - 2; p.vy *= -0.32; p.vx *= 0.6; }
        var t = 1 - p.age / p.life;
        var alpha = (trails ? t * t : t) * 0.95;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.4 + t * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = t > 0.75
          ? "rgba(255,252,240," + alpha.toFixed(3) + ")"
          : heatColor(t, 50 + t * 30, alpha.toFixed(3));
        ctx.fill();
        if (trails) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * dt * 3, p.y - p.vy * dt * 3);
          ctx.strokeStyle = heatColor(t, 60, (alpha * 0.5).toFixed(3));
          ctx.lineWidth = p.r * 0.7;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    } else if (pointerInside || keyboardMode) {
      // static glow fallback already drawn above
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, hot ? 12 : 6, 0, Math.PI * 2);
      ctx.fillStyle = heatColor(1, 78, 0.9);
      ctx.fill();
    }

    // --- joint charging ---
    if (hot) {
      JOINTS.forEach(function (j) {
        if (j.done) return;
        var d = Math.hypot(j.x - tip.x, j.y - tip.y);
        if (d < 26) {
          j.charge += (dt * 1000) / HOLD_MS;
          if (j.charge >= 1) completeJoint(j);
        } else {
          j.charge = Math.max(0, j.charge - dt * 0.9);
        }
      });
    } else {
      JOINTS.forEach(function (j) { if (!j.done) j.charge = Math.max(0, j.charge - dt * 1.2); });
    }

    pCountEl.textContent = particles.length;
    bCountEl.textContent = blobs.length;

    requestAnimationFrame(frame);
  }

  function completeJoint(j) {
    j.done = true;
    j.charge = 1;
    completed++;
    for (var i = 0; i < 10; i++) addBlob(j.x, j.y);
    if (!reduceMotion) emit(60);
    renderJoints();
    jointCountEl.textContent = completed;
    var pct = (completed / JOINTS.length) * 100;
    progressFill.style.width = pct + "%";
    progressFill.classList.toggle("full", completed === JOINTS.length);
    badge.textContent = "JOINT " + j.id + " OK";
    badge.className = "stage-badge mono done";
    if (completed === JOINTS.length && !celebrated) {
      celebrated = true;
      toast("All 6 of 6 joints soldered — board ready for continuity test.", "ok");
    } else {
      toast(j.ref + " " + j.name + " — joint set.", "ok");
    }
  }

  /* ---------- joint list UI ---------- */
  function renderJoints() {
    jointListEl.innerHTML = "";
    JOINTS.forEach(function (j) {
      var row = document.createElement("div");
      row.className = "joint-row" + (j.done ? " done" : "");
      row.innerHTML =
        '<span class="joint-id">' + j.id + " · " + j.ref + "</span>" +
        '<span class="joint-name">' + j.name + "</span>" +
        '<span class="joint-badge">' + (j.done ? "SET" : "OPEN") + "</span>";
      jointListEl.appendChild(row);
    });
  }

  /* ---------- pointer ---------- */
  function toLocal(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (W / r.width),
      y: (e.clientY - r.top) * (H / r.height)
    };
  }

  function moveIron() {
    var r = canvas.getBoundingClientRect();
    var sx = r.width / W;
    iron.style.transform = "translate(" + (tip.x * sx - 14) + "px," + (tip.y * (r.height / H) - 92) + "px)";
  }

  function setHot(v) {
    hot = v;
    iron.classList.toggle("hot", v);
    if (v) {
      badge.textContent = "IRON DOWN · " + Math.round(280 + heatMix() * 120) + " °C";
      badge.className = "stage-badge mono hot";
    } else if (completed < JOINTS.length) {
      badge.textContent = "READY";
      badge.className = "stage-badge mono";
    }
  }

  stageWrap.addEventListener("pointerenter", function () {
    pointerInside = true;
    iron.classList.add("on");
  });

  stageWrap.addEventListener("pointerleave", function () {
    pointerInside = false;
    iron.classList.remove("on");
    setHot(false);
  });

  stageWrap.addEventListener("pointermove", function (e) {
    var p = toLocal(e);
    tip.x = Math.max(0, Math.min(W, p.x));
    tip.y = Math.max(0, Math.min(H, p.y));
    keyboardMode = false;
    pointerInside = true;
    iron.classList.add("on");
    moveIron();
  });

  stageWrap.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    var p = toLocal(e);
    tip.x = p.x; tip.y = p.y;
    pointerInside = true;
    iron.classList.add("on");
    moveIron();
    setHot(true);
    if (stageWrap.setPointerCapture && e.pointerId != null) {
      try { stageWrap.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    }
  });

  window.addEventListener("pointerup", function () { setHot(false); });
  window.addEventListener("pointercancel", function () { setHot(false); });
  window.addEventListener("resize", moveIron);

  /* ---------- keyboard ---------- */
  var KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };

  canvas.addEventListener("focus", function () {
    keyboardMode = true;
    iron.classList.add("on");
    moveIron();
  });

  canvas.addEventListener("blur", function () {
    keyboardMode = false;
    iron.classList.remove("on");
    setHot(false);
  });

  canvas.addEventListener("keydown", function (e) {
    if (KEYS[e.key]) {
      e.preventDefault();
      var step = e.shiftKey ? 6 : 22;
      tip.x = Math.max(0, Math.min(W, tip.x + KEYS[e.key][0] * step));
      tip.y = Math.max(0, Math.min(H, tip.y + KEYS[e.key][1] * step));
      keyboardMode = true;
      moveIron();
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      if (!hot) setHot(true);
    }
  });

  canvas.addEventListener("keyup", function (e) {
    if (e.key === " " || e.key === "Spacebar") setHot(false);
  });

  /* ---------- controls ---------- */
  densityEl.addEventListener("input", function () { densityVal.textContent = densityEl.value; });

  tempEl.addEventListener("input", function () {
    tempVal.textContent = Math.round(220 + heatMix() * 200) + " °C";
  });

  gravityEl.addEventListener("input", function () {
    gravityVal.textContent = (Number(gravityEl.value) / 100).toFixed(2);
  });

  trailEl.addEventListener("click", function () {
    var on = trailEl.getAttribute("aria-checked") === "true";
    trailEl.setAttribute("aria-checked", String(!on));
    toast(!on ? "Trail persistence on — sparks leave smoke ghosting." : "Trail persistence off.");
  });

  clearBtn.addEventListener("click", function () {
    particles.length = 0;
    blobs.length = 0;
    completed = 0;
    celebrated = false;
    JOINTS.forEach(function (j) { j.done = false; j.charge = 0; });
    jointCountEl.textContent = "0";
    progressFill.style.width = "0%";
    progressFill.classList.remove("full");
    badge.textContent = "READY";
    badge.className = "stage-badge mono";
    renderJoints();
    toast("Board cleared — six joints reopened.");
  });

  /* ---------- init ---------- */
  renderJoints();
  tempVal.textContent = Math.round(220 + heatMix() * 200) + " °C";
  gravityVal.textContent = (Number(gravityEl.value) / 100).toFixed(2);
  moveIron();

  if (reduceMotion) {
    badge.textContent = "STATIC MODE";
    toast("Reduced motion detected — sparks disabled, static heat glow only.");
  }

  requestAnimationFrame(function (t) { last = t; requestAnimationFrame(frame); });
})();
