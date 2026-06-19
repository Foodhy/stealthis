(function () {
  "use strict";

  /* ---------- Fictional network data ---------- */
  // Each route: code pair, cities, base flight no, per-timeframe load factor,
  // revenue ($M), RASK (¢), plus cabin split for drill-down.
  var ROUTES = [
    { o: "JFK", d: "LHR", co: "New York", cd: "London", fno: "SA118",
      lf: { "7d": 91, "30d": 89, qtd: 88, ytd: 87 }, rev: 8.4, rask: 9.1,
      cabins: [["Economy", 58], ["Premium", 19], ["Business", 18], ["First", 5]] },
    { o: "SFO", d: "NRT", co: "San Francisco", cd: "Tokyo", fno: "SA402",
      lf: { "7d": 88, "30d": 86, qtd: 85, ytd: 84 }, rev: 7.1, rask: 8.6,
      cabins: [["Economy", 61], ["Premium", 16], ["Business", 20], ["First", 3]] },
    { o: "MIA", d: "GRU", co: "Miami", cd: "São Paulo", fno: "SA770",
      lf: { "7d": 86, "30d": 84, qtd: 83, ytd: 82 }, rev: 5.8, rask: 8.2,
      cabins: [["Economy", 66], ["Premium", 14], ["Business", 20], ["First", 0]] },
    { o: "LAX", d: "SYD", co: "Los Angeles", cd: "Sydney", fno: "SA610",
      lf: { "7d": 83, "30d": 85, qtd: 84, ytd: 83 }, rev: 6.9, rask: 8.0,
      cabins: [["Economy", 60], ["Premium", 17], ["Business", 19], ["First", 4]] },
    { o: "ORD", d: "CDG", co: "Chicago", cd: "Paris", fno: "SA225",
      lf: { "7d": 80, "30d": 78, qtd: 79, ytd: 80 }, rev: 4.6, rask: 7.4,
      cabins: [["Economy", 64], ["Premium", 15], ["Business", 19], ["First", 2]] },
    { o: "BOS", d: "DUB", co: "Boston", cd: "Dublin", fno: "SA133",
      lf: { "7d": 77, "30d": 79, qtd: 80, ytd: 81 }, rev: 3.4, rask: 7.0,
      cabins: [["Economy", 70], ["Premium", 14], ["Business", 16], ["First", 0]] },
    { o: "SEA", d: "ICN", co: "Seattle", cd: "Seoul", fno: "SA518",
      lf: { "7d": 72, "30d": 74, qtd: 75, ytd: 76 }, rev: 4.0, rask: 6.8,
      cabins: [["Economy", 67], ["Premium", 15], ["Business", 18], ["First", 0]] },
    { o: "DEN", d: "MEX", co: "Denver", cd: "Mexico City", fno: "SA289",
      lf: { "7d": 68, "30d": 70, qtd: 71, ytd: 73 }, rev: 2.2, rask: 6.1,
      cabins: [["Economy", 78], ["Premium", 12], ["Business", 10], ["First", 0]] },
    { o: "ATL", d: "AMS", co: "Atlanta", cd: "Amsterdam", fno: "SA341",
      lf: { "7d": 64, "30d": 67, qtd: 69, ytd: 71 }, rev: 2.6, rask: 5.9,
      cabins: [["Economy", 72], ["Premium", 14], ["Business", 14], ["First", 0]] }
  ];

  var CABIN_COLORS = { Economy: "#0a66c2", Premium: "#5aa0e0", Business: "#ff7a33", First: "#13233b" };

  var KPI = {
    "7d":  { lf: 84.6, rask: 7.92, yield: 9.36, rev: 48.2 },
    "30d": { lf: 83.1, rask: 7.74, yield: 9.41, rev: 196.4 },
    qtd:   { lf: 82.5, rask: 7.61, yield: 9.28, rev: 612.7 },
    ytd:   { lf: 81.8, rask: 7.55, yield: 9.19, rev: 2480.0 }
  };
  var KPI_PERIOD = { "7d": "last 7 days", "30d": "last 30 days", qtd: "quarter to date", ytd: "year to date" };

  // Revenue trend series (normalized index per timeframe)
  var TREND = {
    "7d":  { pts: [6.4, 6.1, 6.8, 7.2, 6.9, 7.5, 7.3], labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], sub: "Daily passenger revenue ($M)", total: "+5.1%", cls: "ok" },
    "30d": { pts: [44, 46, 43, 48, 50, 47, 52], labels: ["W1","W1","W2","W2","W3","W3","W4"], sub: "Weekly passenger revenue ($M)", total: "+3.6%", cls: "ok" },
    qtd:   { pts: [188, 196, 203, 199, 208, 212, 214], labels: ["Apr","Apr","May","May","Jun","Jun","Jun"], sub: "Monthly passenger revenue ($M)", total: "+2.2%", cls: "ok" },
    ytd:   { pts: [612, 598, 640, 655, 631, 668, 690], labels: ["Q1","Q1","Q2","Q2","Q3","Q3","Q4"], sub: "Quarterly passenger revenue ($M)", total: "-0.8%", cls: "low" }
  };

  var SPARK = {
    lf:    [80, 81, 82, 81, 83, 84, 84.6],
    rask:  [7.5, 7.6, 7.55, 7.7, 7.8, 7.85, 7.92],
    yield: [9.5, 9.45, 9.4, 9.42, 9.38, 9.37, 9.36],
    rev:   [44, 45.5, 44.8, 46.2, 47, 47.6, 48.2]
  };

  var current = "7d";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function lfClass(v) { return v >= 85 ? "ok" : v >= 70 ? "warn" : "low"; }
  function lfSpill(v) { return v >= 85 ? "s-ok" : v >= 70 ? "s-warn" : "s-low"; }
  function lfStatus(v) { return v >= 85 ? "Strong" : v >= 70 ? "Healthy" : "Underloaded"; }

  /* ---------- Sparklines ---------- */
  function drawSpark(key) {
    var svg = $('[data-spark="' + key + '"]');
    if (!svg) return;
    var d = SPARK[key];
    var min = Math.min.apply(null, d), max = Math.max.apply(null, d);
    var rng = max - min || 1;
    var w = 120, h = 30, pad = 2;
    var step = (w - pad * 2) / (d.length - 1);
    var pts = d.map(function (v, i) {
      var x = pad + i * step;
      var y = pad + (1 - (v - min) / rng) * (h - pad * 2);
      return [x, y];
    });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = "M" + pts[0][0].toFixed(1) + " " + h + " " +
      pts.map(function (p) { return "L" + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ") +
      " L" + pts[pts.length - 1][0].toFixed(1) + " " + h + " Z";
    var up = d[d.length - 1] >= d[0];
    var col = up ? "var(--ok)" : "var(--danger)";
    svg.innerHTML =
      '<path d="' + area + '" fill="' + (up ? "rgba(31,157,98,0.12)" : "rgba(212,73,62,0.12)") + '"/>' +
      '<path d="' + line + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  /* ---------- KPIs ---------- */
  function renderKPIs() {
    var k = KPI[current];
    $('[data-kpi="lf"]').textContent = k.lf.toFixed(1);
    $('[data-kpi="lf-period"]').textContent = KPI_PERIOD[current];
    $('[data-kpi="rask"]').textContent = k.rask.toFixed(2);
    $('[data-kpi="yield"]').textContent = k.yield.toFixed(2);
    var rev = k.rev >= 1000 ? (k.rev / 1000).toFixed(2) : k.rev.toFixed(1);
    $('[data-kpi="rev"]').textContent = rev;
    var revUnit = k.rev >= 1000 ? "B" : "M";
    $('[data-kpi="rev"]').nextElementSibling && ($('[data-kpi="rev"]').parentNode.querySelector("small:last-child").textContent = revUnit);
    ["lf", "rask", "yield", "rev"].forEach(drawSpark);
  }

  /* ---------- Route bars ---------- */
  function renderBars() {
    var host = $("#routeBars");
    host.innerHTML = "";
    var sorted = ROUTES.slice().sort(function (a, b) { return b.lf[current] - a.lf[current]; });
    sorted.forEach(function (r) {
      var v = r.lf[current];
      var btn = document.createElement("button");
      btn.className = "bar-row";
      btn.type = "button";
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-label", r.o + " to " + r.d + ", load factor " + v + " percent");
      btn.innerHTML =
        '<span class="bar-route">' + r.o + '<span style="color:var(--muted)"> → </span>' + r.d + '</span>' +
        '<span class="bar-track"><span class="bar-fill ' + lfClass(v) + '"></span></span>' +
        '<span class="bar-val">' + v + '%</span>';
      btn.addEventListener("click", function () { openDrawer(r); });
      host.appendChild(btn);
      // animate fill
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { $(".bar-fill", btn).style.width = v + "%"; });
      });
    });
  }

  /* ---------- Line chart ---------- */
  function renderLine() {
    var t = TREND[current];
    $("#trendSub").textContent = t.sub;
    var pill = $("#trendTotal");
    pill.textContent = t.total;
    pill.className = "pill pill-" + t.cls;

    var svg = $("#lineChart");
    var W = 480, H = 200, padL = 8, padR = 8, padT = 16, padB = 14;
    var d = t.pts;
    var min = Math.min.apply(null, d), max = Math.max.apply(null, d);
    var rng = (max - min) || 1;
    min -= rng * 0.15; max += rng * 0.15; rng = max - min;
    var step = (W - padL - padR) / (d.length - 1);
    var pts = d.map(function (v, i) {
      return [padL + i * step, padT + (1 - (v - min) / rng) * (H - padT - padB)];
    });
    var grid = "";
    for (var g = 0; g <= 3; g++) {
      var y = padT + (g / 3) * (H - padT - padB);
      grid += '<line class="grid-line" x1="0" y1="' + y.toFixed(1) + '" x2="' + W + '" y2="' + y.toFixed(1) + '"/>';
    }
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = "M" + pts[0][0].toFixed(1) + " " + (H - padB) +
      pts.map(function (p) { return " L" + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("") +
      " L" + pts[pts.length - 1][0].toFixed(1) + " " + (H - padB) + " Z";
    var dots = pts.map(function (p) { return '<circle class="rev-dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5"/>'; }).join("");
    svg.innerHTML =
      '<defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="rgba(10,102,194,0.22)"/><stop offset="1" stop-color="rgba(10,102,194,0)"/>' +
      '</linearGradient></defs>' + grid +
      '<path class="rev-area" d="' + area + '"/>' +
      '<path class="rev-line" d="' + line + '"/>' + dots;

    var axis = $("#lineAxis");
    axis.innerHTML = t.labels.map(function (l) { return "<span>" + l + "</span>"; }).join("");
  }

  /* ---------- Table ---------- */
  function renderTable() {
    var body = $("#routeTable");
    body.innerHTML = "";
    var sorted = ROUTES.slice().sort(function (a, b) { return b.lf[current] - a.lf[current]; });
    sorted.forEach(function (r) {
      var v = r.lf[current];
      var tr = document.createElement("tr");
      tr.tabIndex = 0;
      tr.innerHTML =
        '<td><span class="r-code">' + r.o + ' → ' + r.d + '</span><div class="r-city">' + r.co + ' – ' + r.cd + '</div></td>' +
        '<td class="r-flight">' + r.fno + '</td>' +
        '<td class="num r-load" style="color:var(--' + lfClass(v) + (lfClass(v) === "low" ? "" : "") + ')">' + v + '%</td>' +
        '<td class="num">$' + r.rev.toFixed(1) + 'M</td>' +
        '<td class="num">' + r.rask.toFixed(1) + '¢</td>' +
        '<td><span class="spill ' + lfSpill(v) + '"><span class="s-dot"></span>' + lfStatus(v) + '</span></td>';
      tr.addEventListener("click", function () { openDrawer(r); });
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(r); } });
      body.appendChild(tr);
    });
    // recolor load cells properly
    $$("#routeTable .r-load").forEach(function (td) {
      var num = parseFloat(td.textContent);
      var c = lfClass(num);
      td.style.color = c === "ok" ? "var(--ok)" : c === "warn" ? "var(--warn)" : "var(--danger)";
    });
  }

  /* ---------- Cabin mix donut (network aggregate) ---------- */
  function networkMix() {
    var totals = { Economy: 0, Premium: 0, Business: 0, First: 0 };
    ROUTES.forEach(function (r) {
      var w = r.rev;
      r.cabins.forEach(function (c) { totals[c[0]] += (c[1] / 100) * w; });
    });
    var sum = totals.Economy + totals.Premium + totals.Business + totals.First;
    return [
      ["Economy", totals.Economy / sum * 100],
      ["Premium", totals.Premium / sum * 100],
      ["Business", totals.Business / sum * 100],
      ["First", totals.First / sum * 100]
    ];
  }

  function renderDonut() {
    var mix = networkMix();
    var svg = $("#donut");
    var cx = 60, cy = 60, r = 46, C = 2 * Math.PI * r;
    var offset = 0;
    var segs = "";
    mix.forEach(function (m) {
      var frac = m[1] / 100;
      var len = frac * C;
      segs += '<circle class="donut-seg" data-cabin="' + m[0] + '" cx="' + cx + '" cy="' + cy + '" r="' + r +
        '" stroke="' + CABIN_COLORS[m[0]] + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) +
        '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
      offset += len;
    });
    svg.innerHTML = segs;

    var top = mix.slice().sort(function (a, b) { return b[1] - a[1]; })[0];
    $("#donutPct").textContent = Math.round(top[1]) + "%";

    var legend = $("#mixLegend");
    legend.innerHTML = "";
    mix.forEach(function (m) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="m-dot" style="background:' + CABIN_COLORS[m[0]] + '"></span>' +
        '<span class="m-name">' + m[0] + '</span><span class="m-val">' + m[1].toFixed(1) + '%</span>';
      li.addEventListener("mouseenter", function () { highlightSeg(m[0]); });
      li.addEventListener("mouseleave", function () { highlightSeg(null); });
      li.addEventListener("click", function () {
        $("#donutPct").textContent = Math.round(m[1]) + "%";
        $(".donut-center span").textContent = m[0];
        toast(m[0] + " carries " + m[1].toFixed(1) + "% of network revenue");
      });
      legend.appendChild(li);
    });

    $$(".donut-seg", svg).forEach(function (s) {
      s.addEventListener("mouseenter", function () {
        var name = s.getAttribute("data-cabin");
        var val = mix.filter(function (m) { return m[0] === name; })[0][1];
        $("#donutPct").textContent = Math.round(val) + "%";
        $(".donut-center span").textContent = name;
      });
    });
  }

  function highlightSeg(name) {
    $$(".donut-seg").forEach(function (s) {
      s.style.opacity = (!name || s.getAttribute("data-cabin") === name) ? "1" : "0.3";
    });
  }

  /* ---------- Drawer ---------- */
  var drawer = $("#drawer");
  var lastFocus = null;

  function openDrawer(r) {
    lastFocus = document.activeElement;
    var v = r.lf[current];
    $("#drRoute").textContent = r.o + " → " + r.d;
    $("#drTitle").textContent = r.co + " to " + r.cd;

    var loadColor = lfClass(v) === "ok" ? "var(--ok)" : lfClass(v) === "warn" ? "var(--warn)" : "var(--danger)";
    var cabins = r.cabins.map(function (c) {
      return '<div class="dr-cabin"><span class="cab-name">' + c[0] + '</span>' +
        '<span class="cab-track"><span class="cab-fill" style="width:' + c[1] + '%"></span></span>' +
        '<span class="cab-val">' + c[1] + '%</span></div>';
    }).join("");

    var fn = parseInt(r.fno.replace(/\D/g, ""), 10);
    var flights = [
      { no: r.fno, time: "06:40 → 18:55", load: Math.min(99, v + 4) },
      { no: "SA" + (fn + 1), time: "11:15 → 23:30", load: v },
      { no: "SA" + (fn + 2), time: "19:50 → 08:05⁺¹", load: Math.max(40, v - 6) }
    ].map(function (f) {
      var fc = lfClass(f.load) === "ok" ? "var(--ok)" : lfClass(f.load) === "warn" ? "var(--warn)" : "var(--danger)";
      return '<div class="dr-flight"><div><div class="fno">' + f.no + '</div><div class="ftime">' + f.time + '</div></div>' +
        '<div class="fload" style="color:' + fc + '">' + f.load + '%</div></div>';
    }).join("");

    $("#drBody").innerHTML =
      '<div class="dr-stats">' +
        '<div class="dr-stat"><div class="l">Load Factor</div><div class="v" style="color:' + loadColor + '">' + v + '%</div></div>' +
        '<div class="dr-stat"><div class="l">Revenue</div><div class="v">$' + r.rev.toFixed(1) + 'M</div></div>' +
        '<div class="dr-stat"><div class="l">RASK</div><div class="v">' + r.rask.toFixed(1) + '¢</div></div>' +
        '<div class="dr-stat"><div class="l">Status</div><div class="v" style="font-size:16px;color:' + loadColor + '">' + lfStatus(v) + '</div></div>' +
      '</div>' +
      '<p class="dr-h">Cabin revenue split</p><div class="dr-cabins">' + cabins + '</div>' +
      '<p class="dr-h">Scheduled rotations</p><div class="dr-flights">' + flights + '</div>';

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { $(".icon-btn", drawer).focus(); }, 60);
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$("[data-close]", drawer).forEach(function (el) { el.addEventListener("click", closeDrawer); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });

  /* ---------- Timeframe toggle ---------- */
  $$(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.tf === current) return;
      $$(".seg-btn").forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      current = btn.dataset.tf;
      renderAll();
      toast("Timeframe: " + btn.textContent + " · charts updated");
    });
  });

  /* ---------- Export ---------- */
  $("#exportBtn").addEventListener("click", function () {
    var rows = [["Route", "Flight", "LoadFactor%", "Revenue$M", "RASK_cents", "Status"]];
    ROUTES.slice().sort(function (a, b) { return b.lf[current] - a.lf[current]; }).forEach(function (r) {
      var v = r.lf[current];
      rows.push([r.o + "-" + r.d, r.fno, v, r.rev.toFixed(1), r.rask.toFixed(1), lfStatus(v)]);
    });
    var csv = rows.map(function (r) { return r.join(","); }).join("\n");
    try {
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "load-factor-report-" + current + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast("Exported " + (rows.length - 1) + " routes (" + current.toUpperCase() + ")");
    } catch (err) {
      toast("Export blocked in this preview");
    }
  });

  /* ---------- Render ---------- */
  function renderAll() {
    renderKPIs();
    renderBars();
    renderLine();
    renderTable();
  }

  renderAll();
  renderDonut();
})();
