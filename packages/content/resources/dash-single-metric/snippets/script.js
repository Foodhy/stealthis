/* Northwind Cloud — Single-KPI dashboard
   Vanilla JS only. Period selector swaps the headline MRR, delta and trend line,
   with an animated count-up. A live toggle nudges the current value periodically. */
(function () {
  "use strict";

  /* ---------- Fictional datasets ---------- */
  // Each period: a trend series (MRR by point), its x-axis labels, the previous
  // period total for delta, and the supporting stat figures.
  function gen(seed, n, base, drift, noise) {
    var arr = [];
    var v = base;
    var s = seed;
    for (var i = 0; i < n; i++) {
      // deterministic pseudo-random so the chart is stable per period
      s = (s * 9301 + 49297) % 233280;
      var r = s / 233280;
      v += drift + (r - 0.45) * noise;
      arr.push(Math.max(0, Math.round(v)));
    }
    return arr;
  }

  var DATA = {
    "7d": {
      label: "last 7 days",
      series: gen(7, 7, 372000, 1900, 5200),
      x: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      prev: 368400,
      summary: "Steady week — recurring revenue up across self-serve and sales-led plans.",
      stats: {
        customers: { value: 71, delta: "▲ 6.1%", dir: "up", spark: [40, 44, 42, 51, 49, 58, 71] },
        churn: { value: "1.7%", delta: "▼ 0.2pp", dir: "down", spark: [26, 24, 25, 22, 21, 20, 17] },
        arpu: { value: "$57.90", delta: "▲ 1.2%", dir: "up", spark: [52, 53, 54, 54, 55, 56, 58] },
        expansion: { value: "$4.1k", delta: "▲ 9.0%", dir: "up", spark: [18, 22, 20, 28, 26, 34, 41] }
      }
    },
    "30d": {
      label: "last 30 days",
      series: gen(30, 30, 351000, 880, 6400),
      x: ["W1", "", "", "", "", "W2", "", "", "", "", "W3", "", "", "", "", "W4", "", "", "", "", "W5", "", "", "", "", "", "", "", "", "Now"],
      prev: 339600,
      summary: "Strong month driven by expansion seats on the Scale tier and lower churn.",
      stats: {
        customers: { value: 312, delta: "▲ 8.4%", dir: "up", spark: [180, 205, 198, 240, 235, 280, 312] },
        churn: { value: "1.9%", delta: "▼ 0.3pp", dir: "down", spark: [30, 28, 29, 25, 24, 22, 19] },
        arpu: { value: "$58.20", delta: "▲ 2.1%", dir: "up", spark: [50, 52, 53, 55, 56, 57, 58] },
        expansion: { value: "$14.6k", delta: "▲ 12.0%", dir: "up", spark: [60, 72, 70, 95, 92, 120, 146] }
      }
    },
    "90d": {
      label: "last 90 days",
      series: gen(90, 90, 298000, 1050, 7800),
      x: ["Mar", "", "", "", "", "", "", "", "", "Apr", "", "", "", "", "", "", "", "", "May", "", "", "", "", "", "", "", "", "Jun", "", "",
          "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
          "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      prev: 271200,
      summary: "Quarter-over-quarter growth steady at double digits with falling churn.",
      stats: {
        customers: { value: 904, delta: "▲ 14.2%", dir: "up", spark: [520, 600, 590, 690, 700, 820, 904] },
        churn: { value: "2.1%", delta: "▼ 0.5pp", dir: "down", spark: [34, 32, 30, 28, 26, 24, 21] },
        arpu: { value: "$56.40", delta: "▲ 3.4%", dir: "up", spark: [46, 48, 50, 52, 53, 55, 56] },
        expansion: { value: "$41.2k", delta: "▲ 18.5%", dir: "up", spark: [120, 160, 150, 220, 240, 320, 412] }
      }
    }
  };

  // chart geometry
  var VB = { w: 920, h: 320, padL: 56, padR: 16, padT: 18, padB: 30 };

  var state = { period: "7d", live: true, timer: null, raf: null };

  /* ---------- DOM ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var heroValue = $("#heroValue");
  var periodLabel = $("#periodLabel");
  var heroSummary = $("#heroSummary");
  var deltaChip = $("#deltaChip");
  var deltaArrow = $("#deltaArrow");
  var deltaPct = $("#deltaPct");
  var deltaAbs = $("#deltaAbs");
  var svg = $("#trendSvg");
  var tip = $("#trendTip");
  var tipValue = $("#tipValue");
  var tipLabel = $("#tipLabel");
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- Formatting ---------- */
  function fmtMoney(n) {
    return Math.round(n).toLocaleString("en-US");
  }
  function fmtCompact(n) {
    if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
    return "$" + Math.round(n);
  }

  /* ---------- Count-up animation ---------- */
  function animateValue(el, from, to, dur) {
    if (state.raf) cancelAnimationFrame(state.raf);
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var cur = from + (to - from) * ease(p);
      el.textContent = fmtMoney(cur);
      if (p < 1) state.raf = requestAnimationFrame(step);
      else { el.textContent = fmtMoney(to); el.dataset.value = String(to); }
    }
    state.raf = requestAnimationFrame(step);
  }

  /* ---------- SVG helpers ---------- */
  function makeEl(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  // map a series to screen coordinates
  function project(series) {
    var min = Math.min.apply(null, series);
    var max = Math.max.apply(null, series);
    var range = max - min || 1;
    // pad the y-domain a touch so the line never hugs the edges
    var lo = min - range * 0.12;
    var hi = max + range * 0.12;
    var w = VB.w - VB.padL - VB.padR;
    var h = VB.h - VB.padT - VB.padB;
    var pts = series.map(function (v, i) {
      var x = VB.padL + (series.length === 1 ? 0 : (i / (series.length - 1)) * w);
      var y = VB.padT + (1 - (v - lo) / (hi - lo)) * h;
      return { x: x, y: y, v: v };
    });
    return { pts: pts, lo: lo, hi: hi };
  }

  // smooth path (Catmull-Rom -> cubic bezier)
  function smoothPath(pts) {
    if (pts.length < 2) return "";
    var d = "M" + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6;
      var c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6;
      var c2y = p2.y - (p3.y - p1.y) / 6;
      d += " C" + c1x.toFixed(1) + " " + c1y.toFixed(1) + " " +
        c2x.toFixed(1) + " " + c2y.toFixed(1) + " " +
        p2.x.toFixed(1) + " " + p2.y.toFixed(1);
    }
    return d;
  }

  var lastPts = [];

  function drawTrend(d) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var proj = project(d.series);
    lastPts = proj.pts;

    // gradient def for the area fill
    var defs = makeEl("defs", {});
    var grad = makeEl("linearGradient", { id: "areaGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(makeEl("stop", { offset: "0%", "stop-color": "#5b5bf0", "stop-opacity": "0.26" }));
    grad.appendChild(makeEl("stop", { offset: "100%", "stop-color": "#5b5bf0", "stop-opacity": "0" }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    // y gridlines + labels (5 rows)
    var rows = 4;
    for (var r = 0; r <= rows; r++) {
      var t = r / rows;
      var y = VB.padT + t * (VB.h - VB.padT - VB.padB);
      svg.appendChild(makeEl("line", {
        class: "grid-line", x1: VB.padL, x2: VB.w - VB.padR, y1: y.toFixed(1), y2: y.toFixed(1)
      }));
      var val = proj.hi - t * (proj.hi - proj.lo);
      var lbl = makeEl("text", { class: "y-label", x: VB.padL - 10, y: (y + 4).toFixed(1), "text-anchor": "end" });
      lbl.textContent = "$" + (val / 1000).toFixed(0) + "k";
      svg.appendChild(lbl);
    }

    // x labels (only non-empty)
    var w = VB.w - VB.padL - VB.padR;
    d.x.forEach(function (lab, i) {
      if (!lab) return;
      var x = VB.padL + (d.x.length === 1 ? 0 : (i / (d.x.length - 1)) * w);
      var t = makeEl("text", { class: "x-label", x: x.toFixed(1), y: VB.h - 8, "text-anchor": "middle" });
      t.textContent = lab;
      svg.appendChild(t);
    });

    // area fill
    var areaD = smoothPath(proj.pts) +
      " L" + proj.pts[proj.pts.length - 1].x.toFixed(1) + " " + (VB.h - VB.padB) +
      " L" + proj.pts[0].x.toFixed(1) + " " + (VB.h - VB.padB) + " Z";
    svg.appendChild(makeEl("path", { class: "area-fill", d: areaD, fill: "url(#areaGrad)" }));

    // line with draw-in animation
    var lineD = smoothPath(proj.pts);
    var line = makeEl("path", { class: "line-path", d: lineD });
    svg.appendChild(line);
    var len = line.getTotalLength ? line.getTotalLength() : 0;
    if (len) {
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      line.getBoundingClientRect(); // reflow
      line.style.transition = "stroke-dashoffset 0.7s ease";
      line.style.strokeDashoffset = "0";
    }

    // endpoint dot
    var end = proj.pts[proj.pts.length - 1];
    svg.appendChild(makeEl("circle", { class: "cross-dot", cx: end.x, cy: end.y, r: 4.5 }));

    // crosshair group (hidden until hover)
    var cross = makeEl("g", { id: "crossGroup", style: "opacity:0" });
    cross.appendChild(makeEl("line", { id: "crossLine", class: "cross-line", y1: VB.padT, y2: VB.h - VB.padB }));
    cross.appendChild(makeEl("circle", { id: "crossDot", class: "cross-dot", r: 5.5 }));
    svg.appendChild(cross);

    // transparent hit rect for hover
    svg.appendChild(makeEl("rect", { x: 0, y: 0, width: VB.w, height: VB.h, fill: "transparent", id: "hit" }));
    var hit = $("#hit", svg);
    hit.addEventListener("mousemove", onHover);
    hit.addEventListener("mouseleave", hideTip);
    hit.addEventListener("touchmove", function (e) {
      if (e.touches[0]) onHover(e.touches[0]);
    }, { passive: true });
  }

  function onHover(e) {
    if (!lastPts.length) return;
    var rect = svg.getBoundingClientRect();
    var px = ((e.clientX - rect.left) / rect.width) * VB.w;
    // nearest point
    var best = lastPts[0], bi = 0;
    for (var i = 1; i < lastPts.length; i++) {
      if (Math.abs(lastPts[i].x - px) < Math.abs(best.x - px)) { best = lastPts[i]; bi = i; }
    }
    var cross = $("#crossGroup", svg);
    var line = $("#crossLine", svg);
    var dot = $("#crossDot", svg);
    if (cross) cross.style.opacity = "1";
    if (line) { line.setAttribute("x1", best.x); line.setAttribute("x2", best.x); }
    if (dot) { dot.setAttribute("cx", best.x); dot.setAttribute("cy", best.y); }

    tip.hidden = false;
    tipValue.textContent = "$" + fmtMoney(best.v);
    var xl = DATA[state.period].x[bi] || ("Point " + (bi + 1));
    tipLabel.textContent = xl;
    tip.style.left = (best.x / VB.w) * rect.width + "px";
    tip.style.top = (best.y / VB.h) * rect.height + "px";
  }

  function hideTip() {
    tip.hidden = true;
    var cross = $("#crossGroup", svg);
    if (cross) cross.style.opacity = "0";
  }

  /* ---------- Sparklines ---------- */
  function drawSpark(path, vals) {
    var w = 120, h = 36, pad = 3;
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    var range = max - min || 1;
    var d = vals.map(function (v, i) {
      var x = pad + (i / (vals.length - 1)) * (w - pad * 2);
      var y = pad + (1 - (v - min) / range) * (h - pad * 2);
      return (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
    path.setAttribute("d", d);
  }

  /* ---------- Render a period ---------- */
  function render(period) {
    var d = DATA[period];
    state.period = period;

    var total = d.series[d.series.length - 1];
    var from = parseFloat(heroValue.dataset.value || "0");
    animateValue(heroValue, from, total, 700);

    periodLabel.textContent = d.label;
    heroSummary.textContent = d.summary;

    var diff = total - d.prev;
    var pct = (diff / d.prev) * 100;
    var up = diff >= 0;
    deltaChip.classList.toggle("up", up);
    deltaChip.classList.toggle("down", !up);
    deltaArrow.textContent = up ? "▲" : "▼";
    deltaPct.textContent = Math.abs(pct).toFixed(1) + "%";
    deltaAbs.textContent = (up ? "+$" : "−$") + fmtMoney(Math.abs(diff));

    drawTrend(d);

    // supporting stats
    $$(".stat-card").forEach(function (card) {
      var key = card.dataset.stat;
      var s = d.stats[key];
      if (!s) return;
      $(".stat-value", card).textContent = s.value;
      var dl = $(".stat-delta", card);
      dl.textContent = s.delta;
      dl.className = "stat-delta " + s.dir;
      drawSpark($(".spark-line", card), s.spark);
    });
  }

  /* ---------- Live tick ---------- */
  function startLive() {
    stopLive();
    state.timer = setInterval(function () {
      var d = DATA[state.period];
      var last = d.series[d.series.length - 1];
      // small ± nudge, biased slightly up
      var nudge = Math.round((Math.random() - 0.42) * (last * 0.0016));
      d.series[d.series.length - 1] = Math.max(0, last + nudge);
      var from = parseFloat(heroValue.dataset.value || "0");
      var to = d.series[d.series.length - 1];
      animateValue(heroValue, from, to, 450);
      // recompute delta + redraw quietly
      var diff = to - d.prev;
      var pct = (diff / d.prev) * 100;
      var up = diff >= 0;
      deltaChip.classList.toggle("up", up);
      deltaChip.classList.toggle("down", !up);
      deltaArrow.textContent = up ? "▲" : "▼";
      deltaPct.textContent = Math.abs(pct).toFixed(1) + "%";
      deltaAbs.textContent = (up ? "+$" : "−$") + fmtMoney(Math.abs(diff));
      drawTrend(d);
    }, 3200);
  }
  function stopLive() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
  }

  /* ---------- Toast ---------- */
  var toastWrap = $("#toastWrap");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 220);
    }, 2400);
  }

  /* ---------- Wire up ---------- */
  $$(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      $$(".seg-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      render(btn.dataset.period);
      if (state.live) startLive();
      toast("Showing " + DATA[btn.dataset.period].label);
    });
  });

  var liveToggle = $("#liveToggle");
  liveToggle.addEventListener("change", function () {
    state.live = liveToggle.checked;
    if (state.live) { startLive(); toast("Live updates on"); }
    else { stopLive(); toast("Live updates paused"); }
  });

  // mobile nav
  var menuToggle = $("#menuToggle");
  var sidebar = $(".sidebar");
  var scrim = $("#scrim");
  function openNav() {
    sidebar.classList.add("open");
    scrim.classList.add("show");
    scrim.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    sidebar.classList.remove("open");
    scrim.classList.remove("show");
    scrim.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  }
  menuToggle.addEventListener("click", function () {
    sidebar.classList.contains("open") ? closeNav() : openNav();
  });
  scrim.addEventListener("click", closeNav);
  $$(".nav-link").forEach(function (l) {
    l.addEventListener("click", function (e) {
      e.preventDefault();
      $$(".nav-link").forEach(function (n) { n.classList.remove("is-active"); n.removeAttribute("aria-current"); });
      l.classList.add("is-active");
      l.setAttribute("aria-current", "page");
      closeNav();
    });
  });

  // widget menus
  $$(".dots").forEach(function (b) {
    b.addEventListener("click", function () { toast("Widget options coming soon"); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  // redraw on resize so tips/positions stay aligned
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { drawTrend(DATA[state.period]); }, 150);
  });

  // initial paint
  render("7d");
  startLive();
})();
