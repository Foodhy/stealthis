(function () {
  "use strict";

  /* ---------------- Data ---------------- */
  var TIERS = [
    { key: "ga",    name: "General Admission", price: 79,  sold: 1840, color: "var(--tier-1)" },
    { key: "vip",   name: "VIP Lounge",        price: 159, sold: 820,  color: "var(--tier-2)" },
    { key: "pit",   name: "Platinum Pit",      price: 249, sold: 364,  color: "var(--tier-3)" },
    { key: "early", name: "Early Bird",        price: 59,  sold: 160,  color: "var(--tier-4)" }
  ];

  // Daily ticket sales, newest last. 90 days of synthetic-but-stable data.
  var DAILY = (function () {
    var out = [], seed = 42;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 89; i >= 0; i--) {
      // rising trend toward the event with weekend bumps and a couple of spikes
      var base = 14 + (90 - i) * 0.55;
      var weekend = (i % 7 === 1 || i % 7 === 2) ? 22 : 0;
      var spike = (i === 60 || i === 18 || i === 5) ? 70 : 0;
      var v = Math.round(base + weekend + spike + rnd() * 26);
      out.push(Math.max(6, v));
    }
    return out;
  })();

  var ORDERS = [
    { id: "NP-8841", buyer: "Marisol Vega",   tier: "vip",   qty: 2, when: "12 min ago",  email: "marisol.v@example.com",  fee: 9.5,  method: "Visa ·· 4012" },
    { id: "NP-8840", buyer: "Dre Okonkwo",    tier: "ga",    qty: 4, when: "31 min ago",  email: "dre.ok@example.com",     fee: 9.5,  method: "Apple Pay" },
    { id: "NP-8839", buyer: "Lena Hartman",   tier: "pit",   qty: 1, when: "1 hr ago",    email: "lena.h@example.com",     fee: 9.5,  method: "Mastercard ·· 7781" },
    { id: "NP-8838", buyer: "Yuki Tanaka",    tier: "ga",    qty: 2, when: "2 hr ago",    email: "yuki.t@example.com",     fee: 9.5,  method: "Visa ·· 1190", refunded: true },
    { id: "NP-8837", buyer: "Omar Khalil",    tier: "vip",   qty: 3, when: "3 hr ago",    email: "omar.k@example.com",     fee: 9.5,  method: "PayPal" },
    { id: "NP-8836", buyer: "Priya Nair",     tier: "early", qty: 2, when: "4 hr ago",    email: "priya.n@example.com",    fee: 9.5,  method: "Visa ·· 6620" },
    { id: "NP-8835", buyer: "Theo Brandt",    tier: "ga",    qty: 6, when: "5 hr ago",    email: "theo.b@example.com",     fee: 9.5,  method: "Google Pay" },
    { id: "NP-8834", buyer: "Camila Rossi",   tier: "pit",   qty: 2, when: "6 hr ago",    email: "camila.r@example.com",   fee: 9.5,  method: "Mastercard ·· 3308" }
  ];

  var AVATAR_COLORS = ["#7c3aed", "#ff3d81", "#06b6d4", "#f59e0b", "#16a34a", "#6366f1"];

  /* ---------------- Helpers ---------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function money(n) { return "$" + n.toLocaleString("en-US"); }
  function money2(n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function initials(name) { return name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(); }
  function tierByKey(k) { for (var i = 0; i < TIERS.length; i++) if (TIERS[i].key === k) return TIERS[i]; return TIERS[0]; }

  /* ---------------- Toast ---------------- */
  var toastHost = $("#toastHost");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="dot-led"></span>' + msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      el.addEventListener("animationend", function () { el.remove(); });
    }, 2600);
  }

  /* ---------------- Chart ---------------- */
  var RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };
  var DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var chart = $("#chart");
  var W = 720, H = 260, PAD_L = 8, PAD_R = 8, PAD_T = 18, PAD_B = 22;
  var tip = $("#chartTip");
  var chartWrap = $(".chart-wrap");

  // inject SVG gradients once
  (function defs() {
    var ns = "http://www.w3.org/2000/svg";
    var defs = document.createElementNS(ns, "defs");
    defs.innerHTML =
      '<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#ff3d81"/></linearGradient>';
    chart.insertBefore(defs, chart.firstChild);
  })();

  var currentRange = "7d";

  function dataForRange(r) {
    var n = RANGE_DAYS[r];
    return DAILY.slice(DAILY.length - n);
  }

  function xLabelsForRange(r, data) {
    var n = data.length;
    if (r === "7d") {
      // map last 7 days to weekday names ending today (assume today = Tue arbitrary anchor)
      var anchor = 2; // Tue
      return data.map(function (_, i) {
        var d = (anchor - (n - 1 - i)) % 7;
        if (d < 0) d += 7;
        return DAY_LABELS[d];
      });
    }
    // for 30/90 show ~5 sparse week markers
    var labels = data.map(function () { return ""; });
    var step = r === "30d" ? 6 : 18;
    for (var i = n - 1; i >= 0; i -= step) {
      var wk = Math.round((n - 1 - i) / 7) ;
      labels[i] = "wk -" + Math.round((n - i) / 7);
    }
    labels[n - 1] = "now";
    return labels;
  }

  function drawChart(r) {
    var data = dataForRange(r);
    var n = data.length;
    var max = Math.max.apply(null, data) * 1.12;
    var innerW = W - PAD_L - PAD_R;
    var innerH = H - PAD_T - PAD_B;
    var stepX = innerW / (n - 1 || 1);

    function px(i) { return PAD_L + i * stepX; }
    function py(v) { return PAD_T + innerH - (v / max) * innerH; }

    // gridlines
    var gl = $("#gridlines");
    gl.innerHTML = "";
    for (var g = 0; g <= 4; g++) {
      var yy = PAD_T + (innerH / 4) * g;
      var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("class", "gridline");
      l.setAttribute("x1", PAD_L); l.setAttribute("x2", W - PAD_R);
      l.setAttribute("y1", yy); l.setAttribute("y2", yy);
      gl.appendChild(l);
    }

    // line + area paths
    var linePts = data.map(function (v, i) { return px(i) + "," + py(v); });
    var lineD = "M" + linePts.join(" L");
    var areaD = "M" + px(0) + "," + (H - PAD_B) + " L" + linePts.join(" L") + " L" + px(n - 1) + "," + (H - PAD_B) + " Z";
    $("#line").setAttribute("d", lineD);
    $("#area").setAttribute("d", areaD);

    // bars (faint) — only when not too dense
    var bars = $("#bars");
    bars.innerHTML = "";
    var showBars = n <= 31;
    if (showBars) {
      var bw = Math.min(stepX * 0.42, 22);
      data.forEach(function (v, i) {
        var rct = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rct.setAttribute("class", "bar");
        rct.setAttribute("x", px(i) - bw / 2);
        rct.setAttribute("y", py(v));
        rct.setAttribute("width", bw);
        rct.setAttribute("height", (H - PAD_B) - py(v));
        rct.setAttribute("rx", 4);
        rct.dataset.i = i;
        bars.appendChild(rct);
      });
    }

    // dots — sparse for big ranges
    var dots = $("#dots");
    dots.innerHTML = "";
    var dotEvery = n <= 14 ? 1 : (n <= 31 ? 3 : 9);
    data.forEach(function (v, i) {
      if (i % dotEvery !== 0 && i !== n - 1) return;
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "dot");
      c.setAttribute("cx", px(i));
      c.setAttribute("cy", py(v));
      c.setAttribute("r", n <= 14 ? 5 : 4);
      c.dataset.i = i;
      dots.appendChild(c);
    });

    // x axis labels
    var labels = xLabelsForRange(r, data);
    $("#chartX").innerHTML = labels.map(function (t) { return "<span>" + t + "</span>"; }).join("");

    // tooltip wiring
    function showTip(i, target) {
      var v = data[i];
      var rect = chart.getBoundingClientRect();
      var wrapRect = chartWrap.getBoundingClientRect();
      var cx = (px(i) / W) * rect.width + (rect.left - wrapRect.left);
      var cy = (py(v) / H) * rect.height + (rect.top - wrapRect.top);
      tip.style.left = cx + "px";
      tip.style.top = cy + "px";
      tip.innerHTML = "<b>" + v + "</b> tickets";
      tip.hidden = false;
      $$(".bar").forEach(function (b) { b.classList.toggle("is-hot", b.dataset.i === String(i)); });
    }
    function hideTip() { tip.hidden = true; $$(".bar").forEach(function (b) { b.classList.remove("is-hot"); }); }

    $$(".dot, .bar", chart).forEach(function (node) {
      node.addEventListener("mouseenter", function () { showTip(+node.dataset.i, node); });
      node.addEventListener("mouseleave", hideTip);
    });

    var totalSold = data.reduce(function (a, b) { return a + b; }, 0);
    var subLabel = r === "7d" ? "Last 7 days" : (r === "30d" ? "Last 30 days" : "Last 90 days");
    $("#chartSub").textContent = subLabel + " · " + totalSold.toLocaleString() + " tickets in range";
  }

  /* ---------------- Tier donut + list ---------------- */
  var donutSegs = $("#donutSegs");
  var R = 48, CIRC = 2 * Math.PI * R;
  var activeTier = null;

  function renderTiers() {
    var totalSold = TIERS.reduce(function (a, t) { return a + t.sold; }, 0);
    donutSegs.innerHTML = "";
    var offset = 0;
    TIERS.forEach(function (t) {
      var frac = t.sold / totalSold;
      var seg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      seg.setAttribute("class", "donut-seg");
      seg.setAttribute("cx", 60); seg.setAttribute("cy", 60); seg.setAttribute("r", R);
      seg.setAttribute("stroke", t.color);
      seg.setAttribute("stroke-dasharray", (frac * CIRC) + " " + CIRC);
      seg.setAttribute("stroke-dashoffset", -offset * CIRC);
      seg.dataset.key = t.key;
      donutSegs.appendChild(seg);
      offset += frac;
    });

    var list = $("#tierList");
    list.innerHTML = "";
    TIERS.forEach(function (t) {
      var frac = Math.round((t.sold / totalSold) * 100);
      var li = document.createElement("li");
      li.className = "tier-row";
      li.dataset.key = t.key;
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.innerHTML =
        '<span class="tier-swatch" style="--c:' + t.color + '"></span>' +
        '<span><span class="tier-name">' + t.name + '</span><br>' +
        '<span class="tier-meta">' + money(t.price) + ' · ' + frac + '% of sales</span></span>' +
        '<span class="tier-figs"><span class="tier-count">' + t.sold.toLocaleString() + '</span><br>' +
        '<span class="tier-rev">' + money(t.sold * t.price) + '</span></span>';
      list.appendChild(li);
    });

    $("#tierTotal").textContent = totalSold.toLocaleString() + " sold";
    $("#donutPct").textContent = "100%";
  }

  function selectTier(key) {
    activeTier = (activeTier === key) ? null : key;
    var totalSold = TIERS.reduce(function (a, t) { return a + t.sold; }, 0);
    $$(".donut-seg").forEach(function (s) {
      var on = !activeTier || s.dataset.key === activeTier;
      s.classList.toggle("is-dim", !on);
      s.classList.toggle("is-hot", activeTier && s.dataset.key === activeTier);
    });
    $$(".tier-row").forEach(function (r) {
      r.classList.toggle("is-active", activeTier === r.dataset.key);
    });
    if (activeTier) {
      var t = tierByKey(activeTier);
      $("#donutPct").textContent = Math.round((t.sold / totalSold) * 100) + "%";
      $(".donut-cap").textContent = t.name.split(" ")[0].toLowerCase() + " share";
      toast(t.name + " — " + t.sold.toLocaleString() + " sold · " + money(t.sold * t.price));
    } else {
      $("#donutPct").textContent = "100%";
      $(".donut-cap").textContent = "sold-through";
    }
  }

  /* ---------------- Check-in ring ---------------- */
  function setRing(pct) {
    var rr = 50, c = 2 * Math.PI * rr;
    var fill = $("#ringFill");
    fill.setAttribute("stroke-dasharray", c);
    fill.setAttribute("stroke-dashoffset", c * (1 - pct / 100));
    $("#ringPct").textContent = pct + "%";
  }

  /* ---------------- Orders ---------------- */
  function renderOrders() {
    var body = $("#ordersBody");
    body.innerHTML = "";
    ORDERS.forEach(function (o, idx) {
      var t = tierByKey(o.tier);
      var total = o.qty * t.price + o.fee;
      var tr = document.createElement("tr");
      tr.dataset.id = o.id;
      tr.setAttribute("tabindex", "0");
      var statusBadge = o.refunded
        ? '<span class="badge badge-danger">Refunded</span>'
        : '<span class="badge badge-ok">Paid</span>';
      tr.innerHTML =
        '<td><span class="ord-id">' + o.id + '</span><br><span class="tier-rev">' + o.when + '</span></td>' +
        '<td><span class="ord-buyer"><span class="avatar" style="background:' + AVATAR_COLORS[idx % AVATAR_COLORS.length] + '">' + initials(o.buyer) + '</span>' + o.buyer + '</span></td>' +
        '<td><span class="tier-tag" style="--c:' + t.color + '">' + t.name + '</span></td>' +
        '<td class="num">' + o.qty + '</td>' +
        '<td class="num"><strong>' + money2(total) + '</strong></td>' +
        '<td>' + statusBadge + '</td>';
      body.appendChild(tr);
    });
  }

  /* ---------------- Drawer ---------------- */
  var drawer = $("#drawer"), overlay = $("#drawerOverlay");
  var lastFocus = null;

  function openOrder(id) {
    var o = null;
    for (var i = 0; i < ORDERS.length; i++) if (ORDERS[i].id === id) { o = ORDERS[i]; break; }
    if (!o) return;
    var t = tierByKey(o.tier);
    var sub = o.qty * t.price;
    var total = sub + o.fee;
    $("#drawerTitle").textContent = o.id;
    $("#drawerBody").innerHTML =
      '<div class="stub"><div class="stub-perf"></div>' +
        '<div class="stub-top"><div><div class="stub-evt">Neon Pulse Festival</div>' +
        '<div class="stub-sub">Aug 22, 2026 · Pier 48, San Francisco</div></div>' +
        '<div class="stub-qr"></div></div>' +
        '<div class="stub-bottom"><div>Tier<b>' + t.name + '</b></div>' +
        '<div>Qty<b>' + o.qty + '</b></div>' +
        '<div>Total<b>' + money2(total) + '</b></div></div>' +
      '</div>' +
      '<dl class="dl">' +
        '<li><dt>Buyer</dt><dd>' + o.buyer + '</dd></li>' +
        '<li><dt>Email</dt><dd>' + o.email + '</dd></li>' +
        '<li><dt>Payment</dt><dd>' + o.method + '</dd></li>' +
        '<li><dt>Placed</dt><dd>' + o.when + '</dd></li>' +
        '<li><dt>Status</dt><dd>' + (o.refunded ? '<span class="badge badge-danger">Refunded</span>' : '<span class="badge badge-ok">Paid</span>') + '</dd></li>' +
        '<li><dt>' + o.qty + ' × ' + t.name + '</dt><dd>' + money2(sub) + '</dd></li>' +
        '<li><dt>Service fee</dt><dd>' + money2(o.fee) + '</dd></li>' +
        '<li><dt class="grand">Total</dt><dd class="grand">' + money2(total) + '</dd></li>' +
      '</dl>';
    lastFocus = document.activeElement;
    overlay.hidden = false;
    drawer.hidden = false;
    $("#drawerClose").focus();
  }

  function closeDrawer() {
    drawer.hidden = true;
    overlay.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------------- Wiring ---------------- */
  // timeframe toggle
  $$(".seg-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.classList.contains("is-active")) return;
      $$(".seg-btn").forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("is-active");
      b.setAttribute("aria-pressed", "true");
      currentRange = b.dataset.range;
      drawChart(currentRange);
      toast("Chart updated · " + b.textContent.trim());
    });
  });

  // tier interactions (delegated)
  $("#donutSegs").addEventListener("click", function (e) {
    var seg = e.target.closest(".donut-seg");
    if (seg) selectTier(seg.dataset.key);
  });
  $("#tierList").addEventListener("click", function (e) {
    var row = e.target.closest(".tier-row");
    if (row) selectTier(row.dataset.key);
  });
  $("#tierList").addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      var row = e.target.closest(".tier-row");
      if (row) { e.preventDefault(); selectTier(row.dataset.key); }
    }
  });

  // order drill
  $("#ordersBody").addEventListener("click", function (e) {
    var tr = e.target.closest("tr");
    if (tr) openOrder(tr.dataset.id);
  });
  $("#ordersBody").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var tr = e.target.closest("tr");
      if (tr) openOrder(tr.dataset.id);
    }
  });
  $("#drawerClose").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !drawer.hidden) closeDrawer();
  });

  $("#exportBtn").addEventListener("click", function () {
    toast("Report queued · CSV will email to organizers");
  });

  /* ---------------- Init ---------------- */
  renderOrders();
  renderTiers();
  drawChart("7d");
  setRing(0);

  // animate check-in ring slightly to feel alive (pre-event = low)
  setTimeout(function () { setRing(0); }, 100);

  // re-flow chart on resize (debounced)
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { drawChart(currentRange); }, 150);
  });
})();
