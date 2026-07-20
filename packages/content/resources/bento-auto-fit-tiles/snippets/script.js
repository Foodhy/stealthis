(function () {
  "use strict";

  var grid = document.getElementById("bento");
  var minEl = document.getElementById("min");
  var gapEl = document.getElementById("gap");
  var widthEl = document.getElementById("width");
  var fillEl = document.getElementById("fill");
  var minOut = document.getElementById("minOut");
  var gapOut = document.getElementById("gapOut");
  var widthOut = document.getElementById("widthOut");
  var ruleOut = document.getElementById("rule");
  var colsOut = document.getElementById("cols");

  var DATA = [
    { t: "Revenue", s: "$48.2k this week", w: 0.78, wide: true },
    { t: "Active users", s: "1,204 online", w: 0.55 },
    { t: "Latency p95", s: "182 ms", w: 0.31 },
    { t: "Error rate", s: "0.42%", w: 0.12, tall: true },
    { t: "Conversion", s: "3.9% checkout", w: 0.44 },
    { t: "Queue depth", s: "17 jobs", w: 0.26 },
    { t: "Storage", s: "612 GB / 1 TB", w: 0.61, wide: true },
    { t: "Uptime", s: "99.98% (30d)", w: 0.94 },
    { t: "Deploys", s: "12 today", w: 0.5 },
    { t: "Cache hit", s: "88.1%", w: 0.88 }
  ];

  DATA.forEach(function (d) {
    var li = document.createElement("li");
    li.className = "tile" + (d.wide ? " wide" : "") + (d.tall ? " tall" : "");
    var b = document.createElement("b");
    b.textContent = d.t;
    var s = document.createElement("small");
    s.textContent = d.s;
    var bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = Math.round(d.w * 100) + "%";
    li.appendChild(b);
    li.appendChild(s);
    li.appendChild(bar);
    grid.appendChild(li);
  });

  // Read back the tracks the browser actually resolved for the current rule.
  function countColumns() {
    var tracks = getComputedStyle(grid).gridTemplateColumns;
    if (!tracks || tracks === "none") return 1;
    return tracks.split(/\s+/).filter(Boolean).length;
  }

  function report() {
    var n = countColumns();
    colsOut.textContent = n + (n === 1 ? " column" : " columns");
  }

  function apply() {
    var min = Number(minEl.value);
    var gap = Number(gapEl.value);
    var width = Number(widthEl.value);
    var mode = fillEl.checked ? "auto-fill" : "auto-fit";
    var rule = "repeat(" + mode + ", minmax(" + min + "px, 1fr))";

    grid.style.gridTemplateColumns = rule;
    grid.style.gap = gap + "px";
    grid.style.width = width + "%";

    minOut.textContent = min + "px";
    gapOut.textContent = gap + "px";
    widthOut.textContent = width + "%";
    ruleOut.textContent = "grid-template-columns: " + rule;

    requestAnimationFrame(report);
  }

  [minEl, gapEl, widthEl, fillEl].forEach(function (el) {
    el.addEventListener("input", apply);
    el.addEventListener("change", apply);
  });

  // Container-driven, not viewport-driven.
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(report).observe(grid);
  } else {
    window.addEventListener("resize", report);
  }

  apply();
})();
