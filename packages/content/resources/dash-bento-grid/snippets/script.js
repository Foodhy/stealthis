(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rand = function (min, max) { return Math.random() * (max - min) + min; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- number formatting ---------- */
  function fmt(node, value) {
    var prefix = node.getAttribute("data-prefix") || "";
    var suffix = node.getAttribute("data-suffix") || "";
    var decimals = parseInt(node.getAttribute("data-decimals") || "0", 10);
    var scale = parseFloat(node.getAttribute("data-scale") || "1");
    var scaled = value / scale;
    var str;
    if (decimals > 0) {
      str = scaled.toFixed(decimals);
    } else {
      str = Math.round(scaled).toLocaleString("en-US");
    }
    return prefix + str + suffix;
  }

  /* ---------- count-up animation ---------- */
  function animateCount(node, to, dur) {
    dur = dur || 750;
    var from = parseFloat(node.getAttribute("data-current") || node.getAttribute("data-target") || "0");
    node.setAttribute("data-target", to);
    var start = performance.now();
    function step(now) {
      var t = clamp((now - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = from + (to - from) * eased;
      node.setAttribute("data-current", val);
      node.textContent = fmt(node, val);
      if (t < 1) requestAnimationFrame(step);
      else { node.setAttribute("data-current", to); node.textContent = fmt(node, to); }
    }
    requestAnimationFrame(step);
  }

  /* ---------- demo dataset (re-rollable) ---------- */
  var state = {};

  function roll() {
    var n = 28;
    state.series = [];
    var base = rand(11000, 15000);
    for (var i = 0; i < n; i++) {
      base += rand(-1800, 2300);
      base = clamp(base, 6000, 32000);
      state.series.push(Math.round(base));
    }
    state.revenue = state.series.reduce(function (a, b) { return a + b; }, 0);
    state.best = Math.max.apply(null, state.series);
    state.avg = Math.round(state.revenue / n);
    state.orders = Math.round(state.revenue / rand(140, 168));
    state.aov = state.revenue / state.orders;

    state.users = Math.round(rand(68000, 82000));
    state.conv = Math.round(rand(310, 430)); // /100 => %
    state.ret = Math.round(rand(880, 945));   // /10 => %
    state.mrr = Math.round(rand(118000, 142000));

    state.deltas = {
      hero: rand(-4, 16),
      users: rand(-3, 12),
      conv: rand(-5, 7),
      ret: rand(-2, 6),
      mrr: rand(-2, 9)
    };

    state.sparks = {};
    ["users", "conv", "ret", "mrr"].forEach(function (k) {
      var arr = [], v = rand(30, 70);
      for (var i = 0; i < 16; i++) { v += rand(-12, 14); v = clamp(v, 8, 92); arr.push(v); }
      state.sparks[k] = arr;
    });

    // donut shares (sum 100)
    var raw = [rand(34, 46), rand(22, 32), rand(14, 22), rand(8, 14)];
    var sum = raw.reduce(function (a, b) { return a + b; }, 0);
    state.shares = raw.map(function (x) { return Math.round((x / sum) * 100); });
    // fix rounding to exactly 100
    var diff = 100 - state.shares.reduce(function (a, b) { return a + b; }, 0);
    state.shares[0] += diff;

    // bars
    var labels = ["Marketplace", "Direct store", "Wholesale", "Subscriptions", "Affiliates"];
    state.bars = { rev: [], ord: [] };
    labels.forEach(function (l) {
      state.bars.rev.push({ k: l, v: Math.round(rand(40, 160) * 1000) });
      state.bars.ord.push({ k: l, v: Math.round(rand(280, 1400)) });
    });
    state.bars.rev.sort(function (a, b) { return b.v - a.v; });
    state.bars.ord.sort(function (a, b) { return b.v - a.v; });

    state.goalTarget = 625000;
    state.goalCur = state.revenue;
  }

  /* ---------- SVG path builders ---------- */
  function buildLine(series, w, h, pad) {
    pad = pad || 0;
    var max = Math.max.apply(null, series);
    var min = Math.min.apply(null, series);
    var span = (max - min) || 1;
    var inner = h - pad * 2;
    var pts = series.map(function (v, i) {
      var x = (i / (series.length - 1)) * w;
      var y = pad + inner - ((v - min) / span) * inner;
      return [x, y];
    });
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var p0 = pts[i - 1], p1 = pts[i];
      var cx = (p0[0] + p1[0]) / 2;
      d += " C" + cx.toFixed(1) + " " + p0[1].toFixed(1) + " " + cx.toFixed(1) + " " + p1[1].toFixed(1) + " " + p1[0].toFixed(1) + " " + p1[1].toFixed(1);
    }
    return { d: d, pts: pts };
  }

  /* ---------- renderers ---------- */
  function renderHero() {
    var W = 640, H = 220, PAD = 16;
    var built = buildLine(state.series, W, H, PAD);
    var line = $("#linePath");
    var area = $("#areaPath");
    var dot = $("#lineDot");
    if (line) line.setAttribute("d", built.d);
    if (area) area.setAttribute("d", built.d + " L" + W + " " + H + " L0 " + H + " Z");
    if (dot) {
      var last = built.pts[built.pts.length - 1];
      dot.setAttribute("cx", last[0]);
      dot.setAttribute("cy", last[1]);
    }
    var hv = $('[data-tile="hero"] .big-value');
    if (hv) animateCount(hv, state.revenue);
    setDelta($('[data-tile="hero"] .delta'), state.deltas.hero);
    animateCount($("[data-best]"), state.best);
    animateCount($("[data-avg]"), state.avg);
    animateCount($("[data-orders]"), state.orders);
    var aov = $("[data-aov]");
    if (aov) aov.textContent = "$" + state.aov.toFixed(2);
  }

  function setDelta(node, val) {
    if (!node) return;
    var up = val >= 0;
    node.classList.toggle("up", up);
    node.classList.toggle("down", !up);
    node.setAttribute("aria-label", (up ? "up " : "down ") + Math.abs(val).toFixed(1) + " percent");
    node.innerHTML =
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="' +
      (up ? "M6 2 10 8H2Z" : "M6 10 2 4h8Z") +
      '" fill="currentColor"/></svg>' + Math.abs(val).toFixed(1) + "%";
  }

  function renderKpi(tile, target, deltaVal, sparkKey, sparkColor) {
    var el = $('[data-tile="' + tile + '"]');
    if (!el) return;
    animateCount($(".kpi-value", el), target);
    setDelta($(".delta", el), deltaVal);
    var spark = $("[data-spark]", el);
    if (spark) spark.setAttribute("d", buildLine(state.sparks[sparkKey], 120, 36, 4).d);
  }

  function renderKpis() {
    renderKpi("kpi-users", state.users, state.deltas.users, "users");
    renderKpi("kpi-conv", state.conv, state.deltas.conv, "conv");
    renderKpi("kpi-ret", state.ret, state.deltas.ret, "ret");
    renderKpi("kpi-mrr", state.mrr, state.deltas.mrr, "mrr");
  }

  function renderDonut() {
    var C = 2 * Math.PI * 46; // circumference
    var segs = $$(".donut .seg");
    var offset = 0;
    state.shares.forEach(function (pct, i) {
      var seg = segs[i];
      if (!seg) return;
      var len = (pct / 100) * C;
      seg.setAttribute("stroke-dasharray", len.toFixed(2) + " " + (C - len).toFixed(2));
      seg.setAttribute("stroke-dashoffset", (-offset).toFixed(2));
      offset += len;
      var lbl = $('[data-share="' + i + '"]');
      if (lbl) lbl.textContent = pct + "%";
    });
  }

  function renderBars(metric) {
    metric = metric || currentBarMetric;
    var data = state.bars[metric];
    var max = Math.max.apply(null, data.map(function (d) { return d.v; }));
    var list = $("#barList");
    if (!list) return;
    list.innerHTML = data.map(function (d) {
      var pct = Math.round((d.v / max) * 100);
      var v = metric === "rev"
        ? "$" + (d.v / 1000).toFixed(1) + "k"
        : d.v.toLocaleString("en-US");
      return '<li><span class="bar-k">' + d.k + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="--bw:0%"></span></span>' +
        '<span class="bar-v">' + v + '</span></li>';
    }).join("");
    // animate widths in next frame
    requestAnimationFrame(function () {
      $$(".bar-fill", list).forEach(function (f, i) {
        var pct = Math.round((data[i].v / max) * 100);
        f.style.setProperty("--bw", pct + "%");
      });
    });
  }

  function renderGoal() {
    var pct = clamp(Math.round((state.goalCur / state.goalTarget) * 100), 0, 100);
    var arc = $("#gaugeArc");
    if (arc) {
      var L = arc.getTotalLength ? arc.getTotalLength() : 151;
      arc.style.strokeDasharray = (L * pct / 100).toFixed(1) + " " + L.toFixed(1);
    }
    var pctEl = $(".goal-pct");
    if (pctEl) animateCount(pctEl, pct * 10); // scale 10 => "78%"
    var cur = $("[data-goalcur]");
    if (cur) cur.textContent = "$" + (state.goalCur / 1000).toFixed(1) + "k";
  }

  /* ---------- range label ---------- */
  function setRangeLabel(days) {
    var label = days >= 365 ? "12 months" : days + " days";
    $$("[data-rangelabel]").forEach(function (n) { n.textContent = label; });
  }

  /* ---------- full render ---------- */
  function renderAll() {
    renderHero();
    renderKpis();
    renderDonut();
    renderBars();
    renderGoal();
    stampUpdated();
  }

  function stampUpdated() {
    var u = $("#updatedAt");
    if (u) u.textContent = "updated just now";
  }

  /* ---------- range segmented control ---------- */
  $$("#rangeSeg .seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$("#rangeSeg .seg-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      var days = parseInt(btn.getAttribute("data-range"), 10);
      setRangeLabel(days);
      // longer ranges scale the numbers up
      var mult = days / 30;
      roll();
      state.revenue = Math.round(state.revenue * (0.6 + mult * 0.4));
      state.avg = Math.round(state.revenue / 28);
      renderAll();
      toast("Range set to " + (days >= 365 ? "12 months" : days + " days"));
    });
  });

  /* ---------- bar tabs ---------- */
  var currentBarMetric = "rev";
  $$("#barTabs .seg-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$("#barTabs .seg-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      currentBarMetric = btn.getAttribute("data-metric");
      renderBars(currentBarMetric);
    });
  });

  /* ---------- refresh ---------- */
  var refreshBtn = $("#refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      refreshBtn.classList.add("is-loading");
      refreshBtn.disabled = true;
      roll();
      renderAll();
      toast("Demo data refreshed");
      setTimeout(function () {
        refreshBtn.classList.remove("is-loading");
        refreshBtn.disabled = false;
      }, 700);
    });
  }

  /* ---------- tile menus ---------- */
  $$(".menu-btn").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var tile = b.closest(".tile");
      var name = tile ? $("h2", tile).textContent : "Tile";
      toast(name + ": menu (demo)");
    });
  });

  /* ---------- search ---------- */
  var search = $("#globalSearch");
  if (search) {
    search.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && search.value.trim()) {
        toast('Searching "' + search.value.trim() + '"…');
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (search) search.focus();
    }
  });

  /* ---------- live activity feed ---------- */
  var feed = $("#feed");
  var feedPool = [
    { ico: "ok", cls: "ok", t: "<strong>New order</strong> · #_ID placed" },
    { ico: "✦", cls: "brand", t: "<strong>Plan upgrade</strong> · _CO → Scale" },
    { ico: "+", cls: "brand", t: "<strong>Signup</strong> · _USER joined" },
    { ico: "!", cls: "warn", t: "<strong>Refund</strong> · #_ID reversed" },
    { ico: "$", cls: "ok", t: "<strong>Payment</strong> · $_AMT received" }
  ];
  var names = ["Aria K.", "Marlow V.", "Jin P.", "Sofia R.", "Devon T.", "Noor A."];
  var cos = ["Helix Co", "Vire", "Pallas", "Orbit Labs", "Kestrel"];
  function liveTick() {
    if (!feed) return;
    var p = feedPool[Math.floor(rand(0, feedPool.length))];
    var txt = p.t
      .replace("_ID", Math.floor(rand(40200, 40999)))
      .replace("_CO", cos[Math.floor(rand(0, cos.length))])
      .replace("_USER", names[Math.floor(rand(0, names.length))])
      .replace("_AMT", Math.floor(rand(40, 980)).toLocaleString("en-US"));
    var li = document.createElement("li");
    li.className = "feed-item is-new";
    var icoChar = p.ico.length === 1 && /[a-z]/i.test(p.ico) === false ? p.ico : p.ico;
    li.innerHTML =
      '<span class="fi-ico ' + p.cls + '" aria-hidden="true">' + p.ico + '</span>' +
      '<div class="fi-text">' + txt + '<span class="fi-time">just now</span></div>';
    feed.insertBefore(li, feed.firstChild);
    // age existing timestamps
    var times = $$(".fi-time", feed);
    for (var i = 1; i < times.length; i++) {
      if (times[i].textContent === "just now") times[i].textContent = "moments ago";
    }
    while (feed.children.length > 7) feed.removeChild(feed.lastChild);
  }
  var liveTimer = setInterval(liveTick, 5200);

  /* ---------- drag to rearrange ---------- */
  var bento = $("#bento");
  var dragSrc = null;
  $$(".tile-head[draggable='true']").forEach(function (head) {
    var tile = head.closest(".tile");
    head.addEventListener("dragstart", function (e) {
      dragSrc = tile;
      tile.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", tile.dataset.tile || ""); } catch (err) {}
    });
    head.addEventListener("dragend", function () {
      tile.classList.remove("dragging");
      $$(".tile").forEach(function (t) { t.classList.remove("drop-target"); });
      dragSrc = null;
    });
  });
  if (bento) {
    $$(".tile").forEach(function (tile) {
      tile.addEventListener("dragover", function (e) {
        if (!dragSrc || dragSrc === tile) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        tile.classList.add("drop-target");
      });
      tile.addEventListener("dragleave", function () {
        tile.classList.remove("drop-target");
      });
      tile.addEventListener("drop", function (e) {
        e.preventDefault();
        tile.classList.remove("drop-target");
        if (!dragSrc || dragSrc === tile) return;
        // swap DOM positions
        var sibling = dragSrc.nextSibling === tile ? dragSrc : tile.nextSibling;
        bento.insertBefore(dragSrc, tile);
        if (sibling) bento.insertBefore(tile, sibling);
        toast("Tiles rearranged");
      });
    });
  }

  /* ---------- init ---------- */
  roll();
  setRangeLabel(30);
  // small delay so transitions are visible on first paint
  renderAll();

  // expose for debugging / demos
  window.__bento = { roll: roll, render: renderAll, toast: toast };

  // clean up interval if page hidden long-term (best effort)
  window.addEventListener("beforeunload", function () { clearInterval(liveTimer); });
})();
