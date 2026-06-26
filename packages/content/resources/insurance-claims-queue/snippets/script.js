(function () {
  "use strict";

  var ME = "Dana Okafor";

  // SLA target in days per priority
  var SLA = { high: 3, medium: 7, low: 14 };
  var PRI_RANK = { high: 3, medium: 2, low: 1 };

  var STATUS_CLASS = {
    "New": "badge--new",
    "In review": "badge--review",
    "Inspection": "badge--inspection",
    "Awaiting docs": "badge--docs",
    "Approved": "badge--approved"
  };

  // Realistic placeholder dataset
  var claims = [
    { number: "CLM-48217", claimant: "Marcus Halloway", policy: "AUTO-77120", type: "Auto", amount: 8450, age: 5, priority: "high", status: "Inspection", adjuster: "Priya Nair", incident: "Rear-end collision, I-90 onramp", filed: "Jun 17" },
    { number: "CLM-48209", claimant: "Elena Vasquez", policy: "HOME-30418", type: "Property", amount: 23900, age: 9, priority: "high", status: "Awaiting docs", adjuster: null, incident: "Kitchen fire, smoke damage", filed: "Jun 13" },
    { number: "CLM-48231", claimant: "Theodore Brandt", policy: "AUTO-77910", type: "Auto", amount: 3120, age: 1, priority: "low", status: "New", adjuster: null, incident: "Hail damage to windshield", filed: "Jun 21" },
    { number: "CLM-48198", claimant: "Aisha Rahman", policy: "HLTH-55203", type: "Health", amount: 1480, age: 12, priority: "medium", status: "In review", adjuster: "Dana Okafor", incident: "Outpatient procedure reimbursement", filed: "Jun 10" },
    { number: "CLM-48224", claimant: "Grace Lindqvist", policy: "TRVL-90011", type: "Travel", amount: 2240, age: 3, priority: "medium", status: "New", adjuster: null, incident: "Trip cancellation, medical", filed: "Jun 19" },
    { number: "CLM-48176", claimant: "Omar Said", policy: "LIAB-12044", type: "Liability", amount: 14750, age: 16, priority: "high", status: "In review", adjuster: "Dana Okafor", incident: "Slip-and-fall, retail premises", filed: "Jun 06" },
    { number: "CLM-48240", claimant: "Beatrice Okonkwo", policy: "HOME-30802", type: "Property", amount: 6890, age: 2, priority: "low", status: "New", adjuster: null, incident: "Water damage, burst pipe", filed: "Jun 20" },
    { number: "CLM-48205", claimant: "Henrik Sorensen", policy: "AUTO-78033", type: "Auto", amount: 11200, age: 8, priority: "medium", status: "Inspection", adjuster: "Priya Nair", incident: "Side-impact at intersection", filed: "Jun 14" },
    { number: "CLM-48190", claimant: "Carla Mendez", policy: "HLTH-55719", type: "Health", amount: 970, age: 11, priority: "low", status: "Approved", adjuster: "Dana Okafor", incident: "Specialist visit claim", filed: "Jun 11" },
    { number: "CLM-48236", claimant: "Jonas Weber", policy: "TRVL-90245", type: "Travel", amount: 1650, age: 1, priority: "medium", status: "New", adjuster: null, incident: "Lost baggage, international", filed: "Jun 21" },
    { number: "CLM-48162", claimant: "Sofia Petrova", policy: "LIAB-12190", type: "Liability", amount: 31500, age: 19, priority: "high", status: "Awaiting docs", adjuster: "Marcus Lee", incident: "Property damage dispute", filed: "Jun 03" },
    { number: "CLM-48228", claimant: "Daniel Friedman", policy: "AUTO-78211", type: "Auto", amount: 4380, age: 4, priority: "low", status: "In review", adjuster: null, incident: "Parking lot fender bender", filed: "Jun 18" }
  ];

  var sort = { key: "priority", dir: "desc" };
  var filters = { q: "", type: "", priority: "", status: "", mine: false };

  var rowsEl = document.getElementById("rows");
  var emptyEl = document.getElementById("empty");

  function fmtMoney(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function ageBand(c) {
    var target = SLA[c.priority];
    if (c.age >= target) return "late";
    if (c.age >= target - 2) return "warn";
    return "ok";
  }

  function isOpen(c) {
    return c.status !== "Approved";
  }

  function matches(c) {
    if (filters.type && c.type !== filters.type) return false;
    if (filters.priority && c.priority !== filters.priority) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.mine && c.adjuster !== ME) return false;
    if (filters.q) {
      var q = filters.q.toLowerCase();
      if (c.claimant.toLowerCase().indexOf(q) === -1 &&
          c.number.toLowerCase().indexOf(q) === -1) return false;
    }
    return true;
  }

  function compare(a, b) {
    var v;
    if (sort.key === "priority") v = PRI_RANK[a.priority] - PRI_RANK[b.priority];
    else if (sort.key === "age") v = a.age - b.age;
    else v = a.number < b.number ? -1 : a.number > b.number ? 1 : 0;
    return sort.dir === "asc" ? v : -v;
  }

  function renderStats() {
    var open = claims.filter(isOpen);
    var reserve = open.reduce(function (s, c) { return s + c.amount; }, 0);
    var sla = open.filter(function (c) { return ageBand(c) === "late"; }).length;
    var unassigned = open.filter(function (c) { return !c.adjuster; }).length;
    document.getElementById("statOpen").textContent = open.length;
    document.getElementById("statReserve").textContent = fmtMoney(reserve);
    document.getElementById("statSla").textContent = sla;
    document.getElementById("statUnassigned").textContent = unassigned;
  }

  function priLabel(p) { return p.charAt(0).toUpperCase() + p.slice(1); }

  function render() {
    var list = claims.filter(matches).slice().sort(compare);
    rowsEl.innerHTML = "";
    emptyEl.hidden = list.length !== 0;

    list.forEach(function (c) {
      var tr = document.createElement("tr");
      tr.setAttribute("tabindex", "0");
      tr.dataset.number = c.number;

      var band = ageBand(c);
      var slaTxt = band === "late" ? "SLA breached" : band === "warn" ? "due soon" : "on track";
      var mine = c.adjuster === ME;
      var adjCell = c.adjuster
        ? '<span class="adj' + (mine ? ' adj--mine' : '') + '">' + (mine ? "You" : c.adjuster) + '</span>'
        : '<span class="adj">Unassigned</span>';
      var actionCell = c.adjuster
        ? '<span class="assigned-tick">✓ assigned</span>'
        : '<button type="button" class="assign" data-assign="' + c.number + '">Assign to me</button>';

      tr.innerHTML =
        '<td data-label="Claim #"><span class="cnum">' + c.number + '</span></td>' +
        '<td data-label="Claimant"><span class="claimant"><b>' + c.claimant + '</b><span>' + c.policy + '</span></span></td>' +
        '<td data-label="Type"><span class="type-chip">' + c.type + '</span></td>' +
        '<td data-label="Reserve" class="num"><span class="amount">' + fmtMoney(c.amount) + '</span></td>' +
        '<td data-label="Age"><span class="age age--' + band + '">' + c.age + 'd<small>' + slaTxt + '</small></span></td>' +
        '<td data-label="Priority"><span class="pri pri--' + c.priority + '">' + priLabel(c.priority) + '</span></td>' +
        '<td data-label="Status"><span class="badge ' + STATUS_CLASS[c.status] + '">' + c.status + '</span></td>' +
        '<td data-label="Adjuster">' + adjCell + '</td>' +
        '<td data-label="">' + actionCell + '</td>';

      rowsEl.appendChild(tr);
    });

    renderStats();
    updateSortHeaders();
  }

  function updateSortHeaders() {
    document.querySelectorAll(".th-sort").forEach(function (th) {
      th.classList.remove("asc", "desc");
      if (th.dataset.sort === sort.key) th.classList.add(sort.dir);
    });
  }

  // ----- Drawer -----
  var drawer = document.getElementById("drawer");
  var overlay = document.getElementById("overlay");
  var lastFocus = null;

  function buildTimeline(c) {
    var steps = [
      { t: "Claim filed", m: c.filed + " · by claimant", done: true },
      { t: "Acknowledged", m: c.filed + " · auto-reply sent", done: true },
      { t: "Assigned to adjuster", m: c.adjuster ? (c.adjuster === ME ? "You" : c.adjuster) : "Pending", done: !!c.adjuster },
      { t: "Inspection / review", m: c.status === "Inspection" || c.status === "In review" ? "In progress" : (c.status === "Approved" || c.status === "Awaiting docs" ? "Complete" : "Not started"), done: c.status === "Approved" || c.status === "Awaiting docs" },
      { t: "Estimate / decision", m: c.status === "Approved" ? "Approved · " + fmtMoney(c.amount) : "Awaiting outcome", done: c.status === "Approved" }
    ];
    // mark current
    var currentIdx = -1;
    for (var i = 0; i < steps.length; i++) if (!steps[i].done) { currentIdx = i; break; }
    return steps.map(function (s, i) {
      var cls = s.done ? "done" : (i === currentIdx ? "current" : "");
      return '<li class="' + cls + '"><div class="tl-title">' + s.t + '</div><div class="tl-meta">' + s.m + '</div></li>';
    }).join("");
  }

  function openDrawer(number) {
    var c = claims.filter(function (x) { return x.number === number; })[0];
    if (!c) return;
    lastFocus = document.activeElement;
    document.getElementById("drawerNum").textContent = c.number + " · " + c.type;
    document.getElementById("drawerTitle").textContent = c.claimant;
    var band = ageBand(c);
    var slaTxt = band === "late" ? "SLA breached" : band === "warn" ? "due soon" : "on track";

    document.getElementById("drawerBody").innerHTML =
      '<div class="d-grid">' +
        '<div class="d-cell"><div class="d-k">Reserve</div><div class="d-v big">' + fmtMoney(c.amount) + '</div></div>' +
        '<div class="d-cell"><div class="d-k">Priority</div><div class="d-v"><span class="pri pri--' + c.priority + '">' + priLabel(c.priority) + '</span></div></div>' +
        '<div class="d-cell"><div class="d-k">Policy</div><div class="d-v">' + c.policy + '</div></div>' +
        '<div class="d-cell"><div class="d-k">Age</div><div class="d-v"><span class="age age--' + band + '">' + c.age + ' days · ' + slaTxt + '</span></div></div>' +
        '<div class="d-cell"><div class="d-k">Status</div><div class="d-v"><span class="badge ' + STATUS_CLASS[c.status] + '">' + c.status + '</span></div></div>' +
        '<div class="d-cell"><div class="d-k">Adjuster</div><div class="d-v">' + (c.adjuster ? (c.adjuster === ME ? "You" : c.adjuster) : "Unassigned") + '</div></div>' +
        '<div class="d-cell" style="grid-column:1/-1"><div class="d-k">Incident</div><div class="d-v" style="font-weight:500">' + c.incident + '</div></div>' +
      '</div>' +
      '<h3 class="d-section-title">Claim timeline</h3>' +
      '<ul class="timeline">' + buildTimeline(c) + '</ul>';

    overlay.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      overlay.classList.add("show");
      drawer.classList.add("show");
    });
    document.getElementById("drawerClose").focus();
  }

  function closeDrawer() {
    overlay.classList.remove("show");
    drawer.classList.remove("show");
    drawer.setAttribute("aria-hidden", "true");
    setTimeout(function () { overlay.hidden = true; }, 240);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // ----- Events -----
  document.getElementById("search").addEventListener("input", function (e) {
    filters.q = e.target.value.trim(); render();
  });
  document.getElementById("fType").addEventListener("change", function (e) { filters.type = e.target.value; render(); });
  document.getElementById("fPriority").addEventListener("change", function (e) { filters.priority = e.target.value; render(); });
  document.getElementById("fStatus").addEventListener("change", function (e) { filters.status = e.target.value; render(); });
  document.getElementById("fMine").addEventListener("change", function (e) { filters.mine = e.target.checked; render(); });

  document.querySelectorAll(".th-sort").forEach(function (th) {
    th.addEventListener("click", function () {
      var key = th.dataset.sort;
      if (sort.key === key) sort.dir = sort.dir === "asc" ? "desc" : "asc";
      else { sort.key = key; sort.dir = key === "number" ? "asc" : "desc"; }
      render();
    });
  });

  rowsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-assign]");
    if (btn) {
      e.stopPropagation();
      var c = claims.filter(function (x) { return x.number === btn.dataset.assign; })[0];
      if (c) { c.adjuster = ME; render(); }
      return;
    }
    var tr = e.target.closest("tr");
    if (tr && tr.dataset.number) openDrawer(tr.dataset.number);
  });

  rowsEl.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.tagName === "TR" && e.target.dataset.number) {
      e.preventDefault();
      openDrawer(e.target.dataset.number);
    }
  });

  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("show")) closeDrawer();
  });

  render();
})();
