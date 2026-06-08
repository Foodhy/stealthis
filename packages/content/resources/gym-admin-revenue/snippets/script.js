(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------------- Toast ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  /* ---------------- Formatting ---------------- */
  function money(n) {
    if (n >= 1000) return "$" + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
    return "$" + Math.round(n).toLocaleString();
  }
  function moneyFull(n) {
    return "$" + Math.round(n).toLocaleString();
  }

  /* ---------------- Synthetic but deterministic data ---------------- */
  // seeded pseudo-random so charts look organic yet stable per range
  function seeded(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Build a revenue series of N points for a range key.
  function buildSeries(rangeKey) {
    var cfg = {
      "30d": { points: 30, base: 1480, growth: 0.0022, label: "30 days", seed: 11 },
      "90d": { points: 13, base: 38000, growth: 0.012, label: "90 days", seed: 23 },
      "12m": { points: 12, base: 142000, growth: 0.028, label: "12 months", seed: 41 }
    }[rangeKey];

    var rnd = seeded(cfg.seed);
    var pts = [];
    var val = cfg.base;
    for (var i = 0; i < cfg.points; i++) {
      var noise = (rnd() - 0.4) * cfg.base * 0.06;
      val = val * (1 + cfg.growth) + noise;
      var total = Math.max(cfg.base * 0.7, val);
      pts.push({
        i: i,
        total: total,
        recurring: total * (0.72 + rnd() * 0.08),
        label: pointLabel(rangeKey, i, cfg.points)
      });
    }
    return { pts: pts, label: cfg.label };
  }

  function pointLabel(rangeKey, i, count) {
    if (rangeKey === "12m") {
      var months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      return months[i % 12];
    }
    if (rangeKey === "90d") {
      return "Wk " + (i + 1);
    }
    return "Day " + (i + 1);
  }

  // KPI snapshots per range
  var KPI = {
    "30d": {
      mrr: { value: 48200, delta: 4.1, fmt: money },
      arpu: { value: 61, delta: 1.8, fmt: moneyFull },
      churn: { value: 3.4, delta: -0.3, fmt: pct, lowerBetter: true },
      ltv: { value: 1790, delta: 2.6, fmt: money }
    },
    "90d": {
      mrr: { value: 51640, delta: 7.2, fmt: money },
      arpu: { value: 63, delta: 2.4, fmt: moneyFull },
      churn: { value: 3.1, delta: -0.6, fmt: pct, lowerBetter: true },
      ltv: { value: 1965, delta: 5.1, fmt: money }
    },
    "12m": {
      mrr: { value: 54900, delta: 22.5, fmt: money },
      arpu: { value: 66, delta: 9.3, fmt: moneyFull },
      churn: { value: 2.8, delta: -1.4, fmt: pct, lowerBetter: true },
      ltv: { value: 2240, delta: 18.7, fmt: money }
    }
  };
  function pct(n) {
    return n.toFixed(1) + "%";
  }

  var MIX = [
    { name: "Unlimited", count: 412, color: "#c6ff3a" },
    { name: "Standard", count: 286, color: "#ff6a2b" },
    { name: "Class Pass", count: 174, color: "#6aa3ff" },
    { name: "Off-Peak", count: 98, color: "#34d399" },
    { name: "Student", count: 63, color: "#fbbf24" }
  ];

  var CLASSES = [
    { name: "Hyrox Conditioning", coach: "M. Okafor", rev: 18400 },
    { name: "Olympic Lifting", coach: "S. Vargas", rev: 14250 },
    { name: "Spin Inferno", coach: "L. Petrov", rev: 11900 },
    { name: "Mobility & Recovery", coach: "D. Reyes", rev: 7350 },
    { name: "Open Mat BJJ", coach: "K. Tanaka", rev: 5120 }
  ];

  // Cohort retention: rows = join cohort, cols = months since join
  var COHORTS = [
    { name: "Jan '26", vals: [100, 88, 79, 71, 66, 62] },
    { name: "Feb '26", vals: [100, 90, 82, 75, 69, null] },
    { name: "Mar '26", vals: [100, 87, 80, 73, null, null] },
    { name: "Apr '26", vals: [100, 91, 84, null, null, null] },
    { name: "May '26", vals: [100, 89, null, null, null, null] },
    { name: "Jun '26", vals: [100, null, null, null, null, null] }
  ];

  /* ---------------- KPI rendering ---------------- */
  function renderKPIs(rangeKey) {
    var set = KPI[rangeKey];
    document.querySelectorAll(".kpi").forEach(function (card) {
      var key = card.getAttribute("data-kpi");
      var m = set[key];
      card.querySelector('[data-field="value"]').textContent = m.fmt(m.value);
      var d = card.querySelector('[data-field="delta"]');
      var positive = m.lowerBetter ? m.delta < 0 : m.delta >= 0;
      d.textContent = (m.delta >= 0 ? "+" : "") + m.delta.toFixed(1) + "%";
      d.classList.toggle("is-up", positive);
      d.classList.toggle("is-down", !positive);
      drawSpark(card.querySelector("[data-spark]"), key, rangeKey, positive);
    });
  }

  function drawSpark(svg, key, rangeKey, positive) {
    if (!svg) return;
    svg.innerHTML = "";
    var rnd = seeded(key.charCodeAt(0) + rangeKey.length * 7);
    var n = 16;
    var W = 120;
    var H = 36;
    var vals = [];
    var v = 0.5;
    for (var i = 0; i < n; i++) {
      v += (rnd() - (positive ? 0.4 : 0.6)) * 0.18;
      v = Math.max(0.08, Math.min(0.95, v));
      vals.push(v);
    }
    var pts = vals.map(function (val, i) {
      return [(i / (n - 1)) * W, H - val * H];
    });
    var d = "M" + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L");
    var area = d + " L" + W + "," + H + " L0," + H + " Z";
    var color = positive ? "var(--neon)" : "var(--danger)";

    var fill = el("path", { d: area, fill: positive ? "var(--neon-50)" : "rgba(248,113,113,0.12)" });
    var line = el("path", { d: d, fill: "none", stroke: color, "stroke-width": "2", "stroke-linejoin": "round", "stroke-linecap": "round" });
    svg.appendChild(fill);
    svg.appendChild(line);
  }

  /* ---------------- SVG helper ---------------- */
  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* ---------------- Revenue area/line chart ---------------- */
  var revChart = document.getElementById("revChart");
  var revSvg = revChart ? revChart.querySelector("svg") : null;
  var revTip = document.getElementById("revTip");
  var currentSeries = null;
  var chartGeom = null;

  function renderRevenue(rangeKey) {
    var data = buildSeries(rangeKey);
    currentSeries = data;
    document.querySelectorAll("[data-range-label]").forEach(function (n) {
      n.textContent = data.label;
    });
    if (!revSvg) return;
    revSvg.innerHTML = "";

    var W = 720, H = 280;
    var padL = 52, padR = 14, padT = 16, padB = 30;
    var iw = W - padL - padR;
    var ih = H - padT - padB;
    var pts = data.pts;

    var max = 0;
    pts.forEach(function (p) { if (p.total > max) max = p.total; });
    max = max * 1.12;

    function x(i) { return padL + (i / (pts.length - 1)) * iw; }
    function y(v) { return padT + ih - (v / max) * ih; }

    // gridlines + y labels
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var gv = (max / ticks) * t;
      var gy = y(gv);
      revSvg.appendChild(el("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, class: "axis-line" }));
      var lbl = el("text", { x: padL - 8, y: gy + 4, "text-anchor": "end", class: "axis-label" });
      lbl.textContent = money(gv);
      revSvg.appendChild(lbl);
    }

    // x labels (sparse)
    var step = Math.ceil(pts.length / 6);
    pts.forEach(function (p, i) {
      if (i % step === 0 || i === pts.length - 1) {
        var tx = el("text", { x: x(i), y: H - 8, "text-anchor": "middle", class: "axis-label" });
        tx.textContent = p.label;
        revSvg.appendChild(tx);
      }
    });

    // line paths
    function pathFor(field) {
      return "M" + pts.map(function (p, i) { return x(i).toFixed(1) + "," + y(p[field]).toFixed(1); }).join(" L");
    }
    var totalPath = pathFor("total");
    var recPath = pathFor("recurring");

    // total area
    var areaD = totalPath + " L" + x(pts.length - 1).toFixed(1) + "," + (padT + ih) + " L" + x(0).toFixed(1) + "," + (padT + ih) + " Z";
    // gradient
    var defs = el("defs", {});
    defs.innerHTML =
      '<linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(198,255,58,0.28)"/>' +
      '<stop offset="100%" stop-color="rgba(198,255,58,0.01)"/>' +
      "</linearGradient>";
    revSvg.appendChild(defs);

    revSvg.appendChild(el("path", { d: areaD, fill: "url(#revGrad)" }));
    revSvg.appendChild(el("path", { d: recPath, fill: "none", stroke: "var(--orange)", "stroke-width": "2.5", "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": "4 4" }));
    revSvg.appendChild(el("path", { d: totalPath, fill: "none", stroke: "var(--neon)", "stroke-width": "3", "stroke-linejoin": "round", "stroke-linecap": "round" }));

    // hover layer
    var hLine = el("line", { x1: 0, y1: padT, x2: 0, y2: padT + ih, class: "hover-line", opacity: "0" });
    var dotT = el("circle", { r: "4.5", fill: "var(--neon)", class: "hover-dot", opacity: "0" });
    var dotR = el("circle", { r: "4", fill: "var(--orange)", class: "hover-dot", opacity: "0" });
    revSvg.appendChild(hLine);
    revSvg.appendChild(dotT);
    revSvg.appendChild(dotR);

    var overlay = el("rect", { x: padL, y: padT, width: iw, height: ih, fill: "transparent", style: "cursor:crosshair" });
    revSvg.appendChild(overlay);

    chartGeom = { x: x, y: y, pts: pts, padL: padL, iw: iw, hLine: hLine, dotT: dotT, dotR: dotR, overlay: overlay };

    overlay.addEventListener("mousemove", onRevMove);
    overlay.addEventListener("mouseleave", function () {
      hLine.setAttribute("opacity", "0");
      dotT.setAttribute("opacity", "0");
      dotR.setAttribute("opacity", "0");
      if (revTip) revTip.hidden = true;
    });
  }

  function onRevMove(e) {
    if (!chartGeom) return;
    var rect = revSvg.getBoundingClientRect();
    var scale = 720 / rect.width;
    var px = (e.clientX - rect.left) * scale;
    var rel = (px - chartGeom.padL) / chartGeom.iw;
    var idx = Math.round(rel * (chartGeom.pts.length - 1));
    idx = Math.max(0, Math.min(chartGeom.pts.length - 1, idx));
    var p = chartGeom.pts[idx];
    var cx = chartGeom.x(idx);

    chartGeom.hLine.setAttribute("x1", cx);
    chartGeom.hLine.setAttribute("x2", cx);
    chartGeom.hLine.setAttribute("opacity", "1");
    chartGeom.dotT.setAttribute("cx", cx);
    chartGeom.dotT.setAttribute("cy", chartGeom.y(p.total));
    chartGeom.dotT.setAttribute("opacity", "1");
    chartGeom.dotR.setAttribute("cx", cx);
    chartGeom.dotR.setAttribute("cy", chartGeom.y(p.recurring));
    chartGeom.dotR.setAttribute("opacity", "1");

    if (revTip) {
      revTip.hidden = false;
      revTip.innerHTML =
        "<b>" + p.label + "</b>" +
        '<div class="tip-row"><i class="dot dot--neon"></i>' + moneyFull(p.total) + "</div>" +
        '<div class="tip-row"><i class="dot dot--orange"></i>' + moneyFull(p.recurring) + "</div>";
      var leftPct = (cx / 720) * 100;
      revTip.style.left = leftPct + "%";
      revTip.style.top = (chartGeom.y(p.total) / 280) * 100 + "%";
    }
  }

  /* ---------------- Donut ---------------- */
  function renderDonut() {
    var g = document.getElementById("donutG");
    if (!g) return;
    g.innerHTML = "";
    var total = MIX.reduce(function (s, m) { return s + m.count; }, 0);
    document.getElementById("donutTotal").textContent = total.toLocaleString();

    var R = 72, r = 48;
    var start = -Math.PI / 2;
    MIX.forEach(function (m, idx) {
      var frac = m.count / total;
      var end = start + frac * Math.PI * 2;
      var path = el("path", {
        d: arcPath(0, 0, R, r, start, end),
        fill: m.color,
        class: "arc",
        "data-idx": idx
      });
      path.addEventListener("mouseenter", function () {
        g.querySelectorAll(".arc").forEach(function (a, i) {
          a.classList.toggle("is-dim", i !== idx);
        });
        document.getElementById("donutTotal").textContent = Math.round(frac * 100) + "%";
        document.querySelector(".donut__label").textContent = m.name;
      });
      path.addEventListener("mouseleave", function () {
        g.querySelectorAll(".arc").forEach(function (a) { a.classList.remove("is-dim"); });
        document.getElementById("donutTotal").textContent = total.toLocaleString();
        document.querySelector(".donut__label").textContent = "members";
      });
      g.appendChild(path);
      start = end;
    });

    // mix list
    var list = document.getElementById("mixList");
    list.innerHTML = "";
    MIX.forEach(function (m) {
      var li = document.createElement("li");
      li.className = "mix__row";
      li.innerHTML =
        '<span class="mix__swatch" style="background:' + m.color + '"></span>' +
        '<span class="mix__name">' + m.name + "</span>" +
        '<span class="mix__count">' + m.count + "</span>" +
        '<span class="mix__pct">' + Math.round((m.count / total) * 100) + "%</span>";
      list.appendChild(li);
    });
  }

  function arcPath(cx, cy, R, r, a0, a1) {
    var large = a1 - a0 > Math.PI ? 1 : 0;
    var x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    var x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    var x2 = cx + r * Math.cos(a1), y2 = cy + r * Math.sin(a1);
    var x3 = cx + r * Math.cos(a0), y3 = cy + r * Math.sin(a0);
    return (
      "M" + x0.toFixed(2) + "," + y0.toFixed(2) +
      " A" + R + "," + R + " 0 " + large + " 1 " + x1.toFixed(2) + "," + y1.toFixed(2) +
      " L" + x2.toFixed(2) + "," + y2.toFixed(2) +
      " A" + r + "," + r + " 0 " + large + " 0 " + x3.toFixed(2) + "," + y3.toFixed(2) +
      " Z"
    );
  }

  /* ---------------- Cohort heat grid ---------------- */
  function renderCohort() {
    var wrap = document.getElementById("cohort");
    if (!wrap) return;
    wrap.innerHTML = "";
    var cols = COHORTS[0].vals.length;
    wrap.style.setProperty("--cols", cols);

    // header
    var head = document.createElement("div");
    head.className = "cohort__head";
    head.innerHTML = '<div class="cohort__corner">Cohort</div>';
    for (var c = 0; c < cols; c++) {
      var ch = document.createElement("div");
      ch.className = "cohort__colhead";
      ch.textContent = "M" + c;
      head.appendChild(ch);
    }
    wrap.appendChild(head);

    COHORTS.forEach(function (co) {
      var row = document.createElement("div");
      row.className = "cohort__row";
      var lbl = document.createElement("div");
      lbl.className = "cohort__label";
      lbl.textContent = co.name;
      row.appendChild(lbl);

      co.vals.forEach(function (v, mi) {
        var cell = document.createElement("div");
        if (v === null) {
          cell.className = "cell cell--empty";
          cell.textContent = "·";
        } else {
          cell.className = "cell";
          cell.style.background = heatColor(v);
          cell.style.color = v < 45 ? "var(--ink)" : "#0d0f12";
          cell.textContent = v + "%";
          cell.title = co.name + " · month " + mi + ": " + v + "% retained";
        }
        row.appendChild(cell);
      });
      wrap.appendChild(row);
    });
  }

  // 0..100 -> neon intensity
  function heatColor(v) {
    var t = v / 100;
    var alpha = 0.14 + t * 0.86;
    // blend from dark neon to bright neon
    return "rgba(198,255,58," + alpha.toFixed(2) + ")";
  }

  /* ---------------- Top classes bars ---------------- */
  function renderClasses() {
    var ul = document.getElementById("classBars");
    if (!ul) return;
    ul.innerHTML = "";
    var max = Math.max.apply(null, CLASSES.map(function (c) { return c.rev; }));
    CLASSES.forEach(function (c) {
      var li = document.createElement("li");
      li.innerHTML =
        '<div class="bar__top">' +
        '<span class="bar__name">' + c.name + '<span class="bar__sub">' + c.coach + "</span></span>" +
        '<span class="bar__val">' + moneyFull(c.rev) + "</span>" +
        "</div>" +
        '<div class="bar__track"><div class="bar__fill"></div></div>';
      ul.appendChild(li);
      var fill = li.querySelector(".bar__fill");
      // animate in next frame
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = (c.rev / max) * 100 + "%";
        });
      });
    });
  }

  /* ---------------- Range toggle ---------------- */
  var currentRange = "90d";
  function setRange(rangeKey) {
    currentRange = rangeKey;
    document.querySelectorAll(".range__btn").forEach(function (b) {
      var on = b.getAttribute("data-range") === rangeKey;
      b.classList.toggle("is-active", on);
      if (on) b.setAttribute("aria-pressed", "true");
      else b.removeAttribute("aria-pressed");
    });
    renderKPIs(rangeKey);
    renderRevenue(rangeKey);
  }

  document.querySelectorAll(".range__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var rk = b.getAttribute("data-range");
      if (rk === currentRange) return;
      setRange(rk);
      toast(currentSeries ? "Range updated · " + currentSeries.label : "Range updated");
    });
  });

  var exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      toast("Report queued · CSV will arrive by email");
    });
  }

  /* ---------------- Init ---------------- */
  renderDonut();
  renderCohort();
  renderClasses();
  setRange(currentRange);

  // redraw revenue on resize (tooltip geometry depends on width)
  var rzTimer;
  window.addEventListener("resize", function () {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () {
      renderRevenue(currentRange);
    }, 150);
  });
})();
