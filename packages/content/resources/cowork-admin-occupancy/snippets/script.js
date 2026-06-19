(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  var CAPACITY = 156;
  var HOURS = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
  var ZONES = [
    { id: "open", name: "Open Loft Desks", ico: "▦", seats: 64 },
    { id: "quiet", name: "Quiet Studio", ico: "✎", seats: 28 },
    { id: "phone", name: "Phone Booths", ico: "☏", seats: 8 },
    { id: "lounge", name: "Garden Lounge", ico: "❧", seats: 24 },
    { id: "meet", name: "Meeting Rooms", ico: "◷", seats: 20 },
    { id: "lab", name: "Maker Lab", ico: "⚒", seats: 12 }
  ];

  /* Deterministic pseudo-random so data feels real and stable per timeframe. */
  function seeded(seed) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /* Per-timeframe KPI + curve config. */
  var RANGES = {
    today: {
      occ: 72, util: 64, peak: "11:00", peakPct: 88, members: 128, memTotal: 214,
      trendOcc: ["up", "▲ 6%"], trendUtil: ["up", "▲ 3%"], trendPeak: ["flat", "— steady"], trendMem: ["up", "▲ 12"],
      sub: "Live seats in use · 07:00–20:00", seed: 41, amp: 1
    },
    week: {
      occ: 68, util: 61, peak: "11:30", peakPct: 84, members: 187, memTotal: 214,
      trendOcc: ["up", "▲ 2%"], trendUtil: ["down", "▼ 1%"], trendPeak: ["flat", "— steady"], trendMem: ["up", "▲ 9"],
      sub: "Daily average · last 7 days", seed: 77, amp: 0.94
    },
    month: {
      occ: 65, util: 58, peak: "11:00", peakPct: 81, members: 203, memTotal: 214,
      trendOcc: ["down", "▼ 3%"], trendUtil: ["down", "▼ 2%"], trendPeak: ["flat", "— steady"], trendMem: ["up", "▲ 4"],
      sub: "Daily average · last 30 days", seed: 113, amp: 0.88
    }
  };

  /* Build an occupancy curve (rising morning, midday peak, afternoon dip, evening fall). */
  function buildCurve(cfg) {
    var rnd = seeded(cfg.seed);
    var shape = [0.34, 0.52, 0.72, 0.86, 1.0, 0.78, 0.7, 0.82, 0.9, 0.74, 0.58, 0.4, 0.26, 0.16];
    var peakSeats = Math.round(CAPACITY * (cfg.peakPct / 100));
    return shape.map(function (s, i) {
      var noise = (rnd() - 0.5) * 0.06;
      var v = Math.max(0.08, Math.min(1, (s + noise) * cfg.amp));
      return Math.round(v * peakSeats);
    });
  }

  /* ---------- Animate number ---------- */
  function animateNum(el, to, suffix) {
    suffix = suffix || "";
    var from = parseInt(el.textContent, 10);
    if (isNaN(from)) { el.textContent = to + suffix; return; }
    var start = performance.now();
    var dur = 520;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- KPIs ---------- */
  function setTrend(el, data) {
    el.className = "trend " + data[0];
    el.textContent = data[1];
  }

  function renderKpis(cfg) {
    animateNum(document.getElementById("kpiOcc"), cfg.occ);
    animateNum(document.getElementById("kpiUtil"), cfg.util);
    animateNum(document.getElementById("kpiMem"), cfg.members);
    document.getElementById("kpiPeak").textContent = cfg.peak;
    document.getElementById("kpiOccBar").style.width = cfg.occ + "%";
    document.getElementById("kpiUtilBar").style.width = cfg.util + "%";

    setTrend(document.getElementById("trendOcc"), cfg.trendOcc);
    setTrend(document.getElementById("trendUtil"), cfg.trendUtil);
    setTrend(document.getElementById("trendPeak"), cfg.trendPeak);
    setTrend(document.getElementById("trendMem"), cfg.trendMem);

    var inUse = Math.round(CAPACITY * cfg.occ / 100);
    document.querySelector(".kpi .kpi-sub").textContent = inUse + " of " + CAPACITY + " seats in use";
    document.querySelectorAll(".kpi .kpi-sub")[3].textContent = "of " + cfg.memTotal + " active members";
  }

  /* Spark + avatars (static-ish decorative) */
  function renderSpark(cfg) {
    var curve = buildCurve(cfg);
    var max = Math.max.apply(null, curve);
    var sp = document.getElementById("kpiSpark");
    sp.innerHTML = "";
    curve.forEach(function (v) {
      var b = document.createElement("span");
      b.style.height = Math.max(10, (v / max) * 100) + "%";
      if (v === max) b.className = "hot";
      sp.appendChild(b);
    });
  }

  function renderAvatars() {
    var names = ["Aria N.", "Tomás R.", "Lin W.", "Kofi A.", "Sofia M."];
    var hues = ["#e8902b", "#5f7a52", "#cc7918", "#4a463e", "#2f9e6f"];
    var wrap = document.getElementById("kpiAvatars");
    wrap.innerHTML = "";
    names.forEach(function (n, i) {
      var s = document.createElement("span");
      s.style.background = hues[i];
      s.textContent = n.split(" ").map(function (x) { return x[0]; }).join("");
      s.title = n;
      wrap.appendChild(s);
    });
    var more = document.createElement("span");
    more.style.background = "#9a9488";
    more.textContent = "+";
    wrap.appendChild(more);
  }

  /* ---------- Line chart ---------- */
  var svg = document.getElementById("chartSvg");
  var chartTip = document.getElementById("chartTip");
  var SVGNS = "http://www.w3.org/2000/svg";
  var W = 720, H = 240, PADX = 14, PADY = 18;

  function renderChart(cfg) {
    var data = buildCurve(cfg);
    svg.innerHTML = "";
    var maxY = CAPACITY;
    var innerW = W - PADX * 2;
    var innerH = H - PADY * 2;

    function x(i) { return PADX + (i / (data.length - 1)) * innerW; }
    function y(v) { return PADY + innerH - (v / maxY) * innerH; }

    // grid lines + capacity line
    [0.25, 0.5, 0.75, 1].forEach(function (g) {
      var gl = document.createElementNS(SVGNS, "line");
      gl.setAttribute("x1", PADX); gl.setAttribute("x2", W - PADX);
      gl.setAttribute("y1", y(maxY * g)); gl.setAttribute("y2", y(maxY * g));
      gl.setAttribute("stroke", g === 1 ? "rgba(28,27,25,0.22)" : "rgba(28,27,25,0.07)");
      gl.setAttribute("stroke-dasharray", g === 1 ? "5 4" : "0");
      svg.appendChild(gl);
    });

    // area + line path
    var lineD = "", areaD = "M " + x(0) + " " + y(0);
    data.forEach(function (v, i) {
      var px = x(i), py = y(v);
      lineD += (i === 0 ? "M " : "L ") + px + " " + py + " ";
      areaD += " L " + px + " " + py;
    });
    areaD += " L " + x(data.length - 1) + " " + y(0) + " Z";

    var grad = document.createElementNS(SVGNS, "linearGradient");
    grad.setAttribute("id", "areaGrad");
    grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
    grad.innerHTML =
      '<stop offset="0%" stop-color="#e8902b" stop-opacity="0.28"/>' +
      '<stop offset="100%" stop-color="#e8902b" stop-opacity="0"/>';
    svg.appendChild(grad);

    var area = document.createElementNS(SVGNS, "path");
    area.setAttribute("d", areaD);
    area.setAttribute("fill", "url(#areaGrad)");
    svg.appendChild(area);

    var line = document.createElementNS(SVGNS, "path");
    line.setAttribute("d", lineD);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "#cc7918");
    line.setAttribute("stroke-width", "2.6");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    svg.appendChild(line);

    // animate line draw
    var len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    line.getBoundingClientRect();
    line.style.transition = "stroke-dashoffset 0.8s ease";
    line.style.strokeDashoffset = "0";

    // interactive dots
    data.forEach(function (v, i) {
      var c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", x(i)); c.setAttribute("cy", y(v));
      c.setAttribute("r", "4.5");
      c.setAttribute("fill", "#fff");
      c.setAttribute("stroke", "#cc7918");
      c.setAttribute("stroke-width", "2.2");
      c.setAttribute("class", "chart-dot");
      c.setAttribute("tabindex", "0");
      var pct = Math.round((v / CAPACITY) * 100);
      var label = HOURS[i] + ":00 · <b>" + v + "</b> seats · " + pct + "%";
      function show() {
        chartTip.hidden = false;
        chartTip.innerHTML = label;
        var rect = svg.getBoundingClientRect();
        var rel = rect.width / W;
        chartTip.style.left = (x(i) * rel) + "px";
        chartTip.style.top = (y(v) * (rect.height / H) - 12) + "px";
        c.setAttribute("r", "6.5");
      }
      function hide() { chartTip.hidden = true; c.setAttribute("r", "4.5"); }
      c.addEventListener("mouseenter", show);
      c.addEventListener("focus", show);
      c.addEventListener("mouseleave", hide);
      c.addEventListener("blur", hide);
      svg.appendChild(c);
    });

    // x labels
    var xr = document.getElementById("chartX");
    xr.innerHTML = "";
    [0, 3, 6, 9, 12, 13].forEach(function (i) {
      var s = document.createElement("span");
      s.textContent = HOURS[i] + ":00";
      xr.appendChild(s);
    });

    document.getElementById("chartSub").textContent = cfg.sub;
  }

  /* ---------- Underused resources ---------- */
  var UNDER = [
    { name: "Maker Lab", meta: "12 seats · weekday afternoons", pct: 21, ico: "⚒" },
    { name: "Phone Booth · B3", meta: "Single occupancy · all day", pct: 28, ico: "☏" },
    { name: "Meeting Room · Birch", meta: "8 seats · most underbooked", pct: 34, ico: "◷" },
    { name: "Garden Lounge", meta: "24 seats · mornings only", pct: 41, ico: "❧" }
  ];
  function renderUnder() {
    var ul = document.getElementById("underList");
    ul.innerHTML = "";
    UNDER.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "under-item";
      var warn = r.pct >= 40 ? " warn" : "";
      li.innerHTML =
        '<span class="ui-ico">' + r.ico + '</span>' +
        '<div class="ui-body"><div class="ui-name">' + r.name + '</div>' +
        '<div class="ui-meta">' + r.meta + '</div></div>' +
        '<div class="ui-use"><div class="ui-pct' + warn + '">' + r.pct + '%</div>' +
        '<div class="ui-track"><i style="width:' + r.pct + '%"></i></div></div>';
      li.addEventListener("click", function () {
        toast("Flagged " + r.name + " for the utilization review");
      });
      ul.appendChild(li);
    });
  }

  /* ---------- Heatmap ---------- */
  function heatColor(v) {
    // v: 0..1 ; concrete -> amber -> danger
    var stops = [
      [245, 239, 230], [246, 207, 154], [232, 144, 43], [212, 80, 62]
    ];
    var seg = v * (stops.length - 1);
    var i = Math.min(stops.length - 2, Math.floor(seg));
    var f = seg - i;
    var a = stops[i], b = stops[i + 1];
    var r = Math.round(a[0] + (b[0] - a[0]) * f);
    var g = Math.round(a[1] + (b[1] - a[1]) * f);
    var bl = Math.round(a[2] + (b[2] - a[2]) * f);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }

  var heatHours = ["08", "10", "12", "14", "16", "18"];
  var heatData = {}; // zoneId -> [values per heatHour]

  function buildHeatData(cfg) {
    var rnd = seeded(cfg.seed + 9);
    var hourBias = [0.45, 0.85, 0.7, 0.9, 0.6, 0.3];
    heatData = {};
    ZONES.forEach(function (z, zi) {
      var zoneBias = 0.55 + (zi % 3) * 0.12;
      heatData[z.id] = hourBias.map(function (hb) {
        var v = hb * zoneBias * cfg.amp + (rnd() - 0.5) * 0.14;
        return Math.max(0.05, Math.min(0.99, v));
      });
    });
  }

  function renderHeat(cfg) {
    buildHeatData(cfg);
    var heat = document.getElementById("heat");
    heat.style.gridTemplateColumns = "minmax(120px,1.4fr) repeat(" + heatHours.length + ", 1fr)";
    heat.innerHTML = "";

    // header row
    var blank = document.createElement("div");
    heat.appendChild(blank);
    heatHours.forEach(function (h) {
      var hd = document.createElement("div");
      hd.className = "heat-head";
      hd.textContent = h + ":00";
      heat.appendChild(hd);
    });

    ZONES.forEach(function (z) {
      var label = document.createElement("div");
      label.className = "heat-label zone";
      label.textContent = z.name;
      label.setAttribute("tabindex", "0");
      label.setAttribute("role", "button");
      label.addEventListener("click", function () { drill(z); });
      label.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); drill(z); }
      });
      heat.appendChild(label);

      heatData[z.id].forEach(function (v, hi) {
        var cell = document.createElement("div");
        cell.className = "cell";
        cell.style.background = heatColor(v);
        cell.setAttribute("tabindex", "0");
        var pct = Math.round(v * 100);
        var seats = Math.round(v * z.seats);
        cell.setAttribute("aria-label", z.name + " at " + heatHours[hi] + ":00, " + pct + " percent occupied");
        cell.setAttribute("role", "gridcell");
        function show() {
          chartTip.hidden = false;
          chartTip.innerHTML = z.name + " · " + heatHours[hi] + ":00<br><b>" + pct + "%</b> · " + seats + "/" + z.seats + " seats";
          var rect = cell.getBoundingClientRect();
          var host = document.querySelector(".heat-panel").getBoundingClientRect();
          chartTip.style.left = (rect.left - host.left + rect.width / 2) + "px";
          chartTip.style.top = (rect.top - host.top - 8) + "px";
        }
        cell.addEventListener("mouseenter", show);
        cell.addEventListener("focus", show);
        cell.addEventListener("mouseleave", function () { chartTip.hidden = true; });
        cell.addEventListener("blur", function () { chartTip.hidden = true; });
        cell.addEventListener("click", function () { drill(z); });
        heat.appendChild(cell);
      });
    });
  }

  /* ---------- Zone drill-in ---------- */
  var drillEl = document.getElementById("drill");
  function drill(z) {
    var vals = heatData[z.id];
    var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    var peakIdx = vals.indexOf(Math.max.apply(null, vals));
    var peakSeats = Math.round(vals[peakIdx] * z.seats);
    var lowIdx = vals.indexOf(Math.min.apply(null, vals));

    document.getElementById("drillTitle").textContent = z.name + " — zone detail";
    document.getElementById("drillStats").innerHTML =
      stat(z.seats, "Capacity") +
      stat(Math.round(avg * 100) + "%", "Avg. occupancy") +
      stat(heatHours[peakIdx] + ":00", "Peak · " + peakSeats + " seats") +
      stat(heatHours[lowIdx] + ":00", "Quietest hour");
    drillEl.hidden = false;
    drillEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast("Drilled into " + z.name);
  }
  function stat(val, lab) {
    return '<div class="ds-item"><div class="ds-val">' + val + '</div><div class="ds-lab">' + lab + '</div></div>';
  }
  document.getElementById("drillClose").addEventListener("click", function () {
    drillEl.hidden = true;
  });

  /* ---------- Timeframe toggle ---------- */
  var segBtns = document.querySelectorAll(".seg-btn");
  function selectRange(range) {
    var cfg = RANGES[range];
    renderKpis(cfg);
    renderSpark(cfg);
    renderChart(cfg);
    renderHeat(cfg);
    drillEl.hidden = true;
  }
  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      var r = btn.getAttribute("data-range");
      selectRange(r);
      toast("Showing " + btn.textContent.toLowerCase() + " view");
    });
  });

  /* ---------- Init ---------- */
  renderAvatars();
  renderUnder();
  selectRange("today");

  // keep chart/heat responsive on resize
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var active = document.querySelector(".seg-btn.is-active").getAttribute("data-range");
      renderChart(RANGES[active]);
    }, 180);
  });
})();
