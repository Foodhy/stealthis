(function () {
  "use strict";

  var widget = document.getElementById("stateWidget");
  var seg = document.getElementById("stateSeg");
  var segBtns = Array.prototype.slice.call(seg.querySelectorAll(".seg-btn"));
  var panes = Array.prototype.slice.call(widget.querySelectorAll(".state"));
  var pill = document.getElementById("statePill");
  var footStatus = document.getElementById("footStatus");
  var footTime = document.getElementById("footTime");
  var simulateBtn = document.getElementById("simulateBtn");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var STATE_META = {
    loading: { pill: "Loading", tone: "muted", foot: '<span class="fs-dot"></span> Syncing…', footClass: "foot-status live", time: "—" },
    empty:   { pill: "Empty",   tone: "muted", foot: '<span class="fs-dot"></span> No source connected', footClass: "foot-status", time: "—" },
    error:   { pill: "Error",   tone: "danger", foot: '<span class="fs-dot"></span> Failed to load', footClass: "foot-status err", time: "8s timeout" },
    loaded:  { pill: "Live",    tone: "ok", foot: '<span class="fs-dot"></span> Up to date', footClass: "foot-status live", time: "just now" }
  };

  /* ---------- toast ---------- */
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.style.opacity = "0";
      t.style.transform = "translateY(8px)";
      t.style.transition = "opacity .25s, transform .25s";
      setTimeout(function () { t.remove(); }, 260);
    }, 2200);
  }

  /* ---------- state switching ---------- */
  function setState(state) {
    widget.setAttribute("data-state", state);
    panes.forEach(function (p) {
      p.hidden = p.getAttribute("data-pane") !== state;
    });
    segBtns.forEach(function (b) {
      var on = b.getAttribute("data-state") === state;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var m = STATE_META[state];
    if (m) {
      pill.textContent = m.pill;
      pill.setAttribute("data-tone", m.tone);
      footStatus.className = m.footClass;
      footStatus.innerHTML = m.foot;
      footTime.textContent = m.time;
    }
    if (state === "loaded") renderLoaded();
  }

  segBtns.forEach(function (b) {
    b.addEventListener("click", function () { setState(b.getAttribute("data-state")); });
  });

  /* ---------- overflow menu ---------- */
  var menuBtn = document.getElementById("wMenuBtn");
  var menu = document.getElementById("wMenu");
  function openMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var first = menu.querySelector("button");
      if (first) first.focus();
    }
  }
  menuBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    openMenu(menu.hidden);
  });
  menu.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-go]");
    if (!b) return;
    openMenu(false);
    menuBtn.focus();
    if (b.getAttribute("data-go") === "loaded") {
      simulate();
    } else {
      setState(b.getAttribute("data-go"));
    }
  });
  document.addEventListener("click", function () { if (!menu.hidden) openMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) { openMenu(false); menuBtn.focus(); }
  });

  /* ---------- simulate loading -> loaded ---------- */
  var loadingTimer = null;
  function simulate() {
    if (loadingTimer) clearTimeout(loadingTimer);
    setState("loading");
    document.getElementById("wSub").textContent = "Fetching readings…";
    var delay = prefersReduced ? 350 : 1500;
    loadingTimer = setTimeout(function () {
      document.getElementById("wSub").textContent = "Realtime · last 24h";
      setState("loaded");
      toast("Widget loaded · 8,412 sessions");
    }, delay);
  }
  simulateBtn.addEventListener("click", simulate);

  /* ---------- empty / error CTAs ---------- */
  document.getElementById("connectBtn").addEventListener("click", function () {
    toast("Connecting source…");
    simulate();
  });
  document.getElementById("emptyDocsBtn").addEventListener("click", function () {
    toast("Opening docs for session metrics");
  });
  document.getElementById("retryBtn").addEventListener("click", function () {
    toast("Retrying request…");
    simulate();
  });
  document.getElementById("errDetailsBtn").addEventListener("click", function () {
    toast("ECONNRESET · metrics/sessions · req 7f3a9");
  });

  /* ---------- loaded chart + KPI rendering ---------- */
  var SVGNS = "http://www.w3.org/2000/svg";
  var sessions = [];
  function seedSessions() {
    sessions = [];
    var base = 420;
    for (var i = 0; i < 12; i++) {
      var hour = i + 1;
      var bell = Math.exp(-Math.pow((i - 7) / 4, 2));
      var v = Math.round(base + bell * 900 + (Math.random() * 120 - 60));
      sessions.push({ hour: hour, v: Math.max(180, v) });
    }
  }

  function renderBars() {
    var svg = document.getElementById("barsSvg");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var W = 480, H = 160, padB = 22, padT = 8;
    var max = sessions.reduce(function (m, d) { return Math.max(m, d.v); }, 0);
    var peakIdx = sessions.reduce(function (pi, d, i) { return d.v > sessions[pi].v ? i : pi; }, 0);
    // baseline grid
    [0.25, 0.5, 0.75].forEach(function (g) {
      var y = padT + (H - padB - padT) * g;
      var line = document.createElementNS(SVGNS, "line");
      line.setAttribute("x1", 0); line.setAttribute("x2", W);
      line.setAttribute("y1", y); line.setAttribute("y2", y);
      line.setAttribute("class", "bar-grid");
      svg.appendChild(line);
    });
    var gap = 8;
    var bw = (W - gap * (sessions.length - 1)) / sessions.length;
    sessions.forEach(function (d, i) {
      var h = (d.v / max) * (H - padB - padT);
      var x = i * (bw + gap);
      var y = H - padB - h;
      var r = document.createElementNS(SVGNS, "rect");
      r.setAttribute("x", x.toFixed(1));
      r.setAttribute("y", y.toFixed(1));
      r.setAttribute("width", bw.toFixed(1));
      r.setAttribute("height", Math.max(2, h).toFixed(1));
      r.setAttribute("rx", "4");
      r.setAttribute("class", "bar-rect" + (i === peakIdx ? " peak" : ""));
      var title = document.createElementNS(SVGNS, "title");
      title.textContent = String(d.hour).padStart(2, "0") + ":00 · " + d.v.toLocaleString() + " sessions";
      r.appendChild(title);
      svg.appendChild(r);
    });
    var note = widget.querySelector(".chart-note");
    if (note) note.textContent = "Peak " + String(sessions[peakIdx].hour).padStart(2, "0") + ":00 · " + sessions[peakIdx].v.toLocaleString();
  }

  function renderSpark() {
    var line = document.getElementById("sparkLine");
    var fill = document.getElementById("sparkFill");
    var W = 96, H = 30;
    var pts = sessions.slice(-8).map(function (d) { return d.v; });
    var max = Math.max.apply(null, pts), min = Math.min.apply(null, pts);
    var span = Math.max(1, max - min);
    var step = W / (pts.length - 1);
    var d = pts.map(function (v, i) {
      var x = i * step;
      var y = H - 3 - ((v - min) / span) * (H - 6);
      return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
    line.setAttribute("d", d);
    fill.setAttribute("d", d + " L" + W + " " + H + " L0 " + H + " Z");
  }

  function renderLoaded() {
    if (!sessions.length) seedSessions();
    var total = sessions.reduce(function (s, d) { return s + d.v; }, 0);
    document.getElementById("kpiValue").textContent = total.toLocaleString();
    var delta = (Math.random() * 8 + 2);
    var up = Math.random() > 0.25;
    var chip = document.getElementById("kpiDelta");
    chip.className = "delta-chip " + (up ? "up" : "down");
    chip.querySelector(".delta-arrow").textContent = up ? "▲" : "▼";
    document.getElementById("kpiDeltaPct").textContent = delta.toFixed(1) + "%";
    renderBars();
    renderSpark();
    footTime.textContent = "just now";
  }

  /* ---------- live tick (only while loaded) ---------- */
  setInterval(function () {
    if (widget.getAttribute("data-state") !== "loaded" || prefersReduced) return;
    // nudge the latest few windows so the board feels live
    var i = sessions.length - 1;
    if (i < 0) return;
    sessions[i].v = Math.max(180, sessions[i].v + Math.round(Math.random() * 80 - 38));
    var total = sessions.reduce(function (s, d) { return s + d.v; }, 0);
    document.getElementById("kpiValue").textContent = total.toLocaleString();
    renderBars();
    renderSpark();
  }, 2400);

  /* ---------- off-canvas nav ---------- */
  var sidebar = document.getElementById("sidebar");
  var menuToggle = document.getElementById("menuToggle");
  var scrim = document.getElementById("scrim");
  function setNav(open) {
    sidebar.classList.toggle("is-open", open);
    scrim.hidden = !open;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  menuToggle.addEventListener("click", function () { setNav(!sidebar.classList.contains("is-open")); });
  scrim.addEventListener("click", function () { setNav(false); });

  /* ---------- init ---------- */
  seedSessions();
  setState("loading");
  // kick off an automatic simulated load on first paint
  setTimeout(simulate, 600);
})();
