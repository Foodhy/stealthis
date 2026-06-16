(function () {
  "use strict";

  /* ---------------- Data (fictional: Northwind Beverage Co.) ---------------- */
  // Each period carries KPI figures, prior-period values for deltas, a P&L
  // waterfall breakdown, a cashflow series, budgets, and transactions.
  var DATA = {
    month: {
      label: "Jun 2026",
      kpi: {
        revenue: { value: 482300, prev: 451900 },
        expenses: { value: 351700, prev: 339400 },
        net: { value: 130600, prev: 112500 },
        cash: { value: 918450, prev: 871200 }
      },
      sparks: {
        revenue: [38, 41, 39, 44, 46, 43, 48],
        expenses: [33, 31, 34, 32, 36, 35, 34],
        net: [9, 12, 8, 13, 11, 14, 13],
        cash: [82, 85, 84, 88, 87, 90, 92]
      },
      pnl: [
        { label: "Revenue", val: 482300, type: "in" },
        { label: "COGS", val: -188400, type: "out" },
        { label: "Payroll", val: -101200, type: "out" },
        { label: "Marketing", val: -34800, type: "out" },
        { label: "Other", val: -27300, type: "out" }
      ],
      cash: [
        { t: "W1", v: 871200 }, { t: "W2", v: 889600 }, { t: "W3", v: 902300 },
        { t: "W4", v: 894100 }, { t: "Now", v: 918450 }
      ],
      cashLabel: "Weekly balance · June",
      budgets: [
        { name: "Cost of goods", actual: 188400, budget: 195000 },
        { name: "Payroll", actual: 101200, budget: 100000 },
        { name: "Marketing", actual: 34800, budget: 30000 },
        { name: "Software & tools", actual: 9400, budget: 14000 },
        { name: "Logistics", actual: 17900, budget: 18500 }
      ],
      tx: [
        { desc: "Harbor Grocers — wholesale order", ref: "INV-4821", cat: "Sales", date: "Jun 12", amt: 28400, flow: "in" },
        { desc: "ColdChain Freight Inc.", ref: "BILL-2290", cat: "Logistics", date: "Jun 11", amt: -6120, flow: "out" },
        { desc: "Payroll run — bi-weekly", ref: "PAY-0612", cat: "Payroll", date: "Jun 10", amt: -50600, flow: "out" },
        { desc: "Sunset Cafe Group", ref: "INV-4815", cat: "Sales", date: "Jun 9", amt: 14250, flow: "in" },
        { desc: "Meta Ads — June flight", ref: "BILL-2284", cat: "Marketing", date: "Jun 8", amt: -8900, flow: "out" },
        { desc: "Figma + Linear seats", ref: "BILL-2280", cat: "Software", date: "Jun 6", amt: -2350, flow: "out" },
        { desc: "Metro Distributors", ref: "INV-4807", cat: "Sales", date: "Jun 5", amt: 41600, flow: "in" },
        { desc: "Quarterly sales tax remittance", ref: "TAX-Q2", cat: "Tax", date: "Jun 3", amt: -12480, flow: "out" }
      ]
    },
    quarter: {
      label: "Q2 2026",
      kpi: {
        revenue: { value: 1418900, prev: 1326500 },
        expenses: { value: 1048200, prev: 1011700 },
        net: { value: 370700, prev: 314800 },
        cash: { value: 918450, prev: 802300 }
      },
      sparks: {
        revenue: [42, 45, 44, 47, 49, 46, 52],
        expenses: [34, 36, 35, 38, 37, 39, 38],
        net: [10, 11, 13, 12, 14, 13, 16],
        cash: [72, 76, 79, 81, 84, 88, 92]
      },
      pnl: [
        { label: "Revenue", val: 1418900, type: "in" },
        { label: "COGS", val: -561300, type: "out" },
        { label: "Payroll", val: -298400, type: "out" },
        { label: "Marketing", val: -104600, type: "out" },
        { label: "Other", val: -83900, type: "out" }
      ],
      cash: [
        { t: "Apr", v: 802300 }, { t: "May", v: 861400 }, { t: "Jun", v: 918450 }
      ],
      cashLabel: "Month-end balance · Q2",
      budgets: [
        { name: "Cost of goods", actual: 561300, budget: 585000 },
        { name: "Payroll", actual: 298400, budget: 300000 },
        { name: "Marketing", actual: 104600, budget: 90000 },
        { name: "Software & tools", actual: 28200, budget: 42000 },
        { name: "Logistics", actual: 55700, budget: 55000 }
      ],
      tx: [
        { desc: "Metro Distributors — Q2 contract", ref: "INV-4630", cat: "Sales", date: "Jun 5", amt: 124800, flow: "in" },
        { desc: "Payroll — quarter total", ref: "PAY-Q2", cat: "Payroll", date: "Jun 30", amt: -298400, flow: "out" },
        { desc: "Harbor Grocers — standing order", ref: "INV-4512", cat: "Sales", date: "May 22", amt: 86200, flow: "in" },
        { desc: "ColdChain Freight — quarterly", ref: "BILL-2110", cat: "Logistics", date: "May 19", amt: -55700, flow: "out" },
        { desc: "Brand campaign — spring", ref: "BILL-2044", cat: "Marketing", date: "Apr 28", amt: -41200, flow: "out" },
        { desc: "Sunset Cafe Group — bulk", ref: "INV-4401", cat: "Sales", date: "Apr 14", amt: 63900, flow: "in" },
        { desc: "Estimated tax payment Q2", ref: "TAX-Q2", cat: "Tax", date: "Jun 15", amt: -74100, flow: "out" }
      ]
    },
    year: {
      label: "FY 2026 (YTD)",
      kpi: {
        revenue: { value: 5236400, prev: 4612800 },
        expenses: { value: 3914600, prev: 3601200 },
        net: { value: 1321800, prev: 1011600 },
        cash: { value: 918450, prev: 604700 }
      },
      sparks: {
        revenue: [30, 34, 38, 41, 44, 48, 52],
        expenses: [28, 30, 33, 35, 36, 38, 39],
        net: [4, 6, 8, 9, 11, 13, 16],
        cash: [48, 55, 62, 68, 74, 84, 92]
      },
      pnl: [
        { label: "Revenue", val: 5236400, type: "in" },
        { label: "COGS", val: -2094500, type: "out" },
        { label: "Payroll", val: -1118300, type: "out" },
        { label: "Marketing", val: -389200, type: "out" },
        { label: "Other", val: -312600, type: "out" }
      ],
      cash: [
        { t: "Q1", v: 604700 }, { t: "Q2", v: 918450 }, { t: "Q3*", v: 1142000 }, { t: "Q4*", v: 1388000 }
      ],
      cashLabel: "Quarterly balance · *forecast",
      budgets: [
        { name: "Cost of goods", actual: 2094500, budget: 2150000 },
        { name: "Payroll", actual: 1118300, budget: 1120000 },
        { name: "Marketing", actual: 389200, budget: 340000 },
        { name: "Software & tools", actual: 96800, budget: 160000 },
        { name: "Logistics", actual: 215800, budget: 220000 }
      ],
      tx: [
        { desc: "Annual supply agreement — Metro", ref: "INV-3001", cat: "Sales", date: "Feb 1", amt: 480000, flow: "in" },
        { desc: "Payroll — YTD total", ref: "PAY-YTD", cat: "Payroll", date: "Jun 30", amt: -1118300, flow: "out" },
        { desc: "Loan interest — term facility", ref: "FIN-018", cat: "Interest", date: "Jun 1", amt: -42600, flow: "out" },
        { desc: "Harbor Grocers — annual", ref: "INV-2890", cat: "Sales", date: "Jan 10", amt: 312400, flow: "in" },
        { desc: "Fleet & logistics — YTD", ref: "BILL-YTD", cat: "Logistics", date: "Jun 30", amt: -215800, flow: "out" },
        { desc: "Brand & growth spend — YTD", ref: "MKT-YTD", cat: "Marketing", date: "Jun 30", amt: -389200, flow: "out" },
        { desc: "Estimated income tax — YTD", ref: "TAX-YTD", cat: "Tax", date: "Jun 15", amt: -188400, flow: "out" }
      ]
    }
  };

  /* ---------------- Helpers ---------------- */
  function fmtCurrency(n) {
    var abs = Math.abs(n);
    var sign = n < 0 ? "-" : "";
    if (abs >= 1e6) return sign + "$" + (abs / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    if (abs >= 1e3) return sign + "$" + Math.round(abs / 1e3).toLocaleString("en-US") + "K";
    return sign + "$" + Math.round(abs).toLocaleString("en-US");
  }
  function fmtFull(n) {
    var sign = n < 0 ? "-" : n > 0 ? "+" : "";
    return sign + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
  }
  function pctChange(now, prev) {
    if (!prev) return 0;
    return ((now - prev) / Math.abs(prev)) * 100;
  }

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- Toast ---------------- */
  var toastHost = $("#toastHost");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastHost.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 220);
    }, 2600);
  }

  /* ---------------- State ---------------- */
  var state = { period: "month", flow: "all" };

  /* ---------------- Animated number ---------------- */
  function animateValue(el, to) {
    var from = parseFloat(el.getAttribute("data-cur")) || 0;
    var start = performance.now();
    var dur = 600;
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var cur = from + (to - from) * eased;
      el.textContent = fmtCurrency(cur);
      if (p < 1) requestAnimationFrame(step);
      else el.setAttribute("data-cur", String(to));
    }
    requestAnimationFrame(step);
  }

  /* ---------------- KPI rendering ---------------- */
  // For expenses, a decrease is "good": invert delta semantics.
  var KPI_GOOD_DOWN = { expenses: true };
  var SPARK_COLOR = { revenue: "var(--accent)", expenses: "var(--warn)", net: "var(--brand)", cash: "var(--accent)" };

  function renderKpis(d) {
    Object.keys(d.kpi).forEach(function (key) {
      var card = $('.kpi[data-kpi="' + key + '"]');
      if (!card) return;
      var k = d.kpi[key];
      animateValue($('[data-field="value"]', card), k.value);

      var pc = pctChange(k.value, k.prev);
      var goodDown = KPI_GOOD_DOWN[key];
      var positive = goodDown ? pc <= 0 : pc >= 0;
      var deltaEl = $('[data-field="delta"]', card);
      deltaEl.className = "delta " + (positive ? "up" : "down");
      var arrow = pc >= 0 ? "▲" : "▼";
      deltaEl.innerHTML = '<span class="arr" aria-hidden="true">' + arrow + "</span>" +
        Math.abs(pc).toFixed(1) + "% vs prior";

      renderSparkline($('[data-field="spark"]', card), d.sparks[key], SPARK_COLOR[key]);
    });
  }

  function renderSparkline(svg, vals, color) {
    var w = 120, h = 32, pad = 3;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var range = max - min || 1;
    var step = (w - pad * 2) / (vals.length - 1);
    var pts = vals.map(function (v, i) {
      var x = pad + i * step;
      var y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x, y];
    });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = line + " L" + pts[pts.length - 1][0].toFixed(1) + " " + h + " L" + pts[0][0].toFixed(1) + " " + h + " Z";
    svg.innerHTML =
      '<path class="sk-area" d="' + area + '" fill="' + color + '"></path>' +
      '<path class="sk-line" d="' + line + '" stroke="' + color + '"></path>';
  }

  /* ---------------- P&L waterfall (inline SVG) ---------------- */
  function renderPnl(d) {
    var svg = $("#pnlChart");
    var W = 640, H = 280, padL = 8, padR = 8, padT = 16, padB = 36;
    var bars = d.pnl;
    // Build cumulative waterfall: revenue starts at 0, expenses step down, last bar = net.
    var running = 0;
    var steps = [];
    bars.forEach(function (b) {
      var start = running;
      running += b.val;
      steps.push({ label: b.label, start: start, end: running, val: b.val, type: b.type });
    });
    var net = running;
    steps.push({ label: "Net", start: 0, end: net, val: net, type: "net", isNet: true });

    var maxV = Math.max.apply(null, steps.map(function (s) { return Math.max(s.start, s.end); }));
    var minV = Math.min.apply(null, steps.map(function (s) { return Math.min(s.start, s.end); }), 0);
    var span = maxV - minV || 1;
    var plotH = H - padT - padB;
    var plotW = W - padL - padR;
    function y(v) { return padT + (maxV - v) / span * plotH; }

    var n = steps.length;
    var gap = 14;
    var bw = (plotW - gap * (n - 1)) / n;

    var parts = [];
    // gridlines
    for (var g = 0; g <= 4; g++) {
      var gv = maxV - (span * g) / 4;
      var gy = y(gv);
      parts.push('<line class="grid-line" x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + gy.toFixed(1) + '"></line>');
    }

    var fillFor = { in: "var(--accent)", out: "var(--warn)", net: "var(--brand)" };
    steps.forEach(function (s, i) {
      var x = padL + i * (bw + gap);
      var top = y(Math.max(s.start, s.end));
      var bot = y(Math.min(s.start, s.end));
      var hgt = Math.max(2, bot - top);
      var fill = fillFor[s.type];
      parts.push(
        '<rect class="bar" x="' + x.toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) +
        '" height="' + hgt.toFixed(1) + '" rx="4" fill="' + fill + '">' +
        '<title>' + s.label + ": " + fmtFull(s.val) + '</title></rect>'
      );
      // connector line to next bar
      if (i < steps.length - 2) {
        var nx = padL + (i + 1) * (bw + gap);
        var cy = y(s.end);
        parts.push('<line x1="' + (x + bw).toFixed(1) + '" y1="' + cy.toFixed(1) + '" x2="' + nx.toFixed(1) + '" y2="' + cy.toFixed(1) + '" stroke="var(--line-2)" stroke-width="1" stroke-dasharray="3 3"></line>');
      }
      // value label
      parts.push('<text class="bar-val" x="' + (x + bw / 2).toFixed(1) + '" y="' + (top - 6).toFixed(1) + '" text-anchor="middle">' + fmtCurrency(s.val) + "</text>");
      // axis label
      parts.push('<text class="axis-lbl" x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 14) + '" text-anchor="middle">' + s.label + "</text>");
    });

    svg.innerHTML = parts.join("");
    $("#pnlSub").textContent = "Net " + fmtFull(net) + " · margin " + (net / d.kpi.revenue.value * 100).toFixed(1) + "%";
  }

  /* ---------------- Cashflow area chart ---------------- */
  function renderCash(d) {
    var svg = $("#cashChart");
    var W = 640, H = 240, padL = 12, padR = 12, padT = 18, padB = 30;
    var series = d.cash;
    var vals = series.map(function (p) { return p.v; });
    var max = Math.max.apply(null, vals);
    var min = Math.min.apply(null, vals);
    var pad = (max - min) * 0.25 || max * 0.1;
    max += pad; min = Math.max(0, min - pad);
    var range = max - min || 1;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var step = plotW / (series.length - 1);
    function y(v) { return padT + (max - v) / range * plotH; }

    var pts = series.map(function (p, i) { return [padL + i * step, y(p.v)]; });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = line + " L" + pts[pts.length - 1][0].toFixed(1) + " " + (H - padB) + " L" + pts[0][0].toFixed(1) + " " + (H - padB) + " Z";

    var parts = [];
    parts.push(
      '<defs><linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--brand)" stop-opacity="0.28"></stop>' +
      '<stop offset="100%" stop-color="var(--brand)" stop-opacity="0.02"></stop>' +
      "</linearGradient></defs>"
    );
    for (var g = 0; g <= 3; g++) {
      var gy = padT + (plotH * g) / 3;
      parts.push('<line class="grid-line" x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + gy.toFixed(1) + '"></line>');
    }
    parts.push('<path d="' + area + '" fill="url(#cashGrad)"></path>');
    parts.push('<path d="' + line + '" fill="none" stroke="var(--brand)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>');
    pts.forEach(function (p, i) {
      parts.push('<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="var(--white)" stroke="var(--brand)" stroke-width="2"><title>' + series[i].t + ": " + fmtFull(series[i].v) + '</title></circle>');
      parts.push('<text class="axis-lbl" x="' + p[0].toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + series[i].t + "</text>");
    });
    svg.innerHTML = parts.join("");
    $("#cashSub").textContent = d.cashLabel;
  }

  /* ---------------- Budget vs actual ---------------- */
  function renderBudgets(d) {
    var list = $("#budgetList");
    list.innerHTML = "";
    d.budgets.forEach(function (b) {
      var pct = (b.actual / b.budget) * 100;
      var cls = pct > 100 ? "over" : pct > 90 ? "warn" : "ok";
      var fillCls = pct > 100 ? "over" : pct > 90 ? "warn" : "";
      var li = document.createElement("li");
      li.className = "bg-row";
      li.innerHTML =
        '<div class="bg-top">' +
          '<span class="bg-name">' + b.name + "</span>" +
          '<span class="bg-fig"><b>' + fmtCurrency(b.actual) + "</b> / " + fmtCurrency(b.budget) + "</span>" +
        "</div>" +
        '<div class="bg-track"><div class="bg-fill ' + fillCls + '" style="width:0%"></div></div>' +
        '<span class="bg-pct ' + cls + '">' + Math.round(pct) + "% of budget" +
          (pct > 100 ? " · over by " + fmtCurrency(b.actual - b.budget) : "") + "</span>";
      list.appendChild(li);
      // animate fill
      var fill = $(".bg-fill", li);
      requestAnimationFrame(function () { fill.style.width = Math.min(100, pct).toFixed(1) + "%"; });
    });
  }

  /* ---------------- Transactions ---------------- */
  function renderTx(d) {
    var body = $("#txBody");
    var rows = d.tx.filter(function (t) {
      return state.flow === "all" || t.flow === state.flow;
    });
    body.innerHTML = "";
    if (!rows.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="4">No ' + state.flow + 'flow transactions this period.</td></tr>';
    } else {
      rows.forEach(function (t) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td><span class=\"tx-desc\">" + t.desc + "</span><span class=\"tx-ref\">" + t.ref + "</span></td>" +
          '<td><span class="cat" data-cat="' + t.cat + '">' + t.cat + "</span></td>" +
          '<td class="num tx-date">' + t.date + "</td>" +
          '<td class="num tx-amt ' + t.flow + '">' + (t.amt >= 0 ? "+" : "") + fmtFull(t.amt).replace("+", "") + "</td>";
        body.appendChild(tr);
      });
    }
    $("#txCount").textContent = d.tx.length;
  }

  /* ---------------- Render everything ---------------- */
  function renderAll() {
    var d = DATA[state.period];
    renderKpis(d);
    renderPnl(d);
    renderCash(d);
    renderBudgets(d);
    renderTx(d);
  }

  /* ---------------- Period selector ---------------- */
  $$(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      $$(".seg-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.period = btn.getAttribute("data-period");
      renderAll();
      toast("Showing " + DATA[state.period].label);
    });
  });

  /* ---------------- Transaction flow filter ---------------- */
  $$(".tx-filter .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".tx-filter .chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      state.flow = chip.getAttribute("data-flow");
      renderTx(DATA[state.period]);
    });
  });

  /* ---------------- Export ---------------- */
  $("#exportBtn").addEventListener("click", function () {
    toast("Exporting " + DATA[state.period].label + " report (CSV)…");
  });

  /* ---------------- Off-canvas nav ---------------- */
  var sidebar = $("#sidebar"), backdrop = $("#backdrop"), menuBtn = $("#menuBtn");
  function openNav() {
    sidebar.classList.add("is-open");
    backdrop.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    sidebar.classList.remove("is-open");
    backdrop.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", function () {
    sidebar.classList.contains("is-open") ? closeNav() : openNav();
  });
  backdrop.addEventListener("click", closeNav);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  $$(".nav-item").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      $$(".nav-item").forEach(function (n) { n.classList.remove("is-active"); n.removeAttribute("aria-current"); });
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
      closeNav();
    });
  });

  /* ---------------- Live cash tick ---------------- */
  // Gently jitter the live cash balance every few seconds (month view only feel).
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    setInterval(function () {
      var card = $('.kpi[data-kpi="cash"] [data-field="value"]');
      if (!card) return;
      var base = DATA[state.period].kpi.cash.value;
      var jitter = base * (Math.random() * 0.004 - 0.002);
      card.setAttribute("data-cur", String(base + jitter));
      card.textContent = fmtCurrency(base + jitter);
    }, 4000);
  }

  /* ---------------- Init ---------------- */
  renderAll();
})();
