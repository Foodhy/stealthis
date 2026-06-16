(function () {
  "use strict";

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------- *
   * Toast helper
   * ----------------------------------------------------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ----------------------------------------------------------- *
   * Number formatting
   * ----------------------------------------------------------- */
  function fmtCompact(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(Math.round(n));
  }
  function fmtNumber(n) {
    return Math.round(n).toLocaleString("en-US");
  }
  function fmtMoney(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function fmtRating(n) {
    return n.toFixed(1);
  }
  var formatters = {
    compact: fmtCompact,
    number: fmtNumber,
    money: fmtMoney,
    rating: fmtRating,
  };

  /* ----------------------------------------------------------- *
   * Animated count-up on KPI cards
   * ----------------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var fmt = formatters[el.getAttribute("data-format")] || fmtNumber;
    if (prefersReduced) {
      el.textContent = fmt(target);
      return;
    }
    var dur = 1100;
    var start = null;
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = fmt(target * easeOut(p));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  var kpiValues = document.querySelectorAll(".kpi-value");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            countUp(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    kpiValues.forEach(function (el) {
      io.observe(el);
    });
  } else {
    kpiValues.forEach(countUp);
  }

  /* ----------------------------------------------------------- *
   * Chart data (synthetic but stable per range)
   * ----------------------------------------------------------- */
  function seededSeries(count, base, variance, seed) {
    var arr = [];
    var s = seed;
    for (var i = 0; i < count; i++) {
      // deterministic pseudo-random
      s = (s * 9301 + 49297) % 233280;
      var rnd = s / 233280;
      var trend = base * (1 + (i / count) * 0.5);
      var wave = Math.sin(i / 3) * variance * 0.4;
      arr.push(Math.max(0, Math.round(trend + (rnd - 0.4) * variance + wave)));
    }
    return arr;
  }

  var SERIES = {
    "7d": seededSeries(7, 9200, 4200, 41),
    "30d": seededSeries(30, 7600, 5200, 77),
    "90d": seededSeries(90, 5400, 6400, 113),
  };

  var SVG_NS = "http://www.w3.org/2000/svg";
  var chart = document.getElementById("chart");
  var axis = document.getElementById("chartAxis");
  var labelsEl = document.getElementById("chartLabels");
  var summaryEl = document.getElementById("chartSummary");
  var VW = 720;
  var VH = 280;
  var PAD = 14;

  function el(name, attrs) {
    var e = document.createElementNS(SVG_NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function renderChart(range) {
    var data = SERIES[range];
    var max = Math.max.apply(null, data) * 1.12;
    var min = 0;
    var n = data.length;
    var innerW = VW - PAD * 2;
    var innerH = VH - PAD * 2;

    function x(i) {
      return PAD + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    }
    function y(v) {
      return PAD + innerH - ((v - min) / (max - min)) * innerH;
    }

    chart.classList.remove("is-ready");
    while (chart.firstChild) chart.removeChild(chart.firstChild);

    // defs / gradient
    var defs = el("defs", {});
    var grad = el("linearGradient", {
      id: "areaGrad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    });
    grad.appendChild(el("stop", { offset: "0", "stop-color": "#ff2e4d", "stop-opacity": "0.28" }));
    grad.appendChild(el("stop", { offset: "1", "stop-color": "#ff2e4d", "stop-opacity": "0" }));
    defs.appendChild(grad);
    chart.appendChild(defs);

    // horizontal grid lines
    for (var g = 0; g <= 4; g++) {
      var gy = PAD + (innerH / 4) * g;
      chart.appendChild(
        el("line", {
          class: "grid-line",
          x1: PAD,
          x2: VW - PAD,
          y1: gy,
          y2: gy,
        })
      );
    }

    // build path
    var linePts = "";
    for (var i = 0; i < n; i++) {
      linePts += (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(data[i]).toFixed(1) + " ";
    }
    var areaPts =
      linePts +
      "L" + x(n - 1).toFixed(1) + " " + (VH - PAD) + " " +
      "L" + x(0).toFixed(1) + " " + (VH - PAD) + " Z";

    var area = el("path", { class: "area", d: areaPts });
    chart.appendChild(area);

    var line = el("path", { class: "line", d: linePts });
    chart.appendChild(line);

    // dots — fewer for dense ranges
    var dotStep = n > 30 ? Math.ceil(n / 12) : n > 10 ? 3 : 1;
    for (var d = 0; d < n; d += dotStep) {
      chart.appendChild(el("circle", { class: "dot", cx: x(d), cy: y(data[d]), r: 4 }));
    }
    // always mark the last point
    chart.appendChild(el("circle", { class: "dot", cx: x(n - 1), cy: y(data[n - 1]), r: 4 }));

    // animate stroke
    var len = line.getTotalLength ? line.getTotalLength() : 1000;
    line.style.setProperty("--len", len);
    // force reflow then enable animation
    void chart.getBoundingClientRect();
    chart.classList.add("is-ready");

    // Y axis labels
    axis.innerHTML = "";
    for (var a = 4; a >= 0; a--) {
      var span = document.createElement("span");
      span.textContent = fmtCompact((max / 4) * a);
      axis.appendChild(span);
    }

    // X labels
    renderXLabels(range, n);

    // summary
    var total = data.reduce(function (s2, v) {
      return s2 + v;
    }, 0);
    summaryEl.textContent =
      fmtNumber(total) + " views · avg " + fmtCompact(total / n) + "/day · last " + range;
  }

  function renderXLabels(range, n) {
    labelsEl.innerHTML = "";
    var labels;
    if (range === "7d") {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    } else if (range === "30d") {
      labels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
    } else {
      labels = ["Mar", "Apr", "May", "Jun"];
    }
    labels.forEach(function (t) {
      var s = document.createElement("span");
      s.textContent = t;
      labelsEl.appendChild(s);
    });
  }

  var rangeBtns = document.querySelectorAll(".range-btn");
  rangeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var range = btn.getAttribute("data-range");
      rangeBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.removeAttribute("aria-pressed");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      renderChart(range);
      toast("Showing last " + range);
    });
  });

  renderChart("30d");

  /* ----------------------------------------------------------- *
   * Top episodes table — sortable
   * ----------------------------------------------------------- */
  var episodes = [
    { num: 12, title: "Static Bloom", views: 412800, likes: 38420, revenue: 1860 },
    { num: 9, title: "Rooftop Requiem", views: 388110, likes: 35210, revenue: 1740 },
    { num: 11, title: "Ash & Neon", views: 351900, likes: 31980, revenue: 1520 },
    { num: 7, title: "The Quiet Blade", views: 298440, likes: 27110, revenue: 1280 },
    { num: 10, title: "Signal Lost", views: 264700, likes: 24050, revenue: 1095 },
    { num: 8, title: "Midnight Vendor", views: 211360, likes: 19840, revenue: 870 },
  ];

  var body = document.getElementById("epBody");
  var headers = document.querySelectorAll("#epTable th[data-sort]");
  var sortState = { key: "views", dir: "desc" };

  function renderRows() {
    var sorted = episodes.slice().sort(function (a, b) {
      var k = sortState.key;
      var av = a[k];
      var bv = b[k];
      var cmp;
      if (typeof av === "string") cmp = av.localeCompare(bv);
      else cmp = av - bv;
      return sortState.dir === "asc" ? cmp : -cmp;
    });

    body.innerHTML = "";
    sorted.forEach(function (e) {
      var tr = document.createElement("tr");

      var tdTitle = document.createElement("td");
      tdTitle.innerHTML =
        '<div class="ep-title"><span class="ep-num">' +
        e.num +
        '</span><span class="ep-name">' +
        e.title +
        "</span></div>";

      var tdViews = document.createElement("td");
      tdViews.className = "num";
      tdViews.textContent = fmtNumber(e.views);

      var tdLikes = document.createElement("td");
      tdLikes.className = "num";
      tdLikes.textContent = fmtNumber(e.likes);

      var tdRev = document.createElement("td");
      tdRev.className = "num";
      tdRev.innerHTML = '<span class="rev">' + fmtMoney(e.revenue) + "</span>";

      tr.appendChild(tdTitle);
      tr.appendChild(tdViews);
      tr.appendChild(tdLikes);
      tr.appendChild(tdRev);
      body.appendChild(tr);
    });
  }

  function updateHeaderState() {
    headers.forEach(function (h) {
      h.classList.remove("is-sorted");
      h.removeAttribute("aria-sort");
      if (h.getAttribute("data-sort") === sortState.key) {
        h.classList.add("is-sorted");
        h.setAttribute("aria-sort", sortState.dir === "asc" ? "ascending" : "descending");
      }
    });
  }

  headers.forEach(function (h) {
    h.addEventListener("click", function () {
      var key = h.getAttribute("data-sort");
      if (sortState.key === key) {
        sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
      } else {
        sortState.key = key;
        sortState.dir = key === "title" ? "asc" : "desc";
      }
      updateHeaderState();
      renderRows();
    });
  });

  updateHeaderState();
  renderRows();

  /* ----------------------------------------------------------- *
   * Recent activity feed
   * ----------------------------------------------------------- */
  var activity = [
    { type: "sub", ico: "♥", html: "<strong>+182</strong> new subscribers today", time: "2 min ago" },
    { type: "tip", ico: "$", html: "<strong>R. Okafor</strong> tipped <strong>$15</strong> on Ep 12", time: "18 min ago" },
    { type: "comment", ico: "✦", html: "<strong>Static Bloom</strong> hit <strong>400K</strong> views", time: "1 hr ago" },
    { type: "comment", ico: "✎", html: "<strong>312</strong> new comments on Ep 11", time: "3 hrs ago" },
    { type: "sub", ico: "♥", html: "Featured in <strong>Editor's Picks</strong>", time: "Yesterday" },
  ];

  var feed = document.getElementById("feed");
  activity.forEach(function (a) {
    var li = document.createElement("li");
    li.innerHTML =
      '<span class="feed-ico ' +
      a.type +
      '" aria-hidden="true">' +
      a.ico +
      '</span><span class="feed-body">' +
      a.html +
      '<span class="feed-time">' +
      a.time +
      "</span></span>";
    feed.appendChild(li);
  });

  /* ----------------------------------------------------------- *
   * New episode button
   * ----------------------------------------------------------- */
  var newBtn = document.getElementById("newEpisode");
  if (newBtn) {
    newBtn.addEventListener("click", function () {
      toast("Draft created — Episode 13 ✎");
    });
  }
})();
