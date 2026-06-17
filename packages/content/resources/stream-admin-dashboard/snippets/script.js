(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2400);
  }

  /* ---------- Deterministic pseudo-random ---------- */
  function seeded(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  function gradient(seed) {
    var r = seeded(seed);
    var h1 = Math.floor(r() * 360), h2 = (h1 + 40 + Math.floor(r() * 80)) % 360;
    return "linear-gradient(145deg, hsl(" + h1 + " 62% 32%), hsl(" + h2 + " 58% 18%))";
  }

  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(Math.round(n));
  }

  /* ---------- Data model ---------- */
  var RANGES = {
    "7d":  { points: 7,  label: "last 7 days",   step: 1,  unit: "day" },
    "30d": { points: 15, label: "last 30 days",  step: 2,  unit: "day" },
    "90d": { points: 13, label: "last 90 days",  step: 7,  unit: "wk"  },
    "12m": { points: 12, label: "last 12 months", step: 1, unit: "mo"  }
  };

  var DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // KPI baselines per range: [value, deltaPct]
  var KPI_DATA = {
    "7d":  { viewers: [184200, 4.2], hours: [1.92e6, 6.1], retention: [71.4, 1.8], churn: [2.3, -0.4] },
    "30d": { viewers: [173800, 2.9], hours: [7.8e6, 3.4],  retention: [69.8, 0.9], churn: [2.6, -0.2] },
    "90d": { viewers: [168400, 1.4], hours: [21.4e6, 2.1], retention: [68.2, 0.4], churn: [3.1, 0.3] },
    "12m": { viewers: [159000, 12.6], hours: [82.6e6, 18.2], retention: [66.5, 3.2], churn: [3.4, -0.6] }
  };

  var TITLES = [
    { name: "Voidrunner", type: "series", views: 4.82e6, hours: 9.1e6, compl: 88, trend: 14, seed: 11 },
    { name: "The Glasshouse", type: "series", views: 3.91e6, hours: 7.4e6, compl: 82, trend: 9, seed: 23 },
    { name: "Pale Horizon", type: "film", views: 3.44e6, hours: 5.2e6, compl: 76, trend: -3, seed: 31 },
    { name: "Saltwater Kings", type: "series", views: 2.98e6, hours: 6.0e6, compl: 79, trend: 6, seed: 47 },
    { name: "Nightmarket", type: "film", views: 2.61e6, hours: 3.9e6, compl: 71, trend: 21, seed: 53 },
    { name: "Echo Division", type: "series", views: 2.20e6, hours: 4.6e6, compl: 84, trend: 2, seed: 67 },
    { name: "Cinder & Smoke", type: "film", views: 1.86e6, hours: 2.7e6, compl: 68, trend: -7, seed: 71 },
    { name: "Harbor Lights", type: "series", views: 1.52e6, hours: 3.1e6, compl: 80, trend: 4, seed: 89 }
  ];

  var REGIONS = [
    { name: "North America", flag: "🌎", pct: 31 },
    { name: "Europe", flag: "🌍", pct: 26 },
    { name: "Latin America", flag: "🌎", pct: 18 },
    { name: "Asia Pacific", flag: "🌏", pct: 16 },
    { name: "MEA", flag: "🌍", pct: 9 }
  ];

  var state = { range: "7d", metric: "hours" };

  /* ---------- Series generation ---------- */
  function makeSeries(range, metric) {
    var cfg = RANGES[range];
    var seedBase = (range.charCodeAt(0) + metric.charCodeAt(0)) * 97;
    var r = seeded(seedBase);
    var n = cfg.points;
    var base, amp;
    if (metric === "hours") { base = 240; amp = 90; }
    else if (metric === "viewers") { base = 170; amp = 70; }
    else { base = 75; amp = 12; } // completion %
    var out = [], trend = 0;
    for (var i = 0; i < n; i++) {
      trend += (r() - 0.45) * amp * 0.4;
      var wave = Math.sin(i / 1.7 + seedBase) * amp * 0.45;
      var v = base + trend + wave + (r() - 0.5) * amp * 0.3;
      v = Math.max(base * 0.35, v);
      if (metric === "completion") v = Math.min(96, Math.max(52, v));
      out.push(v);
    }
    return out;
  }

  function xLabels(range, n) {
    var cfg = RANGES[range], labels = [];
    if (range === "7d") return DAY_LABELS.slice(0, n);
    if (range === "12m") return MONTHS.slice();
    for (var i = 0; i < n; i++) {
      if (cfg.unit === "wk") labels.push("W" + (i + 1));
      else labels.push("D" + (i * cfg.step + 1));
    }
    return labels;
  }

  /* ---------- SVG path builders ---------- */
  function buildPath(values, w, h, pad) {
    var n = values.length;
    var max = Math.max.apply(null, values) * 1.08;
    var min = Math.min.apply(null, values) * 0.85;
    var span = max - min || 1;
    var innerW = w - pad * 2, innerH = h - pad * 2;
    var pts = values.map(function (v, i) {
      var x = pad + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      var y = pad + innerH - ((v - min) / span) * innerH;
      return [x, y];
    });
    // smooth-ish line via straight segments
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = d + " L" + pts[n - 1][0].toFixed(1) + " " + (h - pad) + " L" + pts[0][0].toFixed(1) + " " + (h - pad) + " Z";
    return { line: d, area: area, pts: pts, max: max, min: min };
  }

  function sparkPath(values, w, h) {
    var max = Math.max.apply(null, values), min = Math.min.apply(null, values), span = max - min || 1;
    return values.map(function (v, i) {
      var x = (i / (values.length - 1)) * w;
      var y = h - ((v - min) / span) * (h - 4) - 2;
      return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
  }

  /* ---------- SVG gradient defs ---------- */
  function ensureDefs(svg, id, color) {
    if (svg.querySelector("#" + id)) return;
    var ns = "http://www.w3.org/2000/svg";
    var defs = document.createElementNS(ns, "defs");
    var grad = document.createElementNS(ns, "linearGradient");
    grad.setAttribute("id", id);
    grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
    var s1 = document.createElementNS(ns, "stop");
    s1.setAttribute("offset", "0"); s1.setAttribute("stop-color", color); s1.setAttribute("stop-opacity", "0.32");
    var s2 = document.createElementNS(ns, "stop");
    s2.setAttribute("offset", "1"); s2.setAttribute("stop-color", color); s2.setAttribute("stop-opacity", "0");
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad);
    svg.insertBefore(defs, svg.firstChild);
  }

  /* ---------- KPI render ---------- */
  function renderKPIs() {
    var data = KPI_DATA[state.range];
    document.querySelectorAll(".kpi").forEach(function (card) {
      var key = card.getAttribute("data-kpi");
      var d = data[key];
      var valEl = card.querySelector("[data-value]");
      var deltaEl = card.querySelector("[data-delta]");
      var spark = card.querySelector(".spark");
      var display;
      if (key === "viewers") display = fmt(d[0]);
      else if (key === "hours") display = fmt(d[0]) + " h";
      else display = d[0].toFixed(1) + "%";
      valEl.textContent = display;
      var pos = d[1] >= 0;
      deltaEl.textContent = (pos ? "+" : "") + d[1].toFixed(1) + "%";
      // churn: down is good; flip badge color logic
      var good = key === "churn" ? d[1] < 0 : d[1] >= 0;
      deltaEl.classList.toggle("up", good);
      deltaEl.classList.toggle("down", !good);
      if (spark) spark.setAttribute("d", sparkPath(makeSeries(state.range, key === "churn" ? "completion" : key === "retention" ? "completion" : key === "viewers" ? "viewers" : "hours").slice(0, 12), 120, 32));
    });
  }

  /* ---------- Main viewership chart ---------- */
  var chart = document.getElementById("chart");
  var chartLine = document.getElementById("chartLine");
  var chartArea = document.getElementById("chartArea");
  var gridLines = document.getElementById("gridLines");
  var chartDots = document.getElementById("chartDots");
  var chartX = document.getElementById("chartX");
  var chartSub = document.getElementById("chartSub");
  var tooltip = document.getElementById("tooltip");
  var chartWrap = chart.parentElement;
  var W = 640, H = 240, PAD = 16;

  function metricLabel(m) {
    return m === "hours" ? "watch hours" : m === "viewers" ? "viewers" : "completion %";
  }
  function metricUnit(m, v) {
    if (m === "completion") return v.toFixed(1) + "%";
    if (m === "viewers") return fmt(v * 1000);
    return fmt(v * 1000) + " h";
  }

  function renderChart() {
    ensureDefs(chart, "grad", "#e50914");
    var values = makeSeries(state.range, state.metric);
    var labels = xLabels(state.range, values.length);
    var p = buildPath(values, W, H, PAD);
    chartLine.setAttribute("d", p.line);
    chartArea.setAttribute("d", p.area);

    // gridlines (4 horizontal)
    var ns = "http://www.w3.org/2000/svg";
    gridLines.innerHTML = "";
    for (var g = 0; g <= 3; g++) {
      var y = PAD + ((H - PAD * 2) / 3) * g;
      var ln = document.createElementNS(ns, "line");
      ln.setAttribute("x1", PAD); ln.setAttribute("x2", W - PAD);
      ln.setAttribute("y1", y); ln.setAttribute("y2", y);
      gridLines.appendChild(ln);
    }

    // dots
    chartDots.innerHTML = "";
    p.pts.forEach(function (pt, i) {
      var c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", pt[0]); c.setAttribute("cy", pt[1]); c.setAttribute("r", 4);
      c.setAttribute("class", "dot");
      c.setAttribute("tabindex", "0");
      c.setAttribute("role", "button");
      var label = labels[i] + ": " + metricUnit(state.metric, values[i]);
      c.setAttribute("aria-label", label);
      function show() {
        chartDots.querySelectorAll(".dot").forEach(function (d) { d.classList.remove("is-on"); });
        c.classList.add("is-on");
        var rect = chart.getBoundingClientRect();
        var wrapRect = chartWrap.getBoundingClientRect();
        var sx = rect.width / W, sy = rect.height / H;
        tooltip.style.left = (rect.left - wrapRect.left + pt[0] * sx) + "px";
        tooltip.style.top = (rect.top - wrapRect.top + pt[1] * sy) + "px";
        tooltip.innerHTML = labels[i] + " · <b>" + metricUnit(state.metric, values[i]) + "</b>";
        tooltip.classList.add("is-on");
      }
      c.addEventListener("mouseenter", show);
      c.addEventListener("focus", show);
      c.addEventListener("blur", hideTip);
      chartDots.appendChild(c);
    });
    chart.addEventListener("mouseleave", hideTip);

    // x labels
    chartX.innerHTML = "";
    labels.forEach(function (l) {
      var s = document.createElement("span"); s.textContent = l; chartX.appendChild(s);
    });

    chartSub.textContent = "Daily " + metricLabel(state.metric) + " · " + RANGES[state.range].label;
  }
  function hideTip() {
    tooltip.classList.remove("is-on");
    chartDots.querySelectorAll(".dot").forEach(function (d) { d.classList.remove("is-on"); });
  }

  /* ---------- Retention curve ---------- */
  var retChart = document.getElementById("retChart");
  var retLine = document.getElementById("retLine");
  var retArea = document.getElementById("retArea");
  var retGrid = document.getElementById("retGrid");
  var retX = document.getElementById("retX");
  var retSub = document.getElementById("retSub");

  function renderRetention() {
    ensureDefs(retChart, "gradRet", "#5b8def");
    // retention shifts slightly per range to feel live
    var bump = { "7d": 0, "30d": -2, "90d": -4, "12m": 3 }[state.range];
    var marks = [100, 94, 88, 83, 79, 75, 72, 69, 66, 63, 60];
    var values = marks.map(function (v, i) { return Math.max(40, v + bump - i * 0.3); });
    var RW = 640, RH = 200, RP = 14;
    var p = buildPath(values, RW, RH, RP);
    retLine.setAttribute("d", p.line);
    retArea.setAttribute("d", p.area);
    var ns = "http://www.w3.org/2000/svg";
    retGrid.innerHTML = "";
    for (var g = 0; g <= 3; g++) {
      var y = RP + ((RH - RP * 2) / 3) * g;
      var ln = document.createElementNS(ns, "line");
      ln.setAttribute("x1", RP); ln.setAttribute("x2", RW - RP);
      ln.setAttribute("y1", y); ln.setAttribute("y2", y);
      retGrid.appendChild(ln);
    }
    retX.innerHTML = "";
    ["0%", "20%", "40%", "60%", "80%", "100%"].forEach(function (l) {
      var s = document.createElement("span"); s.textContent = l; retX.appendChild(s);
    });
    retSub.textContent = "Viewers remaining over an episode · " + RANGES[state.range].label;
  }

  /* ---------- Regions ---------- */
  function renderRegions() {
    var ul = document.getElementById("regions");
    ul.innerHTML = "";
    var jitter = { "7d": 0, "30d": 1, "90d": -1, "12m": 2 }[state.range];
    REGIONS.forEach(function (reg, i) {
      var pct = Math.max(4, reg.pct + (i === 0 ? jitter : i === 3 ? -jitter : 0));
      var li = document.createElement("li");
      li.className = "region";
      li.innerHTML =
        '<div class="region__top">' +
          '<span class="region__name"><span class="region__flag" aria-hidden="true">' + reg.flag + '</span>' + reg.name + '</span>' +
          '<span class="region__pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="region__bar"><div class="region__fill"></div></div>';
      ul.appendChild(li);
      var fill = li.querySelector(".region__fill");
      requestAnimationFrame(function () { fill.style.width = (pct / 31 * 100) + "%"; });
    });
  }

  /* ---------- Titles table ---------- */
  function renderTitles() {
    var body = document.getElementById("titlesBody");
    body.innerHTML = "";
    var mult = { "7d": 1, "30d": 4.1, "90d": 11.8, "12m": 46 }[state.range];
    TITLES.forEach(function (t, i) {
      var tr = document.createElement("tr");
      tr.setAttribute("tabindex", "0");
      tr.setAttribute("role", "button");
      tr.setAttribute("aria-label", "Drill into " + t.name);
      var trendCls = t.trend >= 0 ? "up" : "down";
      var trendTxt = (t.trend >= 0 ? "▲ " : "▼ ") + Math.abs(t.trend) + "%";
      tr.innerHTML =
        '<td class="rank">' + (i + 1) + '</td>' +
        '<td><div class="t-title">' +
          '<span class="t-poster" style="background:' + gradient(t.seed) + '"></span>' +
          '<span class="t-name">' + t.name + '</span></div></td>' +
        '<td><span class="t-tag ' + t.type + '">' + (t.type === "series" ? "Series" : "Film") + '</span></td>' +
        '<td class="num">' + fmt(t.views * mult) + '</td>' +
        '<td class="num">' + fmt(t.hours * mult) + ' h</td>' +
        '<td class="num">' + t.compl + '%</td>' +
        '<td class="num"><span class="t-trend ' + trendCls + '">' + trendTxt + '</span></td>';
      tr.addEventListener("click", function () { openDrawer(t, mult); });
      tr.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(t, mult); }
      });
      body.appendChild(tr);
    });
  }

  /* ---------- Drawer drill ---------- */
  var drawer = document.getElementById("drawer");
  var lastFocus = null;

  function openDrawer(t, mult) {
    lastFocus = document.activeElement;
    document.getElementById("drawerType").textContent = t.type === "series" ? "Series" : "Film";
    document.getElementById("drawerTitle").textContent = t.name;
    document.getElementById("drawerPoster").style.background = gradient(t.seed);

    var stats = [
      { label: "Total views", val: fmt(t.views * mult), delta: t.trend, suffix: "" },
      { label: "Watch hours", val: fmt(t.hours * mult), delta: Math.round(t.trend * 0.8), suffix: "" },
      { label: "Completion", val: t.compl + "%", delta: t.trend >= 0 ? 2 : -2, suffix: "" },
      { label: "Avg. rating", val: (3.6 + (t.compl / 100) * 1.3).toFixed(1), delta: 0, suffix: "/5" }
    ];
    document.getElementById("drawerStats").innerHTML = stats.map(function (s) {
      var dcls = s.delta > 0 ? "up" : s.delta < 0 ? "down" : "";
      var dtxt = s.delta !== 0 ? ' <small class="' + dcls + '">' + (s.delta > 0 ? "+" : "") + s.delta + "%</small>" : "";
      return '<div class="dstat"><div class="dstat__label">' + s.label + '</div>' +
        '<div class="dstat__val">' + s.val + s.suffix + dtxt + '</div></div>';
    }).join("");

    // mini chart
    var mvals = makeSeries("7d", "hours").map(function (v, i) { return v * (0.6 + (t.compl / 100)) + t.seed; });
    var dp = buildPath(mvals, 320, 110, 8);
    ensureDefs(document.getElementById("drawerChart"), "grad", "#e50914");
    document.getElementById("drawerLine").setAttribute("d", dp.line);
    document.getElementById("drawerArea").setAttribute("d", dp.area);

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.querySelector(".drawer__close").focus();
    document.addEventListener("keydown", escClose);
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", escClose);
    if (lastFocus) lastFocus.focus();
  }
  function escClose(e) { if (e.key === "Escape") closeDrawer(); }
  drawer.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeDrawer);
  });

  /* ---------- Controls ---------- */
  document.querySelectorAll(".tf").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      document.querySelectorAll(".tf").forEach(function (b) {
        b.classList.remove("is-active"); b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active"); btn.setAttribute("aria-selected", "true");
      state.range = btn.getAttribute("data-range");
      renderAll();
      toast("Showing " + RANGES[state.range].label);
    });
  });

  document.querySelectorAll(".mt").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      document.querySelectorAll(".mt").forEach(function (b) {
        b.classList.remove("is-active"); b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active"); btn.setAttribute("aria-selected", "true");
      state.metric = btn.getAttribute("data-metric");
      hideTip();
      renderChart();
    });
  });

  document.getElementById("exportBtn").addEventListener("click", function () {
    toast("Report queued — " + RANGES[state.range].label + " export emailed");
  });

  /* ---------- Render all ---------- */
  function renderAll() {
    renderKPIs();
    renderChart();
    renderRetention();
    renderRegions();
    renderTitles();
  }

  // resize: reposition tooltip-free, just rebuild dots positions
  var rtimer;
  window.addEventListener("resize", function () {
    clearTimeout(rtimer);
    rtimer = setTimeout(function () { hideTip(); }, 120);
  });

  renderAll();
})();
