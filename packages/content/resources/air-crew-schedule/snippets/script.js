(function () {
  "use strict";

  // ---------- Data ----------
  var AV_COLORS = ["#0a66c2", "#ff7a33", "#1f9d62", "#7b5cff", "#d4493e", "#0e9aa7", "#b8541c", "#5a6b85"];

  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }

  // Crew roster — flight deck + cabin. dutyMax = max legal duty minutes for the week.
  var crew = [
    { id: "c1", name: "Capt. Elena Marsh", role: "Captain", deck: "flight", base: "JFK", duty: 0, dutyMax: 600, restSince: 720 },
    { id: "c2", name: "Capt. Omar Reyes", role: "Captain", deck: "flight", base: "JFK", duty: 0, dutyMax: 600, restSince: 540 },
    { id: "c3", name: "F/O Priya Nair", role: "First Officer", deck: "flight", base: "JFK", duty: 0, dutyMax: 600, restSince: 660 },
    { id: "c4", name: "F/O Daniel Kovač", role: "First Officer", deck: "flight", base: "JFK", duty: 0, dutyMax: 600, restSince: 480 },
    { id: "c5", name: "F/O Aiko Tanaka", role: "First Officer", deck: "flight", base: "JFK", duty: 0, dutyMax: 600, restSince: 900 },
    { id: "c6", name: "Lena Brandt", role: "Purser", deck: "cabin", base: "JFK", duty: 0, dutyMax: 660, restSince: 600 },
    { id: "c7", name: "Marco Ferraro", role: "Purser", deck: "cabin", base: "JFK", duty: 0, dutyMax: 660, restSince: 420 },
    { id: "c8", name: "Sofia Almeida", role: "Cabin Crew", deck: "cabin", base: "JFK", duty: 0, dutyMax: 660, restSince: 780 },
    { id: "c9", name: "Hassan Idris", role: "Cabin Crew", deck: "cabin", base: "JFK", duty: 0, dutyMax: 660, restSince: 510 },
    { id: "c10", name: "Grace Okonkwo", role: "Cabin Crew", deck: "cabin", base: "JFK", duty: 0, dutyMax: 660, restSince: 690 },
    { id: "c11", name: "Tom Castellano", role: "Cabin Crew", deck: "cabin", base: "JFK", duty: 0, dutyMax: 660, restSince: 350 }
  ];
  crew.forEach(function (c, i) { c.color = AV_COLORS[i % AV_COLORS.length]; });

  // Flights. each needs flight-deck (Captain + F/O) and cabin (Purser + Cabin Crew) roles.
  // dur = block minutes; rolesNeeded: list of {role, n}
  var flights = [
    { id: "f1", no: "SA118", from: "JFK", to: "LHR", day: "Mon", dep: "21:40", arr: "09:30", dur: 410 },
    { id: "f2", no: "SA204", from: "JFK", to: "CDG", day: "Tue", dep: "19:05", arr: "08:25", dur: 430 },
    { id: "f3", no: "SA336", from: "JFK", to: "DUB", day: "Wed", dep: "20:15", arr: "07:10", dur: 375 },
    { id: "f4", no: "SA119", from: "LHR", to: "JFK", day: "Thu", dep: "11:20", arr: "14:35", dur: 460 },
    { id: "f5", no: "SA512", from: "JFK", to: "LIS", day: "Fri", dep: "22:00", arr: "09:50", dur: 395 }
  ];

  var REQUIRED = [
    { role: "Captain", n: 1 },
    { role: "First Officer", n: 1 },
    { role: "Purser", n: 1 },
    { role: "Cabin Crew", n: 3 }
  ];

  // assignments keyed by "flightId|role|index" -> crewId
  var assign = {};

  // legality thresholds
  var MIN_REST = 600; // minutes rest needed before duty
  var WARN_REST = 720;

  // ---------- Seed a realistic partial roster ----------
  function seed() {
    var pre = {
      "f1|Captain|0": "c1", "f1|First Officer|0": "c3",
      "f1|Purser|0": "c6", "f1|Cabin Crew|0": "c8", "f1|Cabin Crew|1": "c9",
      "f2|Captain|0": "c2", "f2|First Officer|0": "c4",
      "f2|Purser|0": "c7", "f2|Cabin Crew|0": "c10",
      "f3|Captain|0": "c1", "f3|First Officer|0": "c5",
      "f3|Purser|0": "c6", "f3|Cabin Crew|0": "c11", "f3|Cabin Crew|1": "c8",
      "f4|Captain|0": "c2", "f4|First Officer|0": "c3",
      "f4|Purser|0": "c7", "f4|Cabin Crew|0": "c9", "f4|Cabin Crew|1": "c10", "f4|Cabin Crew|2": "c8",
      "f5|Captain|0": "c1", "f5|Purser|0": "c6"
    };
    Object.keys(pre).forEach(function (k) { assign[k] = pre[k]; });
    recompute();
  }

  // ---------- Derived state ----------
  function crewById(id) { return crew.filter(function (c) { return c.id === id; })[0]; }
  function flightById(id) { return flights.filter(function (f) { return f.id === id; })[0]; }

  // recompute each crew member's duty minutes from current assignments
  function recompute() {
    crew.forEach(function (c) { c.duty = 0; c.legs = 0; });
    Object.keys(assign).forEach(function (k) {
      var c = crewById(assign[k]);
      if (!c) return;
      var f = flightById(k.split("|")[0]);
      c.duty += f.dur;
      c.legs += 1;
    });
  }

  // Is crew member legal for a flight? returns {status:'ok'|'warn'|'block', reason}
  function legality(c, flight) {
    // already on this flight in another seat? block (shouldn't double-book)
    var dbl = Object.keys(assign).some(function (k) {
      return assign[k] === c.id && k.split("|")[0] === flight.id;
    });
    if (dbl) return { status: "block", reason: "Already rostered on this flight" };
    var newDuty = c.duty + flight.dur;
    if (newDuty > c.dutyMax) {
      return { status: "block", reason: "Exceeds weekly duty limit (" + fmtHm(newDuty) + " / " + fmtHm(c.dutyMax) + ")" };
    }
    if (c.restSince < MIN_REST) {
      return { status: "block", reason: "Insufficient rest — " + fmtHm(c.restSince) + " since last duty (min " + fmtHm(MIN_REST) + ")" };
    }
    if (c.restSince < WARN_REST || newDuty > c.dutyMax * 0.85) {
      return { status: "warn", reason: "Tight rest / high duty load — review before publishing" };
    }
    return { status: "ok", reason: "Within all duty & rest limits" };
  }

  // duty load class for a crew row
  function dutyClass(c) {
    if (c.duty > c.dutyMax) return "over";
    if (c.duty > c.dutyMax * 0.85 || c.restSince < WARN_REST) return "warn";
    return "";
  }

  function fmtHm(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + "h" + (m ? " " + (m < 10 ? "0" : "") + m + "m" : "");
  }

  // count rest/duty warnings across roster
  function warningCount() {
    var n = 0;
    crew.forEach(function (c) {
      if (c.legs > 0 && (c.duty > c.dutyMax * 0.85 || c.restSince < WARN_REST)) n++;
      if (c.duty > c.dutyMax) n++;
    });
    return n;
  }

  // ---------- Rendering ----------
  var board = document.getElementById("board");
  var activeRole = "all";

  function visibleCrew() {
    if (activeRole === "all") return crew;
    return crew.filter(function (c) { return c.role === activeRole; });
  }

  var ARROW = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var WARNICO = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 3 2 20h20L12 3Zm0 6v5m0 3h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function render() {
    recompute();
    var vc = visibleCrew();
    board.style.gridTemplateColumns = "minmax(168px, 230px) repeat(" + flights.length + ", minmax(150px, 1fr))";
    var html = "";

    // header row
    html += '<div class="cell head corner">' +
      '<div class="flight-day">Flight</div><div class="flight-no">Crew &middot; ' + crew[0].base + '</div></div>';
    flights.forEach(function (f) {
      html += '<div class="cell head">' +
        '<div class="flight-h">' +
        '<div class="flight-day">' + f.day + '</div>' +
        '<div class="flight-no">' + f.no + '</div>' +
        '<div class="flight-route tab">' + f.from + ' ' + ARROW + ' ' + f.to + '</div>' +
        '<div class="flight-time tab">' + f.dep + '&ndash;' + f.arr + ' &middot; ' + fmtHm(f.dur) + '</div>' +
        '</div></div>';
    });

    // crew rows
    vc.forEach(function (c) {
      var dc = dutyClass(c);
      var pct = Math.min(100, Math.round((c.duty / c.dutyMax) * 100));
      html += '<div class="cell crew-h">' +
        '<span class="avatar" style="background:' + c.color + '">' + initials(c.name) + '</span>' +
        '<div class="crew-meta">' +
        '<div class="crew-name">' + c.name + '</div>' +
        '<div class="crew-sub"><span class="role-tag ' + c.deck + '">' + shortRole(c.role) + '</span>' +
        '<span class="tab">' + fmtHm(c.duty) + '</span></div>' +
        '<div class="duty ' + dc + '"><i style="width:' + pct + '%"></i></div>' +
        '<div class="duty-lbl tab"><b>' + pct + '%</b> of ' + fmtHm(c.dutyMax) + ' &middot; rest ' + fmtHm(c.restSince) + '</div>' +
        '</div></div>';

      flights.forEach(function (f) {
        html += renderSlot(c, f);
      });
    });

    board.innerHTML = html;
    bindSlots();
    updateKpis();
  }

  function renderSlot(c, f) {
    // which required role does this crew fill on this flight? find key matching crew role
    var req = REQUIRED.filter(function (r) { return r.role === c.role; })[0];
    if (!req) {
      return '<div class="cell"><span class="empty-cell">&mdash;</span></div>';
    }
    // find an assignment key for this crew on this flight, OR an open index for assign
    var assignedKey = null;
    for (var i = 0; i < req.n; i++) {
      if (assign[f.id + "|" + c.role + "|" + i] === c.id) { assignedKey = f.id + "|" + c.role + "|" + i; break; }
    }
    if (assignedKey) {
      var warned = c.restSince < WARN_REST || c.duty > c.dutyMax * 0.85 || c.duty > c.dutyMax;
      return '<div class="cell"><div class="slot" tabindex="0" role="button" ' +
        'data-key="' + assignedKey + '" data-flight="' + f.id + '" data-crew="' + c.id + '" data-mode="detail" ' +
        'aria-label="View duty: ' + c.name + ' on ' + f.no + '">' +
        '<div class="assigned ' + (warned ? "warned" : "") + '">' +
        '<span class="avatar mini-av" style="background:' + c.color + '">' + initials(c.name) + '</span>' +
        '<span class="a-name">' + shortName(c.name) + '</span>' +
        (warned ? '<span class="a-warn">' + WARNICO + '</span>' : '') +
        '</div></div></div>';
    }
    // open slot (only show as open if this flight still needs this role)
    if (openIndex(f, c.role) === -1) {
      return '<div class="cell"><span class="empty-cell">&mdash;</span></div>';
    }
    return '<div class="cell"><div class="slot" tabindex="0" role="button" ' +
      'data-flight="' + f.id + '" data-role="' + c.role + '" data-mode="assign" ' +
      'aria-label="Assign ' + c.role + ' to ' + f.no + '">' +
      '<div class="open">+ Assign ' + shortRole(c.role) + '</div></div></div>';
  }

  // find first open index for a role on a flight, -1 if full
  function openIndex(f, role) {
    var req = REQUIRED.filter(function (r) { return r.role === role; })[0];
    if (!req) return -1;
    for (var i = 0; i < req.n; i++) {
      if (!assign[f.id + "|" + role + "|" + i]) return i;
    }
    return -1;
  }

  function shortRole(r) {
    return { "Captain": "CPT", "First Officer": "F/O", "Purser": "PSR", "Cabin Crew": "CC" }[r] || r;
  }
  function shortName(n) {
    return n.replace(/^(Capt\.|F\/O)\s+/, "");
  }

  function updateKpis() {
    var assigned = Object.keys(assign).length;
    var totalSlots = 0;
    flights.forEach(function (f) {
      REQUIRED.forEach(function (r) { totalSlots += r.n; });
    });
    document.getElementById("kpiAssigned").textContent = assigned;
    document.getElementById("kpiOpen").textContent = totalSlots - assigned;
    document.getElementById("kpiWarn").textContent = warningCount();
  }

  // ---------- Slot interaction ----------
  function bindSlots() {
    var slots = board.querySelectorAll(".slot");
    Array.prototype.forEach.call(slots, function (el) {
      el.addEventListener("click", onSlot);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSlot.call(el); }
      });
    });
  }

  function onSlot() {
    var mode = this.getAttribute("data-mode");
    var fId = this.getAttribute("data-flight");
    if (mode === "assign") {
      openAssign(fId, this.getAttribute("data-role"));
    } else {
      openDetail(this.getAttribute("data-key"), fId, this.getAttribute("data-crew"));
    }
  }

  // ---------- Drawer ----------
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  var drawerBody = document.getElementById("drawerBody");
  var drawerTitle = document.getElementById("drawerTitle");

  function showDrawer() {
    scrim.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }
  function hideDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
  }
  scrim.addEventListener("click", hideDrawer);
  document.getElementById("drawerClose").addEventListener("click", hideDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideDrawer(); });

  function flightSummaryHtml(f) {
    return '<div class="flight-summary">' +
      '<div class="fs-route tab">' + f.from + ' ' + ARROW + ' ' + f.to + '</div>' +
      '<div class="fs-meta tab">' + f.no + ' &middot; ' + f.day + ' &middot; ' + f.dep + '&ndash;' + f.arr +
      ' &middot; block ' + fmtHm(f.dur) + '</div></div>';
  }

  function openAssign(fId, role, swapKey) {
    var f = flightById(fId);
    drawerTitle.textContent = swapKey ? "Swap " + role : "Assign " + role;
    var idx = swapKey ? parseInt(swapKey.split("|")[2], 10) : openIndex(f, role);
    var key = swapKey || (fId + "|" + role + "|" + idx);

    // candidates = crew of this role not already on this flight
    var onFlight = {};
    Object.keys(assign).forEach(function (k) {
      if (k.split("|")[0] === fId) onFlight[assign[k]] = true;
    });
    var cands = crew.filter(function (c) {
      return c.role === role && (assign[key] === c.id || !onFlight[c.id]);
    });
    // sort: ok first, then warn, then block; within, by duty asc
    cands.forEach(function (c) { c._leg = legality(c, f); });
    var rank = { ok: 0, warn: 1, block: 2 };
    cands.sort(function (a, b) {
      if (rank[a._leg.status] !== rank[b._leg.status]) return rank[a._leg.status] - rank[b._leg.status];
      return a.duty - b.duty;
    });

    var html = flightSummaryHtml(f);
    html += '<p class="section-label">' + cands.length + ' eligible &middot; ' + role + '</p>';
    cands.forEach(function (c) {
      var lg = c._leg;
      var dis = lg.status === "block" ? "disabled" : "";
      html += '<button class="cand" ' + dis + ' data-assign="' + c.id + '" data-key="' + key + '">' +
        '<span class="avatar" style="background:' + c.color + '">' + initials(c.name) + '</span>' +
        '<span class="c-body"><span class="c-name">' + c.name + '</span>' +
        '<span class="c-sub tab">Duty ' + fmtHm(c.duty) + ' / ' + fmtHm(c.dutyMax) + ' &middot; rest ' + fmtHm(c.restSince) + '</span></span>' +
        '<span class="c-flag ' + lg.status + '">' +
        (lg.status === "ok" ? "OK" : lg.status === "warn" ? "TIGHT" : "BLOCKED") + '</span>' +
        '</button>';
    });
    drawerBody.innerHTML = html;

    Array.prototype.forEach.call(drawerBody.querySelectorAll(".cand"), function (btn) {
      btn.addEventListener("click", function () {
        var cId = btn.getAttribute("data-assign");
        var k = btn.getAttribute("data-key");
        doAssign(k, cId, f, role);
      });
    });
    showDrawer();
  }

  function doAssign(key, crewId, f, role) {
    var prev = assign[key];
    assign[key] = crewId;
    recompute();
    var c = crewById(crewId);
    var lg = legality(c, f);
    render();
    hideDrawer();
    if (lg.status === "warn" || c.restSince < WARN_REST || c.duty > c.dutyMax * 0.85) {
      toast(shortName(c.name) + " assigned to " + f.no + " — rest/duty flagged", "warn");
    } else {
      toast(shortName(c.name) + (prev ? " swapped onto " : " assigned to ") + f.no, "ok");
    }
  }

  function openDetail(key, fId, crewId) {
    var f = flightById(fId);
    var c = crewById(crewId);
    var role = key.split("|")[1];
    drawerTitle.textContent = "Duty detail";
    var warned = c.restSince < WARN_REST || c.duty > c.dutyMax * 0.85;
    var over = c.duty > c.dutyMax;
    // legality for an already-rostered member: judge current standing, no double-count
    var lg = over
      ? { status: "block" }
      : warned
        ? { status: "warn" }
        : { status: "ok" };

    var html = flightSummaryHtml(f);

    if (over || warned) {
      var msg = over
        ? "Weekly duty limit exceeded (" + fmtHm(c.duty) + " / " + fmtHm(c.dutyMax) + "). Reassign before publishing."
        : (c.restSince < WARN_REST
          ? "Rest period below recommended buffer (" + fmtHm(c.restSince) + " vs " + fmtHm(WARN_REST) + ")."
          : "Approaching weekly duty cap. Monitor remaining legs.");
      html += '<div class="warn-banner">' + WARNICO + '<span>' + msg + '</span></div>';
    }

    html += '<p class="section-label">' + role + ' &middot; ' + shortName(c.name) + '</p>';
    html += '<div class="detail-rows">' +
      drow("Role", shortRole(c.role) + " — " + c.role) +
      drow("Base", c.base) +
      drow("Weekly duty", fmtHm(c.duty) + " / " + fmtHm(c.dutyMax)) +
      drow("Legs this week", String(c.legs)) +
      drow("Rest before duty", fmtHm(c.restSince)) +
      drow("Legality", '<span class="pill ' + (lg.status === "ok" ? "ok" : "warn") + '">' +
        (lg.status === "ok" ? "Compliant" : "Review") + '</span>') +
      '</div>';

    html += '<div class="drawer-actions">' +
      '<button class="btn ghost" id="swapBtn" type="button">Swap crew</button>' +
      '<button class="btn primary" id="unassignBtn" type="button">Unassign</button>' +
      '</div>';

    drawerBody.innerHTML = html;
    document.getElementById("swapBtn").addEventListener("click", function () {
      openAssign(fId, role, key);
    });
    document.getElementById("unassignBtn").addEventListener("click", function () {
      delete assign[key];
      recompute();
      render();
      hideDrawer();
      toast(shortName(c.name) + " removed from " + f.no, "warn");
    });
    showDrawer();
  }

  function drow(label, val) {
    return '<div class="drow"><span>' + label + '</span><b>' + val + '</b></div>';
  }

  // ---------- Filters ----------
  Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeRole = chip.getAttribute("data-role");
      render();
    });
  });

  // publish
  document.getElementById("publishBtn").addEventListener("click", function () {
    var w = warningCount();
    var open = parseInt(document.getElementById("kpiOpen").textContent, 10);
    if (open > 0) {
      toast(open + " open slot" + (open > 1 ? "s" : "") + " remain — fill before publishing", "warn");
    } else if (w > 0) {
      toast("Published with " + w + " rest/duty flag" + (w > 1 ? "s" : "") + " noted", "warn");
    } else {
      toast("Roster published — all duties within limits", "ok");
    }
  });

  // ---------- Toast ----------
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var t = document.createElement("div");
    t.className = "toast" + (kind === "warn" ? " warn" : "");
    t.innerHTML = '<span class="tdot"></span>' + msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.style.transition = "opacity .3s ease, transform .3s ease";
      t.style.opacity = "0";
      t.style.transform = "translateY(8px)";
      setTimeout(function () { t.remove(); }, 320);
    }, 2600);
  }

  // ---------- Boot ----------
  seed();
  render();
})();
