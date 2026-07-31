(function () {
  "use strict";

  /* ---------- Fictional dataset (Northwind Pulse) ---------- */
  var CHANNELS = ["Web", "Mobile", "Marketplace", "Retail", "Partner"];
  var REGIONS = ["North America", "EMEA", "APAC", "LATAM"];
  var STATUSES = ["Paid", "Processing", "Shipped", "Refunded", "Cancelled"];
  var NAMES = [
    "Aria Bennett", "Leo Marsh", "Priya Nair", "Tomas Vidal", "Nora Holt",
    "Kenji Watanabe", "Sofia Reyes", "Liam O'Shea", "Mei Lin", "Omar Haddad",
    "Greta Lund", "Diego Castro", "Hana Park", "Ivan Petrov", "Zoe Carter",
  ];

  // Seeded pseudo-random so each render is deterministic per range.
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  var RANGE_DAYS = { today: 1, "7d": 7, "30d": 30, custom: 14 };
  var ORDERS = buildOrders();

  function buildOrders() {
    var rand = rng(42);
    var out = [];
    for (var i = 0; i < 240; i++) {
      var daysAgo = Math.floor(rand() * 30);
      out.push({
        id: "NW-" + (10480 - i),
        channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
        region: REGIONS[Math.floor(rand() * REGIONS.length)],
        status: STATUSES[Math.floor(rand() * STATUSES.length)],
        customer: NAMES[Math.floor(rand() * NAMES.length)],
        total: Math.round((28 + rand() * 940) * 100) / 100,
        daysAgo: daysAgo,
      });
    }
    return out;
  }

  /* ---------- State ---------- */
  var state = {
    range: "7d",
    customStart: null,
    customEnd: null,
    search: "",
    channel: [],
    region: [],
    status: [],
  };

  /* ---------- Elements ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var filterbar = $("#filterbar");
  var customDates = $("#customDates");
  var dateStart = $("#dateStart");
  var dateEnd = $("#dateEnd");
  var searchInput = $("#searchInput");
  var clearAllBtn = $("#clearAll");
  var chipsRow = $("#chipsRow");
  var chips = $("#chips");
  var chipsCount = $("#chipsCount");
  var summary = $("#summary");
  var tbody = $("#tbody");
  var emptyMsg = $("#empty");
  var rowCount = $("#rowCount");
  var chart = $("#chart");
  var chartX = $("#chartX");
  var toastEl = $("#toast");

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Date presets ---------- */
  $$(".preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".preset").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.range = btn.dataset.range;
      var isCustom = state.range === "custom";
      customDates.hidden = !isCustom;
      if (isCustom && !dateStart.value) {
        var today = new Date();
        var start = new Date();
        start.setDate(today.getDate() - 13);
        dateStart.value = iso(start);
        dateEnd.value = iso(today);
        state.customStart = dateStart.value;
        state.customEnd = dateEnd.value;
      }
      apply();
    });
  });

  function iso(d) { return d.toISOString().slice(0, 10); }

  dateStart.addEventListener("change", function () { state.customStart = dateStart.value; apply(); });
  dateEnd.addEventListener("change", function () { state.customEnd = dateEnd.value; apply(); });

  /* ---------- Search (debounced) ---------- */
  var searchTimer;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.search = searchInput.value.trim();
      apply();
    }, 180);
  });

  /* ---------- Facet dropdowns ---------- */
  $$(".facet").forEach(function (facet) {
    var btn = $(".facet__btn", facet);
    var menu = $(".facet__menu", facet);
    var key = facet.dataset.facet;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = btn.getAttribute("aria-expanded") === "true";
      closeAllMenus();
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        menu.hidden = false;
      }
    });

    $$("input[type=checkbox]", menu).forEach(function (cb) {
      cb.addEventListener("change", function () {
        var v = cb.value;
        var arr = state[key];
        var idx = arr.indexOf(v);
        if (cb.checked && idx === -1) arr.push(v);
        else if (!cb.checked && idx !== -1) arr.splice(idx, 1);
        apply();
      });
    });
  });

  function closeAllMenus() {
    $$(".facet__btn").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    $$(".facet__menu").forEach(function (m) { (m.hidden = true); });
  }

  document.addEventListener("click", closeAllMenus);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openBtn = $('.facet__btn[aria-expanded="true"]');
    if (!openBtn) return; // only act when a menu is actually open
    closeAllMenus();
    openBtn.focus();
  });

  /* ---------- Clear all ---------- */
  clearAllBtn.addEventListener("click", function () {
    state.search = "";
    state.channel = [];
    state.region = [];
    state.status = [];
    searchInput.value = "";
    $$(".facet__menu input[type=checkbox]").forEach(function (cb) { (cb.checked = false); });
    apply();
    toast("Filters cleared");
  });

  /* ---------- Remove single chip ---------- */
  function removeFilter(group, value) {
    if (group === "search") {
      state.search = "";
      searchInput.value = "";
    } else {
      var arr = state[group];
      var idx = arr.indexOf(value);
      if (idx !== -1) arr.splice(idx, 1);
      var cb = $('.facet[data-facet="' + group + '"] input[value="' + cssEscape(value) + '"]');
      if (cb) cb.checked = false;
    }
    apply();
  }

  function cssEscape(v) { return v.replace(/(["\\])/g, "\\$1"); }

  /* ---------- Export ---------- */
  $("#exportBtn").addEventListener("click", function () {
    toast("Exporting " + currentRows().length + " filtered orders…");
  });

  $("#chart").parentNode.querySelector(".menu-btn").addEventListener("click", function () {
    toast("Widget options coming soon");
  });

  /* ---------- Sticky shadow ---------- */
  var sentinel = document.createElement("div");
  sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;";
  filterbar.parentNode.insertBefore(sentinel, filterbar);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      filterbar.classList.toggle("is-stuck", !entries[0].isIntersecting);
    }, { threshold: [1] }).observe(sentinel);
  }

  /* ---------- Filtering ---------- */
  function currentRows() {
    var maxDays = RANGE_DAYS[state.range] || 7;
    var q = state.search.toLowerCase();
    return ORDERS.filter(function (o) {
      if (o.daysAgo >= maxDays) return false;
      if (state.channel.length && state.channel.indexOf(o.channel) === -1) return false;
      if (state.region.length && state.region.indexOf(o.region) === -1) return false;
      if (state.status.length && state.status.indexOf(o.status) === -1) return false;
      if (q) {
        var hay = (o.id + " " + o.customer + " " + o.channel + " " + o.region).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function activeCount() {
    return state.channel.length + state.region.length + state.status.length + (state.search ? 1 : 0);
  }

  /* ---------- Render chips ---------- */
  var GROUP_LABEL = { channel: "Channel", region: "Region", status: "Status", search: "Search" };

  function renderChips() {
    var items = [];
    ["channel", "region", "status"].forEach(function (g) {
      state[g].forEach(function (v) { items.push({ group: g, value: v }); });
    });
    if (state.search) items.push({ group: "search", value: state.search });

    chips.innerHTML = "";
    items.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "chip";
      li.dataset.group = it.group;
      li.innerHTML =
        '<span class="chip__group">' + GROUP_LABEL[it.group] + ":</span> " +
        '<span class="chip__val"></span>' +
        '<button class="chip__x" type="button" aria-label="Remove filter">×</button>';
      li.querySelector(".chip__val").textContent = it.value;
      li.querySelector(".chip__x").setAttribute(
        "aria-label",
        "Remove " + GROUP_LABEL[it.group] + " filter " + it.value
      );
      li.querySelector(".chip__x").addEventListener("click", function () {
        removeFilter(it.group, it.value);
      });
      chips.appendChild(li);
    });

    var n = activeCount();
    chipsCount.textContent = String(n);
    chipsRow.hidden = n === 0;
    clearAllBtn.hidden = n === 0;

    // update facet button counts
    ["channel", "region", "status"].forEach(function (g) {
      var facet = $('.facet[data-facet="' + g + '"]');
      var c = $(".facet__count", facet);
      var len = state[g].length;
      c.textContent = String(len);
      c.hidden = len === 0;
      facet.classList.toggle("is-active", len > 0);
    });
  }

  /* ---------- KPIs ---------- */
  var prevKpi = null;

  function renderKpis(rows) {
    var orders = rows.length;
    var revenue = rows.reduce(function (s, o) { return s + o.total; }, 0);
    var aov = orders ? revenue / orders : 0;
    var refunds = rows.filter(function (o) { return o.status === "Refunded"; }).length;
    var refundRate = orders ? (refunds / orders) * 100 : 0;

    var kpi = { orders: orders, revenue: revenue, aov: aov, refund: refundRate };

    setKpi("orders", orders, prevKpi && prevKpi.orders, fmtInt, false);
    setKpi("revenue", revenue, prevKpi && prevKpi.revenue, fmtMoney, false);
    setKpi("aov", aov, prevKpi && prevKpi.aov, fmtMoney, false);
    setKpi("refund", refundRate, prevKpi && prevKpi.refund, fmtPct, true);

    prevKpi = kpi;
  }

  function setKpi(key, value, prev, fmt, inverse) {
    var card = $('.kpi[data-kpi="' + key + '"]');
    var valEl = $("[data-val]", card);
    countUp(valEl, value, fmt);

    var deltaEl = $("[data-delta]", card);
    var pct;
    if (prev === null || prev === undefined || prev === 0) {
      pct = value === 0 ? 0 : 100;
    } else {
      pct = ((value - prev) / prev) * 100;
    }
    var up = pct >= 0;
    var good = inverse ? !up : up; // refund up = bad
    deltaEl.classList.toggle("up", good);
    deltaEl.classList.toggle("down", !good);
    deltaEl.textContent = (up ? "▲ " : "▼ ") + Math.abs(pct).toFixed(1) + "%";

    drawSpark($("[data-spark]", card), key, good);
  }

  function fmtInt(v) { return Math.round(v).toLocaleString("en-US"); }
  function fmtMoney(v) {
    return "$" + Math.round(v).toLocaleString("en-US");
  }
  function fmtPct(v) { return v.toFixed(1) + "%"; }

  function countUp(el, target, fmt) {
    var from = parseFloat(el.dataset.raw || "0");
    var start = performance.now();
    var dur = 480;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - t, 3);
      var cur = from + (target - from) * e;
      el.textContent = fmt(cur);
      if (t < 1) requestAnimationFrame(step);
      else el.dataset.raw = String(target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Sparklines ---------- */
  function drawSpark(svg, key, good) {
    var rand = rng(key.charCodeAt(0) * 31 + Math.floor(prevKpi ? prevKpi.orders : 7));
    var pts = [];
    var n = 12;
    for (var i = 0; i < n; i++) pts.push(6 + rand() * 20);
    var w = 120, h = 32;
    var d = pts.map(function (p, i) {
      var x = (i / (n - 1)) * w;
      var y = h - p;
      return (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
    var color = good ? "var(--ok)" : "var(--danger)";
    var area = d + " L" + w + " " + h + " L0 " + h + " Z";
    svg.innerHTML =
      '<path d="' + area + '" fill="' + color + '" opacity="0.12" />' +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />';
  }

  /* ---------- Chart (orders by day) ---------- */
  function renderChart(rows) {
    var days = Math.min(RANGE_DAYS[state.range] || 7, 14);
    var buckets = new Array(days).fill(0);
    rows.forEach(function (o) {
      if (o.daysAgo < days) buckets[days - 1 - o.daysAgo]++;
    });
    var max = Math.max(1, Math.max.apply(null, buckets));
    chart.innerHTML = "";
    chartX.innerHTML = "";
    var labels = labelsFor(days);
    buckets.forEach(function (count, i) {
      var bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = "0%";
      bar.setAttribute("data-tip", count + " orders · " + labels[i]);
      chart.appendChild(bar);
      // animate after layout
      requestAnimationFrame(function () {
        bar.style.height = Math.max(3, (count / max) * 100) + "%";
      });
      var lx = document.createElement("span");
      lx.textContent = labels[i];
      chartX.appendChild(lx);
    });
  }

  function labelsFor(days) {
    var out = [];
    var today = new Date();
    var step = days <= 7 ? 1 : Math.ceil(days / 7);
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(today.getDate() - i);
      var idx = days - 1 - i;
      out.push(idx % step === 0 || days <= 8 ? (d.getMonth() + 1) + "/" + d.getDate() : "");
    }
    return out;
  }

  /* ---------- Table ---------- */
  function statusClass(s) { return "pill--" + s.toLowerCase(); }

  function renderTable(rows) {
    var slice = rows.slice(0, 8);
    tbody.innerHTML = "";
    slice.forEach(function (o) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        '<td><span class="pill ' + statusClass(o.status) + '"></span></td>' +
        '<td class="num"></td>';
      tr.children[0].textContent = o.id;
      tr.children[1].textContent = o.channel;
      tr.children[2].textContent = o.region;
      tr.children[3].firstChild.textContent = o.status;
      tr.children[4].textContent = "$" + o.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      tbody.appendChild(tr);
    });
    emptyMsg.hidden = rows.length !== 0;
    rowCount.textContent = rows.length.toLocaleString("en-US") + (rows.length === 1 ? " row" : " rows");
  }

  /* ---------- Summary ---------- */
  function renderSummary(rows) {
    var n = activeCount();
    var rangeText = {
      today: "today",
      "7d": "the last 7 days",
      "30d": "the last 30 days",
      custom: state.customStart && state.customEnd
        ? state.customStart + " → " + state.customEnd
        : "a custom range",
    }[state.range];
    var filterText = n === 0
      ? "no filters applied"
      : n + (n === 1 ? " filter" : " filters") + " applied";
    summary.innerHTML =
      "Showing <strong>" + rows.length.toLocaleString("en-US") +
      "</strong> orders for <strong>" + rangeText + "</strong> · " + filterText + ".";
  }

  /* ---------- Apply (master render) ---------- */
  function apply() {
    var rows = currentRows();
    renderChips();
    renderKpis(rows);
    renderChart(rows);
    renderTable(rows);
    renderSummary(rows);
  }

  /* ---------- Live tick: simulate a new incoming order every 6s ---------- */
  var liveRand = rng(7);
  setInterval(function () {
    // shift one recent order in by decrementing daysAgo for a random fresh one
    var idx = Math.floor(liveRand() * ORDERS.length);
    var o = ORDERS[idx];
    var fresh = {
      id: "NW-" + (10481 + Math.floor(liveRand() * 900)),
      channel: CHANNELS[Math.floor(liveRand() * CHANNELS.length)],
      region: REGIONS[Math.floor(liveRand() * REGIONS.length)],
      status: STATUSES[Math.floor(liveRand() * STATUSES.length)],
      customer: NAMES[Math.floor(liveRand() * NAMES.length)],
      total: Math.round((28 + liveRand() * 940) * 100) / 100,
      daysAgo: 0,
    };
    ORDERS.unshift(fresh);
    ORDERS.pop();
    apply();
  }, 6000);

  /* ---------- Init ---------- */
  apply();
})();
