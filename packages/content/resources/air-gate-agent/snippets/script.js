(function () {
  "use strict";

  // ---------- Data ----------
  var LOAD = 186;

  // Boarding groups, in order. Group index that is currently "open".
  var groups = [
    { id: 1, name: "Group 1 — First & Business", note: "Rows 1–6", state: "done" },
    { id: 2, name: "Group 2 — Priority & Sky Elite", note: "Rows 7–14", state: "open" },
    { id: 3, name: "Group 3 — Main Cabin", note: "Rows 15–28", state: "wait" },
    { id: 4, name: "Group 4 — Economy", note: "Rows 29–40", state: "wait" },
    { id: 5, name: "Group 5 — Basic", note: "Standby & rear", state: "wait" }
  ];

  // Passenger manifest. group = boarding group they belong to.
  var firstNames = ["Amara", "Tomas", "Wei", "Noor", "Diego", "Ingrid", "Kwame", "Sofia",
    "Raj", "Lena", "Mateo", "Yuki", "Omar", "Freya", "Hassan", "Priya", "Lukas", "Aiko",
    "Carlos", "Nadia", "Finn", "Zara", "Bjorn", "Mira", "Theo", "Anaya"];
  var lastNames = ["Okafor", "Reyes", "Zhang", "Haddad", "Moreau", "Berg", "Mensah", "Costa",
    "Patel", "Novak", "Silva", "Tanaka", "Farouk", "Lindqvist", "Ali", "Rao", "Hofer", "Sato",
    "Vega", "Kovac", "Walsh", "Khan", "Eriksen", "Devi", "Klein", "Sharma"];
  var cabins = ["First", "Business", "Economy", "Economy", "Economy"];

  function seatLabel(i) {
    var row = Math.floor(i / 6) + 1;
    var col = "ABCDEF"[i % 6];
    return row + col;
  }

  var passengers = [];
  for (var i = 0; i < 64; i++) {
    var g = i < 4 ? 1 : i < 14 ? 2 : i < 34 ? 3 : i < 52 ? 4 : 5;
    var cabin = g === 1 ? "First" : g === 2 ? "Business" : "Economy";
    passengers.push({
      id: i,
      seat: seatLabel(i),
      name: firstNames[i % firstNames.length] + " " + lastNames[(i * 7) % lastNames.length],
      group: g,
      cabin: cabin,
      boarded: g === 1, // group 1 already boarded
      flag: i === 9 ? "dupe" : null // one seat-duplicate to demo
    });
  }
  // Pre-mark group 1 boarded count into the running total below.

  var queue = [
    { id: "q1", kind: "upgrade", name: "Priya Rao", from: "Economy 22C", to: "Business 4A", seat: "4A" },
    { id: "q2", kind: "standby", name: "Marcus Hale", from: "Standby #1", to: "—", seat: "—" },
    { id: "q3", kind: "standby", name: "Ella Bright", from: "Standby #2", to: "—", seat: "—" }
  ];

  var counters = { accepted: 0, standby: 0, flagged: 0 };
  var manifestFilter = "all";
  var searchTerm = "";
  var scannedDupe = false;

  // ---------- DOM ----------
  var $ = function (s) { return document.querySelector(s); };
  var boardedCountEl = $("#boardedCount");
  var boardBar = $("#boardBar");
  var flightStatusEl = $("#flightStatus");
  $("#loadCount").textContent = LOAD;

  // ---------- Helpers ----------
  function boardedTotal() {
    return passengers.filter(function (p) { return p.boarded; }).length;
  }
  // virtual baseline so the counter feels like a full flight, not just the 64 sample rows
  var virtualBase = 0;

  function updateBoarded() {
    var n = boardedTotal() + virtualBase;
    if (n > LOAD) n = LOAD;
    boardedCountEl.textContent = n;
    var pct = Math.min(100, Math.round((n / LOAD) * 100));
    boardBar.style.width = pct + "%";
    if (pct >= 100) {
      flightStatusEl.textContent = "Boarding complete";
      flightStatusEl.className = "pill pill-departed";
    }
  }

  function activeGroup() {
    return groups.find(function (g) { return g.state === "open"; });
  }

  function toast(msg, kind) {
    var wrap = $("#toastWrap");
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("leaving");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  // ---------- Render: groups ----------
  function renderGroups() {
    var list = $("#groupList");
    list.innerHTML = "";
    groups.forEach(function (g) {
      var li = document.createElement("li");
      li.className = "group-row" + (g.state === "open" ? " is-open" : g.state === "done" ? " is-done" : "");
      var stateTxt = g.state === "open" ? "Boarding" : g.state === "done" ? "Done" : "Waiting";
      li.innerHTML =
        '<span class="gr-badge">' + g.id + "</span>" +
        '<span class="gr-info"><strong>' + g.name + "</strong><span>" + g.note + "</span></span>" +
        '<span class="gr-state ' + (g.state === "open" ? "open" : g.state === "done" ? "done" : "wait") + '">' + stateTxt + "</span>";
      list.appendChild(li);
    });
    var ag = activeGroup();
    $("#activeGroupTag").textContent = ag ? ag.id : "—";
    var btn = $("#nextGroupBtn");
    btn.disabled = !ag || ag.id === groups[groups.length - 1].id ? false : false;
    if (!ag) { btn.disabled = true; btn.textContent = "All groups open"; }
    if (ag) {
      $("#groupsNote").textContent =
        "Group " + ag.id + " now boarding. Scans outside the open group route to standby.";
    } else {
      $("#groupsNote").textContent = "All boarding groups are open. Final call.";
    }
  }

  function openNextGroup() {
    var ag = activeGroup();
    if (!ag) { toast("All groups already open.", "warn"); return; }
    ag.state = "done";
    var idx = groups.indexOf(ag);
    if (idx + 1 < groups.length) {
      groups[idx + 1].state = "open";
      toast("Group " + groups[idx + 1].id + " is now boarding.");
    } else {
      toast("Final group cleared. Last call.", "warn");
    }
    renderGroups();
  }

  // ---------- Render: queue ----------
  function renderQueue() {
    var list = $("#queueList");
    list.innerHTML = "";
    $("#queueCount").textContent = queue.length;
    if (!queue.length) {
      var empty = document.createElement("li");
      empty.className = "q-empty";
      empty.textContent = "Queue cleared — no one waiting.";
      list.appendChild(empty);
      return;
    }
    queue.forEach(function (q) {
      var li = document.createElement("li");
      li.className = "q-row";
      li.dataset.id = q.id;
      li.innerHTML =
        '<span class="q-kind ' + q.kind + '">' + (q.kind === "upgrade" ? "UPG" : "SBY") + "</span>" +
        '<span class="q-info"><strong>' + q.name + "</strong><span>" + q.from + (q.to !== "—" ? " → " + q.to : "") + "</span></span>" +
        '<span class="q-seat">' + q.seat + "</span>";
      list.appendChild(li);
    });
  }

  function clearNextStandby() {
    if (!queue.length) { toast("Queue is already empty.", "warn"); return; }
    var item = queue[0];
    var row = $('#queueList .q-row[data-id="' + item.id + '"]');
    // find an open seat for standby; upgrades already carry a target seat
    var seat = item.seat !== "—" ? item.seat : assignOpenSeat();
    if (row) {
      row.classList.add("leaving");
      setTimeout(function () { finishClear(item, seat); }, 340);
    } else {
      finishClear(item, seat);
    }
  }

  function assignOpenSeat() {
    var taken = {};
    passengers.forEach(function (p) { taken[p.seat] = true; });
    for (var r = 28; r <= 40; r++) {
      for (var c = 0; c < 6; c++) {
        var s = r + "ABCDEF"[c];
        if (!taken[s]) return s;
      }
    }
    return "—";
  }

  function finishClear(item, seat) {
    queue.shift();
    // add the cleared passenger to manifest as boarded
    passengers.push({
      id: 1000 + Math.floor(Math.random() * 9999),
      seat: seat,
      name: item.name,
      group: 5,
      cabin: item.kind === "upgrade" ? "Business" : "Economy",
      boarded: true,
      flag: null
    });
    counters.accepted++;
    updateCounters();
    renderQueue();
    renderManifest();
    updateBoarded();
    toast(item.name + " cleared into seat " + seat + ".");
  }

  // ---------- Render: counters ----------
  function updateCounters() {
    $("#cAccepted").textContent = counters.accepted;
    $("#cStandby").textContent = counters.standby;
    $("#cFlagged").textContent = counters.flagged;
  }

  // ---------- Render: manifest ----------
  function renderManifest() {
    var list = $("#manList");
    list.innerHTML = "";
    var rows = passengers.filter(function (p) {
      if (manifestFilter === "boarded" && !p.boarded) return false;
      if (manifestFilter === "not-boarded" && p.boarded) return false;
      if (searchTerm) {
        var t = searchTerm.toLowerCase();
        if (p.name.toLowerCase().indexOf(t) === -1 && p.seat.toLowerCase().indexOf(t) === -1) return false;
      }
      return true;
    });
    if (!rows.length) {
      var empty = document.createElement("li");
      empty.className = "man-empty";
      empty.textContent = "No passengers match this view.";
      list.appendChild(empty);
      return;
    }
    rows.slice(0, 40).forEach(function (p) {
      var li = document.createElement("li");
      li.className = "man-row" + (p.boarded ? " boarded" : "");
      var pill = p.boarded
        ? '<span class="pill pill-ontime pill-sm">Boarded</span>'
        : p.flag === "dupe"
          ? '<span class="pill pill-flagged pill-sm">Seat dupe</span>'
          : '<span class="pill pill-delayed pill-sm">Not boarded</span>';
      li.innerHTML =
        '<span class="man-seat">' + p.seat + "</span>" +
        '<span class="man-id"><strong>' + p.name + "</strong><span>Group " + p.group + "</span></span>" +
        '<span class="man-cabin">' + p.cabin + "</span>" +
        pill;
      list.appendChild(li);
    });
  }

  // ---------- Scan logic ----------
  function nextScanCandidate() {
    var ag = activeGroup();
    var openId = ag ? ag.id : 99;
    // priority: unboarded in open group, then the seat-dupe demo, then any unboarded
    var inGroup = passengers.filter(function (p) { return !p.boarded && p.group === openId && !p.flag; });
    if (inGroup.length) return { pax: inGroup[0], verdict: "accept" };

    var dupe = passengers.filter(function (p) { return !p.boarded && p.flag === "dupe"; });
    if (dupe.length && !scannedDupe) { scannedDupe = true; return { pax: dupe[0], verdict: "dupe" }; }

    var outGroup = passengers.filter(function (p) { return !p.boarded && p.group > openId && !p.flag; });
    if (outGroup.length) return { pax: outGroup[0], verdict: "standby" };

    var anyLeft = passengers.filter(function (p) { return !p.boarded && !p.flag; });
    if (anyLeft.length) return { pax: anyLeft[0], verdict: "accept" };

    return null;
  }

  function showResult(pax, verdict) {
    var stage = $("#scanStage");
    $("#scanIdle").hidden = true;
    $("#scanResult").hidden = false;
    stage.classList.remove("ok", "warn", "danger");

    $("#srSeat").textContent = pax.seat;
    $("#srName").textContent = pax.name;
    $("#srGroup").textContent = "Group " + pax.group + " · " + pax.cabin;

    var badge = $("#srBadge");
    var msg = $("#srMsg");

    if (verdict === "accept") {
      stage.classList.add("ok");
      badge.textContent = "Accepted";
      msg.textContent = "Welcome aboard — seat " + pax.seat + " confirmed.";
      pax.boarded = true;
      counters.accepted++;
      toast(pax.name + " boarded · seat " + pax.seat + ".");
    } else if (verdict === "standby") {
      stage.classList.add("warn");
      badge.textContent = "Standby — wrong group";
      msg.textContent = pax.name + " is Group " + pax.group + ". Routed to standby until that group opens.";
      counters.standby++;
      if (!queue.some(function (q) { return q.name === pax.name; })) {
        queue.push({ id: "sb" + pax.id, kind: "standby", name: pax.name, from: "Held — Group " + pax.group, to: "—", seat: "—" });
      }
      toast(pax.name + " sent to standby (Group " + pax.group + ").", "warn");
    } else if (verdict === "dupe") {
      stage.classList.add("danger");
      badge.textContent = "Seat duplicate";
      msg.textContent = "Seat " + pax.seat + " is already assigned. Hold passenger for reseat.";
      counters.flagged++;
      toast("Seat conflict on " + pax.seat + " — flagged.", "danger");
    }

    updateCounters();
    updateBoarded();
    renderManifest();
    renderQueue();
  }

  function doScan() {
    var c = nextScanCandidate();
    if (!c) {
      toast("Manifest fully processed.", "warn");
      var stage = $("#scanStage");
      stage.classList.remove("ok", "warn", "danger");
      $("#scanIdle").hidden = false;
      $("#scanResult").hidden = true;
      return;
    }
    showResult(c.pax, c.verdict);
  }

  function manualOverride() {
    // resolve the flagged seat-dupe by reseating to an open seat
    var dupe = passengers.filter(function (p) { return p.flag === "dupe" && !p.boarded; })[0];
    if (!dupe) { toast("Nothing pending manual override.", "warn"); return; }
    var seat = assignOpenSeat();
    dupe.flag = null;
    dupe.seat = seat;
    dupe.boarded = true;
    counters.flagged = Math.max(0, counters.flagged - 1);
    counters.accepted++;
    updateCounters();
    updateBoarded();
    renderManifest();
    var stage = $("#scanStage");
    stage.classList.remove("danger");
    stage.classList.add("ok");
    $("#srBadge").textContent = "Reseated";
    $("#srSeat").textContent = seat;
    $("#srMsg").textContent = "Override applied — " + dupe.name + " reseated to " + seat + ".";
    toast(dupe.name + " reseated to " + seat + " by override.");
  }

  // ---------- Events ----------
  $("#scanBtn").addEventListener("click", doScan);
  $("#overrideBtn").addEventListener("click", manualOverride);
  $("#nextGroupBtn").addEventListener("click", openNextGroup);
  $("#clearStandbyBtn").addEventListener("click", clearNextStandby);

  Array.prototype.forEach.call(document.querySelectorAll(".man-filter .chip"), function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".man-filter .chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      manifestFilter = chip.dataset.filter;
      renderManifest();
    });
  });

  $("#manSearch").addEventListener("input", function (e) {
    searchTerm = e.target.value.trim();
    renderManifest();
  });

  // ---------- Init ----------
  // Seed a virtual baseline so the boarded counter reflects a busy gate:
  // group 1 (4 sample rows boarded) + ~38 phantom early boarders.
  virtualBase = 38;
  renderGroups();
  renderQueue();
  renderManifest();
  updateCounters();
  updateBoarded();
})();
