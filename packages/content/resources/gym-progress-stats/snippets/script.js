/* Gym — Progress Stats. Vanilla JS, no libraries. Self-drawn SVG charts. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  /* ── Toast helper ── */
  var toastHost = document.querySelector(".toast-host");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = msg;
    toastHost.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("in");
    });
    setTimeout(function () {
      el.classList.remove("in");
      setTimeout(function () {
        el.remove();
      }, 250);
    }, 2200);
  }

  /* ── Data: per-metric series + PRs ──
     Each metric carries series for 4w / 12w / 52w plus a chart "kind". */
  function seed(rangeKey, base, drift, jitter, count) {
    var pts = [];
    var rng = mulberry(rangeKey * 9301 + count * 49297);
    var v = base;
    for (var i = 0; i < count; i++) {
      v += drift + (rng() - 0.5) * jitter;
      pts.push(Math.round(v * 10) / 10);
    }
    return pts;
  }
  function mulberry(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function labelsFor(range) {
    if (range === 4) return ["W1", "W2", "W3", "W4"];
    if (range === 12) return ["W1", "W3", "W5", "W7", "W9", "W11", "W12"];
    return ["Jan", "Mar", "May", "Jul", "Sep", "Nov", "Now"];
  }
  function countFor(range) {
    return range === 4 ? 4 : range === 12 ? 7 : 7;
  }

  var METRICS = {
    strength: {
      eyebrow: "Total volume",
      title: "Weekly training volume",
      legend: "Volume (kg)",
      kind: "bar",
      unit: "kg",
      series: {
        4: seed(11, 13800, 220, 1400, 4),
        12: seed(12, 12200, 520, 2200, 7),
        52: seed(15, 9800, 1100, 3200, 7),
      },
      target: { 4: 14500, 12: 14500, 52: 14500 },
    },
    cardio: {
      eyebrow: "5k pace",
      title: "Average running pace",
      legend: "Pace (sec/km)",
      kind: "line",
      unit: "s/km",
      series: {
        4: seed(21, 312, -2.2, 6, 4),
        12: seed(22, 326, -2.6, 8, 7),
        52: seed(25, 358, -4.4, 12, 7),
      },
      target: { 4: 300, 12: 300, 52: 300 },
    },
    body: {
      eyebrow: "Bodyweight trend",
      title: "Where you're heading",
      legend: "Bodyweight (kg)",
      kind: "line",
      unit: "kg",
      series: {
        4: seed(31, 82.4, -0.32, 0.5, 4),
        12: seed(32, 83.6, -0.36, 0.7, 7),
        52: seed(35, 88.5, -0.7, 1.1, 7),
      },
      target: { 4: 79.5, 12: 79.5, 52: 79.5 },
    },
  };

  var PRS = {
    strength: [
      { ico: "🏋️", name: "Back Squat", val: 182.5, u: "kg", date: "May 28", trend: "up", d: "+5.0 kg" },
      { ico: "💪", name: "Bench Press", val: 122.5, u: "kg", date: "Jun 02", trend: "up", d: "+2.5 kg" },
      { ico: "🪨", name: "Deadlift", val: 215.0, u: "kg", date: "May 14", trend: "flat", d: "matched" },
      { ico: "🤸", name: "Overhead Press", val: 72.5, u: "kg", date: "Apr 30", trend: "up", d: "+2.5 kg" },
    ],
    cardio: [
      { ico: "🏃", name: "5k Run", val: "22:48", u: "", date: "Jun 01", trend: "up", d: "-41 s" },
      { ico: "🚴", name: "10k Bike", val: "16:12", u: "", date: "May 22", trend: "up", d: "-22 s" },
      { ico: "🛶", name: "2k Row", val: "7:38", u: "", date: "May 09", trend: "down", d: "+6 s" },
      { ico: "🧗", name: "Plank Hold", val: "4:05", u: "", date: "Apr 27", trend: "up", d: "+18 s" },
    ],
    body: [
      { ico: "⚖️", name: "Bodyweight", val: 81.2, u: "kg", date: "Jun 08", trend: "down", d: "-2.1 kg" },
      { ico: "📏", name: "Body fat", val: "14.6", u: "%", date: "Jun 06", trend: "down", d: "-1.4 %" },
      { ico: "💪", name: "Arm girth", val: 39.4, u: "cm", date: "May 31", trend: "up", d: "+0.6 cm" },
      { ico: "🫀", name: "Resting HR", val: 54, u: "bpm", date: "Jun 04", trend: "down", d: "-3 bpm" },
    ],
  };

  /* ── State ── */
  var state = { metric: "strength", range: 12 };

  /* ── Chart geometry ── */
  var W = 720;
  var H = 320;
  var PAD = { l: 44, r: 16, t: 18, b: 30 };
  var IW = W - PAD.l - PAD.r;
  var IH = H - PAD.t - PAD.b;

  var svg = document.querySelector(".chart");
  var tooltip = document.querySelector(".tooltip");

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function niceBounds(vals, target) {
    var all = vals.concat([target]);
    var min = Math.min.apply(null, all);
    var max = Math.max.apply(null, all);
    var span = max - min || 1;
    return { min: min - span * 0.15, max: max + span * 0.15 };
  }

  function fmt(v, metric) {
    if (metric === "cardio") {
      var m = Math.floor(v / 60);
      var s = Math.round(v % 60);
      return m + ":" + (s < 10 ? "0" + s : s);
    }
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  function drawChart() {
    var m = METRICS[state.metric];
    var data = m.series[state.range];
    var labels = labelsFor(state.range);
    var target = m.target[state.range];
    var b = niceBounds(data, target);

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // defs gradient
    var defs = el("defs", {});
    var grad = el("linearGradient", { id: "areaGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": "#c6ff3a", "stop-opacity": "0.28" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "#c6ff3a", "stop-opacity": "0" }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    var x = function (i) {
      return PAD.l + (data.length === 1 ? IW / 2 : (i / (data.length - 1)) * IW);
    };
    var y = function (v) {
      return PAD.t + IH - ((v - b.min) / (b.max - b.min)) * IH;
    };

    // grid + y labels (4 rows)
    for (var g = 0; g <= 4; g++) {
      var gv = b.min + ((b.max - b.min) * g) / 4;
      var gy = y(gv);
      svg.appendChild(el("line", { class: "grid-line", x1: PAD.l, y1: gy, x2: W - PAD.r, y2: gy }));
      var yl = el("text", { class: "axis-label", x: PAD.l - 8, y: gy + 4, "text-anchor": "end" });
      yl.textContent = fmt(gv, state.metric);
      svg.appendChild(yl);
    }

    // x labels
    var step = data.length / labels.length;
    for (var li = 0; li < labels.length; li++) {
      var xi = Math.min(data.length - 1, Math.round(li * step));
      var xt = el("text", { class: "axis-label", x: x(xi), y: H - 8, "text-anchor": "middle" });
      xt.textContent = labels[li];
      svg.appendChild(xt);
    }

    // target line
    var ty = y(target);
    svg.appendChild(el("line", { class: "target-line", x1: PAD.l, y1: ty, x2: W - PAD.r, y2: ty }));

    if (m.kind === "line") {
      drawLine(data, x, y, m);
    } else {
      drawBars(data, x, y, m, b);
    }
  }

  function drawLine(data, x, y, m) {
    var d = "";
    var area = "M" + x(0) + " " + (PAD.t + IH);
    data.forEach(function (v, i) {
      d += (i === 0 ? "M" : "L") + x(i) + " " + y(v) + " ";
      area += "L" + x(i) + " " + y(v) + " ";
    });
    area += "L" + x(data.length - 1) + " " + (PAD.t + IH) + " Z";

    svg.appendChild(el("path", { class: "area", d: area }));
    svg.appendChild(el("path", { class: "line", d: d.trim() }));

    data.forEach(function (v, i) {
      var cx = x(i);
      var cy = y(v);
      var pt = el("circle", { class: "pt", cx: cx, cy: cy, r: 4, "data-i": i });
      var hit = el("circle", { class: "hit", cx: cx, cy: cy, r: 18, "data-i": i, tabindex: "0" });
      svg.appendChild(pt);
      svg.appendChild(hit);
      bindPoint(hit, pt, v, m, cx, cy);
    });
  }

  function drawBars(data, x, y, m, b) {
    var bw = (IW / data.length) * 0.6;
    data.forEach(function (v, i) {
      var cx = x(i);
      var top = y(v);
      var bottom = PAD.t + IH;
      var bar = el("rect", {
        class: "bar",
        x: cx - bw / 2,
        y: top,
        width: bw,
        height: Math.max(2, bottom - top),
        rx: 4,
        "data-i": i,
        tabindex: "0",
      });
      bar.style.animationDelay = i * 45 + "ms";
      svg.appendChild(bar);
      bindPoint(bar, bar, v, m, cx, top);
    });
  }

  function bindPoint(hit, visual, v, m, cx, cy) {
    function show() {
      visual.classList.add("is-hot");
      var rect = svg.getBoundingClientRect();
      var stage = svg.parentElement.getBoundingClientRect();
      var px = ((cx / W) * rect.width) + (rect.left - stage.left);
      var py = ((cy / H) * rect.height) + (rect.top - stage.top);
      tooltip.style.left = px + "px";
      tooltip.style.top = py + "px";
      tooltip.innerHTML =
        '<span class="tt-label">' + m.legend + "</span>" +
        '<span class="tt-val"><b>' + fmt(v, state.metric) + "</b> " + m.unit + "</span>";
      tooltip.classList.add("show");
    }
    function hide() {
      visual.classList.remove("is-hot");
      tooltip.classList.remove("show");
    }
    hit.addEventListener("mouseenter", show);
    hit.addEventListener("mouseleave", hide);
    hit.addEventListener("focus", show);
    hit.addEventListener("blur", hide);
  }

  /* ── PR list ── */
  var prList = document.querySelector("[data-pr-list]");
  var prCount = document.querySelector("[data-pr-count]");
  var prTitle = document.querySelector("[data-pr-title]");
  var arrows = { up: "▲", down: "▼", flat: "■" };

  function renderPRs() {
    var rows = PRS[state.metric];
    prList.innerHTML = "";
    rows.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "pr-item";
      li.tabIndex = 0;
      li.innerHTML =
        '<div class="pr-main">' +
          '<div class="pr-name"><span class="ico">' + r.ico + "</span>" + r.name + "</div>" +
          '<div class="pr-date">' + r.date + "</div>" +
        "</div>" +
        '<div class="pr-right">' +
          '<div class="pr-val">' + r.val + (r.u ? ' <span class="u">' + r.u + "</span>" : "") + "</div>" +
          '<div class="pr-trend ' + r.trend + '">' + arrows[r.trend] + " " + r.d + "</div>" +
        "</div>";
      li.addEventListener("click", function () {
        toast('<span class="tk">' + r.name + "</span> · " + r.val + (r.u ? " " + r.u : "") + " on " + r.date);
      });
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          li.click();
        }
      });
      prList.appendChild(li);
    });
    prCount.textContent = rows.length + " " + (state.metric === "body" ? "metrics" : "lifts");
    prTitle.textContent = state.metric === "body" ? "Body measurements" : state.metric === "cardio" ? "Cardio bests" : "Current PRs";
  }

  /* ── Summary stat cards (refresh per metric) ── */
  function refreshSummary() {
    var m = METRICS[state.metric];
    var data = m.series[12];
    var first = data[0];
    var last = data[data.length - 1];
    var diff = last - first;
    var pct = ((diff / first) * 100).toFixed(1);

    setVal("[data-stat=volume]", fmt(last, state.metric) + ' <span class="unit">' + m.unit + "</span>");
    var betterUp = state.metric === "strength";
    var cls = diff === 0 ? "flat" : (diff > 0) === betterUp ? "up" : "down";
    setDelta("[data-stat=volumeDelta]", cls, Math.abs(pct) + "% vs start");

    document.querySelector(".stat-card:nth-child(1) .stat-label").textContent =
      m.eyebrow + " · 12w";
  }

  function setVal(sel, html) {
    var e = document.querySelector(sel);
    if (e) e.innerHTML = html;
  }
  function setDelta(sel, cls, text) {
    var e = document.querySelector(sel);
    if (!e) return;
    e.className = "delta " + cls;
    e.innerHTML = '<span class="arrow">' + (cls === "up" ? "▲" : cls === "down" ? "▼" : "■") + "</span> " + text;
  }

  /* ── Chart header text ── */
  function refreshChartHead() {
    var m = METRICS[state.metric];
    document.querySelector("[data-chart-eyebrow]").textContent = m.eyebrow;
    document.querySelector("[data-chart-title]").textContent = m.title;
    document.querySelector("[data-legend]").textContent = m.legend;
  }

  /* ── Wire tabs ── */
  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (tab.classList.contains("is-active")) return;
      document.querySelectorAll(".tab").forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      state.metric = tab.dataset.metric;
      renderAll();
      toast("Showing <span class=\"tk\">" + tab.textContent.trim() + "</span> progress");
    });
  });

  /* ── Wire range ── */
  document.querySelectorAll(".range-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      document.querySelectorAll(".range-btn").forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      state.range = parseInt(btn.dataset.range, 10);
      drawChart();
      var label = btn.textContent.trim();
      toast("Range set to <span class=\"tk\">" + label + "</span>");
    });
  });

  function renderAll() {
    refreshChartHead();
    drawChart();
    renderPRs();
    refreshSummary();
  }

  renderAll();
})();
