(function () {
  "use strict";

  var ALR = 145; // average labor rate $/hr

  // --- Data: per-tech, per-timeframe (billed hours). Available derived. ---
  var TECHS = [
    {
      id: "mreyes", name: "Marisol Reyes", bay: "Bay 1 · Master Tech", role: "ASE Master · Diagnostics",
      color: "#ff6a13",
      hours: { day: 8.4, week: 41.2, month: 168.5 },
      avail: { day: 8, week: 40, month: 172 },
      jobs:  { day: 5, week: 24, month: 96 },
      certs: ["ASE Master", "L1 Adv. Engine", "EV/HEV", "A/C 609"],
      orders: [
        { veh: "'21 RAM 1500", plate: "GHK-4471", code: "P0301 · Misfire", status: "inprogress", label: "In Progress", hrs: 2.4 },
        { veh: "'19 Civic Si", plate: "8TRV029", code: "Brake job", status: "waiting", label: "Waiting", hrs: 1.6 },
        { veh: "'22 F-150", plate: "TCK-9920", code: "Diagnostic", status: "done", label: "Done", hrs: 1.1 }
      ]
    },
    {
      id: "dpham", name: "Davis Pham", bay: "Bay 2 · A-Tech",
      role: "ASE A-Tech · Driveability", color: "#2b7fff",
      hours: { day: 7.9, week: 39.6, month: 159.0 },
      avail: { day: 8, week: 40, month: 172 },
      jobs:  { day: 6, week: 27, month: 104 },
      certs: ["ASE A6", "ASE A8", "TPMS"],
      orders: [
        { veh: "'18 Camry LE", plate: "RDX-1188", code: "Timing chain", status: "inprogress", label: "In Progress", hrs: 4.2 },
        { veh: "'20 CX-5", plate: "MZD-5521", code: "Oil + filter", status: "done", label: "Done", hrs: 0.6 }
      ]
    },
    {
      id: "tbright", name: "Tony Brightwater", bay: "Bay 3 · B-Tech",
      role: "ASE B-Tech · General Service", color: "#2f9e6f",
      hours: { day: 6.8, week: 35.1, month: 142.3 },
      avail: { day: 8, week: 40, month: 172 },
      jobs:  { day: 7, week: 31, month: 121 },
      certs: ["ASE A4", "ASE A5", "Alignment"],
      orders: [
        { veh: "'17 Altima", plate: "9PLM034", code: "Tie rod + align", status: "inprogress", label: "In Progress", hrs: 2.0 },
        { veh: "'23 Telluride", plate: "KIA-7783", code: "Rotation", status: "waiting", label: "Waiting", hrs: 0.5 }
      ]
    },
    {
      id: "klindqv", name: "Karin Lindqvist", bay: "Bay 4 · A-Tech",
      role: "ASE A-Tech · Electrical", color: "#e0962a",
      hours: { day: 6.1, week: 33.8, month: 137.0 },
      avail: { day: 8, week: 40, month: 172 },
      jobs:  { day: 4, week: 19, month: 78 },
      certs: ["ASE A6", "EV/HEV", "ADAS"],
      orders: [
        { veh: "'22 Model 3", plate: "TSL-0042", code: "ADAS calib.", status: "hold", label: "On Hold", hrs: 3.0 },
        { veh: "'16 Wrangler", plate: "JP-3340", code: "Parasitic draw", status: "inprogress", label: "In Progress", hrs: 1.8 }
      ]
    },
    {
      id: "oadeyemi", name: "Obi Adeyemi", bay: "Bay 5 · B-Tech",
      role: "ASE B-Tech · Tires & Brakes", color: "#5b6470",
      hours: { day: 5.4, week: 30.2, month: 124.6 },
      avail: { day: 8, week: 40, month: 172 },
      jobs:  { day: 8, week: 34, month: 138 },
      certs: ["ASE A5", "TPMS", "Road Force"],
      orders: [
        { veh: "'19 Outback", plate: "SUB-2210", code: "4 tires + bal.", status: "inprogress", label: "In Progress", hrs: 1.4 },
        { veh: "'21 Sienna", plate: "VAN-6655", code: "Brake pads", status: "done", label: "Done", hrs: 1.0 }
      ]
    },
    {
      id: "jcastle", name: "Jess Castellano", bay: "Bay 6 · Lube Tech",
      role: "Express Lube · Maintenance", color: "#8a929d",
      hours: { day: 4.6, week: 24.9, month: 101.2 },
      avail: { day: 8, week: 40, month: 172 },
      jobs:  { day: 9, week: 41, month: 162 },
      certs: ["Maint. Light", "Fluid Exch."],
      orders: [
        { veh: "'20 Corolla", plate: "ECO-1102", code: "LOF service", status: "done", label: "Done", hrs: 0.5 },
        { veh: "'18 Escape", plate: "FRD-8841", code: "Coolant flush", status: "waiting", label: "Waiting", hrs: 0.7 }
      ]
    }
  ];

  var state = { range: "week", sortKey: "eff", sortDir: -1 };

  var RANGE_LABEL = { day: "today", week: "this week", month: "this month" };

  // --- Helpers ---
  function $(s, c) { return (c || document).querySelector(s); }
  function eff(t) { return t.avail[state.range] ? (t.hours[state.range] / t.avail[state.range]) * 100 : 0; }
  function rev(t) { return t.hours[state.range] * ALR; }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function effColor(e) {
    if (e >= 95) return "#2f9e6f";
    if (e >= 82) return "#ff6a13";
    if (e >= 70) return "#e0962a";
    return "#d4493e";
  }
  function initials(name) {
    return name.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
  }

  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  // --- Sorting ---
  function sortedTechs() {
    var arr = TECHS.slice();
    var k = state.sortKey, dir = state.sortDir;
    arr.sort(function (a, b) {
      var av, bv;
      if (k === "name") { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (k === "eff") { av = eff(a); bv = eff(b); }
      else if (k === "revenue") { av = rev(a); bv = rev(b); }
      else if (k === "billed") { av = a.hours[state.range]; bv = b.hours[state.range]; }
      else if (k === "available") { av = a.avail[state.range]; bv = b.avail[state.range]; }
      else if (k === "jobs") { av = a.jobs[state.range]; bv = b.jobs[state.range]; }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }

  // --- Render: KPI strip ---
  function renderKpis() {
    var billed = 0, avail = 0, jobs = 0, revenue = 0, hold = 0;
    TECHS.forEach(function (t) {
      billed += t.hours[state.range];
      avail += t.avail[state.range];
      jobs += t.jobs[state.range];
      revenue += rev(t);
      t.orders.forEach(function (o) { if (o.status === "hold") hold++; });
    });
    var shopEff = avail ? (billed / avail) * 100 : 0;
    $("#kpiBilled").textContent = billed.toFixed(1) + "h";
    $("#kpiEff").textContent = shopEff.toFixed(0) + "%";
    $("#kpiJobs").textContent = jobs;
    $("#kpiRev").textContent = money(revenue);
    $("#kpiHold").textContent = hold;
    $("#kpiBilledDelta").textContent = shopEff >= 90 ? "+4.1%" : "+1.6%";
    $("#rangeLabel").textContent = RANGE_LABEL[state.range];
  }

  // --- Render: table ---
  function renderTable() {
    var body = $("#techBody");
    body.innerHTML = "";
    sortedTechs().forEach(function (t) {
      var e = eff(t);
      var tr = document.createElement("tr");
      tr.tabIndex = 0;
      tr.setAttribute("role", "button");
      tr.setAttribute("aria-label", "Open detail for " + t.name);
      tr.innerHTML =
        '<td class="td-name">' +
          '<div class="tech-cell">' +
            '<span class="tech-av" style="background:' + t.color + '">' + initials(t.name) + '</span>' +
            '<span class="tech-meta"><span class="tech-name">' + t.name + '</span>' +
            '<span class="tech-bay">' + t.bay + '</span></span>' +
          '</div>' +
        '</td>' +
        '<td class="num">' + t.hours[state.range].toFixed(1) + 'h</td>' +
        '<td class="num col-avail">' + t.avail[state.range].toFixed(0) + 'h</td>' +
        '<td>' +
          '<div class="eff-cell">' +
            '<span class="eff-bar"><span class="eff-fill" style="width:' + Math.min(e, 100) + '%;background:' + effColor(e) + '"></span></span>' +
            '<span class="eff-num" style="color:' + effColor(e) + '">' + e.toFixed(0) + '%</span>' +
          '</div>' +
        '</td>' +
        '<td class="num">' + t.jobs[state.range] + '</td>' +
        '<td class="num col-rev"><span class="rev-num">' + money(rev(t)) + '</span></td>';
      tr.addEventListener("click", function () { openDrawer(t.id); });
      tr.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openDrawer(t.id); }
      });
      body.appendChild(tr);
    });
    // header indicators
    var ths = document.querySelectorAll("#techTable thead th");
    ths.forEach(function (th) {
      th.classList.remove("is-sorted", "asc", "desc");
      th.removeAttribute("aria-sort");
      if (th.dataset.sort === state.sortKey) {
        th.classList.add("is-sorted", state.sortDir === 1 ? "asc" : "desc");
        th.setAttribute("aria-sort", state.sortDir === 1 ? "ascending" : "descending");
      }
    });
  }

  // --- Render: leaderboard ---
  function renderBoard() {
    var ol = $("#board");
    ol.innerHTML = "";
    var ranked = TECHS.slice().sort(function (a, b) { return eff(b) - eff(a); });
    var max = eff(ranked[0]) || 1;
    ranked.forEach(function (t, i) {
      var e = eff(t);
      var li = document.createElement("li");
      li.className = "bd-item";
      li.tabIndex = 0;
      li.innerHTML =
        '<span class="bd-rank">' + (i + 1) + '</span>' +
        '<span class="bd-body">' +
          '<span class="bd-name">' + t.name + '</span>' +
          '<span class="bd-track"><span class="bd-prog" style="width:' + (e / max * 100) + '%"></span></span>' +
        '</span>' +
        '<span class="bd-eff">' + e.toFixed(0) + '%</span>';
      li.addEventListener("click", function () { openDrawer(t.id); });
      li.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openDrawer(t.id); }
      });
      ol.appendChild(li);
    });
  }

  // --- Render: chart ---
  function renderChart() {
    var wrap = $("#chart");
    wrap.innerHTML = "";
    var maxAvail = 0;
    TECHS.forEach(function (t) {
      maxAvail = Math.max(maxAvail, t.avail[state.range], t.hours[state.range]);
    });
    TECHS.forEach(function (t) {
      var col = document.createElement("div");
      col.className = "ch-col";
      var bH = (t.hours[state.range] / maxAvail) * 100;
      var aH = (t.avail[state.range] / maxAvail) * 100;
      col.innerHTML =
        '<div class="ch-bars">' +
          '<div class="ch-bar billed" style="height:0%" data-h="' + bH + '" title="' + t.name + ' billed ' + t.hours[state.range].toFixed(1) + 'h">' +
            '<span class="ch-val">' + t.hours[state.range].toFixed(0) + 'h</span>' +
          '</div>' +
          '<div class="ch-bar avail" style="height:0%" data-h="' + aH + '"></div>' +
        '</div>' +
        '<span class="ch-lab">' + t.name.split(" ")[0] + '</span>';
      col.querySelector(".ch-bar.billed").addEventListener("click", function () { openDrawer(t.id); });
      wrap.appendChild(col);
    });
    // animate next frame
    requestAnimationFrame(function () {
      wrap.querySelectorAll(".ch-bar").forEach(function (b) {
        b.style.height = b.dataset.h + "%";
      });
    });
  }

  // --- Drawer ---
  function openDrawer(id) {
    var t = TECHS.find(function (x) { return x.id === id; });
    if (!t) return;
    var e = eff(t);
    $("#dAvatar").textContent = initials(t.name);
    $("#dAvatar").style.background = t.color;
    $("#dName").textContent = t.name;
    $("#dRole").textContent = t.role;
    $("#dEff").textContent = e.toFixed(0) + "%";
    $("#dBilled").textContent = t.hours[state.range].toFixed(1) + "h";
    $("#dAvail").textContent = t.avail[state.range].toFixed(0) + "h";
    $("#dJobs").textContent = t.jobs[state.range];
    $("#dRev").textContent = money(rev(t));

    var ring = $("#dRing");
    var c = effColor(e);
    ring.style.background = "conic-gradient(" + c + " " + (Math.min(e, 100) * 3.6) + "deg, var(--line) 0)";
    $("#dEff").style.color = c;

    var wo = $("#dWorkOrders");
    wo.innerHTML = "";
    t.orders.forEach(function (o) {
      var li = document.createElement("li");
      li.className = "wo";
      li.innerHTML =
        '<span class="wo-status st-' + o.status + '"></span>' +
        '<span class="wo-main">' +
          '<span class="wo-veh">' + o.veh + '</span>' +
          '<span class="wo-sub">' + o.plate + ' · ' + o.code + ' · ' + o.hrs.toFixed(1) + 'h</span>' +
        '</span>' +
        '<span class="wo-badge st-' + o.status + '">' + o.label + '</span>';
      wo.appendChild(li);
    });

    var chips = $("#dCerts");
    chips.innerHTML = "";
    t.certs.forEach(function (cn) {
      var s = document.createElement("span");
      s.className = "chip";
      s.textContent = cn;
      chips.appendChild(s);
    });

    $("#scrim").hidden = false;
    var drawer = $("#drawer");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    $("#drawerClose").focus();
  }

  function closeDrawer() {
    var drawer = $("#drawer");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    setTimeout(function () { $("#scrim").hidden = true; }, 280);
  }

  // --- Render all ---
  function renderAll() {
    renderKpis();
    renderTable();
    renderBoard();
    renderChart();
  }

  // --- Events ---
  document.querySelectorAll(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      document.querySelectorAll(".seg-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.removeAttribute("aria-pressed");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      state.range = btn.dataset.range;
      renderAll();
      toast("Showing " + RANGE_LABEL[state.range]);
    });
  });

  document.querySelectorAll("#techTable thead th").forEach(function (th) {
    th.addEventListener("click", function () {
      var k = th.dataset.sort;
      if (state.sortKey === k) {
        state.sortDir *= -1;
      } else {
        state.sortKey = k;
        state.sortDir = k === "name" ? 1 : -1;
      }
      renderTable();
    });
  });

  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") closeDrawer();
  });

  $("#exportBtn").addEventListener("click", function () {
    toast("Productivity report (" + RANGE_LABEL[state.range] + ") queued for export");
  });

  // init
  renderAll();
})();
