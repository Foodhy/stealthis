/* Helios Ops — Command Center
   Vanilla JS, no libraries. Live tiles, scrolling SVG chart, incident feed,
   region heat grid, filters, time-window, drag-to-rearrange, pause/resume. */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var rnd = function (lo, hi) { return lo + Math.random() * (hi - lo); };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  /* ============ State ============ */
  var paused = false;
  var windowMul = 1;            // time-window scales noise/scroll feel
  var WINDOW_LABEL = { "1h": 1, "6h": 1.6, "24h": 2.4 };
  var alertSeq = 0;

  /* ============ Toast ============ */
  var toastWrap = $("#toastWrap");
  function toast(msg, kind) {
    if (!toastWrap) return;
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.setAttribute("role", "status");
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.style.transition = "opacity .3s, transform .3s";
      t.style.opacity = "0";
      t.style.transform = "translateY(10px)";
      setTimeout(function () { t.remove(); }, 320);
    }, 2600);
  }

  /* ============ Clock ============ */
  // (no #clock element in this build; topbar shows static region tag) — skip.

  /* ============ KPI metrics ============ */
  var kpis = {
    rps: { el: $("#kpi-rps"), v: 48210, base: 48210, fmt: fmtInt, hist: [], better: "up" },
    lat: { el: $("#kpi-lat"), v: 182, base: 182, fmt: fmtMs, hist: [], better: "down" },
    err: { el: $("#kpi-err"), v: 0.34, base: 0.34, fmt: fmtPct2, hist: [], better: "down" },
    cpu: { el: $("#kpi-cpu"), v: 61, base: 61, fmt: fmtPct0, hist: [], better: "down" }
  };

  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmtMs(n) { return Math.round(n) + '<span class="kpi-unit">ms</span>'; }
  function fmtPct2(n) { return n.toFixed(2) + '<span class="kpi-unit">%</span>'; }
  function fmtPct0(n) { return Math.round(n) + '<span class="kpi-unit">%</span>'; }

  // seed sparkline history
  Object.keys(kpis).forEach(function (k) {
    var m = kpis[k];
    for (var i = 0; i < 24; i++) m.hist.push(m.base * (0.92 + Math.random() * 0.16));
  });

  function sparkPoints(hist) {
    var n = hist.length;
    var min = Math.min.apply(null, hist), max = Math.max.apply(null, hist);
    var span = (max - min) || 1;
    return hist.map(function (v, i) {
      var x = (i / (n - 1)) * 120;
      var y = 30 - ((v - min) / span) * 28 - 1;
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
  }

  function renderKpi(k) {
    var m = kpis[k];
    if (!m.el) return;
    var valEl = m.el.querySelector("[data-value]");
    var deltaEl = m.el.querySelector("[data-delta]");
    var spark = m.el.querySelector("[data-spark]");
    if (valEl) valEl.innerHTML = m.fmt(m.v);
    // delta vs base
    var pct = ((m.v - m.base) / m.base) * 100;
    if (deltaEl) {
      var rising = pct >= 0;
      var good = (m.better === "up") ? rising : !rising;
      deltaEl.className = "kpi-delta " + (good ? "up" : "down");
      var sign = rising ? "+" : "";
      deltaEl.textContent = sign + pct.toFixed(k === "err" ? 2 : 1) + "%";
    }
    if (spark) spark.setAttribute("points", sparkPoints(m.hist));
  }

  function tickKpis() {
    // requests/sec wanders with daily-ish drift
    kpis.rps.v = clamp(kpis.rps.v + rnd(-900, 950) * windowMul, 38000, 61000);
    kpis.lat.v = clamp(kpis.lat.v + rnd(-9, 10) * windowMul, 120, 340);
    kpis.err.v = clamp(kpis.err.v + rnd(-0.05, 0.055) * windowMul, 0.05, 2.4);
    kpis.cpu.v = clamp(kpis.cpu.v + rnd(-3, 3.2) * windowMul, 28, 94);
    Object.keys(kpis).forEach(function (k) {
      var m = kpis[k];
      m.hist.push(m.v);
      if (m.hist.length > 24) m.hist.shift();
      renderKpi(k);
    });
  }

  /* ============ Streaming SVG chart ============ */
  var W = 600, H = 200, N = 60;            // 60 samples across width
  var edge = [], core = [];
  var streamArea = $("#streamArea");
  var streamEdge = $("#streamLineEdge");
  var streamCore = $("#streamLineCore");
  var streamNow = $("#streamNow");
  var streamGrid = $("#streamGrid");

  (function seedStream() {
    var e = 0.6, c = 0.45;
    for (var i = 0; i < N; i++) {
      e = clamp(e + rnd(-0.08, 0.08), 0.2, 0.95);
      c = clamp(c + rnd(-0.06, 0.06), 0.1, 0.8);
      edge.push(e); core.push(c);
    }
  })();

  (function drawGrid() {
    if (!streamGrid) return;
    var html = "";
    for (var i = 1; i < 5; i++) {
      var y = (H / 5) * i;
      html += '<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '" />';
    }
    streamGrid.innerHTML = html;
  })();

  function toPts(arr) {
    return arr.map(function (v, i) {
      var x = (i / (N - 1)) * W;
      var y = H - v * (H - 14) - 6;
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
  }

  function renderStream() {
    if (!streamEdge) return;
    var ePts = toPts(edge);
    streamEdge.setAttribute("points", ePts);
    streamCore.setAttribute("points", toPts(core));
    if (streamArea) streamArea.setAttribute("points", "0," + H + " " + ePts + " " + W + "," + H);
    if (streamNow) streamNow.textContent = Math.round(28000 + edge[edge.length - 1] * 33000).toLocaleString("en-US");
  }

  function tickStream() {
    var e = clamp(edge[edge.length - 1] + rnd(-0.1, 0.1) * windowMul, 0.18, 0.96);
    var c = clamp(core[core.length - 1] + rnd(-0.08, 0.08) * windowMul, 0.1, 0.82);
    edge.push(e); edge.shift();
    core.push(c); core.shift();
    renderStream();
  }

  /* ============ Services ============ */
  var SERVICES = [
    { id: "edge-gw", name: "Edge Gateway", status: "up" },
    { id: "auth", name: "Auth Service", status: "up" },
    { id: "ingest", name: "Event Ingest", status: "up" },
    { id: "search", name: "Search API", status: "degraded" },
    { id: "billing", name: "Billing Core", status: "up" },
    { id: "media", name: "Media CDN", status: "up" },
    { id: "queue", name: "Job Queue", status: "up" },
    { id: "db-primary", name: "DB Primary", status: "up" },
    { id: "db-replica", name: "DB Replica", status: "up" },
    { id: "notify", name: "Notify Hub", status: "up" }
  ];
  SERVICES.forEach(function (s) {
    s.lat = Math.round(rnd(40, 160));
    s.load = Math.round(rnd(28, 78));
  });

  var serviceGrid = $("#serviceGrid");
  var serviceMeta = $("#serviceMeta");
  var activeFilter = "all";
  var STATUS_LBL = { up: "Operational", degraded: "Degraded", down: "Down" };

  function renderServices() {
    if (!serviceGrid) return;
    serviceGrid.innerHTML = SERVICES.map(function (s) {
      var loadColor = s.status;
      return '' +
        '<div class="tile" data-status="' + s.status + '" data-id="' + s.id + '" tabindex="0" role="group" aria-label="' + s.name + ', ' + STATUS_LBL[s.status] + '">' +
          '<div class="tile-top">' +
            '<span class="svc-dot" aria-hidden="true"></span>' +
            '<span class="svc-name">' + s.name + '</span>' +
            '<span class="svc-status">' + (s.status === "up" ? "up" : s.status) + '</span>' +
          '</div>' +
          '<div class="tile-stats">' +
            '<span class="stat"><span class="stat-val" data-lat>' + s.lat + 'ms</span><span class="stat-lbl">p95</span></span>' +
            '<span class="stat"><span class="stat-val" data-load>' + s.load + '%</span><span class="stat-lbl">load</span></span>' +
          '</div>' +
          '<div class="tile-bar" aria-hidden="true"><i style="width:' + s.load + '%"></i></div>' +
        '</div>';
    }).join("");
    applyFilter();
    updateMeta();
  }

  function updateMeta() {
    if (!serviceMeta) return;
    var bad = SERVICES.filter(function (s) { return s.status !== "up"; }).length;
    serviceMeta.textContent = SERVICES.length + " services monitored" + (bad ? " · " + bad + " with issues" : " · all healthy");
  }

  function applyFilter() {
    $$(".tile", serviceGrid).forEach(function (t) {
      var st = t.getAttribute("data-status");
      var show = activeFilter === "all" || st === activeFilter;
      t.classList.toggle("hidden", !show);
    });
  }

  function tickServices() {
    SERVICES.forEach(function (s) {
      var jitter = s.status === "up" ? rnd(-6, 6) : rnd(-4, 12);
      s.lat = clamp(Math.round(s.lat + jitter), 30, s.status === "down" ? 999 : 480);
      s.load = clamp(Math.round(s.load + rnd(-5, 5)), 8, 99);
      var tile = serviceGrid && serviceGrid.querySelector('.tile[data-id="' + s.id + '"]');
      if (tile) {
        var latEl = tile.querySelector("[data-lat]");
        var loadEl = tile.querySelector("[data-load]");
        var bar = tile.querySelector(".tile-bar > i");
        if (latEl) latEl.textContent = (s.status === "down" ? "—" : s.lat + "ms");
        if (loadEl) loadEl.textContent = s.load + "%";
        if (bar) bar.style.width = s.load + "%";
      }
    });
  }

  /* ============ Region heat grid ============ */
  var REGIONS = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-west-1", "eu-west-2", "eu-central", "eu-north",
    "ap-south-1", "ap-east-1", "ap-se-2", "sa-east-1",
    "af-south", "me-central"
  ];
  var regionGrid = $("#regionGrid");
  var regionState = {};
  REGIONS.forEach(function (r) {
    regionState[r] = { h: Math.random() < 0.12 ? "warn" : "ok", load: Math.round(rnd(20, 80)) };
  });

  function shortCode(r) {
    var p = r.split("-");
    return (p[0] + (p[1] || "")).slice(0, 4).toUpperCase();
  }

  function renderRegions() {
    if (!regionGrid) return;
    regionGrid.innerHTML = REGIONS.map(function (r) {
      var s = regionState[r];
      return '<div class="region-cell" data-h="' + s.h + '" data-r="' + r + '" ' +
        'title="' + r + ' · ' + s.load + '% load · ' + (s.h === "ok" ? "healthy" : s.h === "warn" ? "degraded" : "down") + '" ' +
        'role="img" aria-label="' + r + ', ' + (s.h === "ok" ? "healthy" : s.h === "warn" ? "degraded" : "down") + ', ' + s.load + ' percent load">' +
        '<span class="rc-dot" aria-hidden="true"></span>' + shortCode(r) +
        '</div>';
    }).join("");
  }

  function tickRegions() {
    REGIONS.forEach(function (r) {
      var s = regionState[r];
      s.load = clamp(Math.round(s.load + rnd(-7, 7)), 8, 99);
      var cell = regionGrid && regionGrid.querySelector('.region-cell[data-r="' + r + '"]');
      if (cell) {
        cell.setAttribute("title", r + " · " + s.load + "% load · " + (s.h === "ok" ? "healthy" : s.h === "warn" ? "degraded" : "down"));
        cell.setAttribute("data-h", s.h);
      }
    });
  }

  /* ============ Alert / incident feed ============ */
  var alertFeed = $("#alertFeed");
  var navPill = $("#navIncidentCount");
  var globalDot = $("#globalDot");
  var globalState = $("#globalState");
  var activeIncidents = 0;

  var FEED_EMPTY = '<li class="feed-empty">No active alerts. Fleet nominal.</li>';

  function relTime(ts) {
    var s = Math.round((Date.now() - ts) / 1000);
    if (s < 5) return "just now";
    if (s < 60) return s + "s ago";
    var m = Math.floor(s / 60);
    return m + "m ago";
  }

  var feedItems = [];

  function pushAlert(sev, svc, msg) {
    if (!alertFeed) return;
    var empty = alertFeed.querySelector(".feed-empty");
    if (empty) empty.remove();
    var id = ++alertSeq;
    var ts = Date.now();
    feedItems.unshift({ id: id, ts: ts });
    var ICON = { critical: "!", warning: "△", info: "i", resolved: "✓" };
    var li = document.createElement("li");
    li.className = "feed-item";
    li.setAttribute("data-sev", sev);
    li.setAttribute("data-id", id);
    li.innerHTML =
      '<span class="feed-ic" aria-hidden="true">' + ICON[sev] + '</span>' +
      '<div class="feed-main">' +
        '<div class="feed-title"><span class="feed-svc">' + svc + '</span> — ' + msg + '</div>' +
        '<div class="feed-time" data-ts="' + ts + '">just now</div>' +
      '</div>';
    alertFeed.insertBefore(li, alertFeed.firstChild);
    // cap feed length
    while (alertFeed.children.length > 30) alertFeed.removeChild(alertFeed.lastChild);
    return li;
  }

  function refreshFeedTimes() {
    $$(".feed-time", alertFeed).forEach(function (el) {
      var ts = +el.getAttribute("data-ts");
      el.textContent = relTime(ts);
    });
  }

  function setGlobalStatus() {
    var down = SERVICES.filter(function (s) { return s.status === "down"; }).length;
    var deg = SERVICES.filter(function (s) { return s.status === "degraded"; }).length;
    if (!globalDot || !globalState) return;
    globalDot.classList.remove("warn", "down");
    if (down) { globalDot.classList.add("down"); globalState.textContent = "Major outage"; }
    else if (deg) { globalDot.classList.add("warn"); globalState.textContent = "Degraded"; }
    else { globalState.textContent = "Operational"; }
  }

  function updateNavPill() {
    activeIncidents = SERVICES.filter(function (s) { return s.status !== "up"; }).length;
    if (!navPill) return;
    navPill.textContent = activeIncidents;
    navPill.classList.toggle("show", activeIncidents > 0);
  }

  /* Random service health flips → drive feed + region + status */
  var DEGRADE_MSG = [
    "p95 latency above 400ms",
    "elevated 5xx error rate",
    "connection pool saturation",
    "replica lag detected",
    "cache hit-rate dropping"
  ];
  var DOWN_MSG = [
    "health check failing",
    "circuit breaker open",
    "node unreachable"
  ];
  var RECOVER_MSG = [
    "auto-recovered, traffic restored",
    "failover complete, healthy",
    "latency back to baseline"
  ];

  function maybeFlip() {
    var s = pick(SERVICES);
    var roll = Math.random();
    if (s.status === "up") {
      if (roll < 0.55) {
        s.status = "degraded";
        pushAlert("warning", s.name, pick(DEGRADE_MSG));
        flashTile(s.id);
        toast(s.name + " degraded", "warn");
      } else if (roll < 0.68) {
        s.status = "down";
        s.lat = 0;
        pushAlert("critical", s.name, pick(DOWN_MSG));
        flashTile(s.id);
        toast(s.name + " is DOWN", "danger");
      } else {
        pushAlert("info", s.name, "deploy v" + (200 + Math.floor(rnd(0, 60))) + " rolled out");
      }
    } else {
      // recover
      s.status = "up";
      s.lat = Math.round(rnd(40, 140));
      pushAlert("resolved", s.name, pick(RECOVER_MSG));
    }
    renderServices();
    setGlobalStatus();
    updateNavPill();
    syncRegionHealth();
  }

  function flashTile(id) {
    var tile = serviceGrid && serviceGrid.querySelector('.tile[data-id="' + id + '"]');
    if (tile) { tile.classList.add("flash"); setTimeout(function () { tile.classList.remove("flash"); }, 1000); }
  }

  // Mirror worst service state into a couple of region cells for visual coherence
  function syncRegionHealth() {
    var down = SERVICES.some(function (s) { return s.status === "down"; });
    var deg = SERVICES.some(function (s) { return s.status === "degraded"; });
    REGIONS.forEach(function (r) { regionState[r].h = "ok"; });
    if (deg) regionState[REGIONS[3]].h = "warn";
    if (down) { regionState[REGIONS[8]].h = "down"; regionState[REGIONS[0]].h = "warn"; }
    renderRegions();
  }

  /* ============ Controls ============ */
  // Pause / resume
  var pauseBtn = $("#pauseBtn");
  var pauseLabel = $("#pauseLabel");
  var liveState = $("#liveState");
  var liveLabel = $("#liveLabel");
  function setPaused(p) {
    paused = p;
    if (pauseBtn) {
      pauseBtn.setAttribute("aria-pressed", String(p));
      var ic = pauseBtn.querySelector(".btn-ic");
      if (ic) ic.textContent = p ? "▶" : "⏸";
    }
    if (pauseLabel) pauseLabel.textContent = p ? "Resume" : "Pause";
    if (liveState) liveState.setAttribute("data-state", p ? "paused" : "live");
    if (liveLabel) liveLabel.textContent = p ? "Paused" : "Live";
    toast(p ? "Live updates paused" : "Live updates resumed");
  }
  if (pauseBtn) pauseBtn.addEventListener("click", function () { setPaused(!paused); });

  // Time window segmented control
  $$(".seg-btn[data-window]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".seg-btn[data-window]").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      var w = btn.getAttribute("data-window");
      windowMul = WINDOW_LABEL[w] || 1;
      toast("Window: " + w.toUpperCase());
    });
  });

  // Service status filter chips
  $$(".chip[data-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".chip[data-filter]").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      activeFilter = chip.getAttribute("data-filter");
      applyFilter();
    });
  });

  // Clear alerts
  var clearBtn = $("#clearAlerts");
  if (clearBtn) clearBtn.addEventListener("click", function () {
    if (alertFeed) alertFeed.innerHTML = FEED_EMPTY;
    feedItems = [];
    toast("Alert feed cleared");
  });

  // Mobile nav toggle
  var menuToggle = $("#menuToggle");
  var scrim = $("#scrim");
  var app = $("#app");
  function closeNav() {
    if (app) app.classList.remove("nav-open");
    if (scrim) scrim.hidden = true;
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }
  if (menuToggle) menuToggle.addEventListener("click", function () {
    var open = app && app.classList.toggle("nav-open");
    if (scrim) scrim.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(!!open));
  });
  if (scrim) scrim.addEventListener("click", closeNav);
  $$(".nav-item").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      $$(".nav-item").forEach(function (n) { n.classList.remove("is-active"); n.removeAttribute("aria-current"); });
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
      closeNav();
    });
  });

  // Card "⋯" menus
  $$("[data-menu]").forEach(function (b) {
    b.addEventListener("click", function () { toast("Widget options"); });
  });

  /* ============ Drag to rearrange widgets ============ */
  var grid = $("#grid");
  var dragEl = null;
  if (grid) {
    $$(".card", grid).forEach(function (card) {
      card.addEventListener("dragstart", function (e) {
        dragEl = card;
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", card.getAttribute("data-card") || ""); } catch (err) {}
      });
      card.addEventListener("dragend", function () {
        card.classList.remove("dragging");
        $$(".card", grid).forEach(function (c) { c.classList.remove("drop-target"); });
        dragEl = null;
        toast("Layout updated");
      });
      card.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (!dragEl || dragEl === card) return;
        card.classList.add("drop-target");
        e.dataTransfer.dropEffect = "move";
      });
      card.addEventListener("dragleave", function () { card.classList.remove("drop-target"); });
      card.addEventListener("drop", function (e) {
        e.preventDefault();
        card.classList.remove("drop-target");
        if (!dragEl || dragEl === card) return;
        var cards = $$(".card", grid);
        var from = cards.indexOf(dragEl);
        var to = cards.indexOf(card);
        if (from < to) grid.insertBefore(dragEl, card.nextSibling);
        else grid.insertBefore(dragEl, card);
      });
    });
  }

  /* ============ Boot + loops ============ */
  Object.keys(kpis).forEach(renderKpi);
  renderStream();
  renderServices();
  renderRegions();
  setGlobalStatus();
  updateNavPill();
  if (alertFeed && !alertFeed.children.length) alertFeed.innerHTML = FEED_EMPTY;
  // seed feed with a couple of historical entries
  pushAlert("info", "Search API", "running on warm cache, p95 elevated");
  pushAlert("resolved", "Auth Service", "token refresh storm subsided");

  // Fast loop: KPIs + stream scroll (~1s)
  setInterval(function () {
    if (paused) return;
    tickKpis();
    tickStream();
    tickServices();
    tickRegions();
  }, 1000);

  // Slow loop: feed timestamps refresh (~5s)
  setInterval(refreshFeedTimes, 5000);

  // Occasional event loop: flip a service / emit alert (~7s, ~45% chance)
  setInterval(function () {
    if (paused) return;
    if (Math.random() < 0.45) maybeFlip();
  }, 7000);

  // Expose toast for demos
  window.toast = toast;
})();
