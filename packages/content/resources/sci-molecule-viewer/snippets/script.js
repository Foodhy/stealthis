/* Molecule / Structure Viewer Card — vanilla JS, no external libs.
 * Pseudo-3D ball-and-stick: atoms have (x,y,z) coords, projected to 2D
 * with rotation matrices; depth cued by radius scaling + opacity.
 * Fictional / illustrative geometry — not real optimized coordinates. */

(function () {
  // CPK-ish element palette (illustrative).
  var ELEMENTS = {
    H: { color: "#eef2f8", r: 11, name: "Hydrogen" },
    C: { color: "#3a4250", r: 17, name: "Carbon" },
    O: { color: "#cf4538", r: 16, name: "Oxygen" },
    N: { color: "#2f6fd0", r: 16, name: "Nitrogen" }
  };

  // Molecules: atoms {el,x,y,z}, bonds [i,j,order]. Coords in arbitrary units.
  var MOLECULES = {
    water: {
      name: "Water",
      iupac: "oxidane",
      formula: "H₂O",
      mass: "18.02 g·mol⁻¹",
      atoms: [
        { el: "O", x: 0, y: 0, z: 0 },
        { el: "H", x: 58, y: 44, z: 0 },
        { el: "H", x: -58, y: 44, z: 0 }
      ],
      bonds: [[0, 1, 1], [0, 2, 1]]
    },
    methane: {
      name: "Methane",
      iupac: "methane",
      formula: "CH₄",
      mass: "16.04 g·mol⁻¹",
      atoms: [
        { el: "C", x: 0, y: 0, z: 0 },
        { el: "H", x: 52, y: 52, z: 52 },
        { el: "H", x: -52, y: -52, z: 52 },
        { el: "H", x: -52, y: 52, z: -52 },
        { el: "H", x: 52, y: -52, z: -52 }
      ],
      bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]
    },
    benzene: (function () {
      var b = ringBenzene();
      return {
        name: "Benzene",
        iupac: "benzene",
        formula: "C₆H₆",
        mass: "78.11 g·mol⁻¹",
        atoms: b.atoms,
        bonds: b.bonds
      };
    })(),
    caffeine: {
      name: "Caffeine",
      iupac: "1,3,7-trimethylpurine-2,6-dione",
      formula: "C₈H₁₀N₄O₂",
      mass: "194.19 g·mol⁻¹",
      atoms: caffeineAtoms(),
      bonds: caffeineBonds()
    }
  };

  function ringBenzene() {
    // 6 carbons in a hexagon (slightly puckered for depth) + 6 H outward.
    var atoms = [];
    var bonds = [];
    var R = 62;
    var i;
    for (i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i;
      atoms.push({ el: "C", x: Math.cos(a) * R, y: Math.sin(a) * R, z: (i % 2 ? 12 : -12) });
    }
    for (i = 0; i < 6; i++) {
      var b = (Math.PI / 3) * i;
      atoms.push({ el: "H", x: Math.cos(b) * (R + 42), y: Math.sin(b) * (R + 42), z: (i % 2 ? 12 : -12) });
    }
    // alternating single/double around the ring + C-H bonds
    for (i = 0; i < 6; i++) {
      bonds.push([i, (i + 1) % 6, i % 2 === 0 ? 2 : 1]);
      bonds.push([i, i + 6, 1]);
    }
    return { atoms: atoms, bonds: bonds };
  }

  function caffeineAtoms() {
    // Illustrative fused bicyclic layout (not real coords).
    return [
      { el: "C", x: -10, y: -52, z: 8 },   // 0
      { el: "N", x: 46, y: -34, z: -6 },   // 1
      { el: "C", x: 58, y: 18, z: 10 },    // 2
      { el: "C", x: 16, y: 50, z: -8 },    // 3
      { el: "N", x: -38, y: 34, z: 6 },    // 4
      { el: "C", x: -52, y: -16, z: -10 }, // 5
      { el: "N", x: 100, y: 36, z: 4 },    // 6 (imidazole)
      { el: "C", x: 92, y: -28, z: -8 },   // 7
      { el: "N", x: 48, y: -78, z: 10 },   // 8
      { el: "O", x: -100, y: -28, z: -14 },// 9
      { el: "O", x: 30, y: 96, z: -16 },   // 10
      { el: "C", x: -84, y: 64, z: 12 },   // 11 methyl
      { el: "C", x: 84, y: -76, z: 18 },   // 12 methyl
      { el: "C", x: 150, y: 58, z: 6 },    // 13 methyl
      { el: "H", x: 130, y: -52, z: -16 }, // 14
      { el: "H", x: -116, y: 90, z: 18 },  // 15
      { el: "H", x: -64, y: 88, z: 6 },    // 16
      { el: "H", x: -98, y: 46, z: 30 },   // 17
      { el: "H", x: 110, y: -98, z: 30 },  // 18
      { el: "H", x: 60, y: -100, z: 36 },  // 19
      { el: "H", x: 96, y: -94, z: 4 },    // 20
      { el: "H", x: 178, y: 44, z: 0 },    // 21
      { el: "H", x: 154, y: 84, z: 22 },   // 22
      { el: "H", x: 162, y: 70, z: -16 }   // 23
    ];
  }
  function caffeineBonds() {
    return [
      [0, 1, 1], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 1], [5, 0, 2],
      [2, 6, 1], [6, 7, 2], [7, 8, 1], [8, 0, 1],
      [5, 9, 2], [3, 10, 2],
      [4, 11, 1], [8, 12, 1], [6, 13, 1],
      [7, 14, 1],
      [11, 15, 1], [11, 16, 1], [11, 17, 1],
      [12, 18, 1], [12, 19, 1], [12, 20, 1],
      [13, 21, 1], [13, 22, 1], [13, 23, 1]
    ];
  }
  var ENTRY = {
    water: "HSDB-00018", methane: "HSDB-00016",
    benzene: "HSDB-00078", caffeine: "HSDB-04127"
  };

  // ---- DOM refs ----
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage");
  var bondsG = $("bonds");
  var atomsG = $("atoms");
  var hint = $("hint");
  var hudFormula = $("hud-formula");
  var hudZoom = $("hud-zoom");
  var SVGNS = "http://www.w3.org/2000/svg";

  // ---- view state ----
  var state = {
    mol: "water",
    rotX: -0.35,
    rotY: 0.5,
    zoom: 1,
    spin: false
  };
  var current = MOLECULES.water;

  // ---- rotation + projection ----
  function rotate(p) {
    var cy = Math.cos(state.rotY), sy = Math.sin(state.rotY);
    var cx = Math.cos(state.rotX), sx = Math.sin(state.rotX);
    // rotate around Y then X
    var x = p.x * cy + p.z * sy;
    var z = -p.x * sy + p.z * cy;
    var y = p.y * cx - z * sx;
    var z2 = p.y * sx + z * cx;
    return { x: x, y: y, z: z2 };
  }

  function render() {
    // project all atoms
    var pts = current.atoms.map(function (a) {
      var r = rotate(a);
      return { el: a.el, x: r.x * state.zoom, y: r.y * state.zoom, z: r.z };
    });

    // depth-based opacity/scale helpers
    var zs = pts.map(function (p) { return p.z; });
    var zMin = Math.min.apply(null, zs), zMax = Math.max.apply(null, zs);
    var zRange = (zMax - zMin) || 1;
    function depth(z) { return (z - zMin) / zRange; } // 0 back .. 1 front

    // ----- bonds (drawn first, painter sorted by avg depth) -----
    var bondList = current.bonds.map(function (b) {
      var pa = pts[b[0]], pb = pts[b[1]];
      return { a: pa, b: pb, order: b[2], z: (pa.z + pb.z) / 2 };
    }).sort(function (m, n) { return m.z - n.z; });

    var bondHtml = "";
    bondList.forEach(function (bd) {
      var d = depth(bd.z);
      var op = (0.45 + d * 0.5).toFixed(3);
      var w = (3.2 + d * 1.6).toFixed(2);
      var col = "#7a8aa0";
      if (bd.order === 2) {
        var ox = bd.b.y - bd.a.y, oy = -(bd.b.x - bd.a.x);
        var len = Math.hypot(ox, oy) || 1;
        var off = 3.4;
        ox = (ox / len) * off; oy = (oy / len) * off;
        bondHtml += line(bd.a.x + ox, bd.a.y + oy, bd.b.x + ox, bd.b.y + oy, w * 0.62, col, op);
        bondHtml += line(bd.a.x - ox, bd.a.y - oy, bd.b.x - ox, bd.b.y - oy, w * 0.62, col, op);
      } else {
        bondHtml += line(bd.a.x, bd.a.y, bd.b.x, bd.b.y, w, col, op);
      }
    });
    bondsG.innerHTML = bondHtml;

    // ----- atoms (painter sorted back-to-front) -----
    var atomList = pts.map(function (p, i) { return { p: p, i: i }; })
      .sort(function (m, n) { return m.p.z - n.p.z; });

    var atomHtml = "";
    atomList.forEach(function (item) {
      var p = item.p;
      var meta = ELEMENTS[p.el];
      var d = depth(p.z);
      var rad = meta.r * state.zoom * (0.78 + d * 0.34);
      var op = (0.62 + d * 0.38).toFixed(3);
      atomHtml +=
        '<g class="atom" opacity="' + op + '">' +
        '<circle class="atom-core" cx="' + f(p.x) + '" cy="' + f(p.y) + '" r="' + f(rad) +
        '" fill="' + meta.color + '" />' +
        '<circle class="atom-spec" cx="' + f(p.x - rad * 0.3) + '" cy="' + f(p.y - rad * 0.32) +
        '" r="' + f(rad * 0.42) + '" />' +
        "</g>";
    });
    atomsG.innerHTML = atomHtml;

    hudFormula.textContent = current.formula;
    hudZoom.textContent = Math.round(state.zoom * 100) + "%";
  }

  function line(x1, y1, x2, y2, w, col, op) {
    return '<line class="bond-line" x1="' + f(x1) + '" y1="' + f(y1) +
      '" x2="' + f(x2) + '" y2="' + f(y2) + '" stroke="' + col +
      '" stroke-width="' + f(w) + '" opacity="' + op + '" />';
  }
  function f(n) { return Math.round(n * 100) / 100; }

  // ---- info panel + legend ----
  function loadMolecule(key) {
    if (!MOLECULES[key]) return;
    state.mol = key;
    current = MOLECULES[key];

    $("info-name").textContent = current.name;
    $("info-iupac").textContent = current.iupac;
    $("prop-formula").innerHTML = current.formula;
    $("prop-mass").textContent = current.mass;
    $("prop-atoms").textContent = current.atoms.length;
    $("prop-bonds").textContent = current.bonds.length;
    $("fig-cap").innerHTML =
      "Approximate ball-and-stick model of " + current.formula +
      " (SDB " + ENTRY[key] + "). Atom radii scaled by covalent radius; " +
      "depth conveyed via foreshortening and opacity.";

    buildLegend();
    render();
  }

  function buildLegend() {
    var counts = {};
    current.atoms.forEach(function (a) { counts[a.el] = (counts[a.el] || 0) + 1; });
    var order = ["C", "H", "N", "O"];
    var keys = Object.keys(counts).sort(function (a, b) {
      return order.indexOf(a) - order.indexOf(b);
    });
    var list = $("legend-list");
    list.innerHTML = keys.map(function (el) {
      var m = ELEMENTS[el];
      return '<li class="legend-item">' +
        '<span class="legend-swatch" style="background:' + m.color + '"></span>' +
        '<span class="sym">' + el + '</span> ' + m.name +
        ' <span class="cnt">×' + counts[el] + "</span></li>";
    }).join("");
  }

  // ---- interaction: drag to rotate ----
  var dragging = false, lastX = 0, lastY = 0;

  function pointerDown(e) {
    dragging = true;
    stage.classList.add("dragging");
    var pt = point(e);
    lastX = pt.x; lastY = pt.y;
    if (hint) hint.classList.add("hide");
    if (e.cancelable) e.preventDefault();
  }
  function pointerMove(e) {
    if (!dragging) return;
    var pt = point(e);
    state.rotY += (pt.x - lastX) * 0.011;
    state.rotX += (pt.y - lastY) * 0.011;
    state.rotX = Math.max(-1.4, Math.min(1.4, state.rotX));
    lastX = pt.x; lastY = pt.y;
    render();
  }
  function pointerUp() {
    dragging = false;
    stage.classList.remove("dragging");
  }
  function point(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  stage.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove);
  window.addEventListener("mouseup", pointerUp);
  stage.addEventListener("touchstart", pointerDown, { passive: false });
  stage.addEventListener("touchmove", function (e) { pointerMove(e); if (e.cancelable) e.preventDefault(); }, { passive: false });
  stage.addEventListener("touchend", pointerUp);

  // keyboard rotation
  stage.addEventListener("keydown", function (e) {
    var step = 0.18;
    if (e.key === "ArrowLeft") state.rotY -= step;
    else if (e.key === "ArrowRight") state.rotY += step;
    else if (e.key === "ArrowUp") state.rotX = Math.max(-1.4, state.rotX - step);
    else if (e.key === "ArrowDown") state.rotX = Math.min(1.4, state.rotX + step);
    else if (e.key === "+" || e.key === "=") setZoom(state.zoom + 0.12);
    else if (e.key === "-") setZoom(state.zoom - 0.12);
    else return;
    e.preventDefault();
    if (hint) hint.classList.add("hide");
    render();
  });

  // wheel zoom
  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    setZoom(state.zoom + (e.deltaY < 0 ? 0.08 : -0.08));
    if (hint) hint.classList.add("hide");
  }, { passive: false });

  function setZoom(z) {
    state.zoom = Math.max(0.5, Math.min(2.4, z));
    render();
  }

  // ---- spin loop ----
  var raf = null;
  function spinLoop() {
    if (!state.spin) return;
    state.rotY += 0.012;
    render();
    raf = requestAnimationFrame(spinLoop);
  }
  function setSpin(on) {
    state.spin = on;
    var btn = $("spin-toggle");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    if (on) { spinLoop(); toast("Auto-spin on"); }
    else { if (raf) cancelAnimationFrame(raf); toast("Auto-spin paused"); }
  }

  // ---- toolbar wiring ----
  Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".seg-btn").forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      loadMolecule(b.getAttribute("data-mol"));
      toast(MOLECULES[b.getAttribute("data-mol")].name + " loaded");
    });
  });

  $("spin-toggle").addEventListener("click", function () { setSpin(!state.spin); });
  $("zoom-in").addEventListener("click", function () { setZoom(state.zoom + 0.15); });
  $("zoom-out").addEventListener("click", function () { setZoom(state.zoom - 0.15); });
  $("zoom-reset").addEventListener("click", function () {
    state.rotX = -0.35; state.rotY = 0.5; state.zoom = 1;
    render(); toast("View reset");
  });

  // ---- toast helper ----
  var toastTimer = null;
  function toast(msg) {
    var wrap = $("toast-wrap");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, 1600);
  }

  // hide hint after idle
  setTimeout(function () { if (hint && !dragging) hint.classList.add("hide"); }, 5200);

  // ---- init ----
  loadMolecule("water");
})();
