(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rnd = function (min, max) { return Math.random() * (max - min) + min; };
  var fmt = function (n) { return Math.round(n).toLocaleString("en-US"); };

  var toastEl = $("#toast");
  var toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }

  /* ---------- SVG path builders ---------- */
  // Build a smooth-ish polyline path scaled into a viewBox of w x h.
  function pathFor(values, w, h, pad) {
    pad = pad || 2;
    var max = Math.max.apply(null, values);
    var min = Math.min.apply(null, values);
    var span = max - min || 1;
    var step = w / (values.length - 1);
    var pts = values.map(function (v, i) {
      var x = i * step;
      var y = pad + (h - pad * 2) * (1 - (v - min) / span);
      return [x, y];
    });
    var line = pts.map(function (p, i) {
      return (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1);
    }).join(" ");
    var area = line + " L" + w + " " + h + " L0 " + h + " Z";
    return { line: line, area: area, pts: pts };
  }

  /* ---------- DATA MODEL ---------- */
  function rollData() {
    var spend = [];
    for (var i = 0; i < 7; i++) spend.push(rnd(180, 460));
    var balance = [];
    var b = rnd(110000, 124000);
    for (var j = 0; j < 12; j++) { b += rnd(-2200, 4200); balance.push(b); }
    return {
      balance: Math.round(balance[balance.length - 1]),
      balanceDelta: +rnd(-3.5, 7.2).toFixed(1),
      balanceSeries: balance,
      spend: spend,
      spendTotal: Math.round(spend.reduce(function (a, c) { return a + c; }, 0)),
      spendDelta: +rnd(-6, 4).toFixed(1),
      kpis: [
        { label: "Income", value: rnd(6200, 8400), prefix: "$", delta: rnd(1, 9) },
        { label: "Savings", value: rnd(18, 34), suffix: "%", delta: rnd(-2, 6) },
        { label: "Investments", value: rnd(41000, 52000), prefix: "$", delta: rnd(-4, 8) },
        { label: "Credit score", value: rnd(710, 805), delta: rnd(-1.5, 2.5) }
      ],
      budget: [
        { name: "Housing", color: "var(--brand)", pct: Math.round(rnd(34, 44)) },
        { name: "Food & drink", color: "var(--accent)", pct: Math.round(rnd(16, 26)) },
        { name: "Lifestyle", color: "var(--warn)", pct: Math.round(rnd(10, 20)) }
      ],
      cashflow: [
        [6.4, 4.1], [7.0, 5.2], [6.8, 4.6], [7.4, 5.9], [6.9, 4.2], [7.7, 5.0]
      ].map(function (m) { return [m[0] + rnd(-0.6, 0.6), m[1] + rnd(-0.5, 0.5)]; })
    };
  }

  var TX = [
    { ico: "☕", bg: "#fdeede", name: "Blue Bottle Coffee", cat: "Food & drink", amt: -6.5 },
    { ico: "💼", bg: "#e7fbf5", name: "Salary · Orbital Labs", cat: "Income", amt: 4280 },
    { ico: "🛒", bg: "#eef0ff", name: "Greenfield Market", cat: "Groceries", amt: -84.3 },
    { ico: "🎬", bg: "#fde9e6", name: "Nimbus Streaming", cat: "Entertainment", amt: -14.99 }
  ];

  var FEED_TEMPLATES = [
    { t: "Card payment to <b>Greenfield Market</b>", d: "ok" },
    { t: "Transfer received from <b>Orbital Labs</b>", d: "ok" },
    { t: "Budget alert: <b>Lifestyle</b> 80% used", d: "warn" },
    { t: "New device signed in · <b>iPhone 16</b>", d: "" },
    { t: "Savings goal <b>Vacation</b> reached 60%", d: "ok" },
    { t: "Subscription renewed · <b>Nimbus</b>", d: "" }
  ];

  var GOALS = [
    { name: "Emergency fund", have: 9200, target: 12000 },
    { name: "Vacation · Lisbon", have: 1850, target: 3000 },
    { name: "New laptop", have: 740, target: 2200 }
  ];

  var DONUT_C = 2 * Math.PI * 48; // circumference

  /* ---------- RENDERERS ---------- */
  function renderHero(d, animate) {
    var deltaEl = $("#heroDelta");
    var up = d.balanceDelta >= 0;
    deltaEl.className = "chip " + (up ? "chip--up" : "chip--down");
    deltaEl.innerHTML =
      '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="' +
      (up ? "M6 2.5 10 8H2z" : "M6 9.5 2 4h8z") + '" fill="currentColor"/></svg> ' +
      Math.abs(d.balanceDelta) + "%";
    countUp($("#heroValue"), d.balance, animate);
    var diff = Math.round(d.balance * d.balanceDelta / 100);
    $("#heroSub").textContent =
      (up ? "Up " : "Down ") + "$" + fmt(Math.abs(diff)) + " vs last month across 4 accounts";

    var p = pathFor(d.balanceSeries, 320, 56, 6);
    $("#heroLine").setAttribute("d", p.line);
    $("#heroArea").setAttribute("d", p.area);
  }

  function renderSpend(d) {
    $("#spendVal").textContent = "$" + fmt(d.spendTotal);
    var de = $("#spendDelta");
    var down = d.spendDelta <= 0;
    de.className = "chip chip--sm " + (down ? "chip--up" : "chip--down");
    de.innerHTML =
      '<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="' +
      (down ? "M6 9.5 2 4h8z" : "M6 2.5 10 8H2z") + '" fill="currentColor"/></svg> ' +
      Math.abs(d.spendDelta) + "%";

    var p = pathFor(d.spend, 320, 120, 8);
    $("#spendLine").setAttribute("d", p.line);
    $("#spendArea").setAttribute("d", p.area);
    var last = p.pts[p.pts.length - 1];
    var dot = $("#spendDot");
    dot.setAttribute("cx", last[0]);
    dot.setAttribute("cy", last[1]);
  }

  function renderKpis(d) {
    var rail = $("#chiprail");
    rail.innerHTML = "";
    d.kpis.forEach(function (k) {
      var spark = [];
      for (var i = 0; i < 12; i++) spark.push(rnd(0, 100));
      var p = pathFor(spark, 118, 26, 2);
      var up = k.delta >= 0;
      var val = (k.prefix || "") + fmt(k.value) + (k.suffix || "");
      var li = document.createElement("div");
      li.className = "kpi";
      li.setAttribute("role", "listitem");
      li.tabIndex = 0;
      li.innerHTML =
        '<div class="kpi__top"><span class="kpi__label">' + k.label + "</span>" +
        '<span class="chip chip--sm ' + (up ? "chip--up" : "chip--down") + '">' +
        '<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="' +
        (up ? "M6 2.5 10 8H2z" : "M6 9.5 2 4h8z") + '" fill="currentColor"/></svg> ' +
        Math.abs(k.delta).toFixed(1) + "%</span></div>" +
        '<div class="kpi__val">' + val + "</div>" +
        '<svg class="kpi__spark" viewBox="0 0 118 26" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="' + p.line + '" fill="none" stroke="' + (up ? "var(--ok)" : "var(--danger)") +
        '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      li.addEventListener("click", function () { toast(k.label + ": " + val); });
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toast(k.label + ": " + val); }
      });
      rail.appendChild(li);
    });
  }

  function renderTx() {
    var ul = $("#txlist");
    ul.innerHTML = "";
    TX.forEach(function (t) {
      var inc = t.amt > 0;
      var li = document.createElement("li");
      li.innerHTML =
        '<span class="txico" style="background:' + t.bg + '">' + t.ico + "</span>" +
        '<span class="txmain"><span class="txname">' + t.name + "</span>" +
        '<span class="txcat">' + t.cat + "</span></span>" +
        '<span class="txamt' + (inc ? " is-in" : "") + '">' +
        (inc ? "+" : "−") + "$" + Math.abs(t.amt).toFixed(2) + "</span>";
      ul.appendChild(li);
    });
  }

  function renderDonut(d) {
    var used = d.budget.reduce(function (a, c) { return a + c.pct; }, 0);
    $("#donutBig").textContent = used + "%";
    var segs = ["#seg1", "#seg2", "#seg3"];
    var offset = 0;
    d.budget.forEach(function (b, i) {
      var len = DONUT_C * (b.pct / 100);
      var seg = $(segs[i]);
      seg.setAttribute("stroke-dasharray", len.toFixed(2) + " " + (DONUT_C - len).toFixed(2));
      seg.setAttribute("stroke-dashoffset", (-offset).toFixed(2));
      offset += len;
    });
    var leg = $("#legend");
    leg.innerHTML = "";
    d.budget.forEach(function (b) {
      var li = document.createElement("li");
      li.innerHTML = '<i style="background:' + b.color + '"></i>' +
        '<span class="lname">' + b.name + "</span><b>" + b.pct + "%</b>";
      leg.appendChild(li);
    });
  }

  function renderBars(d) {
    var g = $("#bars");
    g.innerHTML = "";
    var max = 0;
    d.cashflow.forEach(function (m) { max = Math.max(max, m[0], m[1]); });
    var groupW = 320 / d.cashflow.length;
    var bw = 11;
    d.cashflow.forEach(function (m, i) {
      var cx = i * groupW + groupW / 2;
      [["in", m[0], cx - bw - 2], ["out", m[1], cx + 2]].forEach(function (pair) {
        var h = (pair[1] / max) * 130;
        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", "bar bar--" + pair[0]);
        rect.setAttribute("x", pair[2].toFixed(1));
        rect.setAttribute("y", (140 - h).toFixed(1));
        rect.setAttribute("width", bw);
        rect.setAttribute("height", h.toFixed(1));
        rect.setAttribute("rx", 4);
        g.appendChild(rect);
      });
    });
  }

  function renderGoals() {
    var ul = $("#goals");
    ul.innerHTML = "";
    GOALS.forEach(function (gItem) {
      var pct = Math.min(100, Math.round((gItem.have / gItem.target) * 100));
      var li = document.createElement("li");
      li.innerHTML =
        '<div class="goal__top"><b>' + gItem.name + "</b>" +
        "<span>$" + fmt(gItem.have) + " / $" + fmt(gItem.target) + "</span></div>" +
        '<div class="bar-bg"><div class="bar-fill" style="width:0%"></div></div>';
      ul.appendChild(li);
      requestAnimationFrame(function () {
        $(".bar-fill", li).style.width = pct + "%";
      });
    });
  }

  function renderFeed() {
    var ul = $("#feed");
    ul.innerHTML = "";
    var times = ["just now", "2m ago", "11m ago", "38m ago", "1h ago", "2h ago"];
    FEED_TEMPLATES.forEach(function (f, i) {
      addFeedItem(f, times[i] || "earlier", false);
    });
  }

  function addFeedItem(f, time, prepend) {
    var ul = $("#feed");
    var li = document.createElement("li");
    li.innerHTML =
      '<span class="feed__dot ' + (f.d ? "is-" + f.d : "") + '"></span>' +
      '<span><span class="feed__txt">' + f.t + "</span>" +
      '<div class="feed__time">' + time + "</div></span>";
    if (prepend && ul.firstChild) ul.insertBefore(li, ul.firstChild);
    else ul.appendChild(li);
    while (ul.children.length > 8) ul.removeChild(ul.lastChild);
  }

  /* ---------- count-up animation ---------- */
  function countUp(el, to, animate) {
    var from = animate ? (parseInt((el.textContent || "0").replace(/[^\d-]/g, ""), 10) || 0) : to;
    if (!animate) { el.textContent = fmt(to); return; }
    var start = performance.now();
    var dur = 600;
    function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- render everything ---------- */
  var data;
  function renderAll(animate) {
    renderHero(data, animate);
    renderSpend(data);
    renderKpis(data);
    renderDonut(data);
    renderBars(data);
  }

  data = rollData();
  renderAll(false);
  renderTx();
  renderGoals();
  renderFeed();

  /* ---------- TAB SWITCHING ---------- */
  var scroller = $("#scroller");
  var titles = { home: "Home", stats: "Stats", activity: "Activity", profile: "Profile" };
  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var view = tab.dataset.view;
      $$(".tab").forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        if (on) t.setAttribute("aria-current", "page");
        else t.removeAttribute("aria-current");
      });
      $$(".view").forEach(function (v) {
        var on = v.id === "view-" + view;
        v.hidden = !on;
        v.classList.toggle("is-active", on);
      });
      scroller.scrollTop = 0;
    });
  });

  /* ---------- REFRESH / PULL-TO-REFRESH ---------- */
  var refreshBtn = $("#refreshBtn");
  var ptr = $("#ptr");
  var busy = false;
  function doRefresh() {
    if (busy) return;
    busy = true;
    refreshBtn.classList.add("is-spinning");
    ptr.classList.add("is-on");
    setTimeout(function () {
      data = rollData();
      renderAll(true);
      renderGoals();
      ptr.classList.remove("is-on");
      refreshBtn.classList.remove("is-spinning");
      busy = false;
      toast("Updated · " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }, 850);
  }
  refreshBtn.addEventListener("click", doRefresh);

  // touch pull-to-refresh on the scroller (when at top, drag down)
  var startY = 0, pulling = false;
  scroller.addEventListener("touchstart", function (e) {
    if (scroller.scrollTop <= 0) { startY = e.touches[0].clientY; pulling = true; }
  }, { passive: true });
  scroller.addEventListener("touchmove", function (e) {
    if (!pulling) return;
    var dy = e.touches[0].clientY - startY;
    if (dy > 70 && scroller.scrollTop <= 0) { pulling = false; doRefresh(); }
  }, { passive: true });
  scroller.addEventListener("touchend", function () { pulling = false; });

  /* ---------- TOGGLES ---------- */
  $$(".toggle").forEach(function (tg) {
    tg.addEventListener("click", function () {
      var on = !tg.classList.contains("is-on");
      tg.classList.toggle("is-on", on);
      tg.setAttribute("aria-checked", String(on));
      toast(tg.getAttribute("aria-label") + (on ? " on" : " off"));
    });
  });

  /* ---------- WIDGET MENUS ---------- */
  $$(".menu").forEach(function (m) {
    m.addEventListener("click", function () { toast("Widget options coming soon"); });
  });

  /* ---------- LIVE TICK ---------- */
  setInterval(function () {
    if (busy) return;
    // nudge the hero balance a touch so the dashboard feels alive
    data.balance += Math.round(rnd(-180, 240));
    countUp($("#heroValue"), data.balance, true);
  }, 4200);

  // live activity feed when on the Activity view
  setInterval(function () {
    if ($("#view-activity").hidden) return;
    var f = FEED_TEMPLATES[Math.floor(rnd(0, FEED_TEMPLATES.length))];
    addFeedItem(f, "just now", true);
  }, 6000);
})();
