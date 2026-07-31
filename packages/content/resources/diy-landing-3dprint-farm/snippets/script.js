/* Layerworks Print Farm — instant quote, gallery, live farm, accordion. Vanilla JS. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- toast ---------------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------------- smooth scroll buttons ---------------- */
  $$("[data-scroll]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = $(b.getAttribute("data-scroll"));
      if (t) t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------------- instant quote ---------------- */
  var fname = $("#fname"), material = $("#material"), layer = $("#layer"),
      infill = $("#infill"), infillOut = $("#infillOut"), qty = $("#qty"),
      rush = $("#rush"), drop = $("#drop"), dropSub = $("#dropSub");

  var SAMPLES = [
    { n: "bracket_v4_rev-c.stl", g: 86, h: 5.4 },
    { n: "planetary_gear_set.3mf", g: 142, h: 9.1 },
    { n: "drone_arm_left.step", g: 61, h: 4.2 },
    { n: "enclosure_lid_v2.stl", g: 208, h: 12.6 },
    { n: "cable_grommet_x8.3mf", g: 34, h: 2.3 }
  ];
  var sampleIx = 0;
  var base = SAMPLES[0];

  var MACHINE_RATE = 3.0;   // $/h
  var SETUP = 8.0;          // flat
  var RUSH_PCT = 0.35;

  var last = {};

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function clampQty(v) {
    v = parseInt(String(v).replace(/[^\d]/g, ""), 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 2500) v = 2500;
    return v;
  }
  function flash(key) {
    var row = $('.brow[data-row="' + key + '"]');
    if (!row || reduced) return;
    row.classList.remove("flash");
    void row.offsetWidth;
    row.classList.add("flash");
    setTimeout(function () { row.classList.remove("flash"); }, 620);
  }
  function shipDate(days) {
    var d = new Date(2026, 6, 30); // fixed demo "today": Thu Jul 30, 2026
    var added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) added++;      // farm runs Mon–Sat
    }
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  }

  function recalc(changedRows) {
    var mOpt = material.options[material.selectedIndex];
    var rate = parseFloat(mOpt.dataset.rate);           // $/g
    var lOpt = layer.options[layer.selectedIndex];
    var mult = parseFloat(lOpt.dataset.mult);           // time multiplier
    var inf = parseInt(infill.value, 10);
    var n = clampQty(qty.value);
    var isRush = rush.getAttribute("aria-checked") === "true";

    var infFactor = 0.62 + (inf / 100) * 0.9;
    var grams = base.g * infFactor;
    var hours = base.h * mult * (0.75 + (inf / 100) * 0.55);

    var cMat = grams * rate * n;
    var cTime = hours * MACHINE_RATE * n;
    var cSetup = SETUP + (n > 10 ? (n - 10) * 0.22 : 0);
    var sub = cMat + cTime + cSetup;
    var cRush = isRush ? sub * RUSH_PCT : 0;
    var total = sub + cRush;

    $("#outName").textContent = fname.value || "untitled.stl";
    $("#outMat").textContent = mOpt.dataset.name;
    $("#gramsOut").textContent = (grams * n).toFixed(0) + " g total";
    $("#hoursOut").textContent = (hours * n).toFixed(1) + " h · " + lOpt.value + " mm";
    $("#cMat").textContent = money(cMat);
    $("#cTime").textContent = money(cTime);
    $("#cSetup").textContent = money(cSetup);
    $("#cRush").textContent = isRush ? money(cRush) : "—";
    $("#cTotal").textContent = money(total);
    $("#unitOut").textContent = money(total / n) + " / unit";

    var days = isRush ? 2 : 3 + (n > 25 ? 2 : 0) + (mult > 1.4 ? 1 : 0);
    $("#shipDate").textContent = shipDate(days);

    infillOut.textContent = inf + "%";
    infill.style.setProperty("--pct", ((inf - 10) / 80 * 100).toFixed(1) + "%");

    (changedRows || ["mat", "time", "setup", "rush"]).forEach(flash);
    last = { total: total, n: n, mat: mOpt.dataset.name };
  }

  ["change", "input"].forEach(function (ev) {
    material.addEventListener(ev, function () { recalc(["mat", "time"]); });
    layer.addEventListener(ev, function () { recalc(["time"]); });
    infill.addEventListener(ev, function () { recalc(["mat", "time"]); });
    fname.addEventListener(ev, function () { recalc([]); });
  });

  $$(".step").forEach(function (b) {
    b.addEventListener("click", function () {
      qty.value = clampQty(clampQty(qty.value) + parseInt(b.dataset.qty, 10));
      recalc(["mat", "time", "setup"]);
    });
  });
  qty.addEventListener("input", function () { recalc(["mat", "time", "setup"]); });
  qty.addEventListener("blur", function () { qty.value = clampQty(qty.value); recalc([]); });

  rush.addEventListener("click", function () {
    var on = rush.getAttribute("aria-checked") === "true";
    rush.setAttribute("aria-checked", String(!on));
    recalc(["rush"]);
    toast(!on ? "Rush enabled — 48-hour guarantee." : "Rush removed — standard queue.");
  });

  function pickSample() {
    sampleIx = (sampleIx + 1) % SAMPLES.length;
    base = SAMPLES[sampleIx];
    fname.value = base.n;
    dropSub.textContent = "loaded · " + base.g + " g raw · mesh OK";
    drop.classList.add("hot");
    setTimeout(function () { drop.classList.remove("hot"); }, 500);
    recalc(["mat", "time"]);
    toast("Analyzed " + base.n + " — watertight mesh, no repairs needed.");
  }
  drop.addEventListener("click", pickSample);
  drop.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickSample(); }
  });
  ["dragover", "dragenter"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("hot"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("hot"); });
  });
  drop.addEventListener("drop", pickSample);

  $("#order").addEventListener("click", function () {
    $("#quoteId").textContent = String(4100 + Math.floor(Math.random() * 899));
    toast("Slot reserved — " + last.n + " × " + last.mat + " for " + money(last.total) + ".");
  });

  recalc([]);

  /* ---------------- gallery ---------------- */
  var JOBS = [
    { t: "Harvester sensor mount", c: "Bramble Agritech", d: "42 units, jig-drilled inserts", bg: "linear-gradient(150deg,#22303f,#141c26)", col: "#ff9a4d", chips: ["PETG", "Bead blasted", "0.20 mm"], k: "gear" },
    { t: "Anemometer housing", c: "North Reach Labs", d: "Weather-sealed, 6 mating parts", bg: "linear-gradient(150deg,#123840,#0b2026)", col: "#3fd6da", chips: ["Nylon PA12", "Vapor smoothed", "0.12 mm"], k: "cube" },
    { t: "Miniature terrain set", c: "Hollowpine Games", d: "310 pieces, 0.06 mm detail", bg: "linear-gradient(150deg,#2a2440,#171327)", col: "#a99bff", chips: ["Resin 8K", "Primed grey", "0.06 mm"], k: "cone" },
    { t: "Prosthetic grip sleeve", c: "Kestrel Mobility", d: "Shore 95A, 3 sizes", bg: "linear-gradient(150deg,#3a2418,#1e120b)", col: "#ff7a1a", chips: ["TPU 95A", "As printed", "0.24 mm"], k: "torus" },
    { t: "Espresso tamper jig", c: "Ironhorse Coffee", d: "Shop fixture, daily use", bg: "linear-gradient(150deg,#1e2a35,#121820)", col: "#ffc27a", chips: ["PLA Matte", "Sanded 400", "0.20 mm"], k: "cube" },
    { t: "Cable routing spine", c: "Meridian Studio", d: "Wall run, 118 links", bg: "linear-gradient(150deg,#13303a,#0a1a20)", col: "#0fb5ba", chips: ["PETG", "As printed", "0.28 mm"], k: "torus" }
  ];

  var SHAPES = {
    cube: '<path d="M60 14 106 40v52L60 118 14 92V40Z" fill="COL" opacity=".92"/><path d="M14 40 60 66l46-26M60 66v52" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>',
    gear: '<circle cx="60" cy="66" r="34" fill="COL"/><circle cx="60" cy="66" r="13" fill="rgba(0,0,0,.42)"/><g fill="COL"><rect x="53" y="18" width="14" height="16" rx="3"/><rect x="53" y="98" width="14" height="16" rx="3"/><rect x="12" y="59" width="16" height="14" rx="3"/><rect x="92" y="59" width="16" height="14" rx="3"/></g>',
    cone: '<path d="M60 16 96 106H24Z" fill="COL"/><ellipse cx="60" cy="106" rx="36" ry="11" fill="rgba(0,0,0,.32)"/>',
    torus: '<circle cx="60" cy="66" r="36" fill="none" stroke="COL" stroke-width="17"/><ellipse cx="60" cy="66" rx="36" ry="12" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="3"/>'
  };

  $("#gGrid").innerHTML = JOBS.map(function (j) {
    var art = SHAPES[j.k].replace(/COL/g, j.col);
    return '<article class="g-card">' +
      '<div class="g-art" style="background:' + j.bg + '">' +
      '<svg viewBox="0 0 120 132" aria-label="' + j.t + ' render">' + art + '</svg></div>' +
      '<div class="g-body"><h3>' + j.t + '</h3><p>' + j.c + " · " + j.d + '</p>' +
      '<div class="g-chips">' +
      '<span class="chip-s a">' + j.chips[0] + '</span>' +
      '<span class="chip-s b">' + j.chips[1] + '</span>' +
      '<span class="chip-s">' + j.chips[2] + '</span>' +
      '</div></div></article>';
  }).join("");

  /* ---------------- farm status ---------------- */
  var PRINTERS = [
    { id: "LW-01", job: "bracket_v4_rev-c ×42", st: "printing", p: 68 },
    { id: "LW-02", job: "anemometer_shell", st: "printing", p: 31 },
    { id: "LW-03", job: "queue empty", st: "idle", p: 0 },
    { id: "LW-04", job: "terrain_set_batch_9", st: "printing", p: 84 },
    { id: "LW-05", job: "nozzle swap 0.6 mm", st: "maint", p: 45 },
    { id: "LW-06", job: "grip_sleeve_M ×18", st: "printing", p: 12 },
    { id: "LW-07", job: "cable_spine_links", st: "printing", p: 57 },
    { id: "LW-08", job: "tamper_jig_rev2", st: "printing", p: 93 }
  ];
  var LABEL = { printing: "printing", idle: "idle", maint: "maintenance" };
  var CLS = { printing: "s-printing", idle: "s-idle", maint: "s-maint" };
  var pGrid = $("#pGrid");

  function renderFarm() {
    pGrid.innerHTML = PRINTERS.map(function (p) {
      var eta = p.st === "printing"
        ? "ETA " + Math.max(1, Math.round((100 - p.p) * 0.14)) + " h"
        : (p.st === "maint" ? "tech on site" : "ready");
      return '<article class="p-tile ' + p.st + '">' +
        '<div class="p-top"><span class="p-id">' + p.id + '</span>' +
        '<span class="p-state ' + CLS[p.st] + '"><i></i>' + LABEL[p.st] + '</span></div>' +
        '<p class="p-job">' + p.job + '</p>' +
        '<div class="p-bar" role="progressbar" aria-valuenow="' + p.p + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + p.id + ' progress">' +
        '<span class="p-fill" style="width:' + p.p + '%"></span></div>' +
        '<div class="p-meta"><span>' + p.p + "%</span><span>" + eta + '</span></div></article>';
    }).join("");
  }
  renderFarm();

  if (!reduced) {
    setInterval(function () {
      PRINTERS.forEach(function (p) {
        if (p.st !== "printing") return;
        p.p += Math.random() * 3;
        if (p.p >= 100) { p.p = 0; p.job = "job " + (1200 + Math.floor(Math.random() * 799)) + " starting"; }
      });
      PRINTERS.forEach(function (p) { p.p = Math.round(p.p); });
      renderFarm();
    }, 3000);

    var artLayer = $("#artLayer"), lv = 147;
    setInterval(function () {
      lv = lv >= 312 ? 1 : lv + 1;
      artLayer.textContent = lv;
    }, 900);
  }

  /* ---------------- accordion ---------------- */
  $$("#acc .acc-q").forEach(function (q) {
    if (q.getAttribute("aria-expanded") === "true") q.parentElement.classList.add("open");
    q.addEventListener("click", function () {
      var open = q.getAttribute("aria-expanded") === "true";
      $$("#acc .acc-q").forEach(function (o) {
        o.setAttribute("aria-expanded", "false");
        o.parentElement.classList.remove("open");
      });
      if (!open) { q.setAttribute("aria-expanded", "true"); q.parentElement.classList.add("open"); }
    });
  });
})();
