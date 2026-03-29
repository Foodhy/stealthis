/* ── Analytics Dashboard – script.js ───────── */
(function () {
  "use strict";

  /* ── Date Range Selector ──────────────────── */
  const pills = document.querySelectorAll(".date-pill");
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) {
        p.classList.remove("active");
      });
      pill.classList.add("active");
    });
  });

  /* ── Metric Card Number Animation ─────────── */
  function animateMetrics() {
    var cards = document.querySelectorAll(".metric-card");
    cards.forEach(function (card) {
      var target = parseFloat(card.dataset.target);
      var suffix = card.dataset.suffix || "";
      var format = card.dataset.format || "";
      var valueEl = card.querySelector(".metric-value");
      var duration = 1200;
      var start = performance.now();

      function tick(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;

        if (format === "duration") {
          var mins = Math.floor(current / 60);
          var secs = Math.floor(current % 60);
          valueEl.textContent = mins + "m " + (secs < 10 ? "0" : "") + secs + "s";
        } else if (suffix === "%") {
          valueEl.textContent = current.toFixed(1) + "%";
        } else {
          valueEl.textContent = Math.floor(current).toLocaleString("en-US");
        }

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    });
  }

  /* ── Area Chart ───────────────────────────── */
  function drawAreaChart() {
    var canvas = document.getElementById("areaChart");
    if (!canvas) return;

    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    var w = rect.width;
    var h = 300;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    var data = [
      3200, 4100, 3800, 4600, 5200, 4900, 5800, 6100, 5400, 6800, 7200, 6500, 7800, 8100, 7400,
      8600, 7900, 8200, 9100, 8400, 9600, 10200, 9800, 10800, 11200, 10400, 11800, 12400, 11600,
      12800,
    ];
    var labels = [];
    var today = new Date();
    for (var i = 29; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(d.getMonth() + 1 + "/" + d.getDate());
    }

    var padLeft = 50;
    var padRight = 20;
    var padTop = 20;
    var padBottom = 40;
    var chartW = w - padLeft - padRight;
    var chartH = h - padTop - padBottom;
    var maxVal = Math.max.apply(null, data) * 1.1;
    var stepX = chartW / (data.length - 1);

    function xPos(i) {
      return padLeft + i * stepX;
    }
    function yPos(v) {
      return padTop + chartH - (v / maxVal) * chartH;
    }

    // Grid lines
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 1;
    var gridLines = 5;
    for (var g = 0; g <= gridLines; g++) {
      var gy = padTop + (chartH / gridLines) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, gy);
      ctx.lineTo(w - padRight, gy);
      ctx.stroke();

      // Y-axis labels
      var gridVal = Math.round(maxVal - (maxVal / gridLines) * g);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "11px -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(
        gridVal >= 1000 ? (gridVal / 1000).toFixed(1) + "k" : gridVal.toString(),
        padLeft - 8,
        gy + 4
      );
    }

    // Gradient fill
    var gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.25)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.02)");

    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(data[0]));
    for (var j = 1; j < data.length; j++) {
      ctx.lineTo(xPos(j), yPos(data[j]));
    }
    ctx.lineTo(xPos(data.length - 1), padTop + chartH);
    ctx.lineTo(xPos(0), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(data[0]));
    for (var k = 1; k < data.length; k++) {
      ctx.lineTo(xPos(k), yPos(data[k]));
    }
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    for (var m = 0; m < data.length; m++) {
      ctx.beginPath();
      ctx.arc(xPos(m), yPos(data[m]), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // X-axis labels (show every 5th)
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px -apple-system, sans-serif";
    ctx.textAlign = "center";
    for (var n = 0; n < labels.length; n++) {
      if (n % 5 === 0 || n === labels.length - 1) {
        ctx.fillText(labels[n], xPos(n), h - 10);
      }
    }
  }

  /* ── Heatmap ──────────────────────────────── */
  function buildHeatmap() {
    var grid = document.getElementById("heatmapGrid");
    if (!grid) return;

    var weeks = 52;
    var daysPerWeek = 7;
    var today = new Date();
    var startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * daysPerWeek - 1));

    // Seed a deterministic-looking random
    function seededRandom(seed) {
      var x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    for (var w = 0; w < weeks; w++) {
      for (var d = 0; d < daysPerWeek; d++) {
        var dayIndex = w * daysPerWeek + d;
        var cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + dayIndex);

        var rand = seededRandom(dayIndex * 31 + 7);
        var count = Math.floor(rand * 20);
        var level;
        if (count === 0) level = 0;
        else if (count <= 5) level = 1;
        else if (count <= 12) level = 2;
        else level = 3;

        var cell = document.createElement("div");
        cell.className = "heatmap-cell level-" + level;

        var dateStr = cellDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        var tooltip = document.createElement("span");
        tooltip.className = "tooltip";
        tooltip.textContent = count + " contributions on " + dateStr;
        cell.appendChild(tooltip);

        grid.appendChild(cell);
      }
    }
  }

  /* ── Funnel Animation ─────────────────────── */
  function animateFunnel() {
    var bars = document.querySelectorAll(".funnel-bar");
    bars.forEach(function (bar, index) {
      setTimeout(function () {
        bar.style.width = bar.style.getPropertyValue("--target-width");
      }, index * 150);
    });
  }

  /* ── CSV Export ────────────────────────────── */
  function setupExport() {
    var btn = document.getElementById("exportCsv");
    if (!btn) return;

    btn.addEventListener("click", function () {
      var table = document.getElementById("pagesTable");
      if (!table) return;

      var rows = table.querySelectorAll("tr");
      var csvContent = "";

      rows.forEach(function (row) {
        var cols = row.querySelectorAll("th, td");
        var rowData = [];
        cols.forEach(function (col) {
          var text = col.textContent.replace(/"/g, '""');
          rowData.push('"' + text + '"');
        });
        csvContent += rowData.join(",") + "\n";
      });

      var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "analytics-top-pages.csv";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  /* ── Resize Handler ───────────────────────── */
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawAreaChart, 200);
  });

  /* ── Init ──────────────────────────────────── */
  function init() {
    animateMetrics();
    drawAreaChart();
    buildHeatmap();
    animateFunnel();
    setupExport();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
