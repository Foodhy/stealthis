(function () {
  "use strict";

  /* ---------- Data (fictional) ---------- */
  var vehicles = [
    {
      id: "v1",
      name: "2021 Subaru Outback",
      sub: "2.5i Premium · AWD Wagon",
      plate: "7KX-2840",
      vin: "JF2SKAXC1MH401827",
      odo: 58420,
      cls: "v1",
      status: "inprogress",
      bay: 4,
      stepIndex: 2,
      tech: { initials: "RG", name: "Rosa G." },
      note:
        'Pulled stored code <span class="dtc">P0301</span> — cylinder 1 misfire. Replaced spark plugs &amp; coil pack, road-testing now.',
      quote: {
        id: "EST-4471",
        amount: 612.4,
        lines: [
          { name: "Diagnostic — misfire trace", tag: "labor", amt: 89.0 },
          { name: "Ignition coil pack", tag: "parts", amt: 184.5 },
          { name: "Spark plugs (set of 4)", tag: "parts", amt: 62.0 },
          { name: "Labor — R&R coil + plugs", tag: "labor", amt: 210.0 }
        ],
        approved: false
      },
      reminders: [
        { name: "Oil &amp; filter change", due: "Due in 740 mi", state: "due" },
        { name: "Cabin air filter", due: "Due Sep 2026", state: "" },
        { name: "State safety inspection", due: "Overdue 11 days", state: "overdue" }
      ],
      history: [
        { d: "12", m: "Mar", title: "Brake pads — front", sub: "Inv #INV-3992 · 57,610 mi", amt: 318.0 },
        { d: "04", m: "Jan", title: "Oil change + rotation", sub: "Inv #INV-3710 · 55,120 mi", amt: 96.5 },
        { d: "18", m: "Oct", title: "Battery replacement", sub: "Inv #INV-3401 · 52,880 mi", amt: 224.0 }
      ]
    },
    {
      id: "v2",
      name: "2018 Ford F-150",
      sub: "XLT SuperCrew · 3.5L EcoBoost",
      plate: "TRK-9012",
      vin: "1FTEW1EG5JFA22019",
      odo: 91250,
      cls: "v2",
      status: "ready",
      bay: 2,
      stepIndex: 3,
      tech: { initials: "DM", name: "Devon M." },
      note: "Tire rotation &amp; brake inspection complete. Pads at 6mm front, 7mm rear — all within spec. Ready for pickup.",
      quote: null,
      reminders: [
        { name: "Transmission fluid", due: "Due in 4,800 mi", state: "" },
        { name: "Spark plugs (6)", due: "Due in 8,200 mi", state: "" }
      ],
      history: [
        { d: "16", m: "Jun", title: "Tire rotation + brake inspect", sub: "Inv #INV-4120 · 91,250 mi", amt: 74.0 },
        { d: "22", m: "Feb", title: "Coolant flush", sub: "Inv #INV-3805 · 88,400 mi", amt: 149.0 }
      ]
    },
    {
      id: "v3",
      name: "2023 Toyota RAV4 Hybrid",
      sub: "XLE Premium · AWD",
      plate: "EV-5577",
      vin: "JTMRWRFV8PD188043",
      odo: 19870,
      cls: "v3",
      status: "waiting",
      bay: null,
      stepIndex: 0,
      tech: { initials: "AK", name: "Amir K." },
      note: "Checked in for first scheduled maintenance. Awaiting a free bay — estimated start 1:15 PM.",
      quote: null,
      reminders: [
        { name: "10k service inspection", due: "Due now", state: "due" },
        { name: "Tire rotation", due: "Due in 130 mi", state: "due" }
      ],
      history: [
        { d: "09", m: "Dec", title: "Delivery PDI + first oil", sub: "Inv #INV-3540 · 5,010 mi", amt: 0.0 }
      ]
    }
  ];

  var STEPS = ["Checked in", "Diagnosis", "In progress", "Ready"];
  var STATUS_LABEL = {
    inprogress: "In progress",
    waiting: "Waiting",
    ready: "Ready for pickup",
    done: "Done",
    hold: "On hold"
  };
  var STATUS_COLOR = {
    inprogress: "var(--inprogress)",
    waiting: "var(--waiting)",
    ready: "var(--orange)",
    done: "var(--done)",
    hold: "var(--hold)"
  };

  var current = vehicles[0];

  /* ---------- Helpers ---------- */
  function $(s, ctx) { return (ctx || document).querySelector(s); }
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function num(n) { return n.toLocaleString("en-US"); }

  function toast(msg, kind) {
    var wrap = $("#toastWrap");
    var t = document.createElement("div");
    t.className = "toast " + (kind || "info");
    t.innerHTML = '<span aria-hidden="true">' + (kind === "ok" ? "✓" : kind === "warn" ? "!" : "•") + "</span><span>" + msg + "</span>";
    wrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("leaving");
      setTimeout(function () { t.remove(); }, 250);
    }, 3200);
  }

  /* ---------- Sidebar ---------- */
  function renderVehicleList() {
    var list = $("#vehicleList");
    list.innerHTML = "";
    vehicles.forEach(function (v) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vehicle-card" + (v.id === current.id ? " active" : "");
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", v.id === current.id ? "true" : "false");
      btn.innerHTML =
        '<span class="vehicle-thumb ' + v.cls + '"></span>' +
        '<span class="vehicle-meta">' +
        '<span class="vname">' + v.name + "</span>" +
        '<span class="vplate"><span class="dot" style="background:' + STATUS_COLOR[v.status] + '"></span>' +
        v.plate + " · " + STATUS_LABEL[v.status] + "</span>" +
        "</span>";
      btn.addEventListener("click", function () {
        if (v.id === current.id) return;
        current = v;
        renderAll();
        toast("Switched to " + v.name, "info");
      });
      list.appendChild(btn);
    });
  }

  /* ---------- Hero ---------- */
  function renderHero() {
    $("#heroPhoto").className = "hero-photo " + current.cls;
    $("#heroName").textContent = current.name;
    var chip = $("#heroStatus");
    chip.textContent = STATUS_LABEL[current.status];
    chip.className = "status-chip s-" + current.status;
    $("#heroSub").textContent = current.sub;
    $("#heroStats").innerHTML =
      '<div class="stat"><span>Odometer</span><strong class="tnum">' + num(current.odo) + ' mi</strong></div>' +
      '<div class="stat"><span>Plate</span><strong class="tnum">' + current.plate + "</strong></div>" +
      '<div class="stat"><span>VIN</span><strong class="tnum">…' + current.vin.slice(-6) + "</strong></div>";
  }

  /* ---------- Active service ---------- */
  function renderActive() {
    $("#bayTag").textContent = current.bay ? "Bay " + current.bay : "Not yet assigned";

    var track = '<div class="progress-track">';
    STEPS.forEach(function (label, i) {
      var cls = i < current.stepIndex ? "complete" : i === current.stepIndex ? "current" : "";
      track +=
        '<div class="step ' + cls + '">' +
        '<span class="step-dot">' + (i < current.stepIndex ? "✓" : i + 1) + "</span>" +
        '<span class="step-label">' + label + "</span></div>";
    });
    track += "</div>";

    var note =
      '<div class="service-note"><span class="tech">' + current.tech.initials + "</span>" +
      "<div><b>" + current.tech.name + "</b> — " + current.note + "</div></div>";

    var extra = "";
    if (current.quote && !current.quote.approved) {
      extra =
        '<div class="quote-banner"><div class="qb-text"><strong>Estimate ' +
        current.quote.id + ' needs your approval</strong>' +
        "<span>Work is paused until you authorize the repair.</span></div>" +
        '<div style="display:flex;align-items:center;gap:14px">' +
        '<span class="qb-amount tnum">' + money(current.quote.amount) + "</span>" +
        '<button class="primary-btn" id="reviewQuote" type="button">Review estimate</button></div></div>';
    } else if (current.quote && current.quote.approved) {
      extra =
        '<div class="approved-flag"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
        "Estimate " + current.quote.id + " authorized · " + money(current.quote.amount) + "</div>";
    } else if (current.status === "ready") {
      extra =
        '<div class="approved-flag"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
        "Ready for pickup — no outstanding approvals.</div>";
    }

    $("#activeService").innerHTML = track + note + extra;

    var rq = $("#reviewQuote");
    if (rq) rq.addEventListener("click", openQuote);
  }

  /* ---------- Reminders ---------- */
  function renderReminders() {
    var ul = $("#reminderList");
    ul.innerHTML = "";
    current.reminders.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "reminder " + r.state;
      var badge = r.state === "overdue" ? "Overdue" : r.state === "due" ? "Due soon" : "Scheduled";
      li.innerHTML =
        '<span class="r-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>' +
        '<span class="r-body"><strong>' + r.name + "</strong><span>" + r.due + "</span></span>" +
        '<span class="r-badge ' + r.state + '">' + badge + "</span>";
      ul.appendChild(li);
    });
  }

  /* ---------- History ---------- */
  function renderHistory() {
    var ul = $("#historyList");
    ul.innerHTML = "";
    current.history.forEach(function (h, i) {
      var li = document.createElement("li");
      li.className = "history-row";
      li.innerHTML =
        '<span class="h-date"><span class="hd-day tnum">' + h.d + '</span><span class="hd-mon">' + h.m + "</span></span>" +
        '<span class="h-body"><strong>' + h.title + "</strong><span>" + h.sub + "</span></span>" +
        '<span class="h-right"><span class="h-amount tnum">' + money(h.amt) + "</span>" +
        '<button class="invoice-btn" type="button" data-inv="' + i + '">' +
        '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
        "Invoice</button></span>";
      li.querySelector(".invoice-btn").addEventListener("click", function () {
        toast("Downloading " + h.sub.split(" · ")[0] + " (PDF)…", "ok");
      });
      ul.appendChild(li);
    });
  }

  /* ---------- Quote modal ---------- */
  var lastFocus = null;

  function openQuote() {
    if (!current.quote) return;
    lastFocus = document.activeElement;
    var q = current.quote;
    $("#quoteVehicle").textContent = current.name + " · Estimate " + q.id;
    var rows = "";
    var sub = 0;
    q.lines.forEach(function (l) {
      sub += l.amt;
      rows +=
        '<div class="wo-line"><div class="wl-name"><strong>' + l.name + "</strong>" +
        '<span class="wl-tag ' + l.tag + '">' + l.tag + "</span></div>" +
        '<div class="wl-amt tnum">' + money(l.amt) + "</div></div>";
    });
    $("#quoteLines").innerHTML = rows;
    var tax = +(sub * 0.0825).toFixed(2);
    $("#quoteTotals").innerHTML =
      '<div class="tline"><span>Subtotal</span><span class="tnum">' + money(sub) + "</span></div>" +
      '<div class="tline"><span>Shop tax (8.25%)</span><span class="tnum">' + money(tax) + "</span></div>" +
      '<div class="tline grand"><span>Total</span><span class="tnum">' + money(sub + tax) + "</span></div>";
    openModal("#quoteModal");
  }

  function approveQuote() {
    current.quote.approved = true;
    closeModal("#quoteModal");
    renderActive();
    renderVehicleList();
    toast("Estimate " + current.quote.id + " approved — work resumed.", "ok");
  }

  /* ---------- Book modal ---------- */
  function openBook() {
    lastFocus = document.activeElement;
    $("#bookVehicle").textContent = current.name + " · " + current.plate;
    var dateEl = $("#bookDate");
    var d = new Date();
    d.setDate(d.getDate() + 2);
    dateEl.value = d.toISOString().slice(0, 10);
    dateEl.min = new Date().toISOString().slice(0, 10);
    openModal("#bookModal");
  }

  /* ---------- Modal plumbing ---------- */
  function openModal(sel) {
    var m = $(sel);
    m.hidden = false;
    var first = m.querySelector("button, select, input");
    if (first) first.focus();
    document.addEventListener("keydown", escClose);
  }
  function closeModal(sel) {
    $(sel).hidden = true;
    document.removeEventListener("keydown", escClose);
    if (lastFocus) lastFocus.focus();
  }
  function escClose(e) {
    if (e.key === "Escape") {
      closeModal("#quoteModal");
      closeModal("#bookModal");
    }
  }

  /* ---------- Wire static controls ---------- */
  function wire() {
    $("#quoteClose").addEventListener("click", function () { closeModal("#quoteModal"); });
    $("#quoteDecline").addEventListener("click", function () {
      closeModal("#quoteModal");
      toast("Estimate declined — we'll hold the vehicle and call you.", "warn");
    });
    $("#quoteApprove").addEventListener("click", approveQuote);

    $("#bookBtn").addEventListener("click", openBook);
    $("#bookClose").addEventListener("click", function () { closeModal("#bookModal"); });
    $("#bookCancel").addEventListener("click", function () { closeModal("#bookModal"); });
    $("#bookForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var type = $("#bookType").value;
      var date = $("#bookDate").value;
      var time = $("#bookTime").value;
      closeModal("#bookModal");
      toast(type + " requested for " + date + " at " + time + ". We'll confirm by text.", "ok");
    });

    [$("#quoteModal"), $("#bookModal")].forEach(function (bd) {
      bd.addEventListener("click", function (e) {
        if (e.target === bd) bd.hidden = true;
      });
    });

    $("#contactBtn").addEventListener("click", function () {
      toast("Torque & Tread · (512) 555-0148 · open until 6:00 PM", "info");
    });
    $("#addVehicle").addEventListener("click", function () {
      toast("Vehicle lookup by VIN or plate — coming to your portal soon.", "info");
    });
    $("#account").addEventListener("click", function () {
      toast("Signed in as Marcus Vale · 3 vehicles on file.", "info");
    });
  }

  /* ---------- Render all ---------- */
  function renderAll() {
    renderVehicleList();
    renderHero();
    renderActive();
    renderReminders();
    renderHistory();
  }

  renderAll();
  wire();
})();
