/* Waymark — Travel Site Dashboard
   Vanilla JS. A reporting-period switch recomputes KPIs, sparklines, the
   seasonality chart and region bars; the top-guides table is sortable.
   All data is fictional and generated deterministically per period. */
(function () {
  "use strict";

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Formatters ---------- */
  var nf = new Intl.NumberFormat("en-US");
  function compact(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 || n % 1e3 === 0 ? 0 : 1) + "k";
    return nf.format(Math.round(n));
  }
  function mmss(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = Math.round(totalSeconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function signedPct(p) {
    return (p > 0 ? "+" : p < 0 ? "−" : "") + Math.abs(p).toFixed(1) + "%";
  }

  /* ---------- Period model ----------
     Each period defines a base scale + a deterministic seasonality phase so
     the curves and KPIs shift believably when you switch range. */
  var PERIODS = {
    "7":   { label: "last 7 days",   scale: 0.21, dayCount: 7,   read: 214, phase: 6, gain: 1.18 },
    "28":  { label: "last 28 days",  scale: 1.0,  dayCount: 28,  read: 232, phase: 5, gain: 1.0 },
    "90":  { label: "last 90 days",  scale: 3.05, dayCount: 90,  read: 248, phase: 3, gain: 0.86 },
    "365": { label: "last 12 months", scale: 12.4, dayCount: 365, read: 266, phase: 0, gain: 0.72 }
  };

  // Deterministic pseudo-random from an integer seed (no external libs).
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Monthly seasonality shape (0..1), Northern-hemisphere summer-leaning travel.
  var SEASON_SHAPE = [0.34, 0.30, 0.40, 0.55, 0.70, 0.86, 1.0, 0.97, 0.74, 0.58, 0.46, 0.62];

  function buildModel(period) {
    var p = PERIODS[period];
    var r = rng(period.length * 97 + parseInt(period, 10));

    // KPI base values scaled by period.
    var visitors = Math.round(48200 * p.scale * (0.96 + r() * 0.08));
    var destViews = Math.round(31400 * p.scale * (0.95 + r() * 0.1));
    var guideViews = Math.round(73900 * p.scale * (0.97 + r() * 0.07));
    var readTime = p.read; // seconds

    // Deltas vs previous period — coupled to period gain so 7d looks hotter.
    function delta(mid) {
      return Math.round((mid * p.gain + (r() - 0.5) * 6) * 10) / 10;
    }

    var kpis = {
      visitors:    { value: visitors,   display: compact(visitors),   delta: delta(7.4),  unit: "visitors" },
      destinations:{ value: destViews,  display: compact(destViews),  delta: delta(4.2),  unit: "views" },
      guideViews:  { value: guideViews, display: compact(guideViews), delta: delta(9.1),  unit: "views" },
      readTime:    { value: readTime,   display: mmss(readTime),      delta: delta(-1.6), unit: "min:sec" }
    };

    // Sparkline series (12 points) per KPI, riding the seasonality shape.
    function spark(base, vol) {
      var pts = [];
      for (var i = 0; i < 12; i++) {
        var seasonal = SEASON_SHAPE[(i + p.phase) % 12];
        var noise = (r() - 0.5) * vol;
        pts.push(base * (0.55 + seasonal * 0.5) * (1 + noise));
      }
      return pts;
    }
    kpis.visitors.series = spark(1, 0.22);
    kpis.destinations.series = spark(1, 0.18);
    kpis.guideViews.series = spark(1, 0.2);
    // read time is steadier
    kpis.readTime.series = spark(1, 0.08);

    // Seasonality chart: interest (index 0..100) + bookings (index 0..100).
    var interest = [];
    var bookings = [];
    for (var m = 0; m < 12; m++) {
      var shape = SEASON_SHAPE[m];
      interest.push(Math.round(Math.max(8, Math.min(100, shape * 100 * (0.92 + r() * 0.12)))));
      // bookings lag interest by ~1 month and sit a bit lower.
      var lag = SEASON_SHAPE[(m + 11) % 12];
      bookings.push(Math.round(Math.max(6, Math.min(100, lag * 78 * (0.9 + r() * 0.16)))));
    }

    // Destinations by region — share of guide views (%).
    var regionsRaw = [
      { name: "Mediterranean", flag: "🌊" },
      { name: "Southeast Asia", flag: "🏝️" },
      { name: "Andes & Patagonia", flag: "🏔️" },
      { name: "Nordic & Arctic", flag: "❄️" },
      { name: "East Africa", flag: "🦒" },
      { name: "Pacific Coast", flag: "🌅" }
    ];
    var weights = regionsRaw.map(function () { return 0.5 + r(); });
    var wTotal = weights.reduce(function (a, b) { return a + b; }, 0);
    var regions = regionsRaw.map(function (reg, i) {
      var pct = (weights[i] / wTotal) * 100;
      return { name: reg.name, flag: reg.flag, pct: pct, views: Math.round(guideViews * pct / 100) };
    }).sort(function (a, b) { return b.pct - a.pct; });

    // Top guides table.
    var guidesBase = [
      { title: "48 Hours in Lisbon", tag: "City guide", grad: ["#1f8a8a", "#2fa3a3"] },
      { title: "Slow Train Through the Alps", tag: "Rail journey", grad: ["#e8623f", "#f08055"] },
      { title: "Kyoto in Cherry Season", tag: "Seasonal", grad: ["#d99425", "#e8ab48"] },
      { title: "Patagonia on Foot", tag: "Trek", grad: ["#166a6a", "#1f8a8a"] },
      { title: "The Amalfi Drive", tag: "Road trip", grad: ["#c84a2a", "#e8623f"] },
      { title: "Marrakech Market Map", tag: "Food & maps", grad: ["#a36b1f", "#d99425"] },
      { title: "Reykjavík to the Ring Road", tag: "Self-drive", grad: ["#2c6e7a", "#3f9aa8"] },
      { title: "Hidden Beaches of Palawan", tag: "Island guide", grad: ["#1f8a8a", "#52b3b3"] }
    ];
    var guides = guidesBase.map(function (g, i) {
      var views = Math.round((9400 - i * 760) * p.scale * (0.85 + r() * 0.35));
      var saves = Math.round(views * (0.06 + r() * 0.05));
      var read = Math.round((180 + r() * 160));
      var trend = Math.round(((r() - 0.42) * 24) * 10) / 10;
      return { title: g.title, tag: g.tag, grad: g.grad, views: views, saves: saves, read: read, trend: trend };
    });

    return { kpis: kpis, interest: interest, bookings: bookings, regions: regions, guides: guides };
  }

  /* ---------- Sparkline renderer ---------- */
  function renderSpark(svg, series, color) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var W = 120, H = 32, pad = 3;
    var min = Math.min.apply(null, series);
    var max = Math.max.apply(null, series);
    var range = max - min || 1;
    var n = series.length;
    var xy = series.map(function (v, i) {
      var x = pad + (i / (n - 1)) * (W - pad * 2);
      var y = H - pad - ((v - min) / range) * (H - pad * 2);
      return [x, y];
    });
    var line = xy.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var area = line + " L" + (W - pad).toFixed(1) + " " + (H - pad) + " L" + pad + " " + (H - pad) + " Z";

    var fill = document.createElementNS(SVGNS, "path");
    fill.setAttribute("class", "fill");
    fill.setAttribute("d", area);
    fill.setAttribute("fill", color);
    svg.appendChild(fill);

    var stroke = document.createElementNS(SVGNS, "path");
    stroke.setAttribute("class", "stroke");
    stroke.setAttribute("d", line);
    stroke.setAttribute("stroke", color);
    svg.appendChild(stroke);

    var last = xy[xy.length - 1];
    var dot = document.createElementNS(SVGNS, "circle");
    dot.setAttribute("cx", last[0].toFixed(1));
    dot.setAttribute("cy", last[1].toFixed(1));
    dot.setAttribute("r", "2.4");
    dot.setAttribute("fill", color);
    svg.appendChild(dot);
  }

  /* ---------- KPI cards ---------- */
  var kpiCards = Array.prototype.slice.call(document.querySelectorAll(".kpi"));
  var TEAL = getComputedStyle(document.documentElement).getPropertyValue("--teal").trim() || "#1f8a8a";
  var CORAL = getComputedStyle(document.documentElement).getPropertyValue("--coral").trim() || "#e8623f";

  function renderKpis(model, periodLabel) {
    kpiCards.forEach(function (card) {
      var key = card.getAttribute("data-kpi");
      var data = model.kpis[key];
      if (!data) return;
      card.querySelector("[data-value]").textContent = data.display;

      var deltaEl = card.querySelector("[data-delta]");
      var up = data.delta >= 0;
      deltaEl.textContent = signedPct(data.delta);
      deltaEl.classList.toggle("up", up);
      deltaEl.classList.toggle("down", !up);

      var footEl = card.querySelector("[data-foot]");
      footEl.textContent = "vs previous period · " + periodLabel;

      var spark = card.querySelector("[data-spark]");
      renderSpark(spark, data.series, key === "readTime" ? CORAL : TEAL);
    });
  }

  /* ---------- Seasonality chart ---------- */
  var seasonChart = document.getElementById("seasonChart");
  var seasonCaption = document.getElementById("seasonCaption");
  var seasonGeom = null; // stored for hover

  function renderSeason(model) {
    while (seasonChart.firstChild) seasonChart.removeChild(seasonChart.firstChild);
    var W = 720, H = 280;
    var left = 40, right = 16, top = 18, bottom = 34;
    var plotW = W - left - right;
    var plotH = H - top - bottom;
    var n = 12;
    var maxV = 100;

    function X(i) { return left + (i / (n - 1)) * plotW; }
    function Y(v) { return top + (1 - v / maxV) * plotH; }

    // gridlines + y labels
    [0, 25, 50, 75, 100].forEach(function (g) {
      var y = Y(g);
      var ln = document.createElementNS(SVGNS, "line");
      ln.setAttribute("class", "grid-line");
      ln.setAttribute("x1", left); ln.setAttribute("x2", W - right);
      ln.setAttribute("y1", y.toFixed(1)); ln.setAttribute("y2", y.toFixed(1));
      seasonChart.appendChild(ln);
      var lbl = document.createElementNS(SVGNS, "text");
      lbl.setAttribute("class", "axis-label");
      lbl.setAttribute("x", left - 8); lbl.setAttribute("y", (y + 4).toFixed(1));
      lbl.setAttribute("text-anchor", "end");
      lbl.textContent = g;
      seasonChart.appendChild(lbl);
    });

    // x labels
    for (var i = 0; i < n; i++) {
      var t = document.createElementNS(SVGNS, "text");
      t.setAttribute("class", "axis-label");
      t.setAttribute("x", X(i).toFixed(1));
      t.setAttribute("y", H - 12);
      t.setAttribute("text-anchor", "middle");
      t.textContent = MONTHS[i];
      seasonChart.appendChild(t);
    }

    function path(series) {
      return series.map(function (v, i) {
        return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1);
      }).join(" ");
    }

    // interest area
    var areaD = path(model.interest) + " L" + X(n - 1).toFixed(1) + " " + Y(0).toFixed(1) +
      " L" + X(0).toFixed(1) + " " + Y(0).toFixed(1) + " Z";
    var area = document.createElementNS(SVGNS, "path");
    area.setAttribute("class", "interest-fill");
    area.setAttribute("d", areaD);
    seasonChart.appendChild(area);

    var interestLine = document.createElementNS(SVGNS, "path");
    interestLine.setAttribute("class", "interest-line");
    interestLine.setAttribute("d", path(model.interest));
    seasonChart.appendChild(interestLine);

    var bookingLine = document.createElementNS(SVGNS, "path");
    bookingLine.setAttribute("class", "booking-line");
    bookingLine.setAttribute("d", path(model.bookings));
    seasonChart.appendChild(bookingLine);

    // hover line + dots
    var hoverLine = document.createElementNS(SVGNS, "line");
    hoverLine.setAttribute("class", "hover-line");
    hoverLine.setAttribute("y1", top); hoverLine.setAttribute("y2", top + plotH);
    seasonChart.appendChild(hoverLine);

    var dotI = document.createElementNS(SVGNS, "circle");
    dotI.setAttribute("class", "dot");
    dotI.setAttribute("r", "0"); dotI.setAttribute("fill", TEAL);
    seasonChart.appendChild(dotI);
    var dotB = document.createElementNS(SVGNS, "circle");
    dotB.setAttribute("class", "dot");
    dotB.setAttribute("r", "0"); dotB.setAttribute("fill", CORAL);
    seasonChart.appendChild(dotB);

    // invisible hover columns
    var hotGroup = document.createElementNS(SVGNS, "g");
    for (var c = 0; c < n; c++) {
      var rect = document.createElementNS(SVGNS, "rect");
      rect.setAttribute("class", "hot-col");
      var x0 = c === 0 ? left : (X(c) + X(c - 1)) / 2;
      var x1 = c === n - 1 ? W - right : (X(c) + X(c + 1)) / 2;
      rect.setAttribute("x", x0.toFixed(1));
      rect.setAttribute("y", top);
      rect.setAttribute("width", (x1 - x0).toFixed(1));
      rect.setAttribute("height", plotH);
      rect.setAttribute("data-index", c);
      rect.setAttribute("tabindex", "0");
      rect.setAttribute("role", "img");
      rect.setAttribute("aria-label",
        MONTHS[c] + ": interest " + model.interest[c] + ", bookings " + model.bookings[c]);
      hotGroup.appendChild(rect);
    }
    seasonChart.appendChild(hotGroup);

    seasonGeom = { X: X, Y: Y, hoverLine: hoverLine, dotI: dotI, dotB: dotB, model: model };

    function showAt(idx) {
      if (idx == null || idx < 0) {
        hoverLine.style.opacity = "0";
        dotI.setAttribute("r", "0"); dotB.setAttribute("r", "0");
        seasonCaption.innerHTML = "Hover a month to inspect interest and bookings.";
        return;
      }
      var x = X(idx);
      hoverLine.setAttribute("x1", x.toFixed(1));
      hoverLine.setAttribute("x2", x.toFixed(1));
      hoverLine.style.opacity = "0.5";
      dotI.setAttribute("cx", x.toFixed(1)); dotI.setAttribute("cy", Y(model.interest[idx]).toFixed(1));
      dotI.setAttribute("r", "4.5");
      dotB.setAttribute("cx", x.toFixed(1)); dotB.setAttribute("cy", Y(model.bookings[idx]).toFixed(1));
      dotB.setAttribute("r", "4.5");
      seasonCaption.innerHTML =
        "<strong>" + MONTHS[idx] + "</strong> — interest <strong>" + model.interest[idx] +
        "</strong> · bookings <strong>" + model.bookings[idx] + "</strong>";
    }

    var hotRects = hotGroup.querySelectorAll(".hot-col");
    Array.prototype.forEach.call(hotRects, function (rect) {
      var idx = parseInt(rect.getAttribute("data-index"), 10);
      rect.addEventListener("mouseenter", function () { showAt(idx); });
      rect.addEventListener("focus", function () { showAt(idx); });
    });
    hotGroup.addEventListener("mouseleave", function () { showAt(null); });

    // animate lines in
    [interestLine, bookingLine].forEach(function (p) {
      try {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        // force reflow then transition
        p.getBoundingClientRect();
        p.style.transition = "stroke-dashoffset 0.9s ease";
        requestAnimationFrame(function () { p.style.strokeDashoffset = "0"; });
      } catch (e) { /* getTotalLength unsupported — leave static */ }
    });
  }

  /* ---------- Region bars ---------- */
  var regionBars = document.getElementById("regionBars");
  function renderRegions(model) {
    regionBars.innerHTML = "";
    var max = Math.max.apply(null, model.regions.map(function (r) { return r.pct; }));
    model.regions.forEach(function (reg) {
      var li = document.createElement("li");
      li.className = "bar-row";
      li.innerHTML =
        '<div class="bar-top">' +
          '<span class="bar-name"><span class="bar-flag" aria-hidden="true">' + reg.flag + '</span>' +
            reg.name + '</span>' +
          '<span class="bar-val">' + reg.pct.toFixed(1) + '% · ' + compact(reg.views) + '</span>' +
        '</div>' +
        '<div class="bar-track"><div class="bar-fill"></div></div>';
      regionBars.appendChild(li);
      var fill = li.querySelector(".bar-fill");
      // animate from 0 to width on next frame
      requestAnimationFrame(function () {
        fill.style.width = ((reg.pct / max) * 100).toFixed(1) + "%";
      });
    });
  }

  /* ---------- Top guides table ---------- */
  var guidesBody = document.getElementById("guidesBody");
  var guidesTable = document.getElementById("guidesTable");
  var currentGuides = [];
  var sortKey = "views";
  var sortDir = "descending";

  function trendCell(t) {
    var cls = t > 0.5 ? "up" : t < -0.5 ? "down" : "flat";
    var arrow = t > 0.5 ? "▲" : t < -0.5 ? "▼" : "■";
    return '<span class="trend ' + cls + '">' + arrow + " " + signedPct(t) + "</span>";
  }

  function renderGuides() {
    var sorted = currentGuides.slice().sort(function (a, b) {
      var av, bv;
      if (sortKey === "title") { av = a.title.toLowerCase(); bv = b.title.toLowerCase(); }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (av < bv) return sortDir === "ascending" ? -1 : 1;
      if (av > bv) return sortDir === "ascending" ? 1 : -1;
      return 0;
    });

    guidesBody.innerHTML = "";
    sorted.forEach(function (g) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><div class="guide-cell">' +
          '<span class="guide-thumb" aria-hidden="true" style="background:linear-gradient(135deg,' +
            g.grad[0] + ',' + g.grad[1] + ')"></span>' +
          '<span><span class="guide-title">' + g.title + '</span><br>' +
          '<span class="guide-tag">' + g.tag + '</span></span>' +
        '</div></td>' +
        '<td class="num">' + nf.format(g.views) + '</td>' +
        '<td class="num">' + nf.format(g.saves) + '</td>' +
        '<td class="num">' + mmss(g.read) + '</td>' +
        '<td class="num">' + trendCell(g.trend) + '</td>';
      guidesBody.appendChild(tr);
    });

    // reflect aria-sort on headers
    Array.prototype.forEach.call(guidesTable.querySelectorAll(".sort"), function (btn) {
      if (btn.getAttribute("data-sort") === sortKey) {
        btn.setAttribute("aria-sort", sortDir);
      } else {
        btn.removeAttribute("aria-sort");
      }
    });
  }

  Array.prototype.forEach.call(guidesTable.querySelectorAll(".sort"), function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-sort");
      if (key === sortKey) {
        sortDir = sortDir === "ascending" ? "descending" : "ascending";
      } else {
        sortKey = key;
        sortDir = key === "title" ? "ascending" : "descending";
      }
      renderGuides();
    });
  });

  /* ---------- Period switch ---------- */
  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));

  function applyPeriod(period) {
    var model = buildModel(period);
    var label = PERIODS[period].label;
    currentGuides = model.guides;
    renderKpis(model, label);
    renderSeason(model);
    renderRegions(model);
    renderGuides();
  }

  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var period = btn.getAttribute("data-period");
      segBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        if (active) b.setAttribute("aria-pressed", "true");
        else b.removeAttribute("aria-pressed");
      });
      applyPeriod(period);
      toast("Showing " + PERIODS[period].label);
    });
  });

  /* ---------- Export (mock) ---------- */
  var exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var active = document.querySelector(".seg-btn.is-active");
      var period = active ? active.getAttribute("data-period") : "28";
      toast("Exported " + PERIODS[period].label + " report (CSV) — demo only");
    });
  }

  /* ---------- Live count ticker ---------- */
  var liveCount = document.getElementById("liveCount");
  if (liveCount) {
    setInterval(function () {
      var cur = parseInt(liveCount.textContent, 10) || 300;
      var next = Math.max(180, Math.min(640, cur + Math.round((Math.random() - 0.5) * 26)));
      liveCount.textContent = next;
    }, 3200);
  }

  /* ---------- Rail link active state on click ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".rail-link"), function (link) {
    link.addEventListener("click", function () {
      document.querySelectorAll(".rail-link").forEach(function (l) {
        l.classList.remove("is-active");
        l.removeAttribute("aria-current");
      });
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    });
  });

  /* ---------- Init ---------- */
  applyPeriod("28");
})();
