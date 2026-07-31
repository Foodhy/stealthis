/* ============================================================
   DIY — PCB Traces Background
   Kellerman Circuitworks · vanilla JS, no libraries
   ============================================================ */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var W = 1200, H = 800;

  var body = document.body;
  var svg = document.getElementById("traces");
  var gTraces = document.getElementById("layer-traces");
  var gPulses = document.getElementById("layer-pulses");
  var gParts = document.getElementById("layer-parts");
  var gVias = document.getElementById("layer-vias");
  var gFlares = document.getElementById("layer-flares");
  var motionNote = document.getElementById("motionNote");

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  var state = {
    density: "medium",
    colorway: "green",
    speed: 100,      // percent
    glow: true,
    scrim: true,
    paused: reduceQuery.matches,
    tab: "css"
  };

  var vias = [];     // {x,y} in viewBox units — used for hover flare

  /* ---------- tiny deterministic PRNG (mulberry32) ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- 45° router ----------
     Walks from a start point in the four cardinal directions plus the
     four diagonals, snapping every segment to a multiple of 20 units so
     the net reads like real autorouted copper.                        */
  function routePath(rand, startX, startY, hops, dirBias) {
    var x = startX, y = startY;
    var d = "M " + x + " " + y;
    var dirs = [
      [1, 0], [0, 1], [1, 1], [1, -1],
      [-1, 0], [0, -1], [-1, 1], [-1, -1]
    ];
    for (var i = 0; i < hops; i++) {
      var pick = dirs[Math.floor(rand() * (i % 3 === 0 ? 4 : 8))];
      var len = 40 + Math.floor(rand() * 7) * 20;
      var nx = x + pick[0] * len * dirBias;
      var ny = y + pick[1] * len;
      // keep inside the board with a small bleed
      nx = Math.max(-40, Math.min(W + 40, nx));
      ny = Math.max(-40, Math.min(H + 40, ny));
      if (nx === x && ny === y) continue;
      d += " L " + Math.round(nx) + " " + Math.round(ny);
      x = nx; y = ny;
    }
    return { d: d, end: [x, y] };
  }

  function buildIC(cx, cy, w, h, pins, label) {
    var g = el("g", { "class": "ic" }, gParts);
    el("rect", { "class": "body", x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 3 }, g);
    var step = h / (pins + 1);
    for (var i = 1; i <= pins; i++) {
      var py = cy - h / 2 + step * i;
      el("rect", { "class": "pin", x: cx - w / 2 - 9, y: py - 2.5, width: 9, height: 5, rx: 1 }, g);
      el("rect", { "class": "pin", x: cx + w / 2, y: py - 2.5, width: 9, height: 5, rx: 1 }, g);
    }
    el("circle", { "class": "pin", cx: cx - w / 2 + 8, cy: cy - h / 2 + 8, r: 2.6 }, g);
    var t = el("text", { x: cx, y: cy + 3, "text-anchor": "middle" }, g);
    t.textContent = label;
    el("rect", { "class": "silk", x: cx - w / 2 - 12, y: cy - h / 2 - 6, width: w + 24, height: h + 12, rx: 4 }, gParts);
  }

  function buildVia(x, y, r) {
    var g = el("g", { "class": "via" }, gVias);
    el("circle", { "class": "ring", cx: x, cy: y, r: r }, g);
    el("circle", { "class": "hole", cx: x, cy: y, r: Math.max(1.4, r - 2.6) }, g);
    vias.push({ x: x, y: y });
  }

  /* ---------- net builder ---------- */
  var DENSITY = {
    sparse: { traces: 12, pulses: 3, vias: 10, seed: 1207 },
    medium: { traces: 26, pulses: 6, vias: 22, seed: 4821 },
    dense: { traces: 46, pulses: 10, vias: 40, seed: 9310 }
  };

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function buildNet() {
    clear(gTraces); clear(gPulses); clear(gParts); clear(gVias); clear(gFlares);
    vias.length = 0;

    var cfg = DENSITY[state.density];
    var rand = rng(cfg.seed);
    var paths = [];

    for (var i = 0; i < cfg.traces; i++) {
      var edge = i % 4;
      var sx, sy;
      if (edge === 0) { sx = -20; sy = Math.round(rand() * H / 20) * 20; }
      else if (edge === 1) { sx = W + 20; sy = Math.round(rand() * H / 20) * 20; }
      else if (edge === 2) { sx = Math.round(rand() * W / 20) * 20; sy = -20; }
      else { sx = Math.round(rand() * W / 20) * 20; sy = H + 20; }

      var bias = (edge === 1) ? -1 : 1;
      var r = routePath(rand, sx, sy, 5 + Math.floor(rand() * 6), bias);
      var p = el("path", { d: r.d }, gTraces);
      if (rand() > 0.78) p.setAttribute("class", "is-fat");
      paths.push({ node: p, d: r.d, end: r.end });
    }

    // Footprints — two SOIC-ish packages, deterministic placement
    buildIC(330, 250, 92, 116, 8, "KX-1180");
    buildIC(860, 545, 78, 96, 6, "TL-4C");

    // Pads on a few trace endings
    for (var j = 0; j < paths.length; j += 3) {
      var e = paths[j].end;
      if (e[0] > 10 && e[0] < W - 10 && e[1] > 10 && e[1] < H - 10) {
        el("rect", { "class": "pad", x: e[0] - 5, y: e[1] - 3, width: 10, height: 6, rx: 1.5 }, gVias);
      }
    }

    // Vias
    for (var v = 0; v < cfg.vias; v++) {
      var src = paths[Math.floor(rand() * paths.length)];
      var pt;
      try {
        var L = src.node.getTotalLength();
        pt = src.node.getPointAtLength(L * (0.15 + rand() * 0.7));
      } catch (err) {
        pt = { x: rand() * W, y: rand() * H };
      }
      if (pt.x < 0 || pt.x > W || pt.y < 0 || pt.y > H) continue;
      buildVia(Math.round(pt.x), Math.round(pt.y), rand() > 0.8 ? 6 : 4.5);
    }

    // Pulses — duplicated highlight paths with dasharray/dashoffset
    var chosen = [];
    for (var c = 0; c < cfg.pulses; c++) {
      chosen.push(paths[Math.floor(rand() * paths.length)]);
    }
    chosen.forEach(function (src, idx) {
      var hp = el("path", { d: src.d }, gPulses);
      var len = 400;
      try { len = Math.max(120, src.node.getTotalLength()); } catch (e2) { /* jsdom */ }
      var dashOn = Math.max(28, Math.min(90, len * 0.14));
      hp.setAttribute("stroke-dasharray", dashOn + " " + Math.round(len));
      hp.style.setProperty("--to", "-" + Math.round(len + dashOn) + "px");
      hp.style.setProperty("--dur", (3.4 + idx * 0.9).toFixed(2) + "s");
      hp.style.setProperty("--delay", (-idx * 1.3).toFixed(2) + "s");
      hp.setAttribute("stroke-dashoffset", "0");
    });

    applySpeed();
  }

  /* ---------- speed ---------- */
  function applySpeed() {
    var factor = 100 / state.speed;
    Array.prototype.forEach.call(gPulses.children, function (p, i) {
      var base = 3.4 + i * 0.9;
      p.style.setProperty("--dur", (base * factor).toFixed(2) + "s");
    });
  }

  /* ---------- via hover flare ---------- */
  var lastFlare = 0;
  function onMove(ev) {
    if (state.paused || reduceQuery.matches) return;
    var now = Date.now();
    if (now - lastFlare < 140) return;
    var rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    // viewBox uses slice; approximate with uniform scale on the larger ratio
    var scale = Math.max(rect.width / W, rect.height / H);
    var offX = (rect.width - W * scale) / 2;
    var offY = (rect.height - H * scale) / 2;
    var vx = (ev.clientX - rect.left - offX) / scale;
    var vy = (ev.clientY - rect.top - offY) / scale;

    for (var i = 0; i < vias.length; i++) {
      var dx = vias[i].x - vx, dy = vias[i].y - vy;
      if (dx * dx + dy * dy < 2600) {
        lastFlare = now;
        flare(vias[i].x, vias[i].y);
        break;
      }
    }
  }

  function flare(x, y) {
    var c = el("circle", { "class": "flare", cx: x, cy: y, r: 5 }, gFlares);
    c.style.transformOrigin = x + "px " + y + "px";
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 750);
  }

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2000);
  }

  /* ---------- snippet ---------- */
  var COLOR_TOKENS = {
    green: { mask: "#0a3320", deep: "#05130c", copper: "#c9973f", pulse: "#7dfab4" },
    black: { mask: "#1c1c1e", deep: "#08080a", copper: "#e8c46a", pulse: "#ffe9a8" },
    navy: { mask: "#0f2a4a", deep: "#06111f", copper: "#4f7fae", pulse: "#63e6ff" },
    purple: { mask: "#3a1d5c", deep: "#170a26", copper: "#d8b25e", pulse: "#ff9df0" }
  };

  function snippet() {
    var t = COLOR_TOKENS[state.colorway];
    var dur = (3.4 * (100 / state.speed)).toFixed(2);
    if (state.tab === "css") {
      return [
        ":root {",
        "  --mask-a: " + t.mask + ";",
        "  --mask-b: " + t.deep + ";",
        "  --copper: " + t.copper + ";",
        "  --pulse:  " + t.pulse + ";",
        "}",
        "",
        ".board {",
        "  background:",
        "    radial-gradient(120% 90% at 22% 8%, #ffffff14 0%, transparent 62%),",
        "    linear-gradient(155deg, var(--mask-a), var(--mask-b) 78%);",
        "}",
        "",
        "/* fine 8px weave + 80px major grid */",
        ".board__mask {",
        "  background-image:",
        "    linear-gradient(to right, var(--grid) 1px, transparent 1px),",
        "    linear-gradient(to bottom, var(--grid) 1px, transparent 1px),",
        "    linear-gradient(to right, var(--grid-major) 1px, transparent 1px),",
        "    linear-gradient(to bottom, var(--grid-major) 1px, transparent 1px);",
        "  background-size: 8px 8px, 8px 8px, 80px 80px, 80px 80px;",
        "  mask-image: radial-gradient(105% 85% at 50% 40%, #000 45%, transparent);",
        "}",
        "",
        ".layer-pulses path {",
        "  stroke: var(--pulse);",
        "  animation: flow " + dur + "s linear infinite;",
        (state.glow ? "  filter: url(#pulseGlow);" : "  /* glow off */"),
        (state.paused ? "  animation-play-state: paused;" : "  animation-play-state: running;"),
        "}",
        "@keyframes flow { to { stroke-dashoffset: var(--to); } }",
        "",
        "@media (prefers-reduced-motion: reduce) {",
        "  .layer-pulses path { animation: none; stroke-dasharray: none; }",
        "}"
      ].join("\n");
    }
    return [
      '<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">',
      "  <defs>",
      '    <filter id="pulseGlow" x="-40%" y="-40%" width="180%" height="180%">',
      '      <feGaussianBlur stdDeviation="3.2" result="b"/>',
      "      <feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge>",
      "    </filter>",
      "  </defs>",
      "",
      "  <!-- copper: 45-degree routing only -->",
      '  <path d="M -20 240 L 120 240 L 220 340 L 220 460 L 340 580"',
      '        fill="none" stroke="' + t.copper + '" stroke-width="1.6"/>',
      "",
      "  <!-- current pulse: same geometry, dashed + offset-animated -->",
      '  <path d="M -20 240 L 120 240 L 220 340 L 220 460 L 340 580"',
      '        fill="none" stroke="' + t.pulse + '" stroke-width="2.2"',
      '        stroke-dasharray="64 620" stroke-dashoffset="0"',
      '        style="--to:-684px; animation: flow ' + dur + 's linear infinite"/>',
      "",
      "  <!-- via: ring + drilled hole -->",
      '  <g class="via">',
      '    <circle cx="220" cy="340" r="4.5" fill="none" stroke="' + t.copper + '" stroke-width="2"/>',
      '    <circle cx="220" cy="340" r="2" fill="' + t.deep + '"/>',
      "  </g>",
      "</svg>",
      "",
      "<!-- density: " + state.density + " · " + DENSITY[state.density].traces + " nets, " +
        DENSITY[state.density].pulses + " pulses -->"
    ].join("\n");
  }

  var codeEl = document.getElementById("code");
  function renderSnippet() { codeEl.textContent = snippet(); }

  /* ---------- wiring ---------- */
  document.querySelectorAll("[data-density]").forEach(function (btn) {
    if (btn === body) return;
    btn.addEventListener("click", function () {
      state.density = btn.getAttribute("data-density");
      body.setAttribute("data-density", state.density);
      document.querySelectorAll(".seg__btn").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
      });
      buildNet();
      renderSnippet();
      toast("Density: " + state.density + " — " + DENSITY[state.density].traces + " nets routed");
    });
  });

  document.querySelectorAll(".sw").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.colorway = btn.getAttribute("data-colorway");
      body.setAttribute("data-colorway", state.colorway);
      document.querySelectorAll(".sw").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
      });
      renderSnippet();
      toast("Colorway: " + btn.textContent.trim());
    });
  });

  var speed = document.getElementById("speed");
  var speedOut = document.getElementById("speedOut");
  speed.addEventListener("input", function () {
    state.speed = parseInt(speed.value, 10);
    speedOut.textContent = state.speed + "%";
    applySpeed();
    renderSnippet();
  });

  var glow = document.getElementById("glow");
  glow.addEventListener("change", function () {
    state.glow = glow.checked;
    body.setAttribute("data-glow", state.glow ? "on" : "off");
    renderSnippet();
    toast(state.glow ? "Pulse glow on" : "Pulse glow off");
  });

  var scrim = document.getElementById("scrim");
  scrim.addEventListener("change", function () {
    state.scrim = scrim.checked;
    body.setAttribute("data-scrim", state.scrim ? "on" : "off");
    toast(state.scrim ? "Readability scrim on" : "Scrim off — raw board");
  });

  var pause = document.getElementById("pause");
  var pauseLbl = document.getElementById("pauseLbl");
  function setPaused(p, quiet) {
    state.paused = p;
    body.setAttribute("data-paused", p ? "1" : "0");
    pause.setAttribute("aria-pressed", p ? "true" : "false");
    pauseLbl.textContent = p ? "Resume pulses" : "Pause pulses";
    pause.querySelector(".btn__ico").textContent = p ? "▶" : "❚❚";
    renderSnippet();
    if (!quiet) toast(p ? "Pulses paused" : "Pulses running");
  }
  pause.addEventListener("click", function () { setPaused(!state.paused); });

  document.querySelectorAll(".snip__tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      state.tab = tab.getAttribute("data-tab");
      document.querySelectorAll(".snip__tab").forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      renderSnippet();
    });
  });

  document.getElementById("copy").addEventListener("click", function () {
    var text = codeEl.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast("Snippet copied to clipboard"); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Snippet copied"); }
    catch (e) { toast("Copy failed — select the code manually"); }
    document.body.removeChild(ta);
  }

  /* keyboard: arrow keys move between radio-style buttons */
  function arrowNav(container, selector) {
    container.addEventListener("keydown", function (ev) {
      if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
      var items = Array.prototype.slice.call(container.querySelectorAll(selector));
      var i = items.indexOf(document.activeElement);
      if (i < 0) return;
      ev.preventDefault();
      var next = items[(i + (ev.key === "ArrowRight" ? 1 : items.length - 1)) % items.length];
      next.focus();
      next.click();
    });
  }
  arrowNav(document.querySelector(".seg"), ".seg__btn");
  arrowNav(document.querySelector(".swatches"), ".sw");

  window.addEventListener("pointermove", onMove, { passive: true });

  /* ---------- reduced motion ---------- */
  function syncMotion() {
    if (reduceQuery.matches) {
      setPaused(true, true);
      motionNote.textContent =
        "Reduced motion is on in your system settings, so pulses start paused. Press Resume to run them anyway.";
    } else {
      motionNote.textContent = "Pulses are running. Adjust density, colorway and speed below.";
    }
  }
  if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", syncMotion);
  else if (reduceQuery.addListener) reduceQuery.addListener(syncMotion);

  /* ---------- boot ---------- */
  buildNet();
  setPaused(state.paused, true);
  syncMotion();
  renderSnippet();
})();
