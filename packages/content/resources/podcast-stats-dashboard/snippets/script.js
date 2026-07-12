(function () {
  "use strict";

  /* ---------------- Data model ---------------- */
  // Base (30d) episode data. Other ranges are derived with a scale factor.
  var EPISODES = [
    { ep: 142, title: "The Attention Economy", guest: "Dr. Lena Ortiz", downloads: 48210, completion: 82, growth: 14.2 },
    { ep: 141, title: "Building in the Open", guest: "Marcus Bell", downloads: 44980, completion: 78, growth: 9.6 },
    { ep: 140, title: "Signals in the Noise", guest: "Priya Nadkarni", downloads: 51740, completion: 85, growth: 21.8 },
    { ep: 139, title: "Quiet Quitting Burnout", guest: "Tomás Reyes", downloads: 39120, completion: 71, growth: -4.3 },
    { ep: 138, title: "The Cost of Free", guest: "Ada Whitfield", downloads: 42600, completion: 76, growth: 6.1 },
    { ep: 137, title: "Designing for Trust", guest: "Kenji Watanabe", downloads: 46810, completion: 80, growth: 11.4 },
    { ep: 136, title: "After the Hype Cycle", guest: "Sofia Marchetti", downloads: 35440, completion: 68, growth: -8.7 },
    { ep: 135, title: "Small Bets, Big Wins", guest: "Idris Bello", downloads: 40950, completion: 74, growth: 5.2 },
    { ep: 134, title: "The Loneliness of Scale", guest: "Hana Kovač", downloads: 37880, completion: 72, growth: 2.9 },
    { ep: 133, title: "What Comes Next", guest: "Elena Frost", downloads: 43370, completion: 77, growth: 8.3 }
  ];

  var PLATFORMS = [
    { name: "Apple Podcasts", pct: 34, color: "#8b5cf6" },
    { name: "Spotify", pct: 41, color: "#22d3ee" },
    { name: "YouTube", pct: 14, color: "#f472b6" },
    { name: "Web / Other", pct: 11, color: "#facc15" }
  ];

  // KPI base values for 30d + per-range multipliers.
  var KPIS = {
    downloads: { base: 431100, suffix: "", fmt: "int", delta: { 7: 6.4, 30: 12.8, 90: 31.2 } },
    subscribers: { base: 58420, suffix: "", fmt: "int", delta: { 7: 2.1, 30: 5.7, 90: 18.4 } },
    listen: { base: 76, suffix: "%", fmt: "float1", delta: { 7: 1.2, 30: -0.8, 90: 3.4 } },
    minutes: { base: 1284, suffix: "k", fmt: "float1", delta: { 7: 4.9, 30: 9.1, 90: 24.6 } }
  };

  var RANGE_FACTOR = { 7: 0.28, 30: 1, 90: 2.74 };

  var state = { range: 30, sort: "downloads", activePlatform: null };

  /* ---------------- Helpers ---------------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var NS = "http://www.w3.org/2000/svg";

  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmtFloat1(n) { return (Math.round(n * 10) / 10).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  function scaledEpisodes() {
    var f = RANGE_FACTOR[state.range];
    return EPISODES.map(function (e) {
      return {
        ep: e.ep,
        title: e.title,
        guest: e.guest,
        downloads: Math.round(e.downloads * f),
        completion: e.completion,
        growth: e.growth * (state.range === 90 ? 1.35 : state.range === 7 ? 0.6 : 1)
      };
    });
  }

  /* ---------------- KPI count-up ---------------- */
  function countUp(el, target, fmt, suffix) {
    var start = 0;
    var dur = 900;
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = start + (target - start) * eased;
      el.textContent = (fmt === "int" ? fmtInt(val) : fmtFloat1(val)) + (suffix || "");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderKpis() {
    var f = RANGE_FACTOR[state.range];
    $$(".kpi").forEach(function (card) {
      var key = card.getAttribute("data-metric");
      var cfg = KPIS[key];
      var valEl = $("[data-value]", card);
      var badge = $("[data-delta]", card);
      // listen-through is a percentage — does not scale with range window
      var raw = key === "listen" ? cfg.base + (cfg.delta[state.range] || 0) : cfg.base * f;
      countUp(valEl, raw, cfg.fmt, valEl.getAttribute("data-suffix") || cfg.suffix);
      var d = cfg.delta[state.range] || 0;
      badge.textContent = (d >= 0 ? "+" : "") + fmtFloat1(d) + "%";
      badge.className = "kpi__badge " + (d >= 0 ? "up" : "down");

      // sparkline
      var path = $("[data-spark]", card);
      var pts = sparkPath(key, state.range);
      path.setAttribute("d", pts);
      path.classList.remove("show");
      requestAnimationFrame(function () { path.classList.add("show"); });
    });
  }

  function sparkPath(key, range) {
    // deterministic pseudo-random wiggle per key/range
    var seed = key.length * 7 + range;
    var pts = [];
    for (var i = 0; i < 12; i++) {
      var s = Math.sin(seed + i * 1.3) * 0.5 + 0.5;
      var trend = i / 11 * 0.5;
      var y = 30 - (s * 0.5 + trend) * 26;
      pts.push([i / 11 * 120, y]);
    }
    return pts.map(function (p, i) { return (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
  }

  /* ---------------- Bar chart ---------------- */
  var svg = $("#barSvg");
  var barsG = $("#bars");
  var gridG = $("#gridLines");
  var tip = $("#tip");
  var VW = 640, VH = 300, PAD_L = 8, PAD_R = 8, PAD_B = 34, PAD_T = 12;

  function renderChart() {
    var data = scaledEpisodes().slice().sort(function (a, b) { return a.ep - b.ep; });
    var max = Math.max.apply(null, data.map(function (d) { return d.downloads; }));
    var niceMax = Math.ceil(max / 10000) * 10000;
    barsG.innerHTML = "";
    gridG.innerHTML = "";

    var plotW = VW - PAD_L - PAD_R;
    var plotH = VH - PAD_T - PAD_B;

    // gridlines + y labels
    for (var g = 0; g <= 4; g++) {
      var yv = niceMax * g / 4;
      var y = PAD_T + plotH - (yv / niceMax) * plotH;
      var line = document.createElementNS(NS, "line");
      line.setAttribute("class", "gridline");
      line.setAttribute("x1", PAD_L); line.setAttribute("x2", VW - PAD_R);
      line.setAttribute("y1", y); line.setAttribute("y2", y);
      gridG.appendChild(line);
      var lbl = document.createElementNS(NS, "text");
      lbl.setAttribute("class", "gridlabel");
      lbl.setAttribute("x", PAD_L + 2); lbl.setAttribute("y", y - 4);
      lbl.textContent = yv >= 1000 ? Math.round(yv / 1000) + "k" : Math.round(yv);
      gridG.appendChild(lbl);
    }

    var n = data.length;
    var slot = plotW / n;
    var bw = Math.min(38, slot * 0.6);

    data.forEach(function (d, i) {
      var h = (d.downloads / niceMax) * plotH;
      var x = PAD_L + slot * i + (slot - bw) / 2;
      var yTop = PAD_T + plotH - h;

      var rect = document.createElementNS(NS, "rect");
      rect.setAttribute("class", "bar");
      rect.setAttribute("x", x);
      rect.setAttribute("width", bw);
      rect.setAttribute("rx", 5);
      rect.setAttribute("tabindex", "0");
      rect.setAttribute("role", "listitem");
      rect.setAttribute("aria-label", "Episode " + d.ep + ", " + d.title + ", " + fmtInt(d.downloads) + " downloads");
      // start collapsed at baseline
      rect.setAttribute("y", PAD_T + plotH);
      rect.setAttribute("height", 0);
      barsG.appendChild(rect);

      // animate
      (function (r, ty, th, idx) {
        setTimeout(function () {
          r.style.transition = "y .7s cubic-bezier(.2,.8,.2,1), height .7s cubic-bezier(.2,.8,.2,1)";
          r.setAttribute("y", ty);
          r.setAttribute("height", th);
        }, 40 + idx * 45);
      })(rect, yTop, h, i);

      // x label (episode number)
      var xl = document.createElementNS(NS, "text");
      xl.setAttribute("class", "barlabel");
      xl.setAttribute("x", x + bw / 2);
      xl.setAttribute("y", VH - 12);
      xl.textContent = "#" + d.ep;
      barsG.appendChild(xl);

      // interactions
      function show() { showTip(rect, d); }
      function hide() { tip.hidden = true; }
      rect.addEventListener("mouseenter", show);
      rect.addEventListener("mousemove", show);
      rect.addEventListener("mouseleave", hide);
      rect.addEventListener("focus", show);
      rect.addEventListener("blur", hide);
      rect.addEventListener("click", function () { toast("Ep " + d.ep + " · " + d.title + " — " + fmtInt(d.downloads) + " downloads"); });
      rect.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); rect.click(); }
      });
    });
  }

  function showTip(rect, d) {
    var wrap = $("#chart");
    var rb = rect.getBoundingClientRect();
    var wb = wrap.getBoundingClientRect();
    tip.innerHTML = "<strong>Ep " + d.ep + " · " + d.title + "</strong><span>" + fmtInt(d.downloads) + " downloads</span> · " + d.completion + "% listened";
    tip.hidden = false;
    tip.style.left = (rb.left - wb.left + rb.width / 2) + "px";
    tip.style.top = (rb.top - wb.top) + "px";
  }

  /* ---------------- Donut ---------------- */
  var donutG = $("#donutG");
  var R = 70, C = 2 * Math.PI * R;

  function renderDonut() {
    donutG.innerHTML = "";
    var offset = 0;
    var segs = [];
    PLATFORMS.forEach(function (p, i) {
      var len = p.pct / 100 * C;
      var circ = document.createElementNS(NS, "circle");
      circ.setAttribute("class", "donut__seg");
      circ.setAttribute("r", R);
      circ.setAttribute("cx", 0);
      circ.setAttribute("cy", 0);
      circ.setAttribute("stroke", p.color);
      circ.setAttribute("transform", "rotate(-90)");
      circ.setAttribute("stroke-dasharray", "0 " + C);
      circ.setAttribute("stroke-dashoffset", -offset);
      circ.setAttribute("tabindex", "0");
      circ.setAttribute("role", "button");
      circ.setAttribute("aria-label", p.name + " " + p.pct + " percent");
      donutG.appendChild(circ);
      (function (c, l, idx) {
        setTimeout(function () {
          c.style.transition = "stroke-dasharray .8s ease, stroke-width .18s, opacity .18s";
          c.setAttribute("stroke-dasharray", l + " " + (C - l));
        }, 120 + idx * 120);
      })(circ, len, i);
      segs.push(circ);
      circ.addEventListener("mouseenter", function () { highlight(i); });
      circ.addEventListener("focus", function () { highlight(i); });
      circ.addEventListener("mouseleave", function () { highlight(null); });
      circ.addEventListener("blur", function () { highlight(null); });
      offset += len;
    });

    // legend
    var legend = $("#legend");
    legend.innerHTML = "";
    PLATFORMS.forEach(function (p, i) {
      var li = document.createElement("li");
      li.setAttribute("tabindex", "0");
      li.innerHTML = '<span class="legend__sw" style="background:' + p.color + '"></span>' +
        '<span class="legend__name">' + p.name + '</span>' +
        '<span class="legend__pct">' + p.pct + '%</span>';
      li.addEventListener("mouseenter", function () { highlight(i); });
      li.addEventListener("mouseleave", function () { highlight(null); });
      li.addEventListener("focus", function () { highlight(i); });
      li.addEventListener("blur", function () { highlight(null); });
      legend.appendChild(li);
    });

    window._donutSegs = segs;
  }

  function highlight(idx) {
    var segs = window._donutSegs || [];
    var items = $$("#legend li");
    var center = $("#donutValue");
    var label = $("#donutLabel");
    segs.forEach(function (s, i) {
      s.classList.toggle("active", idx === i);
      s.classList.toggle("dim", idx !== null && idx !== i);
    });
    items.forEach(function (li, i) { li.classList.toggle("active", idx === i); });
    if (idx === null) {
      center.textContent = "100%";
      label.textContent = "All platforms";
    } else {
      center.textContent = PLATFORMS[idx].pct + "%";
      label.textContent = PLATFORMS[idx].name;
    }
  }

  /* ---------------- Table ---------------- */
  function renderTable() {
    var data = scaledEpisodes();
    data.sort(function (a, b) {
      if (state.sort === "downloads") return b.downloads - a.downloads;
      if (state.sort === "completion") return b.completion - a.completion;
      return b.growth - a.growth;
    });
    var tbody = $("#tbody");
    tbody.innerHTML = "";
    data.forEach(function (d, i) {
      var tr = document.createElement("tr");
      var up = d.growth >= 0;
      tr.innerHTML =
        '<td><span class="rank ' + (i < 3 ? "top" : "") + '">' + (i + 1) + '</span></td>' +
        '<td><div class="ep"><span class="ep__title">' + d.title + '</span>' +
          '<span class="ep__meta">Ep ' + d.ep + ' · ' + d.guest + '</span></div></td>' +
        '<td class="num"><span class="dl">' + fmtInt(d.downloads) + '</span></td>' +
        '<td><div class="meter"><div class="meter__track"><div class="meter__fill" data-w="' + d.completion + '"></div></div>' +
          '<span class="meter__val">' + d.completion + '%</span></div></td>' +
        '<td class="num"><span class="trend ' + (up ? "up" : "down") + '">' +
          (up ? "▲" : "▼") + " " + fmtFloat1(Math.abs(d.growth)) + '%</span></td>';
      tbody.appendChild(tr);
    });
    // animate meters
    requestAnimationFrame(function () {
      $$(".meter__fill", tbody).forEach(function (m) { m.style.width = m.getAttribute("data-w") + "%"; });
    });
  }

  /* ---------------- Controls ---------------- */
  $$(".range__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (+btn.getAttribute("data-range") === state.range) return;
      state.range = +btn.getAttribute("data-range");
      $$(".range__btn").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      $("#chartSub").textContent = "Last " + state.range + " days · latest 10 episodes";
      renderKpis();
      renderChart();
      renderTable();
      toast("Range updated to " + state.range + " days");
    });
  });

  $$(".sort__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.sort = btn.getAttribute("data-sort");
      $$(".sort__btn").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      renderTable();
      toast("Sorted by " + btn.textContent.trim().toLowerCase());
    });
  });

  $("#exportBtn").addEventListener("click", function () {
    toast("Report for last " + state.range + " days exported (CSV)");
  });

  /* ---------------- Init ---------------- */
  renderKpis();
  renderChart();
  renderDonut();
  renderTable();

  window.addEventListener("resize", function () {
    clearTimeout(window._rz);
    window._rz = setTimeout(function () { tip.hidden = true; }, 100);
  });
})();
