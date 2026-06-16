/* Master-detail dashboard — Nimbusly (fictional SaaS CRM)
   Vanilla JS only. No libraries. */
(function () {
  "use strict";

  /* ---------- Fictional data ---------- */
  var CUSTOMERS = [
    {
      id: "acme", name: "Acme Atlas Co.", initials: "AC", tone: "brand",
      status: "active", plan: "Enterprise", place: "Seattle, US", since: "2023",
      metric: "$12.4k", mdelta: "+8.4%", up: true,
      mrr: ["$12,480", "▲ 8.4%", true], seats: ["184 / 220", "▲ 12 mo", true],
      health: ["92", "▼ 3 pts", false], tickets: 3,
      api: [320, 410, 380, 520, 610, 580, 690, 720, 660, 810, 870, 920],
      storage: [120, 140, 160, 150, 190, 210, 230, 250, 280, 300, 330, 360],
      spend: [52, 31, 17], spendTotal: "$18.6k",
      timeline: [
        { k: "ok", t: "Plan upgraded to Enterprise", d: "Annual contract, 220 seats", time: "2h ago" },
        { k: "", t: "New integration connected", d: "Slack workspace linked by M. Reyes", time: "Yesterday" },
        { k: "warn", t: "Usage hit 80% of API quota", d: "Auto-alert sent to account owner", time: "3 days ago" },
        { k: "", t: "Quarterly business review", d: "NPS recorded at 64", time: "Last week" }
      ]
    },
    {
      id: "bright", name: "Brightwave Labs", initials: "BL", tone: "accent",
      status: "active", plan: "Growth", place: "Berlin, DE", since: "2022",
      metric: "$6.9k", mdelta: "+3.1%", up: true,
      mrr: ["$6,920", "▲ 3.1%", true], seats: ["88 / 100", "▲ 6 mo", true],
      health: ["87", "▲ 2 pts", true], tickets: 1,
      api: [210, 260, 240, 300, 340, 360, 390, 420, 400, 460, 480, 510],
      storage: [80, 90, 110, 130, 140, 150, 170, 180, 200, 210, 230, 240],
      spend: [44, 38, 18], spendTotal: "$9.4k",
      timeline: [
        { k: "ok", t: "Renewal confirmed", d: "12-month term signed", time: "1d ago" },
        { k: "", t: "Seat count increased", d: "+18 seats added by admin", time: "4 days ago" },
        { k: "", t: "Webhook endpoint added", d: "events.brightwave.io", time: "Last week" }
      ]
    },
    {
      id: "corevia", name: "Corevia Health", initials: "CH", tone: "ink",
      status: "trial", plan: "Trial", place: "Toronto, CA", since: "2026",
      metric: "$0", mdelta: "14d left", up: true,
      mrr: ["$0", "▲ trial", true], seats: ["12 / 25", "▲ new", true],
      health: ["71", "▲ 9 pts", true], tickets: 0,
      api: [40, 60, 90, 120, 150, 180, 210, 240, 280, 310, 340, 380],
      storage: [10, 20, 30, 45, 60, 75, 90, 110, 130, 150, 170, 190],
      spend: [70, 20, 10], spendTotal: "$0",
      timeline: [
        { k: "", t: "Trial started", d: "14-day Growth trial activated", time: "5h ago" },
        { k: "ok", t: "First workflow created", d: "Onboarding milestone reached", time: "5h ago" },
        { k: "", t: "Demo call booked", d: "Scheduled with sales engineer", time: "Yesterday" }
      ]
    },
    {
      id: "delta", name: "Delta Forge Inc.", initials: "DF", tone: "brand",
      status: "active", plan: "Enterprise", place: "Austin, US", since: "2021",
      metric: "$21.0k", mdelta: "+11.2%", up: true,
      mrr: ["$21,040", "▲ 11.2%", true], seats: ["410 / 500", "▲ 40 mo", true],
      health: ["95", "▲ 1 pt", true], tickets: 5,
      api: [560, 640, 700, 760, 820, 880, 910, 970, 1020, 1080, 1140, 1210],
      storage: [300, 340, 380, 420, 460, 500, 540, 580, 620, 660, 700, 740],
      spend: [58, 26, 16], spendTotal: "$31.2k",
      timeline: [
        { k: "warn", t: "5 open support tickets", d: "SLA breach risk on 1 ticket", time: "1h ago" },
        { k: "ok", t: "Expansion deal closed", d: "+90 seats, +$4.2k MRR", time: "2 days ago" },
        { k: "", t: "SSO configured", d: "Okta SAML enabled org-wide", time: "Last week" }
      ]
    },
    {
      id: "ember", name: "Ember Studio", initials: "ES", tone: "warn",
      status: "churned", plan: "Growth", place: "Lisbon, PT", since: "2023",
      metric: "$2.1k", mdelta: "-22%", up: false,
      mrr: ["$2,140", "▼ 22%", false], seats: ["9 / 40", "▼ 11 mo", false],
      health: ["38", "▼ 18 pts", false], tickets: 4,
      api: [180, 170, 150, 130, 120, 100, 90, 80, 70, 60, 50, 40],
      storage: [120, 115, 110, 100, 95, 90, 80, 70, 65, 55, 50, 45],
      spend: [40, 25, 35], spendTotal: "$3.0k",
      timeline: [
        { k: "danger", t: "Health score dropped below 40", d: "Flagged for churn outreach", time: "30m ago" },
        { k: "warn", t: "Seats reduced", d: "-22 seats removed by admin", time: "1 week ago" },
        { k: "", t: "Downgrade requested", d: "Support ticket #4821 opened", time: "2 weeks ago" }
      ]
    },
    {
      id: "fjord", name: "Fjord Analytics", initials: "FA", tone: "accent",
      status: "active", plan: "Growth", place: "Oslo, NO", since: "2024",
      metric: "$5.4k", mdelta: "+5.6%", up: true,
      mrr: ["$5,420", "▲ 5.6%", true], seats: ["64 / 80", "▲ 8 mo", true],
      health: ["83", "▲ 4 pts", true], tickets: 2,
      api: [150, 180, 210, 230, 260, 290, 320, 350, 380, 410, 440, 470],
      storage: [60, 70, 85, 95, 110, 125, 140, 155, 170, 185, 200, 215],
      spend: [50, 34, 16], spendTotal: "$7.1k",
      timeline: [
        { k: "ok", t: "Activated advanced reports", d: "Add-on enabled by data team", time: "3h ago" },
        { k: "", t: "Invited 6 teammates", d: "Pending acceptance", time: "Yesterday" }
      ]
    },
    {
      id: "grove", name: "Grovewright", initials: "GW", tone: "ink",
      status: "trial", plan: "Trial", place: "Dublin, IE", since: "2026",
      metric: "$0", mdelta: "6d left", up: false,
      mrr: ["$0", "▲ trial", true], seats: ["4 / 25", "▲ new", true],
      health: ["59", "▼ 5 pts", false], tickets: 1,
      api: [20, 35, 50, 60, 70, 65, 80, 90, 85, 100, 110, 120],
      storage: [5, 10, 18, 22, 30, 35, 42, 48, 55, 62, 70, 78],
      spend: [60, 30, 10], spendTotal: "$0",
      timeline: [
        { k: "warn", t: "Low trial engagement", d: "No workflows created in 3 days", time: "4h ago" },
        { k: "", t: "Trial started", d: "14-day Growth trial activated", time: "8 days ago" }
      ]
    },
    {
      id: "helio", name: "Helio Robotics", initials: "HR", tone: "brand",
      status: "active", plan: "Enterprise", place: "Tokyo, JP", since: "2020",
      metric: "$18.8k", mdelta: "+6.9%", up: true,
      mrr: ["$18,820", "▲ 6.9%", true], seats: ["360 / 420", "▲ 24 mo", true],
      health: ["90", "▲ 2 pts", true], tickets: 2,
      api: [480, 540, 600, 650, 710, 760, 820, 870, 930, 980, 1040, 1100],
      storage: [260, 290, 320, 350, 380, 410, 440, 470, 500, 530, 560, 590],
      spend: [55, 29, 16], spendTotal: "$27.8k",
      timeline: [
        { k: "ok", t: "Multi-region deploy enabled", d: "APAC data residency configured", time: "5h ago" },
        { k: "", t: "API key rotated", d: "Security policy compliance", time: "2 days ago" },
        { k: "", t: "Custom dashboard shared", d: "12 viewers added", time: "Last week" }
      ]
    }
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var rowsEl = $("#rows");
  var emptyEl = $("#emptyState");
  var countEl = $("#listCount");
  var searchEl = $("#search");
  var body = document.body;

  var state = { filter: "all", query: "", selected: CUSTOMERS[0].id, metric: "api" };

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-show"); }, 2200);
  }

  /* ---------- List rendering ---------- */
  function visibleCustomers() {
    var q = state.query.trim().toLowerCase();
    return CUSTOMERS.filter(function (c) {
      if (state.filter !== "all" && c.status !== state.filter) return false;
      if (q && (c.name + " " + c.place + " " + c.plan).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  var STATUS_LABEL = { active: "Active", trial: "Trial", churned: "At risk" };

  function renderList() {
    var list = visibleCustomers();
    countEl.textContent = String(list.length);
    rowsEl.innerHTML = "";

    if (!list.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    list.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "row" + (c.id === state.selected ? " is-current" : "");
      li.id = "row-" + c.id;
      li.setAttribute("role", "option");
      li.setAttribute("data-id", c.id);
      li.setAttribute("aria-selected", c.id === state.selected ? "true" : "false");
      li.innerHTML =
        '<span class="row__avatar" data-tone="' + c.tone + '" aria-hidden="true">' + c.initials + "</span>" +
        '<div class="row__main">' +
        '<div class="row__name">' + c.name + "</div>" +
        '<div class="row__meta">' +
        '<span class="badge" data-status="' + c.status + '">' + STATUS_LABEL[c.status] + "</span>" +
        '<span class="row__sub">' + c.plan + "</span>" +
        "</div></div>" +
        '<div class="row__metric">' +
        '<div class="row__mval">' + c.metric + "</div>" +
        '<div class="row__mdelta ' + (c.up ? "is-up" : "is-down") + '">' +
        (c.up ? "▲ " : "▼ ") + c.mdelta + "</div></div>";
      rowsEl.appendChild(li);
    });

    // keep aria-activedescendant valid
    if (list.some(function (c) { return c.id === state.selected; })) {
      rowsEl.setAttribute("aria-activedescendant", "row-" + state.selected);
    } else {
      rowsEl.setAttribute("aria-activedescendant", "");
    }
  }

  /* ---------- Sparklines ---------- */
  function sparkPoints(data) {
    var w = 120, h = 32, pad = 2;
    var min = Math.min.apply(null, data), max = Math.max.apply(null, data);
    var span = max - min || 1;
    return data.map(function (v, i) {
      var x = pad + (i / (data.length - 1)) * (w - pad * 2);
      var y = h - pad - ((v - min) / span) * (h - pad * 2);
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
  }

  /* ---------- Bar chart ---------- */
  var MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  function renderBars(c) {
    var data = c[state.metric];
    var grid = $("#usageGrid");
    var bars = $("#usageBars");
    var labels = $("#usageLabels");
    var W = 520, H = 200, padL = 8, padR = 8, padT = 12, padB = 26;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = Math.max.apply(null, data) * 1.1;

    grid.innerHTML = "";
    bars.innerHTML = "";
    labels.innerHTML = "";

    // gridlines (4)
    for (var g = 0; g <= 4; g++) {
      var gy = padT + (g / 4) * plotH;
      grid.innerHTML +=
        '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + gy.toFixed(1) + '"/>';
      var val = Math.round((max * (4 - g)) / 4);
      grid.innerHTML +=
        '<text class="chart__yval" x="' + padL + '" y="' + (gy - 3).toFixed(1) + '">' + val + "</text>";
    }

    var n = data.length;
    var slot = plotW / n;
    var bw = slot * 0.56;
    data.forEach(function (v, i) {
      var bh = (v / max) * plotH;
      var x = padL + i * slot + (slot - bw) / 2;
      var y = padT + plotH - bh;
      var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("class", "bar");
      r.setAttribute("x", x.toFixed(1));
      r.setAttribute("width", bw.toFixed(1));
      r.setAttribute("y", (padT + plotH).toFixed(1));
      r.setAttribute("height", "0");
      r.setAttribute("rx", "3");
      var lbl = (state.metric === "api" ? v + " calls" : v + " GB") + " · " + MONTHS[i];
      r.innerHTML = "<title>" + lbl + "</title>";
      bars.appendChild(r);
      // animate in next frame
      (function (rect, ty, th) {
        requestAnimationFrame(function () {
          rect.setAttribute("y", ty.toFixed(1));
          rect.setAttribute("height", th.toFixed(1));
        });
      })(r, y, bh);

      labels.innerHTML +=
        '<text x="' + (padL + i * slot + slot / 2).toFixed(1) + '" y="' + (H - 8) + '">' + MONTHS[i] + "</text>";
    });
  }

  /* ---------- Donut ---------- */
  function renderDonut(c) {
    var segs = [$("#dSeg1"), $("#dSeg2"), $("#dSeg3")];
    var r = 48, circ = 2 * Math.PI * r;
    var offset = 0;
    var total = c.spend.reduce(function (a, b) { return a + b; }, 0) || 1;
    c.spend.forEach(function (pct, i) {
      var seg = segs[i];
      var len = (pct / total) * circ;
      seg.setAttribute("stroke-dasharray", len.toFixed(2) + " " + (circ - len).toFixed(2));
      seg.setAttribute("stroke-dashoffset", (-offset).toFixed(2));
      offset += len;
    });
    $("#donutTotal").textContent = c.spendTotal;
  }

  /* ---------- Timeline ---------- */
  function renderTimeline(c, animateFirst) {
    var ol = $("#timeline");
    ol.innerHTML = "";
    c.timeline.forEach(function (e, i) {
      var li = document.createElement("li");
      li.className = "tl" + (animateFirst && i === 0 ? " tl--new" : "");
      if (e.k) li.setAttribute("data-kind", e.k);
      li.innerHTML =
        '<div class="tl__top"><span class="tl__title">' + e.t + "</span>" +
        '<time class="tl__time">' + e.time + "</time></div>" +
        '<div class="tl__desc">' + e.d + "</div>";
      ol.appendChild(li);
    });
  }

  /* ---------- Detail rendering ---------- */
  function renderDetail(c, animate) {
    $("#dAvatar").textContent = c.initials;
    $("#dAvatar").setAttribute("data-tone", c.tone);
    $("#dName").textContent = c.name;
    $("#dSub").textContent = c.plan + " · " + c.place + " · since " + c.since;
    var badge = $("#dBadge");
    badge.textContent = STATUS_LABEL[c.status];
    badge.setAttribute("data-status", c.status);

    setKpi("kMrr", "kMrrD", "sparkMrr", c.mrr, c.api);
    setKpi("kSeats", "kSeatsD", "sparkSeats", c.seats, c.storage);
    setKpi("kHealth", "kHealthD", "sparkHealth", c.health, c.api.map(function (v) { return v % 100; }));
    var tk = ["" + c.tickets, "▲ live", c.tickets > 0];
    setKpi("kTickets", "kTicketsD", "sparkTickets", tk, [2, 3, 1, 4, 2, 3, c.tickets]);

    renderBars(c);
    renderDonut(c);
    renderTimeline(c, animate);
  }

  function setKpi(valId, deltaId, sparkId, arr, sparkData) {
    $("#" + valId).textContent = arr[0];
    var d = $("#" + deltaId);
    d.textContent = arr[1];
    d.className = "kpi__delta " + (arr[2] ? "is-up" : "is-down");
    $("#" + sparkId).setAttribute("points", sparkPoints(sparkData));
  }

  /* ---------- Selection ---------- */
  function select(id, opts) {
    opts = opts || {};
    var c = CUSTOMERS.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    state.selected = id;

    $$(".row").forEach(function (r) {
      var on = r.getAttribute("data-id") === id;
      r.classList.toggle("is-current", on);
      r.setAttribute("aria-selected", on ? "true" : "false");
    });
    rowsEl.setAttribute("aria-activedescendant", "row-" + id);

    renderDetail(c, true);

    if (opts.scroll) {
      var el = $("#row-" + id);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
    // mobile: push detail view
    if (opts.push && window.matchMedia("(max-width: 720px)").matches) {
      body.setAttribute("data-view", "detail");
    }
  }

  /* ---------- Keyboard nav on the listbox ---------- */
  function moveSelection(dir) {
    var list = visibleCustomers();
    if (!list.length) return;
    var idx = list.findIndex(function (c) { return c.id === state.selected; });
    if (idx === -1) idx = dir > 0 ? -1 : list.length;
    var next = idx + dir;
    if (next < 0) next = 0;
    if (next > list.length - 1) next = list.length - 1;
    select(list[next].id, { scroll: true });
  }

  /* ---------- Events ---------- */
  rowsEl.addEventListener("click", function (e) {
    var row = e.target.closest(".row");
    if (row) select(row.getAttribute("data-id"), { push: true });
  });

  rowsEl.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSelection(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSelection(-1); }
    else if (e.key === "Home") { e.preventDefault(); var l = visibleCustomers(); if (l[0]) select(l[0].id, { scroll: true }); }
    else if (e.key === "End") { e.preventDefault(); var l2 = visibleCustomers(); if (l2.length) select(l2[l2.length - 1].id, { scroll: true }); }
    else if (e.key === "Enter") { e.preventDefault(); select(state.selected, { push: true }); }
  });

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    renderList();
    // if current selection filtered out, select first visible
    var list = visibleCustomers();
    if (list.length && !list.some(function (c) { return c.id === state.selected; })) {
      select(list[0].id);
    }
  });

  $$(".seg__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".seg__btn").forEach(function (b) {
        b.classList.remove("is-on");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-on");
      btn.setAttribute("aria-selected", "true");
      state.filter = btn.getAttribute("data-filter");
      renderList();
      var list = visibleCustomers();
      if (list.length && !list.some(function (c) { return c.id === state.selected; })) {
        select(list[0].id);
      }
    });
  });

  $$(".chip[data-metric]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".chip[data-metric]").forEach(function (b) {
        b.classList.remove("is-on");
        b.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-on");
      chip.setAttribute("aria-selected", "true");
      state.metric = chip.getAttribute("data-metric");
      var c = CUSTOMERS.filter(function (x) { return x.id === state.selected; })[0];
      if (c) renderBars(c);
    });
  });

  $("#backBtn").addEventListener("click", function () {
    body.setAttribute("data-view", "master");
    var el = $("#row-" + state.selected);
    if (el) el.scrollIntoView({ block: "nearest" });
  });

  $("#msgBtn").addEventListener("click", function () {
    var c = CUSTOMERS.filter(function (x) { return x.id === state.selected; })[0];
    toast("Message drafted to " + c.name);
  });

  $("#renewBtn").addEventListener("click", function () {
    var c = CUSTOMERS.filter(function (x) { return x.id === state.selected; })[0];
    toast("Renewal flow opened for " + c.name);
  });

  $("#logBtn").addEventListener("click", function () {
    var c = CUSTOMERS.filter(function (x) { return x.id === state.selected; })[0];
    c.timeline.unshift({ k: "ok", t: "Note added", d: "Logged by you · just now", time: "Just now" });
    renderTimeline(c, true);
    toast("Note added to timeline");
  });

  // KPI menus + non-functional decorative menus
  document.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("kpi__menu")) {
      toast("Widget options");
    }
  });

  /* ---------- Live ticking: open tickets fluctuate ---------- */
  setInterval(function () {
    var c = CUSTOMERS.filter(function (x) { return x.id === state.selected; })[0];
    if (!c) return;
    // small random walk, clamped 0..6
    var delta = Math.random() < 0.5 ? -1 : 1;
    if (Math.random() < 0.4) {
      c.tickets = Math.max(0, Math.min(6, c.tickets + delta));
      $("#kTickets").textContent = String(c.tickets);
      var d = $("#kTicketsD");
      d.textContent = c.tickets > 0 ? "▲ live" : "✓ clear";
      d.className = "kpi__delta " + (c.tickets > 0 ? "is-up" : "is-down");
    }
  }, 4000);

  /* ---------- Init ---------- */
  renderList();
  select(state.selected);
})();
