/* Lumio / Northwind — Tabbed dashboard
   Vanilla JS: ARIA tabs (arrow-key nav + roving tabindex), fade panel swap,
   lazy panel "load" with shimmer, last-tab memory, live ticking KPIs,
   date-range filter, draggable KPI cards, toast helper. No libraries. */
(function () {
  "use strict";

  var STORE_KEY = "lumio.lastTab";
  var rangeFactor = { "7d": 0.42, "30d": 1, "90d": 2.7, "12m": 9.4 };

  /* ───────── Toast helper ───────── */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ───────── Number formatting ───────── */
  function fmt(value, prefix, suffix, decimals) {
    var n = decimals
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString("en-US");
    if (decimals) n = Number(n).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    return (prefix || "") + n + (suffix || "");
  }

  /* ───────── Tabs (ARIA pattern) ───────── */
  var tablist = document.querySelector('[role="tablist"]');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var ink = document.querySelector(".tab-ink");
  var loaded = {}; // panelId -> true once lazily built

  function moveInk(tab) {
    if (!ink || !tab) return;
    ink.style.width = tab.offsetWidth + "px";
    ink.style.transform = "translateX(" + tab.offsetLeft + "px)";
  }

  function panelFor(tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  }

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
      var p = panelFor(t);
      if (p) {
        p.classList.toggle("is-active", selected);
        if (selected) {
          p.hidden = false;
        } else {
          p.hidden = true;
        }
      }
    });
    if (focus) tab.focus();
    moveInk(tab);

    var panel = panelFor(tab);
    if (panel) lazyLoad(panel);

    try { localStorage.setItem(STORE_KEY, tab.id); } catch (e) {}
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { selectTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(tab);
      var next = null;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = tabs[(i + 1) % tabs.length]; break;
        case "ArrowLeft":
        case "ArrowUp":
          next = tabs[(i - 1 + tabs.length) % tabs.length]; break;
        case "Home":
          next = tabs[0]; break;
        case "End":
          next = tabs[tabs.length - 1]; break;
        default:
          return;
      }
      e.preventDefault();
      selectTab(next, true);
    });
  });

  /* ───────── Lazy panel loading with shimmer ───────── */
  function lazyLoad(panel) {
    if (loaded[panel.id]) return;
    loaded[panel.id] = true;

    var builder = builders[panel.id];
    if (!builder) return; // Overview is pre-rendered in HTML

    // Show skeleton shimmer first
    panel.innerHTML = skeleton();
    setTimeout(function () {
      panel.innerHTML = builder();
      hydratePanel(panel);
    }, 620);
  }

  function skeleton() {
    function sk(grid, block) {
      return '<div class="sk" style="--grid:span ' + grid + '">' +
        '<div class="sk-line"></div>' +
        '<div class="sk-line lg"></div>' +
        (block ? '<div class="sk-block"></div>' : '') +
        "</div>";
    }
    return '<div class="skeleton">' +
      sk(3) + sk(3) + sk(3) + sk(3) +
      sk(8, true) + sk(4, true) +
      "</div>";
  }

  /* ───────── Reusable widget markup ───────── */
  function kpiCard(title, value, delta, dir, points) {
    return '<article class="card kpi" style="--grid:span 3">' +
      '<header class="card-head"><span class="card-title">' + title +
      '</span><button class="menu" aria-label="Widget options">⋯</button></header>' +
      '<p class="kpi-value">' + value + "</p>" +
      '<p class="kpi-delta ' + dir + '">' + (dir === "up" ? "▲" : "▼") + " " +
      delta + ' <span>vs prev</span></p>' +
      '<svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">' +
      '<polyline points="' + points + '" /></svg></article>';
  }

  function barChart(rows, max) {
    var cols = rows.map(function (r) {
      var h = Math.round((r.v / max) * 100);
      var t = Math.round((r.t / max) * 100);
      return '<div class="bar-col"><div class="bar-stack">' +
        '<div class="bar-fill" style="height:0%" data-h="' + h + '"></div>' +
        '<div class="bar-target" style="bottom:' + t + '%"></div></div>' +
        '<span class="bar-label">' + r.l + "</span></div>";
    }).join("");
    return '<div class="chart-bars">' + cols + "</div>" +
      '<ul class="legend"><li><i class="sw sw-brand"></i>Value</li>' +
      '<li><i class="sw sw-line"></i>Target</li></ul>';
  }

  function lineChart(points, area) {
    return '<svg class="line-chart" viewBox="0 0 460 200" role="img" aria-label="Trend over time">' +
      '<defs><linearGradient id="lcGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--brand)" stop-opacity="0.22"/>' +
      '<stop offset="100%" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>' +
      '<line class="lc-grid" x1="0" y1="50" x2="460" y2="50"/>' +
      '<line class="lc-grid" x1="0" y1="100" x2="460" y2="100"/>' +
      '<line class="lc-grid" x1="0" y1="150" x2="460" y2="150"/>' +
      '<path class="lc-area" d="' + area + '"/>' +
      '<polyline class="lc-line" points="' + points + '"/>' +
      "</svg>";
  }

  function hbarList(rows) {
    return '<div class="hbar-list">' + rows.map(function (r) {
      return '<div class="hbar-row"><span>' + r.l + "</span>" +
        '<div class="hbar"><span style="width:' + r.p + '%"></span></div>' +
        "<b>" + r.v + "</b></div>";
    }).join("") + "</div>";
  }

  function donut(center, sub, segs, legend) {
    var off = 25, circles = "";
    segs.forEach(function (s, i) {
      circles += '<circle class="d-seg s' + (i + 1) + '" cx="21" cy="21" r="15.9" ' +
        'stroke-dasharray="' + s + " " + (100 - s) + '" stroke-dashoffset="' + off + '"></circle>';
      off = (off - s + 100) % 100;
    });
    var legendHtml = legend.map(function (g, i) {
      return '<li><i class="sw s' + (i + 1) + '"></i>' + g.l + "<b>" + g.v + "</b></li>";
    }).join("");
    return '<div class="donut-row"><svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Breakdown chart">' +
      '<circle class="d-track" cx="21" cy="21" r="15.9"></circle>' + circles +
      '<text class="d-center" x="21" y="20">' + center + "</text>" +
      '<text class="d-sub" x="21" y="25">' + sub + "</text></svg>" +
      '<ul class="donut-legend">' + legendHtml + "</ul></div>";
  }

  function card(title, span, body) {
    return '<article class="card" style="--grid:span ' + span + '">' +
      '<header class="card-head"><span class="card-title">' + title +
      '</span><button class="menu" aria-label="Widget options">⋯</button></header>' +
      body + "</article>";
  }

  function grid(inner) { return '<div class="grid">' + inner + "</div>"; }

  /* ───────── Panel builders (lazy) ───────── */
  var builders = {
    "panel-traffic": function () {
      return grid(
        kpiCard("Visitors", "61,204", "9.8%", "up", "0,22 14,17 28,19 42,12 56,14 70,7 84,9 100,4") +
        kpiCard("Pageviews", "248,910", "5.4%", "up", "0,20 14,18 28,15 42,16 56,11 70,12 84,8 100,6") +
        kpiCard("Bounce rate", "38.4%", "2.1%", "down", "0,8 14,9 28,11 42,12 56,14 70,15 84,17 100,19") +
        kpiCard("Avg. session", "3m 12s", "4.0%", "up", "0,21 14,18 28,17 42,13 56,14 70,10 84,11 100,7") +
        card("Sessions by day", 8,
          barChart([
            { l: "Mon", v: 54, t: 60 }, { l: "Tue", v: 72, t: 60 },
            { l: "Wed", v: 61, t: 60 }, { l: "Thu", v: 88, t: 60 },
            { l: "Fri", v: 96, t: 60 }, { l: "Sat", v: 43, t: 60 },
            { l: "Sun", v: 38, t: 60 }
          ], 100)) +
        card("Top pages", 4,
          hbarList([
            { l: "/pricing", p: 92, v: "48.2k" },
            { l: "/features", p: 74, v: "38.9k" },
            { l: "/blog/launch", p: 58, v: "30.4k" },
            { l: "/docs/start", p: 41, v: "21.6k" },
            { l: "/changelog", p: 29, v: "15.1k" }
          ]))
      );
    },

    "panel-revenue": function () {
      return grid(
        kpiCard("MRR", "$96,420", "6.9%", "up", "0,24 14,21 28,19 42,16 56,15 70,11 84,9 100,5") +
        kpiCard("Net churn", "2.1%", "0.4%", "down", "0,15 14,14 28,16 42,13 56,15 70,12 84,14 100,11") +
        kpiCard("LTV", "$1,284", "3.2%", "up", "0,22 14,20 28,18 42,17 56,14 70,13 84,10 100,7") +
        kpiCard("Expansion", "$11,930", "8.1%", "up", "0,23 14,20 28,21 42,15 56,16 70,12 84,10 100,6") +
        card("Revenue by plan", 8,
          barChart([
            { l: "Starter", v: 36, t: 40 }, { l: "Team", v: 64, t: 60 },
            { l: "Business", v: 90, t: 70 }, { l: "Scale", v: 71, t: 65 },
            { l: "Enterprise", v: 48, t: 55 }
          ], 100)) +
        card("Channel revenue", 4,
          donut("$96k", "MRR",
            [42, 27, 18, 13],
            [{ l: "Direct", v: "42%" }, { l: "Partner", v: "27%" },
             { l: "Self-serve", v: "18%" }, { l: "Reseller", v: "13%" }])) +
        card("Recent invoices", 12,
          '<table class="tbl"><thead><tr><th>Account</th><th>Plan</th>' +
          '<th class="num">Amount</th><th>Status</th></tr></thead><tbody>' +
          '<tr><td>Brightside Labs</td><td>Business</td><td class="num">$1,490</td><td><span class="pill up">Paid</span></td></tr>' +
          '<tr><td>Atlas Robotics</td><td>Scale</td><td class="num">$3,200</td><td><span class="pill up">Paid</span></td></tr>' +
          '<tr><td>Quartz Media</td><td>Enterprise</td><td class="num">$8,750</td><td><span class="pill up">Paid</span></td></tr>' +
          '<tr><td>Fern &amp; Oak</td><td>Starter</td><td class="num">$120</td><td><span class="pill down">Failed</span></td></tr>' +
          "</tbody></table>")
      );
    },

    "panel-users": function () {
      return grid(
        kpiCard("Active users", "54,310", "9.3%", "up", "0,24 14,20 28,21 42,15 56,16 70,10 84,11 100,4") +
        kpiCard("New signups", "3,206", "14.0%", "up", "0,26 14,20 28,22 42,14 56,12 70,9 84,11 100,3") +
        kpiCard("Retention 30d", "76.5%", "1.6%", "up", "0,14 14,13 28,12 42,11 56,10 70,9 84,8 100,6") +
        kpiCard("Activation", "61.2%", "0.9%", "down", "0,9 14,10 28,9 42,11 56,12 70,13 84,12 100,14") +
        card("Signups (12 weeks)", 8,
          lineChart(
            "0,150 42,140 84,148 126,120 168,128 210,96 252,104 294,72 336,80 378,52 420,60 460,36",
            "M0,150 L42,140 L84,148 L126,120 L168,128 L210,96 L252,104 L294,72 L336,80 L378,52 L420,60 L460,36 L460,200 L0,200 Z")) +
        card("Device split", 4,
          donut("54.3k", "users",
            [58, 31, 11],
            [{ l: "Mobile", v: "58%" }, { l: "Desktop", v: "31%" }, { l: "Tablet", v: "11%" }])) +
        card("Users by region", 12,
          hbarList([
            { l: "North America", p: 88, v: "21.4k" },
            { l: "Europe", p: 69, v: "16.8k" },
            { l: "Asia Pacific", p: 52, v: "12.7k" },
            { l: "LATAM", p: 24, v: "5.9k" }
          ]))
      );
    }
  };

  /* ───────── Post-build hydration (animate bars, wire menus/drag) ───────── */
  function hydratePanel(panel) {
    // animate bar fills
    requestAnimationFrame(function () {
      panel.querySelectorAll(".bar-fill").forEach(function (b) {
        b.style.height = (b.getAttribute("data-h") || 0) + "%";
      });
    });
    enableDrag(panel);
    wireMenus(panel);
    applyRange(currentRange, panel);
  }

  /* ───────── Date range filter ───────── */
  var currentRange = "30d";
  var rangeBtns = Array.prototype.slice.call(document.querySelectorAll(".range-btn"));

  function applyRange(range, scope) {
    var factor = rangeFactor[range] || 1;
    var root = scope || document;
    root.querySelectorAll(".kpi-value[data-base]").forEach(function (el) {
      var base = parseFloat(el.getAttribute("data-base"));
      if (isNaN(base)) return;
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = base % 1 !== 0 ? 2 : 0;
      // Rates (%) and averages (sub-100 decimals) don't scale with the window;
      // only cumulative totals/counts do.
      var isRate = suffix === "%" || (base % 1 !== 0 && base < 100);
      var scaled = isRate ? base : base * factor;
      el.textContent = fmt(scaled, prefix, suffix, decimals);
    });
  }

  rangeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      rangeBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      currentRange = btn.getAttribute("data-range");
      applyRange(currentRange);
      toast("Range set to " + btn.textContent.trim());
    });
  });

  /* ───────── Live ticking KPIs ───────── */
  var liveToggle = document.getElementById("liveToggle");
  var liveTimer;

  function tickLive() {
    var active = document.querySelector(".panel.is-active");
    if (!active) return;
    active.querySelectorAll(".kpi-value[data-base]").forEach(function (el) {
      if (Math.random() > 0.5) return;
      var base = parseFloat(el.getAttribute("data-base"));
      if (isNaN(base)) return;
      var drift = base * (Math.random() * 0.004 - 0.0015);
      base = Math.max(0, base + drift);
      el.setAttribute("data-base", base);
    });
    applyRange(currentRange, active);
  }

  function startLive() { liveTimer = setInterval(tickLive, 2600); }
  function stopLive() { clearInterval(liveTimer); }

  if (liveToggle) {
    startLive();
    liveToggle.addEventListener("click", function () {
      var on = liveToggle.getAttribute("aria-pressed") === "true";
      liveToggle.setAttribute("aria-pressed", on ? "false" : "true");
      if (on) { stopLive(); toast("Live updates paused"); }
      else { startLive(); toast("Live updates resumed"); }
    });
  }

  /* ───────── Drag to rearrange KPI cards ───────── */
  function enableDrag(scope) {
    var root = scope || document;
    root.querySelectorAll(".card.kpi").forEach(function (card) {
      if (card.dataset.dragReady) return;
      card.dataset.dragReady = "1";
      card.setAttribute("draggable", "true");

      card.addEventListener("dragstart", function (e) {
        card.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", "card"); } catch (err) {}
      });
      card.addEventListener("dragend", function () {
        card.classList.remove("dragging");
        document.querySelectorAll(".drop-target").forEach(function (c) {
          c.classList.remove("drop-target");
        });
        toast("Layout updated");
      });
      card.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (!card.classList.contains("dragging")) card.classList.add("drop-target");
      });
      card.addEventListener("dragleave", function () {
        card.classList.remove("drop-target");
      });
      card.addEventListener("drop", function (e) {
        e.preventDefault();
        card.classList.remove("drop-target");
        var dragging = root.querySelector(".card.dragging");
        if (!dragging || dragging === card) return;
        var grid = card.parentNode;
        var cards = Array.prototype.slice.call(grid.children);
        if (cards.indexOf(dragging) < cards.indexOf(card)) {
          grid.insertBefore(dragging, card.nextSibling);
        } else {
          grid.insertBefore(dragging, card);
        }
      });
    });
  }

  /* ───────── Widget menu (⋯) ───────── */
  function wireMenus(scope) {
    (scope || document).querySelectorAll(".menu").forEach(function (m) {
      if (m.dataset.wired) return;
      m.dataset.wired = "1";
      m.addEventListener("click", function () {
        var title = m.closest(".card").querySelector(".card-title");
        toast((title ? title.textContent : "Widget") + " options");
      });
    });
  }

  /* ───────── Mobile nav toggle ───────── */
  var navToggle = document.getElementById("navToggle");
  var sidebar = document.querySelector(".sidebar");
  if (navToggle && sidebar) {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (window.innerWidth > 720) return;
      if (sidebar.contains(e.target) || navToggle.contains(e.target)) return;
      sidebar.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  }

  /* ───────── Overview bar chart (#ovBars) ───────── */
  var ovBars = document.getElementById("ovBars");
  if (ovBars) {
    var ovData = [
      { l: "W1", v: 58, t: 60 }, { l: "W2", v: 66, t: 60 },
      { l: "W3", v: 54, t: 62 }, { l: "W4", v: 78, t: 64 },
      { l: "W5", v: 71, t: 66 }, { l: "W6", v: 89, t: 68 },
      { l: "W7", v: 82, t: 70 }, { l: "W8", v: 96, t: 72 }
    ];
    ovBars.innerHTML = ovData.map(function (r) {
      return '<div class="bar-col"><div class="bar-stack">' +
        '<div class="bar-fill" style="height:0%" data-h="' + r.v + '"></div>' +
        '<div class="bar-target" style="bottom:' + r.t + '%"></div></div>' +
        '<span class="bar-label">' + r.l + "</span></div>";
    }).join("");
    requestAnimationFrame(function () {
      ovBars.querySelectorAll(".bar-fill").forEach(function (b) {
        b.style.height = b.getAttribute("data-h") + "%";
      });
    });
  }

  /* ───────── Init ───────── */
  enableDrag(document);
  wireMenus(document);
  applyRange(currentRange);

  var startTab = tabs[0];
  try {
    var saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      var savedTab = tabs.filter(function (t) { return t.id === saved; })[0];
      if (savedTab) startTab = savedTab;
    }
  } catch (e) {}

  // Mark overview as loaded since it's in the HTML already
  loaded["panel-overview"] = true;
  selectTab(startTab, false);
  window.addEventListener("load", function () { moveInk(startTab); });
  window.addEventListener("resize", function () {
    var sel = document.querySelector('[role="tab"][aria-selected="true"]');
    moveInk(sel);
  });
})();
