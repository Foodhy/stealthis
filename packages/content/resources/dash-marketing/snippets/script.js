/* ============================================================
 * Lumenpath — Marketing dashboard (funnels · channels)
 * Vanilla JS. Deterministic synthetic data, no libraries.
 * ============================================================ */
(function () {
  "use strict";

  /* ---------- small utils ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (n, lo, hi) { return Math.max(lo, Math.min(hi, n)); };
  var fmtInt = function (n) { return Math.round(n).toLocaleString("en-US"); };
  var fmtK = function (n) {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
    if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
    return "$" + Math.round(n);
  };
  var fmtMoney = function (n) { return "$" + fmtInt(n); };

  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastT);
    toastT = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 220);
    }, 2200);
  }

  /* ---------- deterministic dataset ---------- */
  // Each channel: base visitors + stage rates + spend + revenue per range.
  // Range multipliers scale volume; rates wobble slightly but stay stable.
  var RANGE = {
    "7d": { mult: 0.24, label: "last 7 days", prev: "prior week", wob: 0.97 },
    "30d": { mult: 1, label: "last 30 days", prev: "prior 30 days", wob: 1 },
    "90d": { mult: 3.05, label: "last 90 days", prev: "prior quarter", wob: 1.02 },
    "12m": { mult: 12.4, label: "last 12 months", prev: "prior year", wob: 1.05 }
  };

  var CHANNELS = [
    { id: "organic", name: "Organic", color: "#5b5bf0",
      visitors: 18400, rLead: 0.092, rTrial: 0.34, rPaid: 0.41, spend: 12200, revenue: 96400 },
    { id: "paid",    name: "Paid search", color: "#00b4a6",
      visitors: 11200, rLead: 0.118, rTrial: 0.38, rPaid: 0.36, spend: 64800, revenue: 188300 },
    { id: "social",  name: "Social", color: "#7c6cf5",
      visitors: 9600,  rLead: 0.064, rTrial: 0.29, rPaid: 0.31, spend: 28400, revenue: 61200 },
    { id: "email",   name: "Email", color: "#d98a2b",
      visitors: 5400,  rLead: 0.205, rTrial: 0.47, rPaid: 0.52, spend: 4100,  revenue: 74800 }
  ];

  var CAMPAIGNS = [
    { name: "Q3 Always-On Search", channel: "paid", status: "live", spend: 31400, cac: 64, roas: 3.4 },
    { name: "Retarget — Trial Abandon", channel: "paid", status: "live", spend: 8600, cac: 41, roas: 4.8 },
    { name: "Founder Story (YouTube)", channel: "social", status: "live", spend: 14200, cac: 88, roas: 2.1 },
    { name: "Onboarding Drip v4", channel: "email", status: "live", spend: 2100, cac: 19, roas: 9.2 },
    { name: "Comparison Pages SEO", channel: "organic", status: "review", spend: 6800, cac: 33, roas: 5.6 },
    { name: "LinkedIn ABM — Enterprise", channel: "social", status: "paused", spend: 12900, cac: 142, roas: 1.6 },
    { name: "Winback — Churned 90d", channel: "email", status: "live", spend: 1700, cac: 24, roas: 6.4 }
  ];

  var STAGES = [
    { key: "visitors", label: "Visitors", color: "#5b5bf0" },
    { key: "leads",    label: "Leads",    color: "#5454ed" },
    { key: "trials",   label: "Trials",   color: "#1aa79b" },
    { key: "paid",     label: "Paid",     color: "#00b4a6" }
  ];

  /* ---------- state ---------- */
  var state = { range: "30d", channel: "all", chanMetric: "roas" };
  var liveTimer = null, liveJitter = 0;

  /* ---------- derive funnel + channel rollups ---------- */
  function compute() {
    var r = RANGE[state.range];
    var list = state.channel === "all"
      ? CHANNELS
      : CHANNELS.filter(function (c) { return c.id === state.channel; });

    var totals = { visitors: 0, leads: 0, trials: 0, paid: 0, spend: 0, revenue: 0 };
    var rows = list.map(function (c) {
      var visitors = c.visitors * r.mult * r.wob;
      var leads = visitors * c.rLead;
      var trials = leads * c.rTrial;
      var paid = trials * c.rPaid;
      var spend = c.spend * r.mult;
      var revenue = c.revenue * r.mult;
      totals.visitors += visitors;
      totals.leads += leads;
      totals.trials += trials;
      totals.paid += paid;
      totals.spend += spend;
      totals.revenue += revenue;
      return {
        id: c.id, name: c.name, color: c.color,
        spend: spend, revenue: revenue,
        cac: paid > 0 ? spend / paid : 0,
        roas: spend > 0 ? revenue / spend : 0
      };
    });

    // apply live jitter to volume metrics so the dashboard "ticks"
    var j = 1 + liveJitter;
    totals.visitors *= j;
    totals.leads *= j;
    totals.trials *= j;
    totals.paid *= j;

    return { totals: totals, rows: rows, range: r };
  }

  /* ---------- KPIs ---------- */
  function sparkPath(seed, up) {
    // build a stable little sparkline from a seed
    var pts = [], n = 14, v = 16;
    for (var i = 0; i < n; i++) {
      var w = Math.sin((i + seed) * 0.9) * 5 + Math.cos((i + seed) * 0.4) * 3;
      v = clamp(v + w + (up ? -0.4 : 0.5), 4, 28);
      pts.push((i / (n - 1)) * 100 + "," + v.toFixed(1));
    }
    return pts;
  }

  function renderSpark(svg, up) {
    var seed = (svg.getAttribute("data-seed") || "1") * 1;
    var pts = sparkPath(seed, up);
    var color = up ? "var(--ok)" : "var(--danger)";
    var area = "M0,32 L" + pts.join(" L") + " L100,32 Z";
    var line = "M" + pts.join(" L");
    svg.innerHTML =
      '<path d="' + area + '" fill="' + color + '" opacity="0.12"></path>' +
      '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"></path>';
  }

  function setDelta(el, pct, goodWhenUp) {
    var up = pct >= 0;
    var good = goodWhenUp ? up : !up;
    el.className = "delta " + (good ? "up" : "down");
    el.innerHTML = (up ? "▲" : "▼") + " " + Math.abs(pct).toFixed(1) + "%";
    return up;
  }

  function renderKpis(data) {
    var t = data.totals;
    var conv = t.visitors > 0 ? (t.paid / t.visitors) * 100 : 0;
    var cac = t.paid > 0 ? t.spend / t.paid : 0;
    var roas = t.spend > 0 ? t.revenue / t.spend : 0;

    var map = {
      sessions: { val: fmtInt(t.visitors), delta: 8.4, goodUp: true, seed: 2 },
      conv:     { val: conv.toFixed(2) + "%", delta: 2.1, goodUp: true, seed: 5 },
      cac:      { val: fmtMoney(cac), delta: -4.7, goodUp: false, seed: 9 },
      roas:     { val: roas.toFixed(2) + "×", delta: 6.3, goodUp: true, seed: 7 }
    };

    $$(".kpi").forEach(function (card) {
      var k = card.getAttribute("data-kpi");
      var m = map[k];
      if (!m) return;
      $("[data-value]", card).textContent = m.val;
      var spark = $("[data-spark]", card);
      spark.setAttribute("data-seed", m.seed);
      var up = setDelta($("[data-delta]", card), m.delta, m.goodUp);
      renderSpark(spark, m.delta >= 0);
    });
  }

  /* ---------- FUNNEL (inline SVG) ---------- */
  var funnelEl = $("#funnel");
  var funnelTip = $("#funnelTip");
  var funnelData = [];

  function renderFunnel(data) {
    var t = data.totals;
    var vals = [t.visitors, t.leads, t.trials, t.paid];
    var W = 520, H = 280, padX = 16, padTop = 8;
    var rowH = (H - padTop) / 4 - 6;
    var max = vals[0] || 1;
    var maxW = W - padX * 2;
    var ns = "http://www.w3.org/2000/svg";
    funnelEl.innerHTML = "";
    funnelData = [];

    for (var i = 0; i < STAGES.length; i++) {
      var s = STAGES[i];
      var v = vals[i];
      var wTop = (vals[i] / max) * maxW;
      // bottom edge tapers toward the next stage's width; last step tapers gently
      var wBot = i < 3 ? (vals[i + 1] / max) * maxW : wTop * 0.62;
      var y = padTop + i * (rowH + 6);
      var cx = W / 2;
      var x1t = cx - wTop / 2, x2t = cx + wTop / 2;
      var x1b = cx - wBot / 2, x2b = cx + wBot / 2;

      var conv = i === 0 ? 100 : (vals[i] / vals[i - 1]) * 100;

      var g = document.createElementNS(ns, "g");
      g.setAttribute("class", "funnel-step");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "listitem");
      g.setAttribute("data-i", i);

      var poly = document.createElementNS(ns, "polygon");
      poly.setAttribute("points",
        x1t + "," + y + " " + x2t + "," + y + " " +
        x2b + "," + (y + rowH) + " " + x1b + "," + (y + rowH));
      poly.setAttribute("fill", s.color);
      poly.setAttribute("rx", "6");
      g.appendChild(poly);

      var lbl = document.createElementNS(ns, "text");
      lbl.setAttribute("class", "funnel-label");
      lbl.setAttribute("x", cx);
      lbl.setAttribute("y", y + rowH / 2 - 3);
      lbl.setAttribute("text-anchor", "middle");
      lbl.textContent = s.label;
      g.appendChild(lbl);

      var valT = document.createElementNS(ns, "text");
      valT.setAttribute("class", "funnel-val");
      valT.setAttribute("x", cx);
      valT.setAttribute("y", y + rowH / 2 + 14);
      valT.setAttribute("text-anchor", "middle");
      valT.textContent = fmtInt(v);
      g.appendChild(valT);

      if (i > 0) {
        var convT = document.createElementNS(ns, "text");
        convT.setAttribute("class", "funnel-conv");
        convT.setAttribute("x", W - padX);
        convT.setAttribute("y", y - 2);
        convT.setAttribute("text-anchor", "end");
        convT.textContent = "↳ " + conv.toFixed(1) + "% step";
        funnelEl.appendChild(convT);
      }

      funnelEl.appendChild(g);
      funnelData.push({ i: i, label: s.label, value: v, conv: conv, color: s.color,
                        ofTop: (v / max) * 100, cx: cx, cy: y + rowH / 2 });
    }

    bindFunnelHover();
    renderLegend(data);
  }

  function bindFunnelHover() {
    $$(".funnel-step", funnelEl).forEach(function (g) {
      var i = +g.getAttribute("data-i");
      var show = function (clientFromEvt) {
        var d = funnelData[i];
        funnelTip.hidden = false;
        funnelTip.innerHTML =
          "<strong>" + d.label + "</strong> · " + fmtInt(d.value) +
          (i === 0 ? "" : " · " + d.conv.toFixed(1) + "% step") +
          " · " + d.ofTop.toFixed(1) + "% of top";
        // position over the step center, relative to funnel-wrap
        var rect = funnelEl.getBoundingClientRect();
        var scaleX = rect.width / 520, scaleY = rect.height / 280;
        funnelTip.style.left = (d.cx * scaleX) + "px";
        funnelTip.style.top = (d.cy * scaleY) + "px";
      };
      g.addEventListener("mouseenter", show);
      g.addEventListener("focus", show);
      g.addEventListener("mouseleave", function () { funnelTip.hidden = true; });
      g.addEventListener("blur", function () { funnelTip.hidden = true; });
    });
  }

  function renderLegend(data) {
    var t = data.totals;
    var vals = { Visitors: t.visitors, Leads: t.leads, Trials: t.trials, Paid: t.paid };
    var legend = $("#funnelLegend");
    legend.innerHTML = STAGES.map(function (s) {
      return '<li class="fl-item">' +
        '<span class="fl-dot" style="background:' + s.color + '"></span>' +
        '<span class="fl-name">' + s.label + '</span>' +
        '<span class="fl-num">' + fmtInt(vals[s.label]) + '</span></li>';
    }).join("");

    var chName = state.channel === "all" ? "All channels"
      : (CHANNELS.filter(function (c) { return c.id === state.channel; })[0] || {}).name;
    $("#funnelSub").textContent = chName + " · " + data.range.label;
  }

  /* ---------- CHANNEL bars + table ---------- */
  function metricInfo(m) {
    if (m === "spend") return { key: "spend", fmt: fmtK, label: "Spend", invert: false };
    if (m === "cac")   return { key: "cac", fmt: function (v) { return "$" + Math.round(v); }, label: "CAC", invert: true };
    return { key: "roas", fmt: function (v) { return v.toFixed(2) + "×"; }, label: "ROAS", invert: false };
  }

  function renderChannels(data) {
    var rows = data.rows.slice();
    var info = metricInfo(state.chanMetric);
    var max = Math.max.apply(null, rows.map(function (r) { return r[info.key]; })) || 1;

    var bars = $("#bars");
    bars.innerHTML = rows.map(function (r) {
      return '<div class="bar-row">' +
        '<span class="bar-name">' + r.name + '</span>' +
        '<span class="bar-track"><span class="bar-fill" data-w="' +
          ((r[info.key] / max) * 100).toFixed(1) + '" style="background:' + r.color + '"></span></span>' +
        '<span class="bar-val">' + info.fmt(r[info.key]) + '</span></div>';
    }).join("");
    // animate widths in
    requestAnimationFrame(function () {
      $$(".bar-fill", bars).forEach(function (f) { f.style.width = f.getAttribute("data-w") + "%"; });
    });

    var tbody = $("#chanRows");
    // table sorted by spend desc for a stable reading order
    var sorted = rows.slice().sort(function (a, b) { return b.spend - a.spend; });
    tbody.innerHTML = sorted.map(function (r) {
      var cls = r.roas >= 3 ? "good" : r.roas >= 2 ? "mid" : "low";
      return '<tr>' +
        '<td><span class="ch-name"><span class="ch-swatch" style="background:' + r.color + '"></span>' + r.name + '</span></td>' +
        '<td class="num">' + fmtK(r.spend) + '</td>' +
        '<td class="num">$' + Math.round(r.cac) + '</td>' +
        '<td class="num"><span class="roas-pill ' + cls + '">' + r.roas.toFixed(2) + '×</span></td>' +
        '</tr>';
    }).join("");
  }

  /* ---------- CAMPAIGNS ---------- */
  function renderCampaigns() {
    var rangeMult = RANGE[state.range].mult;
    var list = CAMPAIGNS.filter(function (c) {
      return state.channel === "all" || c.channel === state.channel;
    });
    list = list.slice().sort(function (a, b) { return b.roas - a.roas; });

    var labels = { live: "Live", paused: "Paused", review: "In review" };
    var chName = function (id) {
      var c = CHANNELS.filter(function (x) { return x.id === id; })[0];
      return c ? c.name : id;
    };

    $("#campList").innerHTML = list.map(function (c) {
      var spend = c.spend * rangeMult;
      return '<li class="camp">' +
        '<span class="camp-name"><strong>' + c.name + '</strong><small>' + chName(c.channel) + '</small></span>' +
        '<span class="camp-metric"><span>Spend</span><strong>' + fmtK(spend) + '</strong></span>' +
        '<span class="camp-metric"><span>CAC</span><strong>$' + c.cac + '</strong></span>' +
        '<span class="camp-metric"><span>ROAS</span><strong>' + c.roas.toFixed(1) + '×</strong></span>' +
        '<span class="status ' + c.status + '">' + labels[c.status] + '</span>' +
        '</li>';
    }).join("");

    var running = list.filter(function (c) { return c.status === "live"; }).length;
    $("#campSub").textContent = list.length + " campaigns · " + running + " running · sorted by ROAS";
  }

  /* ---------- full render ---------- */
  var kpisEl = $("#kpis");
  function renderAll(opts) {
    var data = compute();
    renderKpis(data);
    renderFunnel(data);
    renderChannels(data);
    renderCampaigns();
    if (opts && opts.busy) {
      kpisEl.setAttribute("aria-busy", "true");
      setTimeout(function () { kpisEl.setAttribute("aria-busy", "false"); }, 280);
    }
  }

  /* ---------- interactions ---------- */
  // date range
  $$(".seg-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".seg-btn").forEach(function (x) { x.classList.remove("is-on"); x.removeAttribute("aria-pressed"); });
      b.classList.add("is-on");
      b.setAttribute("aria-pressed", "true");
      state.range = b.getAttribute("data-range");
      renderAll({ busy: true });
      toast("Range · " + RANGE[state.range].label);
    });
  });

  // channel filter
  $("#channelSelect").addEventListener("change", function () {
    state.channel = this.value;
    renderAll({ busy: true });
    var n = this.options[this.selectedIndex].text;
    toast("Filtered · " + n);
  });

  // channel metric tabs
  $$(".w-tab").forEach(function (t) {
    t.addEventListener("click", function () {
      $$(".w-tab").forEach(function (x) { x.classList.remove("is-on"); x.setAttribute("aria-selected", "false"); });
      t.classList.add("is-on");
      t.setAttribute("aria-selected", "true");
      state.chanMetric = t.getAttribute("data-metric");
      var data = compute();
      renderChannels(data);
    });
  });

  // reset + export
  $("#resetBtn").addEventListener("click", function () {
    state.range = "30d"; state.channel = "all"; state.chanMetric = "roas";
    $("#channelSelect").value = "all";
    $$(".seg-btn").forEach(function (x) {
      var on = x.getAttribute("data-range") === "30d";
      x.classList.toggle("is-on", on);
      if (on) x.setAttribute("aria-pressed", "true"); else x.removeAttribute("aria-pressed");
    });
    $$(".w-tab").forEach(function (x) {
      var on = x.getAttribute("data-metric") === "roas";
      x.classList.toggle("is-on", on);
      x.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderAll({ busy: true });
    toast("Filters reset");
  });

  $("#exportBtn").addEventListener("click", function () {
    toast("Export queued — report.csv");
  });

  $$(".menu-btn").forEach(function (b) {
    b.addEventListener("click", function () { toast("Widget menu (demo)"); });
  });

  // off-canvas nav
  var shell = $("#shell");
  $("#sideOpen").addEventListener("click", function () { shell.classList.add("nav-open"); });
  $("#sideClose").addEventListener("click", function () { shell.classList.remove("nav-open"); });
  $$(".nav-item").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      $$(".nav-item").forEach(function (x) { x.classList.remove("is-active"); x.removeAttribute("aria-current"); });
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
      shell.classList.remove("nav-open");
    });
  });

  // reposition tooltip target on resize handled implicitly via getBoundingClientRect

  /* ---------- live tick ---------- */
  function startLive() {
    stopLive();
    liveTimer = setInterval(function () {
      // gentle bounded random walk on volume
      liveJitter = clamp(liveJitter + (Math.random() - 0.5) * 0.012, -0.05, 0.06);
      var data = compute();
      renderKpis(data);
      // refresh funnel numbers without rebuilding hover bindings every tick
      var t = data.totals;
      var vals = [t.visitors, t.leads, t.trials, t.paid];
      $$(".funnel-step .funnel-val", funnelEl).forEach(function (txt, i) {
        txt.textContent = fmtInt(vals[i]);
        if (funnelData[i]) funnelData[i].value = vals[i];
      });
      var legendNums = $$("#funnelLegend .fl-num");
      legendNums.forEach(function (n, i) { n.textContent = fmtInt(vals[i]); });
    }, 3000);
  }
  function stopLive() { if (liveTimer) clearInterval(liveTimer); }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopLive(); else startLive();
  });

  /* ---------- boot ---------- */
  renderAll();
  startLive();
})();
