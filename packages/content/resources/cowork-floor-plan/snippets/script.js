(function () {
  "use strict";

  /* ---------- Fictional space data ---------- */
  var members = [
    "Mara Osei", "Tomás Vidal", "Priya Nandakumar", "Felix Brandt", "Aiko Tanaka",
    "Devon Marsh", "Lena Hofer", "Samuel Adeyemi", "Noor Haddad", "Rafa Quirós",
    "Ingrid Sø", "Bao Nguyen", "Cleo Marchetti", "Jonah Reyes", "Wren Calloway",
    "Yara Sabbagh", "Otto Lindqvist", "Hana Park", "Milo Fenwick", "Sofia Duarte"
  ];

  var zonesDef = [
    { id: "commons", name: "The Commons", type: "Hot desk", cols: 3, count: 9 },
    { id: "focus",   name: "Focus Wing",  type: "Quiet desk", cols: 3, count: 9 },
    { id: "studio",  name: "Maker Studio", type: "Studio bench", cols: 2, count: 6 },
    { id: "rooms",   name: "Meeting Rooms", type: "Room", cols: 2, count: 4, room: true }
  ];

  var roomNames = ["The Boiler Room", "Greenhouse", "Loft 2A", "The Annex"];

  var statuses = ["free", "occupied", "reserved"];
  function rand(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rand(arr.length)]; }

  function randStatus() {
    var r = Math.random();
    if (r < 0.5) return "occupied";
    if (r < 0.72) return "reserved";
    return "free";
  }

  function randUntil() {
    var h = 9 + rand(9);
    var m = pick([0, 15, 30, 45]);
    var ap = h >= 12 ? "pm" : "am";
    var hh = h > 12 ? h - 12 : h;
    return hh + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }

  /* ---------- Build seat model ---------- */
  var seats = [];
  zonesDef.forEach(function (z) {
    for (var i = 0; i < z.count; i++) {
      var st = z.room ? pick(["free", "occupied", "reserved"]) : randStatus();
      var label = z.room ? roomNames[i] : (z.name.split(" ")[1] || z.name).slice(0, 1).toUpperCase() + "-" + (i + 1);
      seats.push({
        id: z.id + "-" + i,
        zone: z.id,
        zoneName: z.name,
        type: z.type,
        room: !!z.room,
        label: z.room ? roomNames[i] : label,
        status: st,
        member: st === "free" ? null : pick(members),
        until: st === "free" ? null : randUntil()
      });
    }
  });

  /* ---------- Render plan ---------- */
  var plan = document.getElementById("plan");
  var seatEls = {};

  zonesDef.forEach(function (z) {
    var zEl = document.createElement("div");
    zEl.className = "zone";
    zEl.dataset.zone = z.id;
    zEl.innerHTML =
      '<div class="zone-head"><h4>' + z.name + '</h4>' +
      '<span class="zone-occ" data-occ="' + z.id + '"></span></div>' +
      '<div class="seats cols-' + z.cols + '" data-seats="' + z.id + '"></div>';
    plan.appendChild(zEl);

    var seatWrap = zEl.querySelector("[data-seats]");
    seats.filter(function (s) { return s.zone === z.id; }).forEach(function (s) {
      var btn = document.createElement("button");
      btn.className = "seat" + (s.room ? " room" : "");
      btn.dataset.status = s.status;
      btn.dataset.id = s.id;
      btn.type = "button";
      btn.textContent = s.room ? "" : s.label;
      btn.setAttribute("aria-label", "");
      seatWrap.appendChild(btn);
      seatEls[s.id] = btn;
      updateAria(s);
    });
  });

  function seatById(id) {
    for (var i = 0; i < seats.length; i++) if (seats[i].id === id) return seats[i];
    return null;
  }
  function statusLabel(st) { return st === "free" ? "Free" : st === "occupied" ? "In use" : "Reserved"; }

  function updateAria(s) {
    var el = seatEls[s.id];
    if (!el) return;
    var desc = s.label + ", " + statusLabel(s.status);
    if (s.member) desc += ", " + s.member + " until " + s.until;
    el.setAttribute("aria-label", desc);
  }

  /* ---------- Stats ---------- */
  function recompute() {
    var counts = { free: 0, occupied: 0, reserved: 0 };
    var total = seats.length;
    seats.forEach(function (s) { counts[s.status]++; });
    var used = counts.occupied + counts.reserved;
    var pct = Math.round((used / total) * 100);

    document.getElementById("capFill").style.width = pct + "%";
    document.getElementById("capPct").textContent = pct + "%";
    document.getElementById("capCount").textContent = used + " / " + total + " seats";
    document.getElementById("freeCount").textContent = counts.free;
    document.getElementById("occCount").textContent = counts.occupied;
    document.getElementById("resCount").textContent = counts.reserved;

    zonesDef.forEach(function (z) {
      var zSeats = seats.filter(function (s) { return s.zone === z.id; });
      var zUsed = zSeats.filter(function (s) { return s.status !== "free"; }).length;
      var zPct = Math.round((zUsed / zSeats.length) * 100);
      var occEl = plan.querySelector('[data-occ="' + z.id + '"]');
      if (occEl) occEl.textContent = zUsed + "/" + zSeats.length + " in use";
    });

    renderZoneList();
  }

  function renderZoneList() {
    var list = document.getElementById("zoneList");
    list.innerHTML = "";
    zonesDef.forEach(function (z) {
      var zSeats = seats.filter(function (s) { return s.zone === z.id; });
      var zUsed = zSeats.filter(function (s) { return s.status !== "free"; }).length;
      var zPct = Math.round((zUsed / zSeats.length) * 100);
      var li = document.createElement("li");
      li.className = "zone-row";
      li.innerHTML =
        '<div class="zr-top"><span class="zr-name">' + z.name + '</span>' +
        '<span class="zr-val">' + zPct + '%</span></div>' +
        '<div class="zr-bar"><div class="zr-fill' + (zPct >= 75 ? " hot" : "") + '" style="width:' + zPct + '%"></div></div>';
      list.appendChild(li);
    });
  }

  /* ---------- Detail panel ---------- */
  var selectedId = null;
  function showDetail(s) {
    document.getElementById("detailEmpty").hidden = true;
    var body = document.getElementById("detailBody");
    body.hidden = false;

    var statusEl = document.getElementById("detStatus");
    statusEl.textContent = statusLabel(s.status);
    statusEl.className = "detail-status " + s.status;

    document.getElementById("detName").textContent = s.label;
    document.getElementById("detZone").textContent = s.zoneName;
    document.getElementById("detType").textContent = s.type;

    var memberRow = document.getElementById("detMemberRow");
    var untilRow = document.getElementById("detUntilRow");
    if (s.member) {
      memberRow.style.display = "";
      untilRow.style.display = "";
      document.getElementById("detMember").textContent = s.member;
      document.getElementById("detUntil").textContent = s.until;
    } else {
      memberRow.style.display = "none";
      untilRow.style.display = "none";
    }

    var btn = document.getElementById("bookBtn");
    if (s.status === "free") {
      btn.disabled = false;
      btn.textContent = "Reserve " + s.label;
    } else if (s.status === "reserved") {
      btn.disabled = true;
      btn.textContent = "Already reserved";
    } else {
      btn.disabled = true;
      btn.textContent = "Occupied right now";
    }
    btn.dataset.id = s.id;
  }

  function selectSeat(id) {
    if (selectedId && seatEls[selectedId]) seatEls[selectedId].classList.remove("is-selected");
    selectedId = id;
    var s = seatById(id);
    if (seatEls[id]) seatEls[id].classList.add("is-selected");
    showDetail(s);
  }

  document.getElementById("bookBtn").addEventListener("click", function () {
    var s = seatById(this.dataset.id);
    if (!s || s.status !== "free") return;
    s.status = "reserved";
    s.member = "You";
    s.until = randUntil();
    seatEls[s.id].dataset.status = "reserved";
    seatEls[s.id].classList.add("flash");
    setTimeout(function () { seatEls[s.id].classList.remove("flash"); }, 700);
    updateAria(s);
    recompute();
    showDetail(s);
    applyFilters();
    toast(s.label + " reserved &middot; held for you until " + s.until);
  });

  /* ---------- Floating tip ---------- */
  var tip = document.getElementById("tip");
  function positionTip(e, s) {
    document.getElementById("tipName").textContent = s.label + " · " + statusLabel(s.status);
    var meta = s.member ? s.member + " until " + s.until : s.type + " · available now";
    document.getElementById("tipMeta").textContent = meta;
    tip.hidden = false;
    var r = e.currentTarget.getBoundingClientRect();
    tip.style.left = (r.left + r.width / 2) + "px";
    tip.style.top = r.top + "px";
  }

  /* ---------- Wire seat events ---------- */
  Object.keys(seatEls).forEach(function (id) {
    var el = seatEls[id];
    el.addEventListener("click", function () { selectSeat(id); });
    el.addEventListener("mouseenter", function (e) { positionTip(e, seatById(id)); });
    el.addEventListener("mouseleave", function () { tip.hidden = true; });
    el.addEventListener("focus", function (e) { positionTip(e, seatById(id)); });
    el.addEventListener("blur", function () { tip.hidden = true; });
  });

  /* ---------- Filters ---------- */
  var activeStatus = "all";
  var activeZone = "all";

  function applyFilters() {
    seats.forEach(function (s) {
      var el = seatEls[s.id];
      var statusOk = activeStatus === "all" || s.status === activeStatus;
      var zoneOk = activeZone === "all" || s.zone === activeZone;
      el.classList.toggle("hidden", !(statusOk && zoneOk));
    });
    document.querySelectorAll(".zone").forEach(function (z) {
      z.classList.toggle("dim", activeZone !== "all" && z.dataset.zone !== activeZone);
    });
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      activeStatus = chip.dataset.status;
      applyFilters();
    });
  });

  document.getElementById("zoneSel").addEventListener("change", function () {
    activeZone = this.value;
    applyFilters();
  });

  /* ---------- Zoom ---------- */
  var zoom = 1;
  var ZMIN = 0.7, ZMAX = 1.6;
  function applyZoom() {
    plan.style.transform = "scale(" + zoom + ")";
    document.getElementById("zoomLabel").textContent = Math.round(zoom * 100) + "%";
  }
  function setZoom(z) { zoom = Math.min(ZMAX, Math.max(ZMIN, Math.round(z * 100) / 100)); applyZoom(); }
  document.getElementById("zoomIn").addEventListener("click", function () { setZoom(zoom + 0.15); });
  document.getElementById("zoomOut").addEventListener("click", function () { setZoom(zoom - 0.15); });
  document.getElementById("zoomReset").addEventListener("click", function () { setZoom(1); });

  document.getElementById("planStage").addEventListener("wheel", function (e) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? 0.12 : -0.12));
  }, { passive: false });

  /* ---------- Live simulation ---------- */
  function tick() {
    var movable = seats.filter(function (s) { return s.member !== "You"; });
    var changes = 1 + rand(2);
    for (var i = 0; i < changes; i++) {
      var s = pick(movable);
      var prev = s.status;
      var next = pick(statuses.filter(function (x) { return x !== prev; }));
      s.status = next;
      if (next === "free") { s.member = null; s.until = null; }
      else { s.member = pick(members); s.until = randUntil(); }
      var el = seatEls[s.id];
      el.dataset.status = next;
      el.classList.add("flash");
      (function (e) { setTimeout(function () { e.classList.remove("flash"); }, 700); })(el);
      updateAria(s);
      if (s.id === selectedId) showDetail(s);
    }
    recompute();
    applyFilters();
  }

  /* ---------- Toast ---------- */
  var stack = document.getElementById("toastStack");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="t-dot"></span><span></span>';
    t.querySelector("span:last-child").innerHTML = msg;
    stack.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 320);
    }, 3200);
  }

  /* ---------- Init ---------- */
  recompute();
  applyFilters();
  applyZoom();
  setTimeout(function () { tick(); }, 2500);
  setInterval(tick, 4200);
})();
