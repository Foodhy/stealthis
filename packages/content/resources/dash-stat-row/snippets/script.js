(function () {
  "use strict";

  // ---- Fictional dataset, one entry per period ----------------------------
  // Each KPI carries: raw value, formatter, delta %, direction, comparison
  // caption, and an 8-point trend series used to draw the sparkline.
  var DATA = {
    today: {
      caption: "Comparing today against yesterday.",
      compare: "vs yesterday",
      hint: "Today",
      stats: {
        signups: { value: 1284, fmt: "int", delta: 8.4, dir: "up", spark: [9, 11, 10, 13, 12, 15, 14, 18] },
        revenue: { value: 48200, fmt: "money", delta: 12.1, dir: "up", spark: [30, 34, 33, 38, 41, 40, 45, 48] },
        active: { value: 9640, fmt: "int", delta: 3.2, dir: "up", spark: [88, 90, 91, 89, 93, 92, 95, 96] },
        churn: { value: 1.9, fmt: "pct", delta: 0.4, dir: "down", spark: [26, 25, 24, 25, 23, 22, 20, 19] },
        nps: { value: 62, fmt: "raw", delta: 5, dir: "up", deltaUnit: " pts", spark: [52, 54, 55, 57, 56, 59, 60, 62] }
      },
      mix: [
        { label: "Organic", value: 41, color: "#5b5bf0" },
        { label: "Referral", value: 27, color: "#00b4a6" },
        { label: "Paid", value: 22, color: "#d98a2b" },
        { label: "Social", value: 10, color: "#3a3ab8" }
      ]
    },
    week: {
      caption: "Comparing this week against last week.",
      compare: "vs last week",
      hint: "This week",
      stats: {
        signups: { value: 8910, fmt: "int", delta: 5.7, dir: "up", spark: [62, 65, 64, 70, 72, 69, 75, 80] },
        revenue: { value: 326400, fmt: "money", delta: 9.3, dir: "up", spark: [240, 255, 250, 270, 285, 280, 300, 326] },
        active: { value: 41200, fmt: "int", delta: 2.1, dir: "up", spark: [380, 392, 388, 401, 397, 405, 410, 412] },
        churn: { value: 2.3, fmt: "pct", delta: 0.6, dir: "up", spark: [18, 19, 20, 19, 21, 22, 22, 23] },
        nps: { value: 59, fmt: "raw", delta: 2, dir: "down", deltaUnit: " pts", spark: [63, 62, 61, 62, 60, 61, 60, 59] }
      },
      mix: [
        { label: "Organic", value: 38, color: "#5b5bf0" },
        { label: "Referral", value: 24, color: "#00b4a6" },
        { label: "Paid", value: 28, color: "#d98a2b" },
        { label: "Social", value: 10, color: "#3a3ab8" }
      ]
    },
    month: {
      caption: "Comparing this month against last month.",
      compare: "vs last month",
      hint: "This month",
      stats: {
        signups: { value: 38420, fmt: "int", delta: 14.6, dir: "up", spark: [240, 260, 255, 290, 310, 300, 340, 384] },
        revenue: { value: 1410000, fmt: "money", delta: 18.2, dir: "up", spark: [980, 1040, 1010, 1120, 1180, 1240, 1330, 1410] },
        active: { value: 132800, fmt: "int", delta: 6.5, dir: "up", spark: [1080, 1120, 1150, 1190, 1210, 1260, 1300, 1328] },
        churn: { value: 1.6, fmt: "pct", delta: 0.9, dir: "down", spark: [28, 26, 27, 24, 23, 21, 18, 16] },
        nps: { value: 64, fmt: "raw", delta: 6, dir: "up", deltaUnit: " pts", spark: [54, 55, 57, 58, 60, 61, 63, 64] }
      },
      mix: [
        { label: "Organic", value: 44, color: "#5b5bf0" },
        { label: "Referral", value: 25, color: "#00b4a6" },
        { label: "Paid", value: 21, color: "#d98a2b" },
        { label: "Social", value: 10, color: "#3a3ab8" }
      ]
    }
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = "today";
  var liveOn = true;
  var liveTimer = null;

  // ---- Formatters ---------------------------------------------------------
  function format(value, fmt) {
    if (fmt === "money") {
      if (value >= 1000000) return "$" + (value / 1000000).toFixed(2) + "M";
      if (value >= 1000) return "$" + (value / 1000).toFixed(1) + "k";
      return "$" + Math.round(value);
    }
    if (fmt === "pct") return value.toFixed(1) + "%";
    if (fmt === "int") return Math.round(value).toLocaleString("en-US");
    return Math.round(value).toString();
  }

  // ---- Count-up animation -------------------------------------------------
  function countUp(el, from, to, fmt) {
    if (reduceMotion) {
      el.textContent = format(to, fmt);
      return;
    }
    var start = performance.now();
    var dur = 650;
    function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = format(from + (to - from) * eased, fmt);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = format(to, fmt);
    }
    requestAnimationFrame(tick);
  }

  // ---- Sparkline geometry -------------------------------------------------
  function sparkPoints(series) {
    var w = 120, h = 36, pad = 3;
    var min = Math.min.apply(null, series);
    var max = Math.max.apply(null, series);
    var range = max - min || 1;
    var step = (w - pad * 2) / (series.length - 1);
    return series.map(function (v, i) {
      var x = pad + i * step;
      var y = h - pad - ((v - min) / range) * (h - pad * 2);
      return x.toFixed(1) + "," + y.toFixed(1);
    });
  }

  function drawSpark(card, series) {
    var svg = card.querySelector("[data-spark]");
    if (!svg) return;
    var pts = sparkPoints(series);
    var line = svg.querySelector(".spark__line");
    var fill = svg.querySelector(".spark__fill");
    line.setAttribute("points", pts.join(" "));
    // Close the polygon along the baseline for the soft fill.
    var first = pts[0].split(",")[0];
    var last = pts[pts.length - 1].split(",")[0];
    fill.setAttribute("points", first + ",33 " + pts.join(" ") + " " + last + ",33");
  }

  // ---- Render one card ----------------------------------------------------
  function renderCard(card, stat, compare, animate) {
    var key = card.getAttribute("data-key");
    var valEl = card.querySelector("[data-value]");
    var deltaEl = card.querySelector("[data-delta]");
    var deltaVal = card.querySelector("[data-delta-val]");
    var caption = card.querySelector("[data-caption]");

    var prev = parseFloat((valEl.dataset.raw || stat.value));
    if (animate) countUp(valEl, prev, stat.value, stat.fmt);
    else valEl.textContent = format(stat.value, stat.fmt);
    valEl.dataset.raw = stat.value;

    var unit = stat.deltaUnit || "%";
    deltaVal.textContent = (stat.fmt === "raw" ? Math.round(stat.delta) : stat.delta.toFixed(1)) + unit;

    var goodDirection = key === "churn" ? "down" : "up";
    var isGood = stat.dir === goodDirection;
    deltaEl.classList.toggle("delta--up", stat.dir === "up");
    deltaEl.classList.toggle("delta--down", stat.dir === "down");
    deltaEl.querySelector(".delta__arrow").textContent = stat.dir === "up" ? "▲" : "▼";
    // Sparkline recolors red only when the movement is genuinely bad.
    card.classList.toggle("is-neg", !isGood);

    caption.textContent = compare;
    drawSpark(card, stat.spark);

    if (animate && !reduceMotion) {
      card.classList.remove("is-flash");
      void card.offsetWidth; // restart animation
      card.classList.add("is-flash");
    }
  }

  // ---- Channel mix bar ----------------------------------------------------
  function renderMix(mix, hint) {
    var bar = document.getElementById("mixChart");
    var legend = document.getElementById("mixLegend");
    document.getElementById("mixHint").textContent = hint;
    bar.innerHTML = "";
    legend.innerHTML = "";
    mix.forEach(function (m) {
      var seg = document.createElement("div");
      seg.className = "mix__seg";
      seg.style.background = m.color;
      seg.style.flex = "0 0 " + m.value + "%";
      seg.title = m.label + " · " + m.value + "%";
      bar.appendChild(seg);

      var li = document.createElement("li");
      li.innerHTML =
        '<span class="swatch" style="background:' + m.color + '"></span>' +
        m.label + " <strong>" + m.value + "%</strong>";
      legend.appendChild(li);
    });
  }

  // ---- Render a full period -----------------------------------------------
  function render(period, animate) {
    var d = DATA[period];
    document.getElementById("periodCaption").textContent = d.caption;
    document.querySelectorAll(".stat-card").forEach(function (card) {
      var key = card.getAttribute("data-key");
      if (d.stats[key]) renderCard(card, d.stats[key], d.compare, animate);
    });
    renderMix(d.mix, d.hint);
  }

  // ---- Period tabs --------------------------------------------------------
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".period-btn"));
  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.period === current) return;
      tabs.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      current = btn.dataset.period;
      render(current, true);
      toast("Showing " + btn.textContent.trim().toLowerCase() + " metrics");
    });
  });

  // Arrow-key navigation between tabs (roving).
  document.querySelector(".period").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    var next = e.key === "ArrowRight" ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  });

  // ---- Live tick: nudge the "today" current values --------------------------
  function liveTick() {
    if (current !== "today") return;
    var stats = DATA.today.stats;
    Object.keys(stats).forEach(function (key) {
      var s = stats[key];
      var jitter = s.fmt === "money" ? (Math.random() * 60 - 20) : (Math.random() * 6 - 2);
      if (s.fmt === "pct") jitter = (Math.random() * 0.1 - 0.04);
      s.value = Math.max(0, s.value + jitter);
      // shift the spark series to keep it lively
      var lastPt = s.spark[s.spark.length - 1];
      s.spark = s.spark.slice(1).concat([Math.max(1, lastPt + (Math.random() * 6 - 2))]);
    });
    render("today", true);
  }

  function startLive() {
    stopLive();
    liveTimer = setInterval(liveTick, 4200);
  }
  function stopLive() {
    if (liveTimer) clearInterval(liveTimer);
    liveTimer = null;
  }

  var liveBtn = document.getElementById("liveToggle");
  liveBtn.addEventListener("click", function () {
    liveOn = !liveOn;
    liveBtn.classList.toggle("is-on", liveOn);
    liveBtn.setAttribute("aria-pressed", liveOn ? "true" : "false");
    if (liveOn) {
      startLive();
      toast("Live updates on");
    } else {
      stopLive();
      toast("Live updates paused");
    }
  });

  // ---- Card menu (demo affordance) ---------------------------------------
  document.querySelectorAll(".stat-card__menu").forEach(function (m) {
    m.addEventListener("click", function () {
      var label = m.closest(".stat-card").querySelector(".stat-card__label").textContent;
      toast(label + ": exported to CSV");
    });
  });

  // ---- Toast --------------------------------------------------------------
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2200);
  }

  // ---- Init ---------------------------------------------------------------
  render("today", false);
  if (liveOn) startLive();

  // Pause live updates when the tab is hidden to save cycles.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopLive();
    else if (liveOn) startLive();
  });
})();
