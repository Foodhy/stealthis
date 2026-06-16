(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- helpers ---------- */
  function el(tag, attrs, ns) {
    var node = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "class") node.setAttribute("class", attrs[k]);
      else node.setAttribute(k, attrs[k]);
    }
    return node;
  }
  function fmtMoney(n) {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(2).replace(/\.00$/, "") + "M";
    if (n >= 1000) return "$" + (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return "$" + Math.round(n).toLocaleString();
  }
  function fmtMoneyFull(n) { return "$" + Math.round(n).toLocaleString(); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  var toastEl = document.getElementById("toast");
  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- data model (deterministic per period) ---------- */
  var PERIODS = {
    "30d": {
      label: "Trailing 30 days · vs previous 30 days",
      months: ["W1", "W2", "W3", "W4"],
      growthLabels: ["W1", "W2", "W3", "W4"],
      // monthly movement: [new, expansion, churned]
      movement: [[58, 22, -19], [64, 27, -16], [61, 31, -23], [72, 29, -18]],
      baseMrr: 1980000,
      churnPct: 2.4, churnPrev: 2.7,
      nrr: 109, nrrPrev: 107,
      ltv: 4120, ltvPrev: 3980,
      mrrDelta: 4.1, arrDelta: 4.1,
      plans: [["Starter", 0.16, "#a5b4fc"], ["Growth", 0.41, "#6366f1"], ["Scale", 0.31, "#4338ca"], ["Enterprise", 0.12, "#312e81"]],
      cohorts: [
        ["Mar", [100, 91, 84, 80, 77, 75]],
        ["Apr", [100, 89, 83, 79, 76, null]],
        ["May", [100, 92, 86, 82, null, null]],
        ["Jun", [100, 90, 85, null, null, null]]
      ]
    },
    "90d": {
      label: "Trailing 90 days · vs previous 90 days",
      months: ["Apr", "May", "Jun"],
      movement: [[176, 78, -58], [188, 91, -52], [203, 84, -61]],
      baseMrr: 1820000,
      churnPct: 2.7, churnPrev: 3.1,
      nrr: 107, nrrPrev: 104,
      ltv: 3980, ltvPrev: 3760,
      mrrDelta: 8.7, arrDelta: 8.7,
      plans: [["Starter", 0.18, "#a5b4fc"], ["Growth", 0.40, "#6366f1"], ["Scale", 0.30, "#4338ca"], ["Enterprise", 0.12, "#312e81"]],
      cohorts: [
        ["Jan", [100, 88, 80, 74, 70, 67]],
        ["Feb", [100, 90, 82, 76, 72, null]],
        ["Mar", [100, 91, 84, 80, null, null]],
        ["Apr", [100, 89, 83, null, null, null]]
      ]
    },
    "12m": {
      label: "Trailing 12 months · vs previous 12 months",
      months: ["Q1", "Q2", "Q3", "Q4"],
      movement: [[520, 210, -180], [580, 248, -172], [640, 271, -201], [712, 305, -188]],
      baseMrr: 1240000,
      churnPct: 3.2, churnPrev: 4.0,
      nrr: 104, nrrPrev: 99,
      ltv: 3760, ltvPrev: 3210,
      mrrDelta: 38.4, arrDelta: 38.4,
      plans: [["Starter", 0.21, "#a5b4fc"], ["Growth", 0.39, "#6366f1"], ["Scale", 0.28, "#4338ca"], ["Enterprise", 0.12, "#312e81"]],
      cohorts: [
        ["Q3'24", [100, 85, 76, 70, 66, 63]],
        ["Q4'24", [100, 87, 79, 73, 69, null]],
        ["Q1'25", [100, 89, 82, 77, null, null]],
        ["Q2'25", [100, 90, 84, null, null, null]]
      ]
    }
  };

  var current = "30d";

  /* ---------- KPI cards ---------- */
  function setDelta(card, val, goodWhenUp) {
    var d = card.querySelector("[data-delta]");
    var up = val >= 0;
    var positive = goodWhenUp ? up : !up;
    d.className = "delta " + (positive ? "up" : "down");
    d.textContent = (up ? "▲ " : "▼ ") + Math.abs(val).toFixed(1) + "%";
  }

  function renderKpis(d) {
    var totalMrr = d.baseMrr;
    var arr = totalMrr * 12;

    var mrr = document.getElementById("kpi-mrr");
    mrr.querySelector("[data-value]").textContent = fmtMoney(totalMrr);
    mrr.querySelector("[data-sub]").textContent = "Monthly recurring revenue";
    setDelta(mrr, d.mrrDelta, true);

    var ar = document.getElementById("kpi-arr");
    ar.querySelector("[data-value]").textContent = fmtMoney(arr);
    ar.querySelector("[data-sub]").textContent = "Annual run rate";
    setDelta(ar, d.arrDelta, true);

    var ch = document.getElementById("kpi-churn");
    ch.querySelector("[data-value]").textContent = d.churnPct.toFixed(1) + "%";
    ch.querySelector("[data-sub]").textContent = "Gross revenue churn";
    setDelta(ch, ((d.churnPct - d.churnPrev) / d.churnPrev) * 100, false);

    var lt = document.getElementById("kpi-ltv");
    lt.querySelector("[data-value]").textContent = fmtMoneyFull(d.ltv);
    lt.querySelector("[data-sub]").textContent = "Avg. customer lifetime value";
    setDelta(lt, ((d.ltv - d.ltvPrev) / d.ltvPrev) * 100, true);

    var nr = document.getElementById("kpi-nrr");
    nr.querySelector("[data-value]").textContent = d.nrr + "%";
    nr.querySelector("[data-sub]").textContent = "Net revenue retention";
    setDelta(nr, ((d.nrr - d.nrrPrev) / d.nrrPrev) * 100, true);
  }

  /* ---------- MRR movement stacked bars ---------- */
  var movTip = document.getElementById("movementTip");
  function renderMovement(d) {
    var svg = document.getElementById("movementChart");
    svg.innerHTML = "";
    var W = 720, H = 280, padL = 46, padB = 30, padT = 14, padR = 8;
    var plotW = W - padL - padR, plotH = H - padB - padT;

    var maxUp = 0, maxDn = 0;
    d.movement.forEach(function (m) {
      maxUp = Math.max(maxUp, m[0] + m[1]);
      maxDn = Math.max(maxDn, -m[2]);
    });
    var max = Math.ceil((maxUp + maxDn * 0) * 1.12);
    var scaleMax = Math.ceil(Math.max(maxUp, maxDn) * 1.15 / 10) * 10;
    var zeroY = padT + plotH * (scaleMax / (scaleMax * 2));
    function yUp(v) { return zeroY - (v / scaleMax) * (plotH / 2); }
    function yDn(v) { return zeroY + (v / scaleMax) * (plotH / 2); }

    // gridlines
    [scaleMax, scaleMax / 2, 0, -scaleMax / 2, -scaleMax].forEach(function (gv) {
      var y = gv >= 0 ? yUp(gv) : yDn(-gv);
      svg.appendChild(el("line", { x1: padL, x2: W - padR, y1: y, y2: y, class: "grid-line" }, SVGNS));
      var lbl = el("text", { x: padL - 8, y: y + 3, class: "axis-label", "text-anchor": "end" }, SVGNS);
      lbl.textContent = "$" + Math.round(gv) + "K";
      svg.appendChild(lbl);
    });

    var n = d.movement.length;
    var slot = plotW / n;
    var bw = Math.min(46, slot * 0.5);

    d.movement.forEach(function (m, i) {
      var cx = padL + slot * i + slot / 2;
      var x = cx - bw / 2;
      var g = el("g", { class: "bar-grp" }, SVGNS);

      var newH = (m[0] / scaleMax) * (plotH / 2);
      var expH = (m[1] / scaleMax) * (plotH / 2);
      var churnH = (-m[2] / scaleMax) * (plotH / 2);

      var rNew = el("rect", { class: "seg bar-new", x: x, y: zeroY - newH, width: bw, height: newH, rx: 3 }, SVGNS);
      var rExp = el("rect", { class: "seg bar-exp", x: x, y: zeroY - newH - expH, width: bw, height: expH, rx: 3 }, SVGNS);
      var rCh = el("rect", { class: "seg bar-churn", x: x, y: zeroY, width: bw, height: churnH, rx: 3 }, SVGNS);
      g.appendChild(rNew); g.appendChild(rExp); g.appendChild(rCh);

      var lbl = el("text", { x: cx, y: H - 10, class: "axis-label", "text-anchor": "middle" }, SVGNS);
      lbl.textContent = d.months[i];
      svg.appendChild(lbl);

      // hover hit-area
      var hit = el("rect", { x: x - 6, y: padT, width: bw + 12, height: plotH, fill: "transparent", style: "cursor:pointer" }, SVGNS);
      hit.addEventListener("mousemove", function (ev) {
        showMovTip(ev, svg, d.months[i], m);
        Array.prototype.forEach.call(svg.querySelectorAll(".bar-grp"), function (bg) {
          bg.classList.toggle("dim", bg !== g);
        });
      });
      hit.addEventListener("mouseleave", function () {
        movTip.hidden = true;
        Array.prototype.forEach.call(svg.querySelectorAll(".bar-grp"), function (bg) { bg.classList.remove("dim"); });
      });
      g.appendChild(hit);
      svg.appendChild(g);
    });

    // zero baseline
    svg.appendChild(el("line", { x1: padL, x2: W - padR, y1: zeroY, y2: zeroY, stroke: "var(--muted)", "stroke-width": 1.4 }, SVGNS));
  }

  function showMovTip(ev, svg, label, m) {
    var net = m[0] + m[1] + m[2];
    movTip.innerHTML =
      '<div style="margin-bottom:4px"><b>' + label + '</b></div>' +
      '<div class="tt-row"><span class="tt-dot" style="background:var(--brand)"></span>New $' + m[0] + 'K</div>' +
      '<div class="tt-row"><span class="tt-dot" style="background:var(--exp)"></span>Expansion $' + m[1] + 'K</div>' +
      '<div class="tt-row"><span class="tt-dot" style="background:var(--danger)"></span>Churned $' + m[2] + 'K</div>' +
      '<div style="margin-top:4px;border-top:1px solid rgba(255,255,255,.2);padding-top:3px"><b>Net +$' + net + 'K</b></div>';
    positionTip(movTip, ev, svg);
  }

  function positionTip(tip, ev, svg) {
    var rect = svg.getBoundingClientRect();
    var wrap = svg.parentElement;
    var wrapRect = wrap.getBoundingClientRect();
    tip.hidden = false;
    var x = ev.clientX - wrapRect.left;
    var y = ev.clientY - wrapRect.top;
    tip.style.left = clamp(x, 60, wrapRect.width - 60) + "px";
    tip.style.top = y + "px";
  }

  /* ---------- Growth area chart ---------- */
  var grTip = document.getElementById("growthTip");
  var grPts = [];
  function renderGrowth(d) {
    var svg = document.getElementById("growthChart");
    svg.innerHTML = "";
    var W = 720, H = 240, padL = 46, padB = 26, padT = 14, padR = 8;
    var plotW = W - padL - padR, plotH = H - padB - padT;

    // build cumulative recurring revenue series from movement nets
    var start = d.baseMrr * 0.84;
    var series = [];
    var running = start;
    series.push(start);
    d.movement.forEach(function (m) {
      running += (m[0] + m[1] + m[2]) * 1000 * (d.baseMrr / 1980000);
      series.push(running);
    });
    // normalize last to baseMrr
    var scale = d.baseMrr / series[series.length - 1];
    series = series.map(function (v) { return v * scale; });

    var labels = ["start"].concat(d.months);
    var min = Math.min.apply(null, series) * 0.96;
    var max = Math.max.apply(null, series) * 1.04;
    function x(i) { return padL + (plotW * i) / (series.length - 1); }
    function y(v) { return padT + plotH - ((v - min) / (max - min)) * plotH; }

    // gridlines
    for (var gi = 0; gi <= 3; gi++) {
      var gv = min + ((max - min) * gi) / 3;
      var gy = y(gv);
      svg.appendChild(el("line", { x1: padL, x2: W - padR, y1: gy, y2: gy, class: "grid-line" }, SVGNS));
      var t = el("text", { x: padL - 8, y: gy + 3, class: "axis-label", "text-anchor": "end" }, SVGNS);
      t.textContent = fmtMoney(gv);
      svg.appendChild(t);
    }

    // gradient def
    var defs = el("defs", null, SVGNS);
    var grad = el("linearGradient", { id: "areaGrad", x1: 0, y1: 0, x2: 0, y2: 1 }, SVGNS);
    grad.appendChild(el("stop", { offset: "0%", "stop-color": "var(--brand)", "stop-opacity": ".34" }, SVGNS));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "var(--brand)", "stop-opacity": "0" }, SVGNS));
    defs.appendChild(grad);
    svg.appendChild(defs);

    var linePath = "", areaPath = "";
    grPts = [];
    series.forEach(function (v, i) {
      var px = x(i), py = y(v);
      grPts.push({ x: px, y: py, v: v, label: labels[i] });
      linePath += (i === 0 ? "M" : "L") + px.toFixed(1) + " " + py.toFixed(1) + " ";
    });
    areaPath = linePath + "L" + x(series.length - 1) + " " + (padT + plotH) + " L" + padL + " " + (padT + plotH) + " Z";

    svg.appendChild(el("path", { d: areaPath, class: "area-fill" }, SVGNS));
    svg.appendChild(el("path", { d: linePath.trim(), class: "area-line" }, SVGNS));

    var cursor = el("line", { class: "area-cursor", y1: padT, y2: padT + plotH, x1: 0, x2: 0 }, SVGNS);
    svg.appendChild(cursor);
    var dot = el("circle", { class: "area-dot", r: 5, cx: 0, cy: 0 }, SVGNS);
    svg.appendChild(dot);

    // labels
    labels.forEach(function (lb, i) {
      if (i === 0) return;
      var t = el("text", { x: x(i), y: H - 8, class: "axis-label", "text-anchor": "middle" }, SVGNS);
      t.textContent = lb;
      svg.appendChild(t);
    });

    var hit = el("rect", { class: "area-hit", x: padL, y: padT, width: plotW, height: plotH }, SVGNS);
    hit.addEventListener("mousemove", function (ev) {
      var pt = svgPointX(svg, ev);
      var nearest = grPts[0], nd = Infinity;
      grPts.forEach(function (p) { var dd = Math.abs(p.x - pt); if (dd < nd) { nd = dd; nearest = p; } });
      dot.setAttribute("cx", nearest.x); dot.setAttribute("cy", nearest.y); dot.style.opacity = 1;
      cursor.setAttribute("x1", nearest.x); cursor.setAttribute("x2", nearest.x); cursor.style.opacity = 1;
      grTip.innerHTML = '<b>' + fmtMoneyFull(nearest.v) + '</b><br>' + (nearest.label === "start" ? "period start" : nearest.label + " · MRR");
      grTip.hidden = false;
      var wrapRect = svg.parentElement.getBoundingClientRect();
      var svgRect = svg.getBoundingClientRect();
      var ratio = svgRect.width / W;
      grTip.style.left = clamp(nearest.x * ratio, 60, wrapRect.width - 60) + "px";
      grTip.style.top = (nearest.y * (svgRect.height / H)) + "px";
    });
    hit.addEventListener("mouseleave", function () {
      grTip.hidden = true; dot.style.opacity = 0; cursor.style.opacity = 0;
    });
    svg.appendChild(hit);

    // growth badge
    var pct = ((series[series.length - 1] - series[0]) / series[0]) * 100;
    var badge = document.getElementById("growthBadge");
    badge.textContent = (pct >= 0 ? "+" : "") + pct.toFixed(1) + "% growth";
    badge.style.color = pct >= 0 ? "var(--ok)" : "var(--danger)";
  }

  function svgPointX(svg, ev) {
    var r = svg.getBoundingClientRect();
    return ((ev.clientX - r.left) / r.width) * 720;
  }

  /* ---------- Donut ---------- */
  function renderDonut(d) {
    var svg = document.getElementById("donutChart");
    svg.innerHTML = "";
    var cx = 100, cy = 100, r = 74, rin = 50;
    var total = d.baseMrr;
    var legend = document.getElementById("donutLegend");
    legend.innerHTML = "";
    document.getElementById("donutTotal").textContent = fmtMoney(total);

    var angle = -90;
    d.plans.forEach(function (p) {
      var name = p[0], frac = p[1], color = p[2];
      var sweep = frac * 360;
      var a0 = (angle * Math.PI) / 180;
      var a1 = ((angle + sweep) * Math.PI) / 180;
      var large = sweep > 180 ? 1 : 0;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var xi0 = cx + rin * Math.cos(a0), yi0 = cy + rin * Math.sin(a0);
      var xi1 = cx + rin * Math.cos(a1), yi1 = cy + rin * Math.sin(a1);
      var path = "M" + x0 + " " + y0 +
        " A" + r + " " + r + " 0 " + large + " 1 " + x1 + " " + y1 +
        " L" + xi1 + " " + yi1 +
        " A" + rin + " " + rin + " 0 " + large + " 0 " + xi0 + " " + yi0 + " Z";
      var seg = el("path", { d: path, fill: color, class: "donut-seg" }, SVGNS);
      var val = total * frac;
      seg.addEventListener("mouseenter", function () {
        document.getElementById("donutTotal").textContent = fmtMoney(val);
      });
      seg.addEventListener("mouseleave", function () {
        document.getElementById("donutTotal").textContent = fmtMoney(total);
      });
      seg.addEventListener("click", function () { toast(name + " · " + fmtMoneyFull(val) + " MRR (" + Math.round(frac * 100) + "%)"); });
      svg.appendChild(seg);
      angle += sweep;

      var li = el("li");
      li.appendChild(el("span", { class: "dl-sw", style: "background:" + color }));
      li.appendChild(el("span", { class: "dl-name", text: name }));
      li.appendChild(el("span", { class: "dl-val", text: fmtMoney(val) }));
      li.appendChild(el("span", { class: "dl-pct", text: Math.round(frac * 100) + "%" }));
      legend.appendChild(li);
    });
  }

  /* ---------- Heatmap ---------- */
  function heatColor(v) {
    // 60..100 → amber → green
    var t = clamp((v - 58) / (100 - 58), 0, 1);
    // interpolate amber (253,230,138) -> teal (52,211,153) -> deep green (5,150,105)
    var c1 = [253, 230, 138], c2 = [52, 211, 153], c3 = [5, 150, 105];
    var rgb;
    if (t < 0.5) { var k = t / 0.5; rgb = mix(c1, c2, k); }
    else { var k2 = (t - 0.5) / 0.5; rgb = mix(c2, c3, k2); }
    return "rgb(" + rgb.join(",") + ")";
  }
  function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }); }

  function renderHeatmap(d) {
    var hm = document.getElementById("heatmap");
    hm.innerHTML = "";
    // header row
    hm.appendChild(el("div", { class: "heat-h", text: "Cohort" }));
    ["M0", "M1", "M2", "M3", "M4", "M5"].forEach(function (h) {
      hm.appendChild(el("div", { class: "heat-h", text: h }));
    });
    d.cohorts.forEach(function (row) {
      hm.appendChild(el("div", { class: "heat-y", text: row[0] }));
      row[1].forEach(function (v, i) {
        if (v === null) {
          hm.appendChild(el("div", { class: "heat-cell empty", text: "·" }));
        } else {
          var cell = el("div", { class: "heat-cell", text: v + "%" });
          cell.style.background = heatColor(v);
          if (v > 88) cell.style.color = "#06281c";
          cell.title = row[0] + " cohort · " + v + "% retained at month " + i;
          hm.appendChild(cell);
        }
      });
    });
  }

  /* ---------- render all ---------- */
  function renderAll() {
    var d = PERIODS[current];
    document.getElementById("rangeLabel").textContent = d.label;
    renderKpis(d);
    renderMovement(d);
    renderGrowth(d);
    renderDonut(d);
    renderHeatmap(d);
  }

  /* ---------- period switch ---------- */
  var segBtns = document.querySelectorAll(".seg-btn");
  Array.prototype.forEach.call(segBtns, function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      Array.prototype.forEach.call(segBtns, function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      current = btn.dataset.period;
      renderAll();
      toast("Period: " + btn.textContent.trim());
    });
  });

  /* ---------- theme toggle ---------- */
  var themeBtn = document.getElementById("themeToggle");
  themeBtn.addEventListener("click", function () {
    var html = document.documentElement;
    var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    // redraw charts that depend on CSS vars resolved at draw time is fine; re-render for gradients
    renderAll();
    toast(next === "dark" ? "Dark theme" : "Light theme");
  });

  // redraw on resize (tooltips/positions depend on px)
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(renderAll, 160);
  });

  renderAll();
})();
