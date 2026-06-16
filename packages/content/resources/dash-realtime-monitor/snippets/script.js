(function () {
  "use strict";

  /* ---------- Config ---------- */
  var WINDOW = 60; // points held in the rolling window
  var VW = 600, VH = 220, PAD = 6;

  var METRICS = {
    cpu: { label: "CPU", unit: "%", base: 42, min: 0, max: 100, thresh: 85, vola: 6, kpi: true },
    ram: { label: "Memory", unit: "%", base: 61, min: 0, max: 100, thresh: 90, vola: 3.5, kpi: true },
    req: { label: "Requests", unit: " rps", base: 1180, min: 0, max: 2600, thresh: 2200, vola: 140, kpi: true },
    lat: { label: "p95 latency", unit: " ms", base: 138, min: 20, max: 600, thresh: 320, vola: 22, kpi: true },
    disk: { label: "Disk I/O", unit: "%", base: 34, min: 0, max: 100, thresh: 95, vola: 8 }
  };

  // Seed each metric series with WINDOW points
  var series = {};
  Object.keys(METRICS).forEach(function (k) {
    var m = METRICS[k];
    var arr = [];
    var v = m.base;
    for (var i = 0; i < WINDOW; i++) {
      v = step(v, m);
      arr.push(v);
    }
    series[k] = arr;
  });

  function step(v, m) {
    var nv = v + (Math.random() - 0.5) * m.vola * 2;
    // gentle pull toward base so it doesn't drift forever
    nv += (m.base - nv) * 0.05;
    if (nv < m.min) nv = m.min;
    if (nv > m.max) nv = m.max;
    return Math.round(nv * 10) / 10;
  }

  /* ---------- DOM refs ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var streamPath = $("#streamPath");
  var streamFill = $("#streamFill");
  var streamHead = $("#streamHead");
  var streamChart = $("#streamChart");
  var thresholdLine = $("#thresholdLine");
  var gridLines = $("#gridLines");
  var chartAxis = $("#chartAxis");

  var state = {
    speed: 1000,
    paused: false,
    activeStream: "cpu",
    alerted: {},
    breachKpis: {}
  };

  /* ---------- Grid lines + axis (static) ---------- */
  (function buildGrid() {
    var rows = 4, frag = "";
    for (var i = 1; i < rows; i++) {
      var y = (VH / rows) * i;
      frag += '<line x1="0" y1="' + y + '" x2="' + VW + '" y2="' + y + '" />';
    }
    gridLines.innerHTML = frag;
    chartAxis.innerHTML = "<span>-60s</span><span>-40s</span><span>-20s</span><span>now</span>";
  })();

  /* ---------- Stream chart render ---------- */
  function renderStream() {
    var key = state.activeStream;
    var m = METRICS[key];
    var data = series[key];
    var lo = m.min, hi = m.max;
    // dynamic top padding above max value for nicer framing
    var dataMax = Math.max.apply(null, data);
    if (dataMax * 1.12 > hi) hi = m.max; else hi = Math.max(m.thresh * 1.1, dataMax * 1.15);

    var span = hi - lo || 1;
    var n = data.length;
    var stepX = (VW - PAD * 2) / (n - 1);

    function x(i) { return PAD + i * stepX; }
    function y(val) { return PAD + (1 - (val - lo) / span) * (VH - PAD * 2); }

    var d = "", i;
    for (i = 0; i < n; i++) {
      d += (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(data[i]).toFixed(1) + " ";
    }
    streamPath.setAttribute("d", d.trim());
    streamFill.setAttribute("d", d.trim() + "L" + x(n - 1).toFixed(1) + " " + (VH - PAD) + " L" + x(0).toFixed(1) + " " + (VH - PAD) + " Z");

    var last = data[n - 1];
    streamHead.setAttribute("cx", x(n - 1).toFixed(1));
    streamHead.setAttribute("cy", y(last).toFixed(1));

    var ty = y(m.thresh);
    thresholdLine.setAttribute("y1", ty.toFixed(1));
    thresholdLine.setAttribute("y2", ty.toFixed(1));

    var breached = last > m.thresh;
    streamChart.classList.toggle("is-breach", breached);

    // readout
    $("#streamNow").textContent = fmt(last, key);
    $("#streamUnit").textContent = m.unit.trim();
    $("#streamPeak").textContent = fmt(dataMax, key);
    $("#streamPeakUnit").textContent = m.unit.trim();
    $("#streamThresh").textContent = fmt(m.thresh, key);
    $("#streamThreshUnit").textContent = m.unit.trim();
  }

  function fmt(v, key) {
    if (key === "req") return Math.round(v).toLocaleString();
    if (key === "lat") return Math.round(v);
    return Math.round(v);
  }

  /* ---------- KPI cards ---------- */
  function buildSpark(el, data) {
    var n = data.length, w = 96, h = 28, p = 2;
    var lo = Math.min.apply(null, data), hi = Math.max.apply(null, data);
    var span = hi - lo || 1;
    var sx = (w - p * 2) / (n - 1);
    function x(i) { return p + i * sx; }
    function y(v) { return p + (1 - (v - lo) / span) * (h - p * 2); }
    var d = "", a = "M" + x(0).toFixed(1) + " " + (h - p);
    for (var i = 0; i < n; i++) {
      d += (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(data[i]).toFixed(1) + " ";
      a += "L" + x(i).toFixed(1) + " " + y(data[i]).toFixed(1) + " ";
    }
    a += "L" + x(n - 1).toFixed(1) + " " + (h - p) + " Z";
    el.innerHTML = '<path class="spark-area" d="' + a + '"/><path d="' + d.trim() + '"/>';
  }

  function renderKpis() {
    $$(".kpi").forEach(function (card) {
      var key = card.getAttribute("data-metric");
      var m = METRICS[key];
      var data = series[key];
      var last = data[data.length - 1];
      var prev = data[data.length - 6] || data[0];
      var valEl = $("[data-kpi-value]", card);
      valEl.textContent = fmt(last, key);

      var pct = prev ? ((last - prev) / prev) * 100 : 0;
      var deltaEl = $("[data-kpi-delta]", card);
      deltaEl.setAttribute("data-dir", pct >= 0 ? "up" : "down");
      $("[data-kpi-delta-num]", card).textContent = Math.abs(pct).toFixed(1);

      buildSpark($("[data-kpi-spark]", card), data.slice(-24));

      var breach = last > m.thresh;
      card.classList.toggle("is-breach", breach);
      if (breach && !state.breachKpis[key]) {
        state.breachKpis[key] = true;
        onBreach(key, last);
      } else if (!breach) {
        state.breachKpis[key] = false;
      }
    });
    updateAlertBar();
  }

  /* ---------- Threshold / alert bar ---------- */
  function onBreach(key, val) {
    var m = METRICS[key];
    pushLog("error", "<strong>" + m.label + "</strong> crossed threshold at " + fmt(val, key) + m.unit.trim());
    toast(m.label + " threshold exceeded", "error");
  }

  function updateAlertBar() {
    var bar = $("#alertBar");
    var breached = Object.keys(state.breachKpis).filter(function (k) { return state.breachKpis[k]; });
    if (breached.length) {
      bar.hidden = false;
      var names = breached.map(function (k) { return METRICS[k].label; }).join(", ");
      $("#alertBarText").textContent = breached.length === 1
        ? names + " is above its threshold — investigate now."
        : breached.length + " metrics above threshold: " + names + ".";
    } else {
      bar.hidden = true;
    }
  }
  $("#alertDismiss").addEventListener("click", function () { $("#alertBar").hidden = true; });

  /* ---------- Gauges ---------- */
  var GAUGE_LEN = 144.5; // arc length of the half-circle path
  function renderGauges() {
    $$(".gauge").forEach(function (g) {
      var key = g.getAttribute("data-gauge");
      var m = METRICS[key];
      var data = series[key];
      var val = data[data.length - 1];
      var frac = (val - m.min) / (m.max - m.min);
      frac = Math.max(0, Math.min(1, frac));
      var fill = $(".g-fill", g);
      fill.style.strokeDashoffset = (GAUGE_LEN * (1 - frac)).toFixed(1);
      var needle = $(".g-needle line", g);
      needle.style.transform = "rotate(" + (-90 + frac * 180) + "deg)";
      $(".g-val", g).textContent = Math.round(val);
      var level = frac > 0.88 ? "crit" : frac > 0.7 ? "warn" : "ok";
      g.setAttribute("data-level", level);
    });
  }

  /* ---------- Nodes ---------- */
  var nodes = [];
  (function seedNodes() {
    var zones = ["eu-w1", "eu-w2", "us-e1", "us-e2", "us-w1", "ap-s1", "ap-n1", "sa-e1"];
    zones.forEach(function (z, i) {
      nodes.push({ id: "node-" + z, name: z, load: 30 + Math.round(Math.random() * 35), state: "ok" });
    });
  })();

  function renderNodes(rebuild) {
    var grid = $("#nodeGrid");
    var up = 0, warn = 0, down = 0;
    if (rebuild) {
      grid.innerHTML = nodes.map(function (n) {
        return '<li class="node" data-id="' + n.id + '" data-state="' + n.state + '">' +
          '<div class="node-top"><span class="node-dot"></span><span class="node-name">' + n.name + '</span></div>' +
          '<div class="node-load"><i style="width:' + n.load + '%"></i></div>' +
          '<div class="node-pct">' + n.load + '% load</div></li>';
      }).join("");
    }
    nodes.forEach(function (n) {
      if (n.state === "ok") up++; else if (n.state === "warn") warn++; else down++;
      if (!rebuild) {
        var li = grid.querySelector('[data-id="' + n.id + '"]');
        if (li) {
          li.setAttribute("data-state", n.state);
          li.querySelector(".node-load i").style.width = n.load + "%";
          li.querySelector(".node-pct").textContent = n.load + "% load";
        }
      }
    });
    $("#nodesUp").textContent = up;
    $("#nodesWarn").textContent = warn;
    $("#nodesDown").textContent = down;
  }

  function jitterNodes() {
    nodes.forEach(function (n) {
      n.load += (Math.random() - 0.5) * 10;
      n.load = Math.max(5, Math.min(99, Math.round(n.load)));
      var roll = Math.random();
      var prev = n.state;
      if (n.load > 90 || roll < 0.012) n.state = "down";
      else if (n.load > 78 || roll < 0.05) n.state = "warn";
      else n.state = "ok";
      if (prev !== n.state) {
        if (n.state === "down") { pushLog("error", "Node <strong>" + n.name + "</strong> went critical"); toast(n.name + " critical", "error"); }
        else if (n.state === "warn" && prev === "ok") pushLog("warn", "Node <strong>" + n.name + "</strong> degraded (" + n.load + "%)");
        else if (n.state === "ok" && prev !== "ok") { pushLog("ok", "Node <strong>" + n.name + "</strong> recovered"); }
      }
    });
    renderNodes(false);
  }

  /* ---------- Event log ---------- */
  var logTick = 0;
  var INFO_MSGS = [
    "Healthcheck batch completed",
    "Autoscaler held at current capacity",
    "Cache hit ratio 94.2%",
    "TLS session resumed for edge-3",
    "Config sync ok across fleet",
    "Snapshot persisted to cold storage"
  ];

  function pushLog(level, html) {
    var ol = $("#logStream");
    var empty = ol.querySelector(".log-empty");
    if (empty) empty.remove();
    var li = document.createElement("li");
    li.className = "log-item";
    li.innerHTML = '<span class="log-time">' + nowTime() + '</span>' +
      '<span class="log-level" data-lvl="' + level + '">' + level + '</span>' +
      '<span class="log-msg">' + html + '</span>';
    ol.insertBefore(li, ol.firstChild);
    while (ol.children.length > 40) ol.removeChild(ol.lastChild);

    if (level === "error" || level === "warn") {
      var b = $("#navAlertBadge");
      var c = parseInt(b.textContent, 10) || 0;
      b.textContent = c + 1;
      b.setAttribute("data-zero", "false");
    }
  }

  function nowTime() {
    var d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" +
      String(d.getMinutes()).padStart(2, "0") + ":" +
      String(d.getSeconds()).padStart(2, "0");
  }

  $("#clearLog").addEventListener("click", function () {
    $("#logStream").innerHTML = '<li class="log-empty">No events. Waiting for stream…</li>';
    $("#navAlertBadge").textContent = "0";
    $("#navAlertBadge").setAttribute("data-zero", "true");
    toast("Event log cleared");
  });

  /* ---------- Toast ---------- */
  var toastTimers = [];
  function toast(msg, kind) {
    var host = $("#toastHost");
    var el = document.createElement("div");
    el.className = "toast";
    if (kind) el.setAttribute("data-kind", kind);
    el.textContent = msg;
    host.appendChild(el);
    var t = setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 250);
    }, 2600);
    toastTimers.push(t);
  }

  /* ---------- Tick loop ---------- */
  var timer = null;
  function advance() {
    Object.keys(METRICS).forEach(function (k) {
      var m = METRICS[k];
      var arr = series[k];
      var next = step(arr[arr.length - 1], m);
      // occasionally inject a spike toward/over threshold to demo the alert
      if (Math.random() < 0.025) next = Math.min(m.max, m.thresh + Math.random() * (m.max - m.thresh) * 0.6 + 2);
      arr.push(next);
      if (arr.length > WINDOW) arr.shift();
    });
    renderStream();
    renderKpis();
    renderGauges();
    if (Math.random() < 0.4) jitterNodes();
    logTick++;
    if (logTick % 4 === 0) {
      pushLog("info", INFO_MSGS[Math.floor(Math.random() * INFO_MSGS.length)]);
    }
  }

  function startLoop() {
    stopLoop();
    if (state.paused) return;
    timer = setInterval(advance, state.speed);
  }
  function stopLoop() { if (timer) { clearInterval(timer); timer = null; } }

  /* ---------- Pause / Resume ---------- */
  var pauseBtn = $("#pauseBtn");
  pauseBtn.addEventListener("click", function () {
    state.paused = !state.paused;
    pauseBtn.setAttribute("aria-pressed", String(state.paused));
    $("#pauseIcon").textContent = state.paused ? "▶" : "❚❚";
    $("#pauseLabel").textContent = state.paused ? "Resume" : "Pause";
    setConn(state.paused ? "paused" : "live", state.paused ? "Stream paused" : "Connected");
    var pill = $("#livePill");
    pill.setAttribute("data-state", state.paused ? "paused" : "live");
    $("#livePillText").textContent = state.paused ? "PAUSED" : "LIVE";
    if (state.paused) { stopLoop(); toast("Stream paused"); }
    else { startLoop(); toast("Stream resumed", "ok"); }
  });

  /* ---------- Speed control ---------- */
  $$(".seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".seg-btn").forEach(function (b) { b.classList.remove("is-active"); b.removeAttribute("aria-pressed"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      state.speed = parseInt(btn.getAttribute("data-speed"), 10);
      $("#intervalLabel").textContent = (state.speed / 1000).toFixed(1) + "s";
      if (!state.paused) startLoop();
      toast("Speed set to " + btn.textContent.trim());
    });
  });

  /* ---------- Stream tabs ---------- */
  $$(".st-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      $$(".st-tab").forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      state.activeStream = tab.getAttribute("data-stream");
      renderStream();
    });
  });

  /* ---------- Connection indicator (simulated drops) ---------- */
  function setConn(stateName, label) {
    var el = $("#connStatus");
    el.setAttribute("data-state", stateName);
    $("#connLabel").textContent = label;
  }
  setInterval(function () {
    if (state.paused) return;
    if (Math.random() < 0.06) {
      setConn("reconnecting", "Reconnecting…");
      pushLog("warn", "Telemetry link unstable — reconnecting");
      setTimeout(function () {
        if (!state.paused) { setConn("live", "Connected"); pushLog("ok", "Telemetry link restored"); }
      }, 1800);
    }
  }, 7000);

  /* ---------- Drag to rearrange ---------- */
  var dragged = null;
  $$("[data-card]").forEach(function (card) {
    card.addEventListener("dragstart", function (e) {
      dragged = card;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", function () {
      card.classList.remove("dragging");
      $$(".card").forEach(function (c) { c.classList.remove("drag-over"); });
      dragged = null;
    });
    card.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (dragged && dragged !== card) card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", function () { card.classList.remove("drag-over"); });
    card.addEventListener("drop", function (e) {
      e.preventDefault();
      card.classList.remove("drag-over");
      if (!dragged || dragged === card) return;
      var grid = $("#grid");
      var cards = $$("[data-card]", grid);
      var di = cards.indexOf(dragged), ti = cards.indexOf(card);
      if (di < ti) grid.insertBefore(dragged, card.nextSibling);
      else grid.insertBefore(dragged, card);
      toast("Layout rearranged");
    });
  });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = $("#navToggle");
  navToggle.addEventListener("click", function () {
    var open = $("#navList").classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-item").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      $$(".nav-item").forEach(function (n) { n.classList.remove("is-active"); n.removeAttribute("aria-current"); });
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    });
  });

  /* ---------- Init ---------- */
  $("#logStream").innerHTML = '<li class="log-empty">No events. Waiting for stream…</li>';
  $("#navAlertBadge").setAttribute("data-zero", "true");
  renderStream();
  renderKpis();
  renderGauges();
  renderNodes(true);
  pushLog("info", "Monitoring session started — eu-west-1");
  startLoop();
})();
