(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast ---------- */
  var toastHost = $("[data-toast-host]");
  var toastTimer;
  function toast(msg) {
    toastHost.textContent = msg;
    toastHost.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastHost.classList.remove("is-show"); }, 2200);
  }
  $$("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () { toast(el.getAttribute("data-toast")); });
  });

  /* ---------- formatting ---------- */
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmtUsd(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function fmtCompact(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }
  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ---------- count-up KPIs ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var fmt = el.getAttribute("data-format");
    var render = fmt === "usd" ? fmtUsd : fmtInt;
    if (reduce) { el.textContent = render(target); return; }
    var dur = 1100, start = performance.now();
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = render(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  $$("[data-count]").forEach(countUp);

  /* ---------- sparklines ---------- */
  $$("[data-spark]").forEach(function (el) {
    var vals = el.getAttribute("data-spark").split(",").map(Number);
    var max = Math.max.apply(null, vals);
    vals.forEach(function (v, i) {
      var bar = document.createElement("i");
      bar.style.height = (v / max * 100) + "%";
      bar.style.animationDelay = (i * 45) + "ms";
      el.appendChild(bar);
    });
  });

  /* =====================================================
     CHART
     ===================================================== */
  var svg = $("[data-chart] .chart__svg");
  var W = 600, H = 240, PAD = 14;
  var lineA = $("[data-line-a]"), lineB = $("[data-line-b]");
  var areaA = $("[data-area-a]"), areaB = $("[data-area-b]");
  var gridG = $("[data-grid]"), cursor = $("[data-cursor]");
  var tip = $("[data-tip]"), axis = $("[data-axis]");
  var subTotal = $("[data-chart-total]"), subEl = $("[data-chart-sub]");

  function seeded(seed) {
    return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  }

  // build datasets per range: [labels[], streams[], listeners[]]
  function buildData(range) {
    var rnd = seeded(range === "7d" ? 11 : range === "28d" ? 42 : 99);
    var n, labels = [], base, slope, vol;
    if (range === "7d") { n = 7; base = 78000; slope = 1400; vol = 9000; }
    else if (range === "28d") { n = 28; base = 70000; slope = 700; vol = 11000; }
    else { n = 12; base = 1500000; slope = 80000; vol = 220000; }

    var dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    var streams = [], listeners = [];
    for (var i = 0; i < n; i++) {
      var s = base + slope * i + (rnd() - 0.45) * vol;
      s = Math.max(base * 0.4, s);
      streams.push(s);
      listeners.push(s * (0.34 + rnd() * 0.05));
      if (range === "7d") labels.push(dayNames[i % 7]);
      else if (range === "28d") labels.push(i % 4 === 0 ? "W" + (Math.floor(i / 7) + 1) : "");
      else labels.push(months[i % 12]);
    }
    return { n: n, labels: labels, streams: streams, listeners: listeners };
  }

  function pathFor(data, key, max) {
    var n = data.n, pts = [];
    for (var i = 0; i < n; i++) {
      var x = PAD + (i / (n - 1)) * (W - PAD * 2);
      var y = H - PAD - (data[key][i] / max) * (H - PAD * 2);
      pts.push([x, y]);
    }
    var d = "M" + pts[0][0] + "," + pts[0][1];
    for (var j = 1; j < pts.length; j++) {
      var p0 = pts[j - 1], p1 = pts[j];
      var cx = (p0[0] + p1[0]) / 2;
      d += " C" + cx + "," + p0[1] + " " + cx + "," + p1[1] + " " + p1[0] + "," + p1[1];
    }
    return { d: d, pts: pts };
  }

  var current = null;

  function renderChart(range) {
    var data = buildData(range);
    var max = Math.max.apply(null, data.streams) * 1.1;

    var pa = pathFor(data, "streams", max);
    var pb = pathFor(data, "listeners", max);
    lineA.setAttribute("d", pa.d);
    lineB.setAttribute("d", pb.d);
    areaA.setAttribute("d", pa.d + " L" + (W - PAD) + "," + (H - PAD) + " L" + PAD + "," + (H - PAD) + " Z");
    areaB.setAttribute("d", pb.d + " L" + (W - PAD) + "," + (H - PAD) + " L" + PAD + "," + (H - PAD) + " Z");

    // grid
    gridG.innerHTML = "";
    for (var g = 0; g <= 3; g++) {
      var gy = PAD + g * ((H - PAD * 2) / 3);
      var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", PAD); ln.setAttribute("x2", W - PAD);
      ln.setAttribute("y1", gy); ln.setAttribute("y2", gy);
      gridG.appendChild(ln);
    }

    // axis labels
    axis.innerHTML = "";
    var step = data.n > 8 ? Math.ceil(data.n / 6) : 1;
    for (var a = 0; a < data.n; a += step) {
      var sp = document.createElement("span");
      sp.textContent = data.labels[a] ||
        (range === "28d" ? "D" + (a + 1) : "");
      axis.appendChild(sp);
    }

    var total = data.streams.reduce(function (x, y) { return x + y; }, 0);
    subTotal.textContent = fmtCompact(Math.round(total));
    var labelMap = { "7d": "Last 7 days", "28d": "Last 28 days", "12mo": "Last 12 months" };
    subEl.innerHTML = labelMap[range] + " · <strong data-chart-total>" + fmtCompact(Math.round(total)) + "</strong> streams";

    // line draw animation
    if (!reduce) {
      [lineA, lineB].forEach(function (ln) {
        var len = ln.getTotalLength();
        ln.style.transition = "none";
        ln.style.strokeDasharray = len;
        ln.style.strokeDashoffset = len;
        // force reflow
        void ln.getBoundingClientRect();
        ln.style.transition = "stroke-dashoffset .8s ease";
        ln.style.strokeDashoffset = 0;
      });
    }

    current = { data: data, pts: pa.pts, range: range };
  }

  // hover interaction
  function pointerMove(ev) {
    if (!current) return;
    var rect = svg.getBoundingClientRect();
    var clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    var relX = (clientX - rect.left) / rect.width;
    var idx = Math.round(relX * (current.data.n - 1));
    idx = Math.max(0, Math.min(current.data.n - 1, idx));
    var p = current.pts[idx];
    cursor.setAttribute("cx", p[0]);
    cursor.setAttribute("cy", p[1]);
    cursor.style.opacity = 1;
    tip.hidden = false;
    tip.style.left = (p[0] / W * 100) + "%";
    tip.style.top = (p[1] / H * 100) + "%";
    var lab = current.data.labels[idx] || ((current.range === "28d" ? "Day " : "#") + (idx + 1));
    tip.innerHTML = "<strong>" + fmtCompact(Math.round(current.data.streams[idx])) + "</strong> streams<br>" +
      fmtCompact(Math.round(current.data.listeners[idx])) + " listeners · " + lab;
  }
  function pointerLeave() { cursor.style.opacity = 0; tip.hidden = true; }
  svg.addEventListener("mousemove", pointerMove);
  svg.addEventListener("mouseleave", pointerLeave);
  svg.addEventListener("touchmove", pointerMove, { passive: true });
  svg.addEventListener("touchend", pointerLeave);

  // range toggle
  $$(".seg__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".seg__btn").forEach(function (b) { b.classList.remove("is-active"); b.removeAttribute("aria-pressed"); });
      btn.classList.add("is-active"); btn.setAttribute("aria-pressed", "true");
      renderChart(btn.getAttribute("data-range"));
    });
  });
  renderChart("28d");

  /* =====================================================
     TRACKS TABLE (sortable)
     ===================================================== */
  var COVERS = ["a", "b", "c", "d", "e", "f"];
  var tracks = [
    { title: "Paper Lanterns", album: "Midnight Reservoir", streams: 1042310, listeners: 318044, saves: 84210, revenue: 4118, dur: 222 },
    { title: "Velvet Static", album: "Midnight Reservoir", streams: 884502, listeners: 271338, saves: 71044, revenue: 3496, dur: 198 },
    { title: "Neon Tides", album: "Glass Harbour", streams: 652180, listeners: 204710, saves: 58330, revenue: 2577, dur: 241 },
    { title: "Cassette Sunrise", album: "Glass Harbour", streams: 498744, listeners: 162005, saves: 40118, revenue: 1972, dur: 187 },
    { title: "Halftone Heart", album: "Midnight Reservoir", streams: 421066, listeners: 138902, saves: 33890, revenue: 1664, dur: 263 },
    { title: "Saltwater Radio", album: "Singles", streams: 312901, listeners: 109774, saves: 25612, revenue: 1237, dur: 174 },
    { title: "Low Orbit", album: "Glass Harbour", streams: 268540, listeners: 95011, saves: 21008, revenue: 1062, dur: 209 },
    { title: "Driftwood", album: "Singles", streams: 190233, listeners: 71288, saves: 16240, revenue: 752, dur: 231 }
  ];
  tracks.forEach(function (t, i) { t.cover = COVERS[i % COVERS.length]; });

  var tbody = $("[data-tbody]");
  var sortKey = "streams", sortDir = -1;
  var playingTitle = null;

  function coverGradient(key) {
    var grads = {
      a: "conic-gradient(from 200deg at 70% 80%, var(--accent-2), var(--accent-3), #0d1b3a, var(--accent-2))",
      b: "linear-gradient(140deg, var(--accent), #0a3d2a, #062018)",
      c: "radial-gradient(70% 90% at 30% 20%, var(--accent-3), #2a0d2e 70%)",
      d: "linear-gradient(135deg, var(--accent-2), #1a1145, var(--accent-3))",
      e: "conic-gradient(from 40deg, var(--accent), var(--accent-2), var(--accent-3), var(--accent))",
      f: "radial-gradient(60% 80% at 60% 30%, #ffd36b, var(--accent-3) 60%, #2a0d2e)"
    };
    return grads[key] || grads.a;
  }

  function renderTable() {
    var sorted = tracks.slice().sort(function (a, b) {
      if (sortKey === "title") return a.title.localeCompare(b.title) * sortDir;
      return (a[sortKey] - b[sortKey]) * sortDir;
    });
    tbody.innerHTML = "";
    sorted.forEach(function (t, i) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-title", t.title);
      if (t.title === playingTitle) tr.classList.add("is-playing");
      var rank = t.title === playingTitle
        ? '<span class="miniEq" aria-hidden="true"><i></i><i></i><i></i></span>'
        : (i + 1);
      tr.innerHTML =
        '<td class="ttable__rank">' + rank + '</td>' +
        '<td class="is-text"><div class="trk">' +
          '<span class="trk__art" style="background:' + coverGradient(t.cover) + '"></span>' +
          '<span><span class="trk__title">' + t.title + '</span><br>' +
          '<span class="trk__album">' + t.album + ' · ' + fmtTime(t.dur) + '</span></span>' +
        '</div></td>' +
        '<td class="is-num">' + fmtInt(t.streams) + '</td>' +
        '<td class="is-num">' + fmtInt(t.listeners) + '</td>' +
        '<td class="is-num">' + fmtInt(t.saves) + '</td>' +
        '<td class="is-num">' + fmtUsd(t.revenue) + '</td>';
      tr.addEventListener("click", function () { playTrack(t); });
      tbody.appendChild(tr);
    });

    $$(".ttable th[data-sort]").forEach(function (th) {
      var key = th.getAttribute("data-sort");
      var caret = $(".caret", th);
      th.classList.toggle("is-sorted", key === sortKey);
      if (key === sortKey) {
        th.setAttribute("aria-sort", sortDir === -1 ? "descending" : "ascending");
        if (caret) caret.textContent = sortDir === -1 ? "▾" : "▴";
      } else {
        th.removeAttribute("aria-sort");
        if (caret) caret.textContent = "";
      }
    });
  }

  $$(".ttable th[data-sort]").forEach(function (th) {
    th.addEventListener("click", function () {
      var key = th.getAttribute("data-sort");
      if (key === sortKey) sortDir *= -1;
      else { sortKey = key; sortDir = key === "title" ? 1 : -1; }
      renderTable();
    });
  });
  renderTable();

  /* =====================================================
     TOP LOCATIONS
     ===================================================== */
  var locs = [
    { name: "Los Angeles, US", val: 42118 },
    { name: "London, UK", val: 36740 },
    { name: "Berlin, DE", val: 28902 },
    { name: "Mexico City, MX", val: 24515 },
    { name: "Tokyo, JP", val: 19330 },
    { name: "São Paulo, BR", val: 15208 }
  ];
  var locHost = $("[data-locs]");
  var locMax = locs[0].val;
  locs.forEach(function (l) {
    var li = document.createElement("li");
    li.innerHTML =
      '<div class="loc__row"><span class="loc__name">' + l.name + '</span>' +
      '<span class="loc__val">' + fmtInt(l.val) + '</span></div>' +
      '<div class="meter"><div class="meter__fill"></div></div>';
    locHost.appendChild(li);
    var fill = $(".meter__fill", li);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { fill.style.width = (l.val / locMax * 100) + "%"; });
    });
  });

  /* =====================================================
     NOW-PLAYING PREVIEW (simulated)
     ===================================================== */
  var np = $("[data-nowplay]");
  var npTitle = $("[data-np-title]");
  var npCur = $("[data-np-cur]");
  var npDur = $("[data-np-dur]");
  var npToggle = $("[data-np-toggle]");
  var npClose = $("[data-np-close]");
  var scrub = $("[data-scrub]");
  var scrubFill = $("[data-scrub-fill]");

  var cur = null;         // current track
  var pos = 0;            // seconds
  var playing = false;
  var raf = null, last = 0;

  function setProgress() {
    var pct = cur ? Math.min(100, pos / cur.dur * 100) : 0;
    scrubFill.style.width = pct + "%";
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    npCur.textContent = fmtTime(pos);
  }

  function tick(now) {
    if (!playing || !cur) return;
    if (!last) last = now;
    pos += (now - last) / 1000;
    last = now;
    if (pos >= cur.dur) { pos = cur.dur; setProgress(); pause(); toast("Preview ended."); return; }
    setProgress();
    raf = requestAnimationFrame(tick);
  }

  function play() {
    if (!cur) return;
    playing = true; last = 0;
    npToggle.setAttribute("aria-pressed", "true");
    npToggle.setAttribute("aria-label", "Pause preview");
    if (!reduce) raf = requestAnimationFrame(tick);
  }
  function pause() {
    playing = false;
    if (raf) cancelAnimationFrame(raf);
    npToggle.setAttribute("aria-pressed", "false");
    npToggle.setAttribute("aria-label", "Play preview");
  }

  function playTrack(t) {
    cur = t; pos = 0;
    np.hidden = false;
    npTitle.textContent = t.title;
    npDur.textContent = fmtTime(t.dur);
    playingTitle = t.title;
    setProgress();
    renderTable();
    play();
  }

  npToggle.addEventListener("click", function () { playing ? pause() : play(); });
  npClose.addEventListener("click", function () {
    pause(); np.hidden = true; playingTitle = null; cur = null; renderTable();
  });

  // scrubber: click + drag + keyboard
  function seekFromEvent(ev) {
    if (!cur) return;
    var rect = scrub.getBoundingClientRect();
    var clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    var p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    pos = p * cur.dur; setProgress();
  }
  var dragging = false;
  scrub.addEventListener("mousedown", function (e) { dragging = true; seekFromEvent(e); });
  window.addEventListener("mousemove", function (e) { if (dragging) seekFromEvent(e); });
  window.addEventListener("mouseup", function () { dragging = false; });
  scrub.addEventListener("touchstart", function (e) { seekFromEvent(e); }, { passive: true });
  scrub.addEventListener("touchmove", function (e) { seekFromEvent(e); }, { passive: true });
  scrub.addEventListener("keydown", function (e) {
    if (!cur) return;
    var d = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") d = 5;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") d = -5;
    else if (e.key === "Home") { pos = 0; setProgress(); e.preventDefault(); return; }
    else if (e.key === "End") { pos = cur.dur; setProgress(); e.preventDefault(); return; }
    else return;
    pos = Math.max(0, Math.min(cur.dur, pos + d)); setProgress(); e.preventDefault();
  });
})();
