(function () {
  "use strict";

  // --- Fictional data ----------------------------------------------------
  var AVATAR_COLORS = ["#1f7a6d", "#e8743b", "#2f9e6f", "#d98a2b", "#155e54", "#cc5d28"];

  var volunteers = [
    { id: 1, name: "Maya Okafor", email: "maya.o@hearthlight.org", role: "Kitchen Lead", hours: 142, status: "active" },
    { id: 2, name: "Diego Marín", email: "diego.m@hearthlight.org", role: "Food Runner", hours: 88, status: "active" },
    { id: 3, name: "Priya Nair", email: "priya.n@hearthlight.org", role: "Greeter", hours: 0, status: "pending" },
    { id: 4, name: "Tom Brennan", email: "tom.b@hearthlight.org", role: "Driver", hours: 64, status: "active" },
    { id: 5, name: "Aisha Rahman", email: "aisha.r@hearthlight.org", role: "Coordinator", hours: 211, status: "active" },
    { id: 6, name: "Leo Fontaine", email: "leo.f@hearthlight.org", role: "Dishwashing", hours: 12, status: "inactive" },
    { id: 7, name: "Grace Wu", email: "grace.w@hearthlight.org", role: "Food Runner", hours: 0, status: "pending" },
    { id: 8, name: "Samuel Idris", email: "samuel.i@hearthlight.org", role: "Prep Cook", hours: 97, status: "active" }
  ];

  var shifts = [
    { id: "morning", name: "Morning prep", time: "7:00 – 10:00", capacity: 3, filled: ["Aisha Rahman", "Samuel Idris"] },
    { id: "lunch", name: "Lunch service", time: "11:00 – 14:00", capacity: 4, filled: ["Maya Okafor", "Diego Marín"] },
    { id: "cleanup", name: "Cleanup crew", time: "14:00 – 16:00", capacity: 3, filled: ["Tom Brennan"] }
  ];

  var MEALS_PER_HOUR = 4;
  var filter = "all";
  var query = "";
  var selectedId = null;
  var nextId = 9;

  // --- Helpers -----------------------------------------------------------
  var $ = function (sel) { return document.querySelector(sel); };
  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }
  function colorFor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
  function statusLabel(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg, ok) {
    toastEl.textContent = msg;
    toastEl.classList.toggle("toast--ok", !!ok);
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  // --- Renderers ---------------------------------------------------------
  function renderStats() {
    var hours = volunteers.reduce(function (a, v) { return a + v.hours; }, 0);
    var active = volunteers.filter(function (v) { return v.status === "active"; }).length;
    var pending = volunteers.filter(function (v) { return v.status === "pending"; }).length;
    animate($("#statHours"), hours);
    animate($("#statActive"), active);
    animate($("#statPending"), pending);
    animate($("#statMeals"), hours * MEALS_PER_HOUR);
  }

  function animate(el, to) {
    var from = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
    if (from === to) { el.textContent = to.toLocaleString(); return; }
    var start = performance.now(), dur = 500;
    (function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  function visibleVolunteers() {
    return volunteers.filter(function (v) {
      if (filter !== "all" && v.status !== filter) return false;
      if (query) {
        var hay = (v.name + " " + v.role).toLowerCase();
        if (hay.indexOf(query) === -1) return false;
      }
      return true;
    });
  }

  function renderTable() {
    var body = $("#vbody");
    var rows = visibleVolunteers();
    body.innerHTML = "";
    $("#emptyRow").hidden = rows.length > 0;

    rows.forEach(function (v) {
      var tr = document.createElement("tr");
      if (v.id === selectedId) tr.classList.add("is-selected");
      tr.dataset.id = v.id;

      var actions = v.status === "pending"
        ? '<button class="btn btn--sm btn--ok" data-act="approve">Approve</button>'
          + '<button class="btn btn--sm btn--ghost" data-act="decline">Decline</button>'
        : '<button class="btn btn--sm btn--ghost" data-act="log">+ Log hrs</button>'
          + '<button class="btn btn--sm btn--ghost" data-act="select">'
          + (v.id === selectedId ? "Selected" : "Select") + '</button>';

      tr.innerHTML =
        '<td><div class="person" data-act="select">'
        + '<span class="avatar" style="background:' + colorFor(v.id) + '">' + initials(v.name) + '</span>'
        + '<span><span class="person__name">' + v.name + '</span><br>'
        + '<span class="person__email">' + v.email + '</span></span></div></td>'
        + '<td>' + v.role + '</td>'
        + '<td class="hours">' + v.hours + '</td>'
        + '<td><span class="status status--' + v.status + '">' + statusLabel(v.status) + '</span></td>'
        + '<td class="actions-col"><div class="row-actions">' + actions + '</div></td>';

      body.appendChild(tr);
    });
  }

  function renderShifts() {
    var wrap = $("#shifts");
    wrap.innerHTML = "";
    shifts.forEach(function (sh) {
      var pct = Math.round((sh.filled.length / sh.capacity) * 100);
      var open = sh.capacity - sh.filled.length;
      var card = document.createElement("div");
      card.className = "shift";
      card.dataset.id = sh.id;

      var slots = sh.filled.map(function (n) {
        return '<span class="slot slot--filled">' + n.split(" ")[0] + "</span>";
      });
      for (var i = 0; i < open; i++) slots.push('<span class="slot">open</span>');

      var canAssign = selectedId !== null && open > 0;
      var assignLabel = open === 0 ? "Shift full"
        : (selectedId === null ? "Select a volunteer first" : "Assign selected →");

      card.innerHTML =
        '<div class="shift__top"><span class="shift__name">' + sh.name + '</span>'
        + '<span class="shift__time">' + sh.time + '</span></div>'
        + '<p class="shift__fill">' + sh.filled.length + ' / ' + sh.capacity + ' filled · '
        + open + ' open</p>'
        + '<div class="bar"><span class="bar__fill" style="width:' + pct + '%"></span></div>'
        + '<div class="shift__slots">' + slots.join("") + '</div>'
        + '<button class="btn btn--sm shift__assign" data-assign="' + sh.id + '"'
        + (canAssign ? "" : " disabled") + '>' + assignLabel + '</button>';

      wrap.appendChild(card);
    });
  }

  function renderAll() {
    renderStats();
    renderTable();
    renderShifts();
  }

  // --- Actions -----------------------------------------------------------
  function findById(id) {
    for (var i = 0; i < volunteers.length; i++) if (volunteers[i].id === id) return volunteers[i];
    return null;
  }

  function approve(v) { v.status = "active"; toast(v.name + " approved — welcome aboard!", true); renderAll(); }
  function decline(v) {
    volunteers = volunteers.filter(function (x) { return x.id !== v.id; });
    if (selectedId === v.id) selectedId = null;
    toast(v.name + "'s application was declined.");
    renderAll();
  }
  function logHours(v) {
    v.hours += 3;
    toast("+3 hours logged for " + v.name + ".", true);
    renderAll();
  }
  function select(v) {
    if (v.status === "pending") { toast("Approve " + v.name + " before assigning shifts."); return; }
    selectedId = (selectedId === v.id) ? null : v.id;
    renderTable();
    renderShifts();
  }
  function assign(shiftId) {
    var v = findById(selectedId);
    if (!v) return;
    var sh = shifts.filter(function (s) { return s.id === shiftId; })[0];
    if (!sh || sh.filled.length >= sh.capacity) return;
    if (sh.filled.indexOf(v.name) !== -1) { toast(v.name + " is already on this shift."); return; }
    sh.filled.push(v.name);
    if (v.status === "inactive") v.status = "active";
    toast(v.name + " assigned to " + sh.name + ".", true);
    selectedId = null;
    renderAll();
  }

  function addVolunteer() {
    var name = (window.prompt("New volunteer name:", "") || "").trim();
    if (!name) return;
    var role = (window.prompt("Role (e.g. Food Runner):", "Greeter") || "Greeter").trim();
    var first = name.toLowerCase().split(/\s+/)[0];
    volunteers.unshift({
      id: nextId++, name: name, email: first + "@hearthlight.org",
      role: role, hours: 0, status: "pending"
    });
    filter = "all";
    syncChips();
    toast(name + " added — pending approval.", true);
    renderAll();
  }

  // --- Events ------------------------------------------------------------
  function syncChips() {
    document.querySelectorAll(".chip").forEach(function (c) {
      c.classList.toggle("is-active", c.dataset.filter === filter);
    });
  }

  document.querySelector(".filters").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    filter = chip.dataset.filter;
    syncChips();
    renderTable();
  });

  $("#search").addEventListener("input", function (e) {
    query = e.target.value.trim().toLowerCase();
    renderTable();
  });

  $("#vbody").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    var tr = e.target.closest("tr");
    if (!tr) return;
    var v = findById(parseInt(tr.dataset.id, 10));
    if (!v) return;
    var act = btn ? btn.dataset.act : null;
    if (act === "approve") approve(v);
    else if (act === "decline") decline(v);
    else if (act === "log") logHours(v);
    else if (act === "select") select(v);
  });

  $("#shifts").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-assign]");
    if (!btn || btn.disabled) return;
    assign(btn.dataset.assign);
  });

  $("#addBtn").addEventListener("click", addVolunteer);

  renderAll();
})();
