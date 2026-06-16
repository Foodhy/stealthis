(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }
  document.querySelectorAll("[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function () { toast(btn.getAttribute("data-toast")); });
  });

  /* ---------- Greeting by time ---------- */
  (function () {
    var h = new Date().getHours();
    var word = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    document.getElementById("greeting").textContent = word + ", Ari";
  })();

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  document.getElementById("themeToggle").addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark";
    root.setAttribute("data-theme", dark ? "light" : "dark");
    toast(dark ? "Light theme" : "Dark theme");
    render(); // redraw chart so gradient/colors stay crisp
  });

  /* ---------- Deterministic pseudo-random ---------- */
  function seeded(seed) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /* ---------- KPI definitions ---------- */
  var KPIS = {
    mrr:   { base: 48200, vol: 0.11, fmt: money,   trend: 1 },
    users: { base: 3140,  vol: 0.09, fmt: thousand, trend: 1 },
    conv:  { base: 3.8,   vol: 0.14, fmt: pct1,     trend: 1 },
    churn: { base: 2.1,   vol: 0.18, fmt: pct1,     trend: -1 }
  };

  function money(v) { return "$" + Math.round(v).toLocaleString("en-US"); }
  function thousand(v) { return Math.round(v).toLocaleString("en-US"); }
  function pct1(v) { return v.toFixed(1) + "%"; }

  /* Build a series of `n` points for a kpi + range seed */
  function series(key, n, rangeSeed) {
    var cfg = KPIS[key];
    var rnd = seeded(rangeSeed + key.charCodeAt(0) * 17);
    var pts = [];
    var v = cfg.base * (1 - cfg.trend * 0.12); // start lower so trend reads up
    for (var i = 0; i < n; i++) {
      var drift = cfg.trend * (cfg.base * 0.24 / n);
      var noise = (rnd() - 0.5) * cfg.base * cfg.vol;
      v = Math.max(cfg.base * 0.4, v + drift + noise);
      pts.push(v);
    }
    return pts;
  }

  function deltaPct(pts) {
    var first = pts[0], last = pts[pts.length - 1];
    return ((last - first) / first) * 100;
  }

  /* ---------- Sparklines (KPI cards) ---------- */
  function drawSpark(el, pts) {
    var n = pts.length, min = Math.min.apply(null, pts), max = Math.max.apply(null, pts);
    var span = max - min || 1;
    var coords = pts.map(function (p, i) {
      var x = (i / (n - 1)) * 120;
      var y = 34 - ((p - min) / span) * 30 - 2;
      return x.toFixed(1) + "," + y.toFixed(1);
    });
    el.setAttribute("points", coords.join(" "));
  }

  /* ---------- Main trend chart ---------- */
  var W = 640, H = 240, PAD = 12;
  function toPoints(coords) {
    return coords.map(function (c) { return c.x.toFixed(1) + "," + c.y.toFixed(1); }).join(" ");
  }

  function drawChart(range) {
    var nDays = range;
    var current = series("mrr", nDays, range);
    var previous = series("mrr", nDays, range + 999).map(function (v) { return v * 0.86; });

    var all = current.concat(previous);
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    var pad = (max - min) * 0.15 || 1; min -= pad; max += pad;
    var span = max - min || 1;
    function proj(pts) {
      return pts.map(function (p, i) {
        return { x: PAD + (i / (pts.length - 1)) * (W - PAD * 2), y: PAD + (1 - (p - min) / span) * (H - PAD * 2), v: p };
      });
    }
    var A = proj(current), B = proj(previous);

    document.getElementById("lineA").setAttribute("points", toPoints(A));
    document.getElementById("lineB").setAttribute("points", toPoints(B));

    var area = "M" + A[0].x.toFixed(1) + "," + A[0].y.toFixed(1) + " " +
      A.slice(1).map(function (c) { return "L" + c.x.toFixed(1) + "," + c.y.toFixed(1); }).join(" ") +
      " L" + A[A.length - 1].x.toFixed(1) + "," + (H - PAD) + " L" + A[0].x.toFixed(1) + "," + (H - PAD) + " Z";
    document.getElementById("areaA").setAttribute("d", area);

    // gridlines
    var g = document.getElementById("gridlines");
    g.innerHTML = "";
    for (var i = 0; i <= 4; i++) {
      var y = PAD + (i / 4) * (H - PAD * 2);
      var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", PAD); ln.setAttribute("x2", W - PAD);
      ln.setAttribute("y1", y); ln.setAttribute("y2", y);
      g.appendChild(ln);
    }
    chartA = A; chartCurrent = current;
  }

  var chartA = [], chartCurrent = [];

  /* ---------- Chart hover tooltip ---------- */
  var chartSvg = document.getElementById("chart");
  var dot = document.getElementById("dot");
  var tip = document.getElementById("tip");
  chartSvg.addEventListener("mousemove", function (e) {
    if (!chartA.length) return;
    var rect = chartSvg.getBoundingClientRect();
    var rx = (e.clientX - rect.left) / rect.width * W;
    var idx = Math.round((rx - PAD) / (W - PAD * 2) * (chartA.length - 1));
    idx = Math.max(0, Math.min(chartA.length - 1, idx));
    var c = chartA[idx];
    dot.setAttribute("cx", c.x); dot.setAttribute("cy", c.y); dot.style.display = "";
    tip.hidden = false;
    tip.textContent = money(c.v);
    tip.style.left = (c.x / W * rect.width) + "px";
    tip.style.top = (c.y / H * rect.height) + "px";
  });
  chartSvg.addEventListener("mouseleave", function () {
    dot.style.display = "none"; tip.hidden = true;
  });

  /* ---------- Render everything for a range ---------- */
  var currentRange = 30;
  function render() {
    var range = currentRange;
    document.getElementById("chartSub").textContent = "Last " + range + " days";

    document.querySelectorAll(".kpi").forEach(function (card) {
      var key = card.getAttribute("data-kpi");
      var pts = series(key, range, range);
      var last = pts[pts.length - 1];
      card.querySelector("[data-value]").textContent = KPIS[key].fmt(last);
      var d = deltaPct(pts);
      var deltaEl = card.querySelector("[data-delta]");
      var goodUp = KPIS[key].trend > 0;
      var positive = goodUp ? d >= 0 : d < 0;
      deltaEl.textContent = (d >= 0 ? "+" : "") + d.toFixed(1) + "%";
      deltaEl.classList.toggle("up", positive);
      deltaEl.classList.toggle("down", !positive);
      drawSpark(card.querySelector("[data-spark]"), pts);
    });

    drawChart(range);
  }

  /* ---------- Range switch ---------- */
  document.querySelectorAll(".range-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".range-btn").forEach(function (b) {
        b.classList.remove("active"); b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active"); btn.setAttribute("aria-selected", "true");
      currentRange = parseInt(btn.getAttribute("data-range"), 10);
      render();
      toast("Showing last " + currentRange + " days");
    });
  });

  /* ---------- Onboarding nudge ---------- */
  var nudge = document.getElementById("nudge");
  document.getElementById("nudgeClose").addEventListener("click", function () {
    nudge.classList.add("dismissed");
    toast("Onboarding hidden — find it in Settings");
  });
  // animate ring
  (function () {
    var ring = document.getElementById("ring");
    var pct = 70, circ = 113.1;
    requestAnimationFrame(function () {
      ring.setAttribute("stroke-dashoffset", (circ * (1 - pct / 100)).toFixed(1));
    });
    document.getElementById("ringNum").textContent = pct + "%";
  })();

  /* ---------- Tasks widget ---------- */
  var TASKS = [
    { label: "Review Q3 retention cohort", due: "Today", done: false },
    { label: "Approve new pricing experiment", due: "Today", done: false },
    { label: "Reply to 3 support escalations", due: "Tue", done: true },
    { label: "Connect Stripe webhook", due: "Wed", done: false },
    { label: "Publish changelog v2.4", due: "Fri", done: false }
  ];
  var tasksEl = document.getElementById("tasks");
  function renderTasks() {
    tasksEl.innerHTML = "";
    TASKS.forEach(function (t, i) {
      var li = document.createElement("li");
      li.className = "task" + (t.done ? " done" : "");
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-pressed", String(t.done));
      li.innerHTML =
        '<span class="check" aria-hidden="true">' + (t.done ? "✓" : "") + "</span>" +
        '<span class="task-label">' + t.label + "</span>" +
        '<span class="due">' + t.due + "</span>";
      function toggle() {
        t.done = !t.done;
        renderTasks();
        toast(t.done ? "Task completed" : "Task reopened");
      }
      li.addEventListener("click", toggle);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
      tasksEl.appendChild(li);
    });
    var done = TASKS.filter(function (t) { return t.done; }).length;
    document.getElementById("taskCount").textContent = done;
    document.getElementById("taskTotal").textContent = TASKS.length;
  }
  renderTasks();

  /* ---------- Widget menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.querySelector(".menu");
  menuBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = !menu.hidden;
    menu.hidden = open;
    menuBtn.setAttribute("aria-expanded", String(!open));
  });
  document.addEventListener("click", function (e) {
    if (!menu.hidden && !menu.contains(e.target)) {
      menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false");
    }
  });
  menu.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); });
  });

  /* ---------- Activity feed ---------- */
  var FEED = [
    { ic: "💳", t: "<b>Marisol R.</b> upgraded to Growth", m: "8 minutes ago" },
    { ic: "🧑‍🤝‍🧑", t: "<b>14 new signups</b> from the product hunt launch", m: "42 minutes ago" },
    { ic: "⚡", t: "Automation <b>Welcome series</b> sent 312 emails", m: "1 hour ago" },
    { ic: "⚠️", t: "Webhook <b>checkout.completed</b> retried successfully", m: "2 hours ago" },
    { ic: "📊", t: "<b>Weekly report</b> generated for the founders channel", m: "Yesterday" }
  ];
  var feedEl = document.getElementById("feed");
  FEED.forEach(function (f) {
    var li = document.createElement("li");
    li.innerHTML =
      '<span class="fi" aria-hidden="true">' + f.ic + "</span>" +
      '<span><span class="ft">' + f.t + "</span><span class=\"fm\">" + f.m + "</span></span>";
    feedEl.appendChild(li);
  });

  /* ---------- Boot ---------- */
  render();
})();
