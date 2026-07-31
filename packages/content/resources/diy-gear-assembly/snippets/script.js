/* DIY — Gear Assembly Loader
   Procedural gear geometry + one rAF loop driving a single CSS custom property. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- toast ---------------- */
  var toastWrap = document.getElementById("toasts");
  function toast(msg) {
    if (!toastWrap) return;
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  /* ---------------- geometry ----------------
     Approximated involute flank: each tooth is built from points sampled
     between the root circle and the addendum circle with a trapezoid profile
     softened by a cosine ease, which reads as a real gear at UI sizes and
     guarantees module-consistent meshing. */
  function gearPath(teeth, module) {
    var pitch = (teeth * module) / 2;
    var add = pitch + module;            // addendum (tip) radius
    var ded = Math.max(pitch - 1.25 * module, module); // dedendum (root)
    var step = (Math.PI * 2) / teeth;
    var d = "";
    // fraction of the angular pitch occupied by the tooth top
    var topF = 0.36, riseF = 0.16;
    for (var i = 0; i < teeth; i++) {
      var a0 = i * step;
      var pts = [
        [a0, ded],
        [a0 + step * riseF, add],
        [a0 + step * (riseF + topF), add],
        [a0 + step * (2 * riseF + topF), ded],
        [a0 + step * 0.999, ded]
      ];
      for (var p = 0; p < pts.length; p++) {
        var x = Math.cos(pts[p][0]) * pts[p][1];
        var y = Math.sin(pts[p][0]) * pts[p][1];
        d += (d === "" ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
      }
    }
    return d + "Z";
  }
  function pitchR(teeth, module) { return (teeth * module) / 2; }

  /* ---------------- finishes ---------------- */
  var FINISH = {
    brass:  { a: "#f6dfa0", b: "#c9a248", c: "#8a6a24", name: "BRASS C360" },
    steel:  { a: "#e6edf4", b: "#9fb0c1", c: "#5d6d7d", name: "STEEL 4140" },
    copper: { a: "#f7c7a4", b: "#c9764a", c: "#8a4526", name: "COPPER C110" }
  };
  var finish = "brass";

  function defsFor(id, f) {
    return (
      '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + f.a + '"/>' +
      '<stop offset="45%" stop-color="' + f.b + '"/>' +
      '<stop offset="100%" stop-color="' + f.c + '"/>' +
      "</linearGradient>" +
      '<radialGradient id="' + id + '-hub" cx="40%" cy="35%">' +
      '<stop offset="0%" stop-color="' + f.a + '" stop-opacity=".85"/>' +
      '<stop offset="100%" stop-color="' + f.c + '" stop-opacity=".95"/>' +
      "</radialGradient>"
    );
  }

  /* ---------------- state ---------------- */
  var state = {
    driverTeeth: 24,
    module: 4,
    speed: 1,        // multiplier
    dir: 1,
    explode: 0,
    angle: 0
  };
  var MODULE_MIN = 3.2;

  var svg = document.getElementById("trainSvg");
  var defs = document.getElementById("trainDefs");
  var group = document.getElementById("trainGroup");
  var stage = document.getElementById("stage");
  var badge = document.getElementById("stateBadge");
  var footMesh = document.getElementById("footMesh");

  var TRAIN = [
    { ratio: 1.00, label: "G1 DRIVER" },
    { ratio: 0.62, label: "G2 IDLER" },
    { ratio: 1.30, label: "G3 REDUC" },
    { ratio: 0.75, label: "G4 IDLER" },
    { ratio: 1.05, label: "G5 OUTPUT" }
  ];

  var nodes = [];   // {g, cx, cy, k}

  function buildTrain() {
    var f = FINISH[finish];
    defs.innerHTML = defsFor("gfill", f);
    group.innerHTML = "";
    nodes = [];

    var mod = state.module;
    var counts = TRAIN.map(function (t) {
      return Math.max(8, Math.round(state.driverTeeth * t.ratio));
    });

    // lay out along a gentle arc, tangent circles + explode gap
    var radii = counts.map(function (n) { return pitchR(n, mod); });
    var xs = [];
    var ys = [];
    var x = radii[0];
    for (var i = 0; i < counts.length; i++) {
      if (i > 0) x += radii[i - 1] + radii[i] + state.explode;
      xs.push(x);
      ys.push(i % 2 === 0 ? 0 : -Math.min(18, mod * 4));
    }
    var total = xs[xs.length - 1] + radii[radii.length - 1];
    var maxR = Math.max.apply(null, radii);
    var pad = 26;
    var w = total + pad * 2;
    var h = maxR * 2 + pad * 2 + 40;
    svg.setAttribute("viewBox", "0 0 " + w.toFixed(0) + " " + h.toFixed(0));
    var midY = h / 2;

    // shafts / centre axis line
    var axis = document.createElementNS(svg.namespaceURI, "path");
    axis.setAttribute("class", "axis");
    var dAxis = "";
    for (var a = 0; a < xs.length - 1; a++) {
      dAxis += "M" + (xs[a] + pad) + " " + (midY + ys[a]) +
               "L" + (xs[a + 1] + pad) + " " + (midY + ys[a + 1]);
    }
    axis.setAttribute("d", dAxis);
    group.appendChild(axis);

    var k = 1;
    for (var j = 0; j < counts.length; j++) {
      if (j > 0) k = -k * (counts[j - 1] / counts[j]);
      var cx = xs[j] + pad, cy = midY + ys[j], r = radii[j], n = counts[j];

      // Placement lives on its own wrapper: .gear-node carries a CSS transform
      // for the seating animation, and a CSS transform would override a
      // transform attribute set on the same element.
      var pos = document.createElementNS(svg.namespaceURI, "g");
      pos.setAttribute("class", "gear-pos");
      pos.setAttribute("transform", "translate(" + cx.toFixed(1) + "," + cy.toFixed(1) + ")");

      var node = document.createElementNS(svg.namespaceURI, "g");
      node.setAttribute("class", "gear-node");

      var halo = document.createElementNS(svg.namespaceURI, "circle");
      halo.setAttribute("class", "pin-halo");
      halo.setAttribute("r", (r + 6).toFixed(1));
      node.appendChild(halo);

      var spin = document.createElementNS(svg.namespaceURI, "g");
      spin.setAttribute("class", "gear");
      spin.style.setProperty("--k", k.toFixed(4));

      var body = document.createElementNS(svg.namespaceURI, "path");
      body.setAttribute("class", "gear-body");
      body.setAttribute("fill", "url(#gfill)");
      body.setAttribute("d", gearPath(n, mod));
      spin.appendChild(body);

      var rim = document.createElementNS(svg.namespaceURI, "circle");
      rim.setAttribute("class", "gear-rim");
      rim.setAttribute("r", Math.max(4, r - mod * 1.6).toFixed(1));
      spin.appendChild(rim);

      // spokes
      var spokes = Math.min(6, Math.max(3, Math.round(r / 12)));
      for (var s = 0; s < spokes; s++) {
        var ang = (s / spokes) * Math.PI * 2;
        var sp = document.createElementNS(svg.namespaceURI, "line");
        sp.setAttribute("class", "gear-spoke");
        sp.setAttribute("x1", (Math.cos(ang) * r * 0.24).toFixed(1));
        sp.setAttribute("y1", (Math.sin(ang) * r * 0.24).toFixed(1));
        sp.setAttribute("x2", (Math.cos(ang) * r * 0.72).toFixed(1));
        sp.setAttribute("y2", (Math.sin(ang) * r * 0.72).toFixed(1));
        spin.appendChild(sp);
      }

      var hub = document.createElementNS(svg.namespaceURI, "circle");
      hub.setAttribute("class", "gear-hub");
      hub.setAttribute("r", Math.max(4, r * 0.22).toFixed(1));
      hub.setAttribute("fill", "url(#gfill-hub)");
      spin.appendChild(hub);

      node.appendChild(spin);

      var pin = document.createElementNS(svg.namespaceURI, "circle");
      pin.setAttribute("class", "pin");
      pin.setAttribute("r", "3");
      node.appendChild(pin);

      var lbl = document.createElementNS(svg.namespaceURI, "text");
      lbl.setAttribute("class", "glabel");
      lbl.setAttribute("text-anchor", "middle");
      lbl.setAttribute("y", (r + 20).toFixed(1));
      lbl.textContent = TRAIN[j].label + " · z" + n;
      node.appendChild(lbl);

      pos.appendChild(node);
      group.appendChild(pos);
      nodes.push({ el: node, k: k, teeth: n });
    }

    var last = nodes[nodes.length - 1];
    document.getElementById("statTeeth").textContent = String(counts[0]);
    document.getElementById("statRatio").textContent =
      "1 : " + Math.abs(last.k).toFixed(2);
    footMesh.textContent = "MESH OK · " + FINISH[finish].name;
  }

  /* ---------------- assembly intro ---------------- */
  var seated = false;
  function playAssembly() {
    if (!nodes.length) return;
    seated = false;
    if (badge) { badge.textContent = "SEATING…"; badge.removeAttribute("data-state"); }
    stage.classList.remove("seating");
    nodes.forEach(function (n, i) {
      var dx = (i % 2 ? 1 : -1) * (140 + i * 30);
      var dy = (i % 3 === 0 ? -1 : 1) * 120;
      n.el.style.setProperty("--tx", dx + "px");
      n.el.style.setProperty("--ty", dy + "px");
      n.el.style.setProperty("--sc", "0.6");
      n.el.style.setProperty("--op", "0");
    });
    if (reduced.matches) { settle(); return; }
    // force reflow so the from-state is committed before transitioning
    void stage.offsetWidth;
    stage.classList.add("seating");
    nodes.forEach(function (n, i) {
      setTimeout(function () {
        n.el.style.setProperty("--tx", "0px");
        n.el.style.setProperty("--ty", "0px");
        n.el.style.setProperty("--sc", "1");
        n.el.style.setProperty("--op", "1");
      }, 70 + i * 95);
    });
    setTimeout(settle, 70 + nodes.length * 95 + 700);
  }
  function settle() {
    nodes.forEach(function (n) {
      n.el.style.setProperty("--tx", "0px");
      n.el.style.setProperty("--ty", "0px");
      n.el.style.setProperty("--sc", "1");
      n.el.style.setProperty("--op", "1");
    });
    seated = true;
    if (badge) {
      badge.textContent = reduced.matches ? "SEATED (STATIC)" : "RUNNING";
      badge.setAttribute("data-state", "run");
    }
  }

  /* ---------------- rAF loop ---------------- */
  var last = 0;
  function frame(ts) {
    if (!last) last = ts;
    var dt = Math.min(64, ts - last);
    last = ts;
    if (seated && !reduced.matches) {
      // 42 rpm nominal at 1x → 252 deg/s
      state.angle = (state.angle + (252 * state.speed * state.dir * dt) / 1000) % 360000;
      document.documentElement.style.setProperty("--spin", state.angle.toFixed(2) + "deg");
      tickMini(dt);
      tickProgress(dt);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------------- controls ---------------- */
  function fillRange(el) {
    var min = +el.min, max = +el.max;
    el.style.setProperty("--fill", (((+el.value - min) / (max - min)) * 100).toFixed(1) + "%");
  }
  var teeth = document.getElementById("teeth");
  var speed = document.getElementById("speed");
  var explode = document.getElementById("explode");
  [teeth, speed, explode].forEach(fillRange);

  teeth.addEventListener("input", function () {
    fillRange(teeth);
    state.driverTeeth = +teeth.value;
    // keep the hero a constant physical size: shrink module as teeth grow
    state.module = Math.max(MODULE_MIN, 96 / state.driverTeeth);
    document.getElementById("teethOut").textContent = teeth.value;
    buildTrain();
    seated = true;
  });
  speed.addEventListener("input", function () {
    fillRange(speed);
    state.speed = +speed.value / 100;
    document.getElementById("speedOut").textContent = state.speed.toFixed(2) + "×";
    document.getElementById("statRpm").textContent =
      Math.round(42 * state.speed) + " rpm";
  });
  explode.addEventListener("input", function () {
    fillRange(explode);
    state.explode = +explode.value;
    document.getElementById("explodeOut").textContent = explode.value + " mm";
    footMesh.textContent = state.explode > 2 ? "EXPLODED VIEW" : "MESH OK · " + FINISH[finish].name;
    buildTrain();
    seated = true;
  });

  document.querySelectorAll(".seg[data-finish]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".seg[data-finish]").forEach(function (o) {
        o.classList.toggle("is-on", o === b);
        o.setAttribute("aria-checked", o === b ? "true" : "false");
      });
      finish = b.dataset.finish;
      buildTrain();
      buildMinis();
      buildProgGears();
      seated = true;
      toast("Finish set to " + FINISH[finish].name);
    });
  });

  var revBtn = document.getElementById("reverseBtn");
  revBtn.addEventListener("click", function () {
    state.dir = -state.dir;
    var on = state.dir < 0;
    revBtn.setAttribute("aria-pressed", on ? "true" : "false");
    toast(on ? "Drive reversed — counter-clockwise" : "Drive forward — clockwise");
  });
  document.getElementById("replayBtn").addEventListener("click", function () {
    playAssembly();
    toast("Replaying assembly sequence");
  });

  /* ---------------- mini inline loaders ---------------- */
  function miniSvg() {
    var f = FINISH[finish];
    var id = "m" + Math.random().toString(36).slice(2, 8);
    var mod = 1.9;
    var a = gearPath(10, mod), b = gearPath(7, mod);
    var ra = pitchR(10, mod), rb = pitchR(7, mod);
    return (
      '<svg viewBox="0 0 40 40" aria-hidden="true"><defs>' + defsFor(id, f) + "</defs>" +
      '<g transform="translate(14,15)"><g class="gear" style="--k:1">' +
      '<path d="' + a + '" fill="url(#' + id + ')"/><circle r="' + (ra * .22).toFixed(1) + '" fill="url(#' + id + '-hub)"/></g></g>' +
      '<g transform="translate(' + (14 + ra + rb).toFixed(1) + ',15)"><g class="gear" style="--k:' + (-10 / 7).toFixed(3) + '">' +
      '<path d="' + b + '" fill="url(#' + id + ')"/><circle r="' + (rb * .22).toFixed(1) + '" fill="url(#' + id + '-hub)"/></g></g>' +
      '<g transform="translate(' + (14 + rb * .3).toFixed(1) + ',' + (15 + ra + rb) .toFixed(1) + ')"><g class="gear" style="--k:' + (-10 / 7).toFixed(3) + '">' +
      '<path d="' + b + '" fill="url(#' + id + ')"/><circle r="' + (rb * .22).toFixed(1) + '" fill="url(#' + id + '-hub)"/></g></g>' +
      "</svg>"
    );
  }
  function buildMinis() {
    document.querySelectorAll(".mini-gears").forEach(function (el) {
      el.innerHTML = miniSvg();
    });
  }
  function tickMini() { /* minis share --spin; nothing per-frame needed */ }

  var saveBtn = document.getElementById("saveBtn");
  var saveLabel = document.getElementById("saveLabel");
  var saveNote = document.getElementById("saveNote");
  var miniA = document.getElementById("miniA");
  miniA.style.display = "none";
  saveBtn.addEventListener("click", function () {
    if (saveBtn.disabled) return;
    saveBtn.disabled = true;
    miniA.style.display = "inline-block";
    saveLabel.textContent = "Saving…";
    saveNote.textContent = "WRITING EEPROM";
    setTimeout(function () {
      miniA.style.display = "none";
      saveLabel.textContent = "Save torque profile";
      saveNote.textContent = "SAVED 14:07:22";
      saveBtn.disabled = false;
      toast("Torque profile TP-118 saved");
    }, 2100);
  });

  /* ---------------- determinate variant ---------------- */
  var arc = document.getElementById("arcFill");
  var CIRC = 2 * Math.PI * 84;
  var progGears = document.getElementById("progGears");
  var progDefs = document.getElementById("progDefs");
  var progVal = 0, progRun = false;
  var pctEl = document.getElementById("progPct");
  var a11y = document.getElementById("progA11y");
  var progBtn = document.getElementById("progBtn");

  function buildProgGears() {
    var f = FINISH[finish];
    progDefs.innerHTML = defsFor("pfill", f);
    var mod = 3.4;
    var big = gearPath(14, mod), small = gearPath(9, mod);
    var rB = pitchR(14, mod), rS = pitchR(9, mod);
    progGears.innerHTML =
      '<g transform="translate(' + (100 - rS) + ',100)"><g class="gear" style="--k:1">' +
      '<path d="' + big + '" fill="url(#pfill)"/><circle r="' + (rB * .24).toFixed(1) + '" fill="url(#pfill-hub)"/></g></g>' +
      '<g transform="translate(' + (100 - rS + rB + rS) + ',100)"><g class="gear" style="--k:' + (-14 / 9).toFixed(3) + '">' +
      '<path d="' + small + '" fill="url(#pfill)"/><circle r="' + (rS * .24).toFixed(1) + '" fill="url(#pfill-hub)"/></g></g>';
    progGears.setAttribute("opacity", ".28");
  }

  function setProgress(v) {
    progVal = Math.max(0, Math.min(100, v));
    arc.style.strokeDashoffset = (CIRC * (1 - progVal / 100)).toFixed(2);
    var pct = Math.round(progVal);
    pctEl.textContent = pct + "%";
    document.getElementById("kvBlocks").textContent = Math.round((pct / 100) * 512) + " / 512";
    document.getElementById("kvTp").textContent =
      (progRun ? (2.4 + Math.sin(pct / 7) * 0.6).toFixed(1) : "0.0") + " MB/s";
    document.getElementById("kvEta").textContent =
      progRun ? Math.max(1, Math.round((100 - pct) * 0.09)) + "s" : "—";
    if (pct % 25 === 0) a11y.textContent = "Flashing " + pct + " percent complete";
  }
  arc.style.strokeDasharray = CIRC.toFixed(2);
  setProgress(0);

  function tickProgress(dt) {
    if (!progRun) return;
    setProgress(progVal + (dt / 1000) * 11 * state.speed);
    if (progVal >= 100) {
      progRun = false;
      progBtn.textContent = "Flash again";
      progBtn.disabled = false;
      toast("Firmware KW-4.2.1 flashed · 512/512 blocks");
    }
  }
  progBtn.addEventListener("click", function () {
    if (progRun) return;
    if (progVal >= 100) setProgress(0);
    progRun = true;
    progBtn.textContent = "Flashing…";
    progBtn.disabled = true;
    if (reduced.matches) {
      // no rAF driving; step it on a timer instead
      var iv = setInterval(function () {
        setProgress(progVal + 8);
        if (progVal >= 100) {
          clearInterval(iv); progRun = false;
          progBtn.textContent = "Flash again"; progBtn.disabled = false;
        }
      }, 260);
    }
  });

  /* ---------------- reduced motion flag ---------------- */
  function syncMotion() {
    document.getElementById("motionFlag").textContent =
      reduced.matches ? "MOTION: REDUCED" : "MOTION: ON";
  }
  if (reduced.addEventListener) reduced.addEventListener("change", function () {
    syncMotion(); playAssembly();
  });

  /* ---------------- boot ---------------- */
  state.module = Math.max(MODULE_MIN, 96 / state.driverTeeth);
  buildTrain();
  buildMinis();
  buildProgGears();
  syncMotion();
  playAssembly();
})();
