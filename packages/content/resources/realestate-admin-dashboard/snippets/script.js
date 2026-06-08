(function () {
  "use strict";

  /* ---------------- Data ---------------- */
  // Per-range dataset. Numbers are illustrative & fictional.
  var RANGES = {
    "7": {
      label: "last 7 days",
      kpis: { volume: 6.4, gci: 161, units: 7, dom: 19 },
      deltas: { volume: 4, gci: 3, units: 2, dom: -6 },
      series: [0.7, 0.9, 0.6, 1.1, 0.8, 1.3, 1.0],
      axis: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      status: { active: 18, pending: 9, closed: 7, withdrawn: 2 },
      agents: [
        ["Camille Hart", "Vale · Hillside", 2.1, 2, 52, "#1f3d34"],
        ["Théo Marchand", "Vale · Harbor", 1.6, 2, 41, "#94733f"],
        ["Priya Raman", "Vale · Midtown", 1.2, 1, 31, "#26493e"],
        ["Owen Castellan", "Vale · Coastal", 0.9, 1, 23, "#6b7a72"],
        ["Lina Sørensen", "Vale · Estates", 0.6, 1, 16, "#c98a2b"]
      ]
    },
    "30": {
      label: "last 30 days",
      kpis: { volume: 21.8, gci: 548, units: 24, dom: 23 },
      deltas: { volume: 9, gci: 7, units: 11, dom: -4 },
      series: [3.1, 4.0, 3.4, 4.6, 3.9, 5.2, 4.4, 5.8],
      axis: ["W1", "", "W2", "", "W3", "", "W4", ""],
      status: { active: 31, pending: 14, closed: 24, withdrawn: 4 },
      agents: [
        ["Camille Hart", "Vale · Hillside", 6.4, 7, 161, "#1f3d34"],
        ["Théo Marchand", "Vale · Harbor", 5.1, 6, 128, "#94733f"],
        ["Priya Raman", "Vale · Midtown", 4.2, 5, 105, "#26493e"],
        ["Owen Castellan", "Vale · Coastal", 3.5, 4, 88, "#6b7a72"],
        ["Lina Sørensen", "Vale · Estates", 2.6, 2, 66, "#c98a2b"]
      ]
    },
    "90": {
      label: "last 90 days",
      kpis: { volume: 64.2, gci: 1611, units: 71, dom: 27 },
      deltas: { volume: 12, gci: 14, units: 8, dom: -9 },
      series: [5.4, 6.8, 6.1, 7.9, 7.2, 8.6, 8.0, 9.4, 9.1, 10.3, 9.8, 11.2],
      axis: ["Mar", "", "", "Apr", "", "", "May", "", "", "Jun", "", ""],
      status: { active: 42, pending: 19, closed: 71, withdrawn: 6 },
      agents: [
        ["Camille Hart", "Vale · Hillside", 18.9, 20, 474, "#1f3d34"],
        ["Théo Marchand", "Vale · Harbor", 14.7, 17, 369, "#94733f"],
        ["Priya Raman", "Vale · Midtown", 12.1, 14, 304, "#26493e"],
        ["Owen Castellan", "Vale · Coastal", 10.4, 12, 261, "#6b7a72"],
        ["Lina Sørensen", "Vale · Estates", 8.1, 8, 203, "#c98a2b"]
      ]
    },
    "365": {
      label: "year to date",
      kpis: { volume: 248.6, gci: 6237, units: 286, dom: 31 },
      deltas: { volume: 18, gci: 21, units: 15, dom: -12 },
      series: [16, 19, 17, 22, 24, 21, 27, 29, 26, 31, 28, 34],
      axis: ["Jan", "", "", "Apr", "", "", "Jul", "", "", "Oct", "", ""],
      status: { active: 47, pending: 22, closed: 286, withdrawn: 11 },
      agents: [
        ["Camille Hart", "Vale · Hillside", 72.4, 79, 1816, "#1f3d34"],
        ["Théo Marchand", "Vale · Harbor", 58.9, 66, 1478, "#94733f"],
        ["Priya Raman", "Vale · Midtown", 46.2, 54, 1159, "#26493e"],
        ["Owen Castellan", "Vale · Coastal", 39.8, 47, 998, "#6b7a72"],
        ["Lina Sørensen", "Vale · Estates", 31.3, 40, 786, "#c98a2b"]
      ]
    }
  };

  var CLOSINGS = [
    ["218 Marisol Terrace", "Hillside", "4 bd · 3 ba", 2480000, "Camille Hart", "linear-gradient(140deg,#3a5a4e,#1f3d34 55%,#16302a)", "2d ago"],
    ["77 Cedar Walk", "Midtown", "3 bd · 2 ba", 1145000, "Priya Raman", "linear-gradient(140deg,#c79a63,#94733f 60%,#6e5430)", "3d ago"],
    ["9 Harbor Light Ln", "Harbor", "5 bd · 4 ba", 3920000, "Théo Marchand", "linear-gradient(140deg,#6c8a9a,#3f6172 55%,#28414d)", "5d ago"],
    ["1340 Olive Crest", "Coastal", "2 bd · 2 ba", 865000, "Owen Castellan", "linear-gradient(140deg,#caa37a,#9c7c54 60%,#6b5536)", "6d ago"],
    ["52 Bellrose Court", "Estates", "6 bd · 5 ba", 5260000, "Lina Sørensen", "linear-gradient(140deg,#4a6b5d,#2c5043 55%,#1c382f)", "1w ago"]
  ];

  var STATUS_LABELS = { active: "Active", pending: "Pending", closed: "Closed", withdrawn: "Withdrawn" };
  var STATUS_COLORS = { active: "#1f3d34", pending: "#b08d57", closed: "#2f9e6f", withdrawn: "#c4503e" };

  /* ---------------- Helpers ---------------- */
  function $(s, ctx) { return (ctx || document).querySelector(s); }
  function $all(s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); }
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fmtMoney(n) {
    return "$" + n.toLocaleString("en-US");
  }
  function fmtVal(v, kind) {
    if (kind === "m") return (Math.round(v * 10) / 10).toFixed(1);
    if (kind === "k") return Math.round(v).toLocaleString("en-US");
    return Math.round(v).toLocaleString("en-US");
  }
  function initials(name) {
    return name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------------- Count-up numbers ---------------- */
  function animateNum(el, to, kind) {
    var from = parseFloat(el.getAttribute("data-current")) || 0;
    el.setAttribute("data-current", to);
    if (prefersReduced) { el.textContent = fmtVal(to, kind); return; }
    var start = performance.now();
    var dur = 700;
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtVal(from + (to - from) * eased, kind);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------- Sparklines ---------------- */
  function buildSpark(host, series) {
    var w = 86, h = 30, pad = 3;
    var min = Math.min.apply(null, series), max = Math.max.apply(null, series);
    var span = max - min || 1;
    var pts = series.map(function (v, i) {
      var x = pad + (i / (series.length - 1)) * (w - pad * 2);
      var y = h - pad - ((v - min) / span) * (h - pad * 2);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    host.innerHTML =
      '<svg viewBox="0 0 ' + w + ' ' + h + '"><path d="M' + pts.join(" L") + '"/></svg>';
  }

  /* ---------------- Trend chart ---------------- */
  var chartW = 720, chartH = 280, padX = 16, padY = 24;
  var linePath = $("#linePath"), areaPath = $("#areaPath"), dotsG = $("#dots"),
      gridG = $("#gridLines"), axisEl = $("#chartAxis"), tipEl = $("#chartTip");
  var chartPoints = [];

  function buildChart(data) {
    var series = data.series;
    var max = Math.max.apply(null, series) * 1.12;
    var min = 0;
    var n = series.length;

    // grid lines
    var gl = "";
    for (var g = 0; g <= 4; g++) {
      var gy = padY + (g / 4) * (chartH - padY * 2);
      gl += '<line x1="0" y1="' + gy.toFixed(1) + '" x2="' + chartW + '" y2="' + gy.toFixed(1) + '"/>';
    }
    gridG.innerHTML = gl;

    chartPoints = series.map(function (v, i) {
      var x = padX + (i / (n - 1)) * (chartW - padX * 2);
      var y = chartH - padY - ((v - min) / (max - min)) * (chartH - padY * 2);
      return { x: x, y: y, v: v };
    });

    var d = chartPoints.map(function (p, i) {
      return (i === 0 ? "M" : "L") + p.x.toFixed(1) + " " + p.y.toFixed(1);
    }).join(" ");
    var area = "M" + chartPoints[0].x.toFixed(1) + " " + (chartH - padY) +
      " L" + chartPoints.map(function (p) { return p.x.toFixed(1) + " " + p.y.toFixed(1); }).join(" L") +
      " L" + chartPoints[n - 1].x.toFixed(1) + " " + (chartH - padY) + " Z";

    linePath.setAttribute("d", d);
    areaPath.setAttribute("d", area);

    // line draw animation
    var len = linePath.getTotalLength();
    if (!prefersReduced) {
      linePath.style.transition = "none";
      linePath.style.strokeDasharray = len;
      linePath.style.strokeDashoffset = len;
      // force reflow
      void linePath.getBoundingClientRect();
      linePath.style.transition = "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)";
      linePath.style.strokeDashoffset = "0";
    } else {
      linePath.style.strokeDasharray = "none";
      linePath.style.strokeDashoffset = "0";
    }
    areaPath.classList.remove("in");
    void areaPath.getBoundingClientRect();
    areaPath.classList.add("in");

    // dots
    dotsG.innerHTML = chartPoints.map(function (p, i) {
      return '<circle class="dot" data-i="' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4"></circle>';
    }).join("");

    // axis labels
    axisEl.innerHTML = data.axis.map(function (a) { return "<span>" + a + "</span>"; }).join("");
  }

  function chartTipShow(i) {
    var p = chartPoints[i];
    if (!p) return;
    var host = $("#chart");
    var rect = host.getBoundingClientRect();
    tipEl.hidden = false;
    tipEl.innerHTML = "<span>$" + p.v.toFixed(1) + "M</span> closed";
    tipEl.style.left = (p.x / chartW * rect.width) + "px";
    tipEl.style.top = (p.y / chartH * 280) + "px";
  }
  if (dotsG) {
    dotsG.addEventListener("mouseover", function (e) {
      var d = e.target.getAttribute && e.target.getAttribute("data-i");
      if (d !== null && d !== undefined) chartTipShow(parseInt(d, 10));
    });
    dotsG.addEventListener("mouseout", function () { tipEl.hidden = true; });
  }

  /* ---------------- Donut ---------------- */
  var R = 76, CIRC = 2 * Math.PI * R;
  function buildDonut(status) {
    var keys = ["active", "pending", "closed", "withdrawn"];
    var total = keys.reduce(function (s, k) { return s + status[k]; }, 0);
    var offset = 0;
    keys.forEach(function (k) {
      var seg = document.getElementById("seg-" + k);
      var frac = total ? status[k] / total : 0;
      var len = frac * CIRC;
      // small reset then animate
      seg.setAttribute("stroke-dasharray", "0 " + CIRC);
      seg.setAttribute("stroke-dashoffset", -offset);
      (function (s, l) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            s.setAttribute("stroke-dasharray", l.toFixed(2) + " " + (CIRC - l).toFixed(2));
          });
        });
      })(seg, len);
      offset += len;
    });

    $("#donutTotal").textContent = total;

    var legend = $("#legend");
    legend.innerHTML = keys.map(function (k) {
      return '<li><span class="sw" style="background:' + STATUS_COLORS[k] + '"></span>' +
        STATUS_LABELS[k] + '<span class="lg-val">' + status[k] + "</span></li>";
    }).join("");
  }

  /* ---------------- Leaderboard ---------------- */
  function buildLeaderboard(agents) {
    var maxVol = Math.max.apply(null, agents.map(function (a) { return a[2]; }));
    var totalVol = agents.reduce(function (s, a) { return s + a[2]; }, 0);
    var body = $("#lbBody");
    body.innerHTML = agents.map(function (a, i) {
      var name = a[0], team = a[1], vol = a[2], units = a[3], gci = a[4], color = a[5];
      var share = totalVol ? Math.round((vol / totalVol) * 100) : 0;
      return "<tr>" +
        '<td><span class="rank ' + (i === 0 ? "top" : "") + '">' + (i + 1) + "</span></td>" +
        '<td><div class="agent-cell">' +
          '<span class="agent-av" style="background:' + color + '">' + initials(name) + "</span>" +
          "<div><div class=\"agent-name\">" + name + "</div><div class=\"agent-team\">" + team + "</div></div>" +
        "</div></td>" +
        '<td class="num-col">$' + vol.toFixed(1) + "M</td>" +
        '<td class="num-col">' + units + "</td>" +
        '<td class="num-col hide-sm">$' + gci + "K</td>" +
        '<td><div class="share"><div class="share-bar"><span style="width:' +
          Math.round((vol / maxVol) * 100) + '%"></span></div><span class="share-pct">' + share + "%</span></div></td>" +
        "</tr>";
    }).join("");
  }

  /* ---------------- Closings feed ---------------- */
  function buildFeed() {
    var feed = $("#feed");
    feed.innerHTML = CLOSINGS.map(function (c) {
      var addr = c[0], hood = c[1], facts = c[2], price = c[3], agent = c[4], grad = c[5], when = c[6];
      return "<li>" +
        '<span class="thumb" style="background:' + grad + '"></span>' +
        "<div>" +
          '<div class="feed-addr">' + addr + "</div>" +
          '<div class="feed-meta"><span class="badge">' + hood + "</span><span>" + facts + "</span><span>· " + agent + "</span></div>" +
        "</div>" +
        "<div><div class=\"feed-price\">" + fmtMoney(price) + "</div><div class=\"feed-when\">" + when + "</div></div>" +
        "</li>";
    }).join("");
  }

  /* ---------------- Render a range ---------------- */
  function render(key, announce) {
    var data = RANGES[key];
    if (!data) return;

    // KPIs
    $all("[data-kpi]").forEach(function (el) {
      var kpi = el.getAttribute("data-kpi");
      var kind = el.getAttribute("data-fmt");
      animateNum(el, data.kpis[kpi], kind);
    });
    // deltas
    $all("[data-delta]").forEach(function (el) {
      var key2 = el.getAttribute("data-delta");
      var d = data.deltas[key2];
      var card = el.closest(".kpi");
      var positiveGood = key2 !== "dom"; // lower DOM is good
      var arrow = d >= 0 ? "▲" : "▼";
      el.textContent = arrow + " " + Math.abs(d) + "%";
      var good = (d >= 0) === positiveGood;
      el.className = "kpi__delta " + (good ? "up" : "down");
    });

    // sparks
    $all("[data-spark]").forEach(function (el) {
      buildSpark(el, data.series);
    });

    // chart total
    var chartTotalEl = $("#chartTotal");
    var totalSeries = data.series.reduce(function (s, v) { return s + v; }, 0);
    if (prefersReduced) {
      chartTotalEl.textContent = totalSeries.toFixed(1);
    } else {
      var ct0 = parseFloat(chartTotalEl.getAttribute("data-cur")) || 0;
      chartTotalEl.setAttribute("data-cur", totalSeries);
      var s0 = performance.now();
      (function () {
        function step(now) {
          var p = Math.min(1, (now - s0) / 700);
          var e = 1 - Math.pow(1 - p, 3);
          chartTotalEl.textContent = (ct0 + (totalSeries - ct0) * e).toFixed(1);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      })();
    }

    buildChart(data);
    buildDonut(data.status);
    buildLeaderboard(data.agents);

    if (announce) toast('Range set to <span class="tk">' + data.label + "</span>");
  }

  /* ---------------- Range toggle ---------------- */
  $all(".range__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $all(".range__btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.removeAttribute("aria-pressed");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      render(btn.getAttribute("data-range"), true);
    });
  });

  /* ---------------- Init ---------------- */
  buildFeed();
  render("90", false);
})();
