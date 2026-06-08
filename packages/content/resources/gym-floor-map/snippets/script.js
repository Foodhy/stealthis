(function () {
  "use strict";

  // ---- Data: zones, equipment, capacity ----
  var ZONES = {
    "free-weights": {
      title: "Free Weights",
      eyebrow: "Strength Floor",
      cap: 48,
      equipment: [
        { name: "Power Rack #1", sub: "Eleiko platform", base: "in-use" },
        { name: "Power Rack #2", sub: "Competition bar", base: "free" },
        { name: "Dumbbell Range", sub: "2.5–60 kg", base: "in-use" },
        { name: "Flat Bench Cluster", sub: "4 stations", base: "free" },
        { name: "Incline Bench", sub: "Adjustable", base: "free" },
        { name: "Deadlift Platform", sub: "Bumper plates", base: "in-use" }
      ]
    },
    "machines": {
      title: "Machines",
      eyebrow: "Pin-Loaded",
      cap: 52,
      equipment: [
        { name: "Leg Press", sub: "45° sled", base: "in-use" },
        { name: "Lat Pulldown", sub: "Dual handle", base: "free" },
        { name: "Cable Crossover", sub: "Twin stack", base: "in-use" },
        { name: "Chest Press", sub: "Converging", base: "free" },
        { name: "Hack Squat", sub: "Linear bearing", base: "maint" },
        { name: "Seated Row", sub: "Plate-loaded", base: "free" }
      ]
    },
    "cardio": {
      title: "Cardio",
      eyebrow: "Conditioning",
      cap: 44,
      equipment: [
        { name: "Treadmills", sub: "8 units", base: "in-use" },
        { name: "Assault Bikes", sub: "6 units", base: "free" },
        { name: "Rowing Ergs", sub: "Concept2 x5", base: "in-use" },
        { name: "Stair Climbers", sub: "4 units", base: "free" },
        { name: "Ski Ergs", sub: "3 units", base: "free" }
      ]
    },
    "rig": {
      title: "Functional / Rig",
      eyebrow: "Open Training",
      cap: 30,
      equipment: [
        { name: "Pull-Up Rig", sub: "12 stations", base: "in-use" },
        { name: "Kettlebell Wall", sub: "8–48 kg", base: "free" },
        { name: "Sled Track", sub: "20 m turf", base: "free" },
        { name: "Battle Ropes", sub: "2 anchors", base: "in-use" },
        { name: "Plyo Boxes", sub: "Stackable", base: "free" }
      ]
    },
    "studio-a": {
      title: "Studio A",
      eyebrow: "Group Class",
      cap: 26,
      equipment: [
        { name: "Spin Bikes", sub: "Coach Mara — 18:00", base: "in-use" },
        { name: "Yoga Mats", sub: "30 available", base: "free" },
        { name: "Sound System", sub: "Class mode", base: "in-use" },
        { name: "Resistance Bands", sub: "Full set", base: "free" }
      ]
    },
    "lockers": {
      title: "Locker Rooms",
      eyebrow: "Amenities",
      cap: 0,
      equipment: [
        { name: "Lockers (North)", sub: "120 units", base: "free" },
        { name: "Showers", sub: "10 stalls", base: "in-use" },
        { name: "Sauna", sub: "Open · 80°C", base: "free" },
        { name: "Towel Station", sub: "Restocked 17:30", base: "free" }
      ]
    }
  };

  var TOTAL_CAP = Object.keys(ZONES).reduce(function (s, k) { return s + ZONES[k].cap; }, 0);

  var simBusy = false;

  // ---- Helpers ----
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // Deterministic occupancy fraction per zone, nudged by busy simulation.
  var SEED = { "free-weights": 0.62, "machines": 0.4, "cardio": 0.78, "rig": 0.33, "studio-a": 0.88, "lockers": 0.25 };

  function occFraction(key) {
    var base = SEED[key];
    if (simBusy) base = clamp(base + 0.28, 0, 0.99);
    return base;
  }

  function occLevel(frac) {
    if (frac >= 0.7) return "busy";
    if (frac >= 0.4) return "moderate";
    return "quiet";
  }

  var LEVEL_LABEL = { busy: "Busy", moderate: "Moderate", quiet: "Quiet" };

  function zoneInUse(key) {
    var z = ZONES[key];
    if (z.cap === 0) return 0;
    return Math.round(z.equipment.filter(function (e) {
      var s = effectiveStatus(e);
      return s === "in-use";
    }).length / z.equipment.length * z.cap * occFraction(key) / Math.max(occFraction(key), 0.5));
  }

  // Equipment status flips toward "in-use" under busy simulation.
  function effectiveStatus(e) {
    if (e.base === "maint") return "maint";
    if (simBusy && e.base === "free" && (e.name.charCodeAt(0) % 2 === 0)) return "in-use";
    return e.base;
  }

  // ---- Render zones on the map ----
  function paintZones() {
    $$(".zone").forEach(function (btn) {
      var key = btn.getAttribute("data-zone");
      var z = ZONES[key];
      var frac = occFraction(key);
      var lvl = occLevel(frac);
      btn.setAttribute("data-occ", lvl);
      btn.setAttribute("aria-label", z.title + " — " + LEVEL_LABEL[lvl] + " occupancy");
      var countEl = $(".z-count", btn);
      if (countEl) countEl.textContent = z.equipment.length;
    });
  }

  // ---- Gauge ----
  var CIRC = 2 * Math.PI * 52; // r=52
  var gaugeFill = $("#gaugeFill");
  var gaugePct = $("#gaugePct");
  var gaugeHead = $("#gaugeHead");
  var gaugeStatus = $("#gaugeStatus");

  function currentHeadcount() {
    // Weighted estimate across zones with capacity.
    var total = 0;
    Object.keys(ZONES).forEach(function (key) {
      var z = ZONES[key];
      total += z.cap * occFraction(key);
    });
    return Math.round(total);
  }

  function updateGauge() {
    var head = currentHeadcount();
    var pct = clamp(Math.round(head / TOTAL_CAP * 100), 0, 100);
    gaugeFill.style.strokeDashoffset = String(CIRC * (1 - pct / 100));
    gaugePct.textContent = pct + "%";
    gaugeHead.textContent = head + " / " + TOTAL_CAP;

    var lvl = occLevel(pct / 100);
    var color = lvl === "busy" ? "var(--danger)" : lvl === "moderate" ? "var(--warn)" : "var(--neon)";
    gaugeFill.style.stroke = color;
    gaugeStatus.textContent =
      lvl === "busy" ? "Busy — peak hours" :
      lvl === "moderate" ? "Moderate — steady flow" :
      "Quiet — plenty of space";
  }

  // ---- Panel ----
  var activeKey = null;
  var panelEmpty = $("#panelEmpty");
  var panelBody = $("#panelBody");

  function openPanel(key) {
    var z = ZONES[key];
    activeKey = key;

    $$(".zone").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-zone") === key ? "true" : "false");
    });

    var frac = occFraction(key);
    var lvl = occLevel(frac);

    $("#panelEyebrow").textContent = z.eyebrow;
    $("#panelTitle").textContent = z.title;
    var badge = $("#panelBadge");
    badge.textContent = LEVEL_LABEL[lvl];
    badge.setAttribute("data-occ", lvl);

    var inUse = z.equipment.filter(function (e) { return effectiveStatus(e) === "in-use"; }).length;
    var maint = z.equipment.filter(function (e) { return effectiveStatus(e) === "maint"; }).length;
    var free = z.equipment.length - inUse - maint;

    $("#statOcc").textContent = inUse;
    $("#statTotal").textContent = z.equipment.length;
    $("#statFree").textContent = free;

    var list = $("#equipList");
    list.innerHTML = "";
    z.equipment.forEach(function (e, i) {
      var s = effectiveStatus(e);
      var li = document.createElement("li");
      li.style.animationDelay = (i * 35) + "ms";
      var label = s === "free" ? "Free" : s === "in-use" ? "In use" : "Service";
      var cls = s === "free" ? "free" : s === "in-use" ? "in-use" : "maint";
      li.innerHTML =
        '<span><span class="e-name">' + e.name + '</span>' +
        '<span class="e-sub">' + e.sub + '</span></span>' +
        '<span class="pill ' + cls + '">' + label + '</span>';
      list.appendChild(li);
    });

    panelEmpty.hidden = true;
    panelBody.hidden = false;
  }

  // ---- Wire up zones ----
  $$(".zone").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openPanel(btn.getAttribute("data-zone"));
    });
  });

  // ---- Simulation toggle ----
  var simBtn = $("#simBtn");
  simBtn.addEventListener("click", function () {
    simBusy = !simBusy;
    simBtn.setAttribute("aria-pressed", String(simBusy));
    simBtn.lastChild.textContent = simBusy ? " Live conditions" : " Simulate busy hour";
    paintZones();
    updateGauge();
    if (activeKey) openPanel(activeKey);
    toast(simBusy ? "Busy-hour simulation on — occupancy climbing" : "Back to live conditions");
  });

  // ---- Clock ----
  function tick() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, "0");
    var m = String(d.getMinutes()).padStart(2, "0");
    $("#clock").textContent = h + ":" + m;
  }

  // ---- Init ----
  paintZones();
  updateGauge();
  tick();
  setInterval(tick, 30000);
})();
