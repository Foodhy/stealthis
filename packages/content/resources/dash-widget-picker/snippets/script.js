(function () {
  "use strict";

  /* ---------- Widget catalog (fictional Plotline Insights) ---------- */
  var CATALOG = [
    {
      id: "kpi-mrr",
      cat: "metric",
      icon: "$",
      name: "Recurring revenue",
      desc: "MRR with month-over-month delta and a 12-point sparkline.",
      span: 4,
    },
    {
      id: "kpi-active",
      cat: "metric",
      icon: "◉",
      name: "Active users",
      desc: "Weekly active accounts and trend versus the prior week.",
      span: 4,
    },
    {
      id: "kpi-churn",
      cat: "metric",
      icon: "↘",
      name: "Churn rate",
      desc: "Net logo churn — lower is better, color-coded accordingly.",
      span: 4,
    },
    {
      id: "chart-revenue",
      cat: "chart",
      icon: "∿",
      name: "Revenue trend",
      desc: "Inline SVG area + line chart of net revenue over time.",
      span: 8,
    },
    {
      id: "chart-channels",
      cat: "chart",
      icon: "▥",
      name: "Signups by channel",
      desc: "Grouped SVG bar chart breaking acquisition down by source.",
      span: 4,
    },
    {
      id: "chart-plan",
      cat: "chart",
      icon: "◕",
      name: "Plan mix",
      desc: "Donut chart of active subscriptions across pricing tiers.",
      span: 4,
    },
    {
      id: "data-pages",
      cat: "data",
      icon: "▦",
      name: "Top pages",
      desc: "Ranked table of the most-visited pages with status pills.",
      span: 6,
    },
    {
      id: "data-activity",
      cat: "data",
      icon: "◷",
      name: "Activity feed",
      desc: "Live stream of account events as they happen.",
      span: 6,
    },
  ];

  /* ---------- Element refs ---------- */
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var catalogEl = document.getElementById("catalog");
  var panel = document.getElementById("panel");
  var scrim = document.getElementById("scrim");
  var searchInput = document.getElementById("catalogSearch");
  var noResults = document.getElementById("noResults");
  var noResultsTerm = document.getElementById("noResultsTerm");
  var countChip = document.getElementById("countChip");
  var panelStatus = document.getElementById("panelStatus");
  var toastEl = document.getElementById("toast");
  var openBtn = document.getElementById("openPanel");
  var sidebar = document.getElementById("sidebar");
  var navToggle = document.getElementById("navToggle");

  var added = {}; // id -> true
  var activeCat = "all";
  var lastFocused = null;
  var toastTimer = null;

  /* ---------- Toast ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  /* ---------- Small SVG builders (no libs) ---------- */
  function sparkline(points, up) {
    var w = 240,
      h = 38,
      max = Math.max.apply(null, points),
      min = Math.min.apply(null, points),
      span = max - min || 1;
    var step = w / (points.length - 1);
    var d = points
      .map(function (p, i) {
        var x = i * step;
        var y = h - 4 - ((p - min) / span) * (h - 8);
        return (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
      })
      .join(" ");
    var color = up ? "var(--ok)" : "var(--danger)";
    var fillId = "sp" + Math.random().toString(36).slice(2, 7);
    return (
      '<svg class="spark" viewBox="0 0 ' +
      w +
      " " +
      h +
      '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="' +
      fillId +
      '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' +
      color +
      '" stop-opacity="0.22"/>' +
      '<stop offset="1" stop-color="' +
      color +
      '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' +
      d +
      " L" +
      w +
      " " +
      h +
      " L0 " +
      h +
      ' Z" fill="url(#' +
      fillId +
      ')"/>' +
      '<path d="' +
      d +
      '" fill="none" stroke="' +
      color +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>"
    );
  }

  function lineChart(points) {
    var w = 520,
      h = 150,
      pad = 8;
    var max = Math.max.apply(null, points) * 1.1,
      min = 0,
      span = max - min || 1;
    var step = (w - pad * 2) / (points.length - 1);
    var coords = points.map(function (p, i) {
      return {
        x: pad + i * step,
        y: h - pad - ((p - min) / span) * (h - pad * 2 - 12),
      };
    });
    var d = coords
      .map(function (c, i) {
        return (i === 0 ? "M" : "L") + c.x.toFixed(1) + " " + c.y.toFixed(1);
      })
      .join(" ");
    var area =
      d +
      " L" +
      coords[coords.length - 1].x.toFixed(1) +
      " " +
      (h - pad) +
      " L" +
      coords[0].x.toFixed(1) +
      " " +
      (h - pad) +
      " Z";
    var grid = [];
    for (var g = 1; g <= 3; g++) {
      var gy = (h / 4) * g;
      grid.push(
        '<line x1="0" y1="' +
          gy +
          '" x2="' +
          w +
          '" y2="' +
          gy +
          '" stroke="var(--line)" stroke-width="1"/>'
      );
    }
    return (
      '<svg class="" viewBox="0 0 ' +
      w +
      " " +
      h +
      '" role="img" aria-label="Revenue trend line chart">' +
      '<defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="var(--brand)" stop-opacity="0.24"/>' +
      '<stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>' +
      grid.join("") +
      '<path d="' +
      area +
      '" fill="url(#rev)"/>' +
      '<path d="' +
      d +
      '" fill="none" stroke="var(--brand)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      coords
        .map(function (c) {
          return (
            '<circle cx="' +
            c.x.toFixed(1) +
            '" cy="' +
            c.y.toFixed(1) +
            '" r="2.5" fill="var(--white)" stroke="var(--brand)" stroke-width="1.6"/>'
          );
        })
        .join("") +
      "</svg>"
    );
  }

  function barChart(series) {
    var w = 240,
      h = 150,
      pad = 8,
      gap = 14;
    var max = Math.max.apply(
      null,
      series.map(function (s) {
        return s.v;
      })
    );
    var bw = (w - pad * 2 - gap * (series.length - 1)) / series.length;
    var bars = series
      .map(function (s, i) {
        var bh = ((h - pad * 2 - 16) * s.v) / max;
        var x = pad + i * (bw + gap);
        var y = h - pad - bh;
        return (
          '<rect x="' +
          x.toFixed(1) +
          '" y="' +
          y.toFixed(1) +
          '" width="' +
          bw.toFixed(1) +
          '" height="' +
          bh.toFixed(1) +
          '" rx="4" fill="' +
          s.c +
          '"/>' +
          '<text x="' +
          (x + bw / 2).toFixed(1) +
          '" y="' +
          (h - 1) +
          '" font-size="9" fill="var(--muted)" text-anchor="middle">' +
          s.label +
          "</text>"
        );
      })
      .join("");
    return (
      '<svg viewBox="0 0 ' +
      w +
      " " +
      h +
      '" role="img" aria-label="Signups by channel bar chart">' +
      bars +
      "</svg>"
    );
  }

  function donut(segments) {
    var size = 132,
      r = 50,
      cx = size / 2,
      cy = size / 2,
      circ = 2 * Math.PI * r;
    var total = segments.reduce(function (a, s) {
      return a + s.v;
    }, 0);
    var offset = 0;
    var arcs = segments
      .map(function (s) {
        var len = (s.v / total) * circ;
        var seg =
          '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="' +
          r +
          '" fill="none" stroke="' +
          s.c +
          '" stroke-width="16" stroke-dasharray="' +
          len.toFixed(1) +
          " " +
          (circ - len).toFixed(1) +
          '" stroke-dashoffset="' +
          (-offset).toFixed(1) +
          '" transform="rotate(-90 ' +
          cx +
          " " +
          cy +
          ')"/>';
        offset += len;
        return seg;
      })
      .join("");
    return (
      '<svg viewBox="0 0 ' +
      size +
      " " +
      size +
      '" width="132" height="132" role="img" aria-label="Plan mix donut chart">' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="none" stroke="var(--bg)" stroke-width="16"/>' +
      arcs +
      '<text x="' +
      cx +
      '" y="' +
      (cy - 2) +
      '" text-anchor="middle" font-size="20" font-weight="800" fill="var(--ink)">' +
      total.toLocaleString() +
      "</text>" +
      '<text x="' +
      cx +
      '" y="' +
      (cy + 14) +
      '" text-anchor="middle" font-size="9" fill="var(--muted)">accounts</text>' +
      "</svg>"
    );
  }

  /* ---------- Widget body renderers ---------- */
  function bodyFor(id) {
    switch (id) {
      case "kpi-mrr":
        return (
          '<div class="kpi-value">$184.2K<span class="delta is-up">▲ 8.4%</span></div>' +
          '<p class="kpi-cap">vs. $169.9K last month</p>' +
          sparkline([142, 150, 148, 156, 161, 159, 168, 172, 170, 178, 181, 184], true) +
          footer("Synced just now", false)
        );
      case "kpi-active":
        return (
          '<div class="kpi-value">28,914<span class="delta is-up">▲ 3.6%</span></div>' +
          '<p class="kpi-cap">weekly active accounts</p>' +
          sparkline([255, 261, 258, 267, 270, 268, 276, 281, 279, 285, 287, 289], true) +
          footer("Updated 6m ago", false)
        );
      case "kpi-churn":
        return (
          '<div class="kpi-value">2.1%<span class="delta is-down">▼ 0.4 pts</span></div>' +
          '<p class="kpi-cap">net logo churn (lower is better)</p>' +
          sparkline([31, 29, 30, 27, 28, 26, 25, 24, 24, 23, 22, 21], false) +
          footer("Trending down — good", false)
        );
      case "chart-revenue":
        return (
          '<div class="kpi-value" style="font-size:21px">$1.41M<span class="delta is-up">▲ 11.2%</span></div>' +
          '<div class="chart-box">' +
          lineChart([62, 71, 68, 79, 84, 81, 92, 97, 95, 108, 116, 124]) +
          "</div>" +
          footer("12-month rolling net revenue", false)
        );
      case "chart-channels":
        return (
          '<div class="chart-box">' +
          barChart([
            { label: "Organic", v: 4120, c: "var(--brand)" },
            { label: "Paid", v: 2680, c: "var(--accent)" },
            { label: "Referral", v: 1940, c: "var(--brand-700)" },
            { label: "Social", v: 1210, c: "var(--warn)" },
          ]) +
          "</div>" +
          footer("9,950 signups this period", false)
        );
      case "chart-plan":
        return (
          '<div class="chart-box" style="display:flex;justify-content:center">' +
          donut([
            { v: 1820, c: "var(--brand)" },
            { v: 940, c: "var(--accent)" },
            { v: 450, c: "var(--warn)" },
          ]) +
          "</div>" +
          '<div class="legend">' +
          '<span><i style="background:var(--brand)"></i>Starter</span>' +
          '<span><i style="background:var(--accent)"></i>Growth</span>' +
          '<span><i style="background:var(--warn)"></i>Scale</span>' +
          "</div>"
        );
      case "data-pages":
        return (
          '<table class="w-table"><thead><tr><th>Page</th><th class="num">Views</th><th class="num">Conv.</th><th>Health</th></tr></thead><tbody>' +
          row("/pricing", "18,402", "5.8%", "ok", "Healthy") +
          row("/signup", "12,109", "9.1%", "ok", "Healthy") +
          row("/blog/launch", "9,640", "1.2%", "warn", "Watch") +
          row("/docs/api", "7,318", "3.4%", "ok", "Healthy") +
          "</tbody></table>" +
          footer("Last 30 days", false)
        );
      case "data-activity":
        return (
          '<ul class="feed" data-feed>' +
          feedItem("ok", "Maya Lin", "upgraded to <strong>Scale</strong>", "2m ago") +
          feedItem("", "Orbit Labs", "invited 4 teammates", "11m ago") +
          feedItem("warn", "Kettle Co.", "payment failed — retrying", "26m ago") +
          feedItem("ok", "Juno Park", "completed onboarding", "41m ago") +
          "</ul>" +
          footer("", true)
        );
      default:
        return "";
    }
  }

  function row(page, views, conv, cls, label) {
    return (
      "<tr><td>" +
      page +
      '</td><td class="num">' +
      views +
      '</td><td class="num">' +
      conv +
      '</td><td><span class="pill ' +
      cls +
      '">' +
      label +
      "</span></td></tr>"
    );
  }
  function feedItem(cls, who, what, time) {
    return (
      '<li><span class="fdot ' +
      cls +
      '"></span><div><p class="ftxt"><strong>' +
      who +
      "</strong> " +
      what +
      '</p><span class="ftime">' +
      time +
      "</span></div></li>"
    );
  }
  function footer(text, live) {
    return (
      '<div class="w-foot"><span class="dot"></span><span>' +
      (text || "Up to date") +
      "</span>" +
      (live ? '<span class="live">Live</span>' : "") +
      "</div>"
    );
  }

  /* ---------- Grid render ---------- */
  function meta(id) {
    return CATALOG.filter(function (c) {
      return c.id === id;
    })[0];
  }

  function renderWidget(id) {
    var m = meta(id);
    var iconCls = m.cat === "chart" ? "t-chart" : m.cat === "data" ? "t-data" : "";
    var el = document.createElement("article");
    el.className = "widget" + (m.span === 6 ? " span-6" : m.span === 8 ? " span-8" : "");
    el.setAttribute("role", "listitem");
    el.dataset.id = id;
    el.innerHTML =
      '<div class="w-head">' +
      '<span class="w-icn ' +
      iconCls +
      '" aria-hidden="true">' +
      m.icon +
      "</span>" +
      '<div class="w-title"><h3>' +
      m.name +
      "</h3><p>" +
      labelFor(m.cat) +
      "</p></div>" +
      '<button class="w-remove" type="button" aria-label="Remove ' +
      m.name +
      ' widget" data-remove="' +
      id +
      '">✕</button>' +
      "</div>" +
      bodyFor(id);
    return el;
  }

  function labelFor(cat) {
    return cat === "metric" ? "Key metric" : cat === "chart" ? "Visualization" : "Live data";
  }

  function syncGrid() {
    grid.innerHTML = "";
    var ids = CATALOG.filter(function (c) {
      return added[c.id];
    }).map(function (c) {
      return c.id;
    });
    ids.forEach(function (id) {
      grid.appendChild(renderWidget(id));
    });
    var n = ids.length;
    empty.hidden = n > 0;
    countChip.textContent = n + (n === 1 ? " widget" : " widgets");
    panelStatus.textContent = n + " added";
  }

  /* ---------- Catalog (panel) render ---------- */
  function renderCatalog() {
    var term = searchInput.value.trim().toLowerCase();
    catalogEl.innerHTML = "";
    var shown = 0;
    CATALOG.forEach(function (c) {
      var matchCat = activeCat === "all" || c.cat === activeCat;
      var matchTerm =
        !term ||
        c.name.toLowerCase().indexOf(term) !== -1 ||
        c.desc.toLowerCase().indexOf(term) !== -1;
      if (!matchCat || !matchTerm) return;
      shown++;
      var iconCls = c.cat === "chart" ? "t-chart" : c.cat === "data" ? "t-data" : "";
      var on = !!added[c.id];
      var card = document.createElement("div");
      card.className = "cat-card" + (on ? " is-added" : "");
      card.innerHTML =
        '<span class="cat-icn ' +
        iconCls +
        '" aria-hidden="true">' +
        c.icon +
        "</span>" +
        '<div class="cat-meta"><h3>' +
        c.name +
        '<span class="cat-tag">' +
        c.cat +
        "</span></h3><p>" +
        c.desc +
        "</p></div>" +
        '<button class="toggle" type="button" role="switch" aria-pressed="' +
        on +
        '" aria-label="' +
        (on ? "Remove " : "Add ") +
        c.name +
        '" data-toggle="' +
        c.id +
        '"></button>';
      catalogEl.appendChild(card);
    });
    var hasResults = shown > 0;
    noResults.hidden = hasResults;
    if (!hasResults) {
      noResultsTerm.textContent = term ? '"' + searchInput.value.trim() + '"' : "this filter";
    }
  }

  /* ---------- Add / remove ---------- */
  function addWidget(id, quiet) {
    if (added[id]) return;
    added[id] = true;
    syncGrid();
    renderCatalog();
    if (!quiet) toast(meta(id).name + " added");
  }

  function removeWidget(id) {
    if (!added[id]) return;
    var card = grid.querySelector('[data-id="' + id + '"]');
    if (card) {
      card.classList.add("removing");
      setTimeout(function () {
        delete added[id];
        syncGrid();
        renderCatalog();
      }, 200);
    } else {
      delete added[id];
      syncGrid();
      renderCatalog();
    }
    toast(meta(id).name + " removed");
  }

  /* ---------- Panel open / close + focus trap ---------- */
  function openPanel() {
    lastFocused = document.activeElement;
    scrim.hidden = false;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    renderCatalog();
    setTimeout(function () {
      searchInput.focus();
    }, 60);
    document.addEventListener("keydown", onPanelKey);
  }

  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.removeEventListener("keydown", onPanelKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function focusables() {
    return Array.prototype.slice
      .call(
        panel.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (el) {
        return el.offsetParent !== null && !el.disabled;
      });
  }

  function onPanelKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePanel();
      return;
    }
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------- Event wiring ---------- */
  openBtn.addEventListener("click", openPanel);
  document.getElementById("emptyAdd").addEventListener("click", openPanel);
  document.getElementById("panelClose").addEventListener("click", closePanel);
  document.getElementById("panelDone").addEventListener("click", closePanel);
  scrim.addEventListener("click", closePanel);

  searchInput.addEventListener("input", renderCatalog);

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("is-on");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-on");
      chip.setAttribute("aria-selected", "true");
      activeCat = chip.dataset.cat;
      renderCatalog();
    });
  });

  catalogEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-toggle]");
    if (!btn) return;
    var id = btn.getAttribute("data-toggle");
    if (added[id]) removeWidget(id);
    else addWidget(id);
  });

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-remove]");
    if (!btn) return;
    removeWidget(btn.getAttribute("data-remove"));
  });

  /* date range tweaks KPI values for realism */
  document.getElementById("rangeSelect").addEventListener("change", function (e) {
    toast("Range set to " + e.target.options[e.target.selectedIndex].text);
  });

  /* sidebar drawer on mobile */
  navToggle.addEventListener("click", function () {
    var open = sidebar.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Live activity ticker ---------- */
  var EVENTS = [
    { cls: "ok", who: "Aria Voss", what: "started a trial", },
    { cls: "", who: "Delta Forge", what: "added a payment method" },
    { cls: "ok", who: "Pixel Bros", what: "upgraded to <strong>Growth</strong>" },
    { cls: "warn", who: "Northwind", what: "hit an API rate limit" },
    { cls: "ok", who: "Sol Ortega", what: "completed onboarding" },
  ];
  setInterval(function () {
    var feed = grid.querySelector("[data-feed]");
    if (!feed) return;
    var ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    var li = document.createElement("li");
    li.style.opacity = "0";
    li.innerHTML =
      '<span class="fdot ' +
      ev.cls +
      '"></span><div><p class="ftxt"><strong>' +
      ev.who +
      "</strong> " +
      ev.what +
      '</p><span class="ftime">just now</span></div>';
    feed.insertBefore(li, feed.firstChild);
    requestAnimationFrame(function () {
      li.style.transition = "opacity 0.4s";
      li.style.opacity = "1";
    });
    while (feed.children.length > 4) feed.removeChild(feed.lastChild);
  }, 4200);

  /* ---------- Seed a default dashboard ---------- */
  ["kpi-mrr", "kpi-active", "kpi-churn", "chart-revenue", "chart-channels", "data-activity"].forEach(
    function (id) {
      added[id] = true;
    }
  );
  syncGrid();
})();
