/* Cookbook — Food Blog Dashboard
   Vanilla JS. Date-range recomputes KPIs + redraws the inline-SVG chart,
   sortable top-recipes table, comment approve/reject. Fictional data. */
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- Deterministic pseudo-random for plausible series ---------- */
  function makeSeries(seed, len, base, spread, drift) {
    var out = [];
    var s = seed;
    for (var i = 0; i < len; i++) {
      s = (s * 9301 + 49297) % 233280;
      var r = s / 233280;
      var wave = Math.sin(i / 3.3) * 0.35 + Math.sin(i / 1.6) * 0.18;
      var val = base + drift * i + spread * (r - 0.5) * 2 + spread * wave;
      out.push(Math.max(0, Math.round(val)));
    }
    return out;
  }

  /* ---------- Range datasets (7 / 30 / 90 days) ---------- */
  var RANGES = {
    7: {
      label: "last 7 days",
      views: makeSeries(11, 7, 4200, 900, 60),
      visitors: makeSeries(23, 7, 2600, 520, 40),
      kpis: { views: 31480, visitors: 18920, time: 254, saves: 1342 },
      deltas: { views: 8.4, visitors: 6.1, time: 3.2, saves: 11.7 }
    },
    30: {
      label: "last 30 days",
      views: makeSeries(31, 30, 3900, 1100, 22),
      visitors: makeSeries(47, 30, 2450, 640, 14),
      kpis: { views: 142730, visitors: 86410, time: 248, saves: 5870 },
      deltas: { views: 12.6, visitors: 9.3, time: -1.4, saves: 14.2 }
    },
    90: {
      label: "last 90 days",
      views: makeSeries(67, 90, 3700, 1300, 9),
      visitors: makeSeries(83, 90, 2300, 760, 6),
      kpis: { views: 408960, visitors: 241300, time: 241, saves: 16480 },
      deltas: { views: 19.1, visitors: 15.8, time: 2.0, saves: 22.5 }
    }
  };

  var currentRange = 30;

  /* ---------- Formatters ---------- */
  function fmtInt(n) { return n.toLocaleString("en-US"); }
  function fmtTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + "m " + (s < 10 ? "0" + s : s) + "s";
  }
  function fmtValue(kpi, n) {
    if (kpi === "time") return fmtTime(n);
    return fmtInt(n);
  }

  /* ---------- Sparklines ---------- */
  function buildPath(values, w, h, pad) {
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var range = max - min || 1;
    var n = values.length;
    var pts = values.map(function (v, i) {
      var x = pad + (i / (n - 1)) * (w - pad * 2);
      var y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x, y];
    });
    var d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      d += " L" + pts[i][0].toFixed(1) + "," + pts[i][1].toFixed(1);
    }
    return { d: d, pts: pts };
  }

  function renderSpark(svg, values, up) {
    svg.innerHTML = "";
    var w = 100, h = 28, pad = 3;
    var p = buildPath(values, w, h, pad);
    var color = up ? "var(--ok)" : "var(--danger)";
    var line = document.createElementNS(SVGNS, "path");
    line.setAttribute("d", p.d);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-linejoin", "round");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
    var last = p.pts[p.pts.length - 1];
    var dot = document.createElementNS(SVGNS, "circle");
    dot.setAttribute("cx", last[0]);
    dot.setAttribute("cy", last[1]);
    dot.setAttribute("r", "2.4");
    dot.setAttribute("fill", color);
    svg.appendChild(dot);
  }

  /* ---------- KPI render ---------- */
  function renderKPIs() {
    var r = RANGES[currentRange];
    document.querySelectorAll(".kpi").forEach(function (card) {
      var kpi = card.getAttribute("data-kpi");
      var valEl = card.querySelector('[data-field="value"]');
      var deltaEl = card.querySelector('[data-field="delta"]');
      var sparkEl = card.querySelector('[data-field="spark"]');

      valEl.textContent = fmtValue(kpi, r.kpis[kpi]);

      var d = r.deltas[kpi];
      var up = d >= 0;
      deltaEl.classList.toggle("up", up);
      deltaEl.classList.toggle("down", !up);
      deltaEl.textContent = (up ? "▲ " : "▼ ") + Math.abs(d).toFixed(1) + "%";

      // spark uses the per-day series for views/visitors; synthesize for others
      var series;
      if (kpi === "views") series = r.views;
      else if (kpi === "visitors") series = r.visitors;
      else series = makeSeries(kpi === "time" ? 5 : 9, Math.min(r.views.length, 12),
        kpi === "time" ? r.kpis.time : r.kpis.saves / 30, kpi === "time" ? 18 : 60, up ? 4 : -3);
      renderSpark(sparkEl, series, up);
    });
  }

  /* ---------- Main traffic chart (two series, area + line, hover) ---------- */
  var chart = document.getElementById("chart");
  var tooltip = document.getElementById("tooltip");
  var chartW = 720, chartH = 260;
  var mL = 44, mR = 16, mT = 16, mB = 28;
  var plotW = chartW - mL - mR;
  var plotH = chartH - mT - mB;
  var chartState = null;

  function scaleSeries(views, visitors) {
    var all = views.concat(visitors);
    var max = Math.max.apply(null, all);
    var niceMax = Math.ceil(max / 1000) * 1000;
    return niceMax;
  }

  function seriesToPath(values, max, n, close) {
    var step = n > 1 ? plotW / (n - 1) : 0;
    var d = "";
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = mL + i * step;
      var y = mT + plotH - (values[i] / max) * plotH;
      pts.push([x, y]);
      d += (i === 0 ? "M" : " L") + x.toFixed(1) + "," + y.toFixed(1);
    }
    if (close) {
      d += " L" + (mL + (n - 1) * step).toFixed(1) + "," + (mT + plotH).toFixed(1);
      d += " L" + mL.toFixed(1) + "," + (mT + plotH).toFixed(1) + " Z";
    }
    return { d: d, pts: pts };
  }

  function el(tag, attrs) {
    var node = document.createElementNS(SVGNS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function renderChart() {
    var r = RANGES[currentRange];
    var views = r.views, visitors = r.visitors;
    var n = views.length;
    var max = scaleSeries(views, visitors);
    chart.innerHTML = "";

    // gradient defs
    var defs = el("defs", {});
    function grad(id, color) {
      var g = el("linearGradient", { id: id, x1: "0", y1: "0", x2: "0", y2: "1" });
      g.appendChild(el("stop", { offset: "0%", "stop-color": color, "stop-opacity": "0.3" }));
      g.appendChild(el("stop", { offset: "100%", "stop-color": color, "stop-opacity": "0" }));
      return g;
    }
    defs.appendChild(grad("gViews", "#d6452b"));
    defs.appendChild(grad("gVisitors", "#7c8a6b"));
    chart.appendChild(defs);

    // gridlines + y labels
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var yv = (max / ticks) * t;
      var y = mT + plotH - (yv / max) * plotH;
      chart.appendChild(el("line", {
        class: "grid-line", x1: mL, y1: y, x2: mL + plotW, y2: y
      }));
      var lbl = el("text", { class: "axis-label", x: mL - 8, y: y + 3, "text-anchor": "end" });
      lbl.textContent = yv >= 1000 ? (yv / 1000) + "k" : String(Math.round(yv));
      chart.appendChild(lbl);
    }

    // x labels (a few)
    var xCount = Math.min(n, 6);
    for (var xi = 0; xi < xCount; xi++) {
      var idx = Math.round((xi / (xCount - 1)) * (n - 1));
      var xx = mL + (n > 1 ? (idx / (n - 1)) * plotW : 0);
      var xl = el("text", { class: "axis-label", x: xx, y: chartH - 8, "text-anchor": "middle" });
      var daysAgo = n - idx;
      xl.textContent = daysAgo <= 1 ? "today" : "−" + (daysAgo - 1) + "d";
      chart.appendChild(xl);
    }

    var vPath = seriesToPath(visitors, max, n, false);
    var vArea = seriesToPath(visitors, max, n, true);
    var viewPath = seriesToPath(views, max, n, false);
    var viewArea = seriesToPath(views, max, n, true);

    chart.appendChild(el("path", { class: "area-visitors", d: vArea.d }));
    chart.appendChild(el("path", { class: "area-views", d: viewArea.d }));
    chart.appendChild(el("path", { class: "line-visitors", d: vPath.d }));
    chart.appendChild(el("path", { class: "line-views", d: viewPath.d }));

    // hover layer
    var hoverLine = el("line", { class: "hover-line", x1: 0, y1: mT, x2: 0, y2: mT + plotH });
    hoverLine.style.opacity = "0";
    chart.appendChild(hoverLine);
    var dotV = el("circle", { class: "hover-dot", r: "4", stroke: "var(--tomato)" });
    var dotU = el("circle", { class: "hover-dot", r: "4", stroke: "var(--sage)" });
    dotV.style.opacity = "0"; dotU.style.opacity = "0";
    chart.appendChild(dotV); chart.appendChild(dotU);

    chartState = {
      n: n, max: max, views: views, visitors: visitors,
      viewPts: viewPath.pts, visitorPts: vPath.pts,
      hoverLine: hoverLine, dotV: dotV, dotU: dotU
    };
  }

  function onChartMove(evt) {
    if (!chartState) return;
    var rect = chart.getBoundingClientRect();
    var px = (evt.clientX - rect.left) / rect.width * chartW;
    var rel = (px - mL) / plotW;
    var idx = Math.round(rel * (chartState.n - 1));
    if (idx < 0) idx = 0;
    if (idx > chartState.n - 1) idx = chartState.n - 1;

    var vp = chartState.viewPts[idx];
    var up = chartState.visitorPts[idx];
    chartState.hoverLine.setAttribute("x1", vp[0]);
    chartState.hoverLine.setAttribute("x2", vp[0]);
    chartState.hoverLine.style.opacity = "1";
    chartState.dotV.setAttribute("cx", vp[0]); chartState.dotV.setAttribute("cy", vp[1]); chartState.dotV.style.opacity = "1";
    chartState.dotU.setAttribute("cx", up[0]); chartState.dotU.setAttribute("cy", up[1]); chartState.dotU.style.opacity = "1";

    var daysAgo = chartState.n - idx - 1;
    var dateLabel = daysAgo === 0 ? "Today" : daysAgo + " day" + (daysAgo === 1 ? "" : "s") + " ago";
    tooltip.hidden = false;
    tooltip.innerHTML =
      '<span class="tt-date">' + dateLabel + '</span>' +
      '<span class="tt-row"><i class="dot dot-views"></i>Views <strong>' + fmtInt(chartState.views[idx]) + '</strong></span>' +
      '<span class="tt-row"><i class="dot dot-visitors"></i>Visitors <strong>' + fmtInt(chartState.visitors[idx]) + '</strong></span>';
    var leftPx = (vp[0] / chartW) * rect.width;
    var topPx = (vp[1] / chartH) * rect.height;
    tooltip.style.left = leftPx + "px";
    tooltip.style.top = (topPx - 8) + "px";
  }

  function onChartLeave() {
    if (!chartState) return;
    chartState.hoverLine.style.opacity = "0";
    chartState.dotV.style.opacity = "0";
    chartState.dotU.style.opacity = "0";
    tooltip.hidden = true;
  }

  chart.addEventListener("mousemove", onChartMove);
  chart.addEventListener("mouseleave", onChartLeave);

  /* ---------- Range toggle ---------- */
  var rangeBtns = document.querySelectorAll(".range-btn");
  var chartSub = document.querySelector('[data-field="chart-sub"]');
  rangeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var r = parseInt(btn.getAttribute("data-range"), 10);
      if (r === currentRange) return;
      currentRange = r;
      rangeBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      renderKPIs();
      renderChart();
      if (chartSub) chartSub.textContent = "Page views & visitors · " + RANGES[currentRange].label;
      toast("Stats updated · " + RANGES[currentRange].label);
    });
  });

  /* ---------- Top recipes table ---------- */
  var RECIPES = [
    { title: "Charred Tomato &amp; Burrata Tart", cat: "Mains · 45 min", emoji: "🍅", grad: "linear-gradient(135deg,#e8765a,#d6452b)", views: 48210, rating: 4.8, saves: 3120, trend: 18 },
    { title: "Saffron Risotto with Peas", cat: "Mains · 35 min", emoji: "🌾", grad: "linear-gradient(135deg,#f1c45a,#e8a33d)", views: 39870, rating: 4.7, saves: 2740, trend: 9 },
    { title: "Lemon &amp; Sage Roast Chicken", cat: "Mains · 80 min", emoji: "🍋", grad: "linear-gradient(135deg,#f3d97a,#c8a85a)", views: 35640, rating: 4.9, saves: 4010, trend: 24 },
    { title: "Garlic Confit Focaccia", cat: "Bread · 3 hr", emoji: "🧄", grad: "linear-gradient(135deg,#d8c79a,#b89a63)", views: 31290, rating: 4.6, saves: 1980, trend: -4 },
    { title: "Roasted Carrot &amp; Harissa Soup", cat: "Soups · 40 min", emoji: "🥕", grad: "linear-gradient(135deg,#e89a55,#c8612b)", views: 27450, rating: 4.5, saves: 1610, trend: 0 },
    { title: "Herb Garden Green Pasta", cat: "Mains · 25 min", emoji: "🌿", grad: "linear-gradient(135deg,#9bb07a,#7c8a6b)", views: 24180, rating: 4.7, saves: 2230, trend: 12 },
    { title: "Brown Butter Fig Galette", cat: "Dessert · 55 min", emoji: "🥧", grad: "linear-gradient(135deg,#cf8a6a,#a8553a)", views: 21060, rating: 4.8, saves: 2890, trend: 7 }
  ];

  var sortKey = "views";
  var sortDir = "desc";
  var tbody = document.getElementById("recipes-body");
  var headers = document.querySelectorAll("#recipes th[data-sort]");

  function starString(rating) {
    var full = Math.round(rating);
    var s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }

  function trendCell(t) {
    if (t > 0) return '<span class="trend up">▲ ' + t + '%</span>';
    if (t < 0) return '<span class="trend down">▼ ' + Math.abs(t) + '%</span>';
    return '<span class="trend flat">— 0%</span>';
  }

  function renderTable() {
    var rows = RECIPES.slice().sort(function (a, b) {
      var av = a[sortKey], bv = b[sortKey];
      if (sortKey === "title") {
        av = a.title.replace(/&amp;/g, "&"); bv = b.title.replace(/&amp;/g, "&");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });

    tbody.innerHTML = rows.map(function (r) {
      return '<tr>' +
        '<td><div class="recipe-cell">' +
          '<div class="recipe-thumb" style="background:' + r.grad + '">' + r.emoji + '</div>' +
          '<div><div class="recipe-name">' + r.title + '</div>' +
          '<div class="recipe-meta">' + r.cat + '</div></div>' +
        '</div></td>' +
        '<td class="num">' + fmtInt(r.views) + '</td>' +
        '<td class="num"><span class="stars" aria-hidden="true">' + starString(r.rating) + '</span> ' +
          '<span class="rating-val">' + r.rating.toFixed(1) + '</span></td>' +
        '<td class="num">' + fmtInt(r.saves) + '</td>' +
        '<td class="num">' + trendCell(r.trend) + '</td>' +
      '</tr>';
    }).join("");

    headers.forEach(function (h) {
      var k = h.getAttribute("data-sort");
      h.setAttribute("aria-sort", k === sortKey ? (sortDir === "asc" ? "ascending" : "descending") : "none");
    });
  }

  headers.forEach(function (h) {
    h.addEventListener("click", function () {
      var k = h.getAttribute("data-sort");
      if (k === sortKey) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = k;
        sortDir = k === "title" ? "asc" : "desc";
      }
      renderTable();
    });
  });

  /* ---------- Comments feed ---------- */
  var COMMENTS = [
    { id: 1, name: "Priya N.", color: "#d6452b", on: "Lemon &amp; Sage Roast Chicken", text: "Made this for Sunday dinner — the sage butter under the skin is genius. Family demolished it!", status: "pending" },
    { id: 2, name: "Marco T.", color: "#7c8a6b", on: "Garlic Confit Focaccia", text: "How long does the confit garlic keep in the fridge? Want to batch it.", status: "pending" },
    { id: 3, name: "Dana R.", color: "#e8a33d", on: "Saffron Risotto with Peas", text: "First time using saffron and wow. Took 40 not 35 min but worth every stir. 🌟", status: "pending" },
    { id: 4, name: "Anon", color: "#8a7f73", on: "Charred Tomato &amp; Burrata Tart", text: "buy followers cheap >> spammy-link-here", status: "pending" }
  ];

  var commentList = document.getElementById("comment-list");
  var pendingCountEl = document.getElementById("pending-count");

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function updatePendingCount() {
    var n = COMMENTS.filter(function (c) { return c.status === "pending"; }).length;
    pendingCountEl.textContent = n + " pending";
    var navBadge = document.querySelector(".nav-badge");
    if (navBadge) navBadge.textContent = n;
  }

  function renderComments() {
    commentList.innerHTML = COMMENTS.map(function (c) {
      var resolved = c.status !== "pending";
      var actions;
      if (resolved) {
        actions = '<span class="comment-status ' + (c.status === "approved" ? "approved" : "rejected") + '">' +
          (c.status === "approved" ? "✓ Approved" : "✕ Rejected") + '</span>';
      } else {
        actions = '<div class="comment-actions">' +
          '<button class="btn-mini approve" data-act="approve" data-id="' + c.id + '">Approve</button>' +
          '<button class="btn-mini reject" data-act="reject" data-id="' + c.id + '">Reject</button>' +
        '</div>';
      }
      return '<li class="comment' + (resolved ? " resolved" : "") + '">' +
        '<span class="avatar" style="background:' + c.color + '">' + initials(c.name) + '</span>' +
        '<div class="comment-body">' +
          '<div class="comment-top"><span class="comment-name">' + c.name + '</span>' +
          '<span class="comment-on">on <em>' + c.on + '</em></span></div>' +
          '<p class="comment-text">' + c.text + '</p>' +
          actions +
        '</div></li>';
    }).join("");
    updatePendingCount();
  }

  commentList.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn) return;
    var id = parseInt(btn.getAttribute("data-id"), 10);
    var act = btn.getAttribute("data-act");
    var c = COMMENTS.find(function (x) { return x.id === id; });
    if (!c) return;
    c.status = act === "approve" ? "approved" : "rejected";
    renderComments();
    toast(act === "approve" ? "Comment approved 🌿" : "Comment rejected");
  });

  /* ---------- Init ---------- */
  renderKPIs();
  renderChart();
  renderTable();
  renderComments();
  if (chartSub) chartSub.textContent = "Page views & visitors · " + RANGES[currentRange].label;
})();
