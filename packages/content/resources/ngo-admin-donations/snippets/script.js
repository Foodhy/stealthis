(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var fmt = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };
  var fmtK = function (n) {
    if (n >= 1000) return "$" + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
    return "$" + Math.round(n);
  };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- Seeded deterministic data ---------- */
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  // Build a daily series of donation totals for up to 365 days.
  var rand = rng(7351);
  var DAYS = 365;
  var series = [];
  for (var i = 0; i < DAYS; i++) {
    var base = 2400 + i * 6;                       // gentle upward trend
    var wave = Math.sin(i / 7) * 700;              // weekly rhythm
    var spike = rand() < 0.05 ? 4200 * rand() : 0; // occasional appeal spikes
    series.push(Math.max(600, base + wave + spike + (rand() - 0.5) * 1300));
  }

  var RANGES = {
    "30": { label: "Last 30 days", ticks: 6 },
    "90": { label: "Last 90 days", ticks: 6 },
    "365": { label: "Last 12 months", ticks: 6 }
  };

  /* ---------- Campaigns ---------- */
  var campaigns = [
    { id: "spring", name: "Spring Appeal", share: 0.31, gifts: 412 },
    { id: "meals", name: "Meals on Wheels", share: 0.24, gifts: 689 },
    { id: "water", name: "Clean Water Initiative", share: 0.19, gifts: 254 },
    { id: "winter", name: "Winter Warmth Drive", share: 0.15, gifts: 503 },
    { id: "scholar", name: "Scholarship Fund", share: 0.11, gifts: 138 }
  ];

  /* ---------- Donations table ---------- */
  var firstNames = ["Maya", "Daniel", "Priya", "Liam", "Sofia", "Omar", "Grace", "Noah", "Amara", "Ethan", "Lena", "Marcus", "Yuki", "Rosa", "Theo", "Nadia", "Caleb", "Imani", "Felix", "Aisha"];
  var lastNames = ["Okafor", "Reyes", "Patel", "Hansen", "Bennett", "Khan", "Lindgren", "Castro", "Walsh", "Mori", "Adeyemi", "Costa", "Forsberg", "Nguyen", "Bauer", "Silva", "Brandt", "Osei", "Romano", "Haddad"];
  var statuses = ["completed", "completed", "completed", "completed", "pending"];
  var avatarColors = ["#1f7a6d", "#e8743b", "#2f9e6f", "#d98a2b", "#155e54", "#cc5d28"];

  var donations = [];
  var dr = rng(2024);
  for (var d = 0; d < 38; d++) {
    var fn = firstNames[Math.floor(dr() * firstNames.length)];
    var ln = lastNames[Math.floor(dr() * lastNames.length)];
    var camp = campaigns[Math.floor(dr() * campaigns.length)];
    var recurring = dr() < 0.42;
    var amt = recurring
      ? [10, 15, 25, 35, 50, 75][Math.floor(dr() * 6)]
      : [20, 40, 50, 75, 100, 150, 250, 500, 1000][Math.floor(dr() * 9)];
    var daysAgo = Math.floor(dr() * 29);
    var dt = new Date(2026, 5, 16);
    dt.setDate(dt.getDate() - daysAgo);
    donations.push({
      name: fn + " " + ln,
      initials: fn[0] + ln[0],
      color: avatarColors[Math.floor(dr() * avatarColors.length)],
      campaign: camp.name,
      campaignId: camp.id,
      type: recurring ? "recurring" : "onetime",
      amount: amt,
      date: dt,
      status: statuses[Math.floor(dr() * statuses.length)]
    });
  }
  donations.sort(function (a, b) { return b.date - a.date; });

  var leadershipGifts = [
    { name: "The Hollis Family Trust", initials: "HF", amt: 25000 },
    { name: "Verdant Tech Foundation", initials: "VT", amt: 18500 },
    { name: "Anonymous donor", initials: "A", amt: 12000 }
  ];

  /* ---------- State ---------- */
  var state = { range: "30", campaignFilter: null, search: "" };

  /* ---------- KPI computation ---------- */
  function rangeSlice(days) {
    return series.slice(series.length - days);
  }
  function sum(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }

  function computeKpis(days) {
    var cur = rangeSlice(days);
    var prev = series.slice(series.length - days * 2, series.length - days);
    var totalRaised = sum(cur);
    var prevRaised = sum(prev) || totalRaised;
    var recurringRev = totalRaised * 0.38;
    var prevRecurring = prevRaised * 0.355;
    var giftCount = Math.round(days * 23 + (days * 0.4));
    var prevGiftCount = Math.round(days * 21);
    var avg = totalRaised / giftCount;
    var prevAvg = prevRaised / prevGiftCount;
    var newDonors = Math.round(days * 4.6);
    var prevNew = Math.round(days * 4.1);
    return {
      raised: { v: totalRaised, t: pct(totalRaised, prevRaised) },
      recurring: { v: recurringRev, t: pct(recurringRev, prevRecurring) },
      avg: { v: avg, t: pct(avg, prevAvg) },
      donors: { v: newDonors, t: pct(newDonors, prevNew) }
    };
  }
  function pct(cur, prev) {
    if (!prev) return 0;
    return ((cur - prev) / prev) * 100;
  }

  function setTrend(key, value) {
    var el = document.querySelector('[data-trend="' + key + '"]');
    var up = value >= 0;
    el.textContent = (up ? "▲ " : "▼ ") + Math.abs(value).toFixed(1) + "%";
    el.classList.toggle("pill-up", up);
    el.classList.toggle("pill-down", !up);
  }

  function renderKpis() {
    var k = computeKpis(parseInt(state.range, 10));
    animateValue('[data-kpi="raised"]', k.raised.v, true);
    animateValue('[data-kpi="recurring"]', k.recurring.v, true);
    animateValue('[data-kpi="avg"]', k.avg.v, true);
    animateValue('[data-kpi="donors"]', k.donors.v, false);
    setTrend("raised", k.raised.t);
    setTrend("recurring", k.recurring.t);
    setTrend("avg", k.avg.t);
    setTrend("donors", k.donors.t);

    // Split donut
    var rec = k.raised.v * 0.38;
    var one = k.raised.v - rec;
    var recPct = Math.round((rec / k.raised.v) * 100);
    $("#recAmt").textContent = fmt(rec);
    $("#oneAmt").textContent = fmt(one);
    $("#donutPct").textContent = recPct + "%";
    var circ = 2 * Math.PI * 48;
    $("#donutArc").style.strokeDasharray = (circ * recPct / 100) + " " + circ;

    // Impact numbers
    animateValue("#impactMeals", Math.round(k.raised.v / 2.4), false);
    animateValue("#impactKits", Math.round(k.raised.v / 65), false);
  }

  function animateValue(sel, target, money) {
    var el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (!el) return;
    var start = parseFloat((el.getAttribute("data-raw") || "0")) || 0;
    var dur = 550, t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = start + (target - start) * eased;
      el.textContent = money ? fmt(val) : Math.round(val).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
      else el.setAttribute("data-raw", target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Chart ---------- */
  var W = 720, H = 260, PADX = 8, PADY = 18;

  function bucketData(days) {
    var data = rangeSlice(days);
    // Downsample to ~30 points for readability on long ranges
    var maxPts = 30;
    if (data.length <= maxPts) return aggregate(data, days);
    var groupSize = Math.ceil(data.length / maxPts);
    var out = [];
    for (var i = 0; i < data.length; i += groupSize) {
      var chunk = data.slice(i, i + groupSize);
      out.push(sum(chunk));
    }
    return labelize(out, days);
  }
  function aggregate(data) { return labelize(data.slice(), null); }
  function labelize(values, days) {
    return values.map(function (v, idx) {
      return { v: v, idx: idx, count: values.length };
    });
  }

  function buildPath(points) {
    var max = Math.max.apply(null, points.map(function (p) { return p.v; }));
    var min = Math.min.apply(null, points.map(function (p) { return p.v; }));
    var range = (max - min) || 1;
    var n = points.length;
    var coords = points.map(function (p, i) {
      var x = PADX + (i / (n - 1)) * (W - PADX * 2);
      var y = PADY + (1 - (p.v - min * 0.85) / (max - min * 0.85 || 1)) * (H - PADY * 2);
      return { x: x, y: y, v: p.v };
    });
    var line = coords.map(function (c, i) { return (i ? "L" : "M") + c.x.toFixed(1) + " " + c.y.toFixed(1); }).join(" ");
    var area = line + " L" + coords[coords.length - 1].x.toFixed(1) + " " + (H - PADY) +
      " L" + coords[0].x.toFixed(1) + " " + (H - PADY) + " Z";
    return { line: line, area: area, coords: coords, max: max };
  }

  function renderChart() {
    var days = parseInt(state.range, 10);
    var pts = bucketData(days);
    var built = buildPath(pts);
    $("#line").setAttribute("d", built.line);
    $("#area").setAttribute("d", built.area);

    // Gridlines
    var gl = $("#gridlines");
    gl.innerHTML = "";
    for (var g = 1; g <= 4; g++) {
      var y = PADY + (g / 5) * (H - PADY * 2);
      var ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", PADX); ln.setAttribute("x2", W - PADX);
      ln.setAttribute("y1", y); ln.setAttribute("y2", y);
      gl.appendChild(ln);
    }

    // Dots
    var dots = $("#dots");
    dots.innerHTML = "";
    built.coords.forEach(function (c, i) {
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("class", "dot");
      circle.setAttribute("cx", c.x);
      circle.setAttribute("cy", c.y);
      circle.setAttribute("r", "3.5");
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("data-i", i);
      circle.addEventListener("mouseenter", function () { showTip(c, days); });
      circle.addEventListener("focus", function () { showTip(c, days); });
      circle.addEventListener("mouseleave", hideTip);
      circle.addEventListener("blur", hideTip);
      dots.appendChild(circle);
    });

    // X-axis labels
    var xa = $("#xaxis");
    xa.innerHTML = "";
    var labels = axisLabels(days);
    labels.forEach(function (l) {
      var span = document.createElement("span");
      span.textContent = l;
      xa.appendChild(span);
    });

    $("[data-chart-meta]").textContent = RANGES[state.range].label;
  }

  function axisLabels(days) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var end = new Date(2026, 5, 16);
    var out = [];
    if (days <= 30) {
      for (var i = 4; i >= 0; i--) {
        var dt = new Date(end); dt.setDate(dt.getDate() - i * 7);
        out.push(months[dt.getMonth()] + " " + dt.getDate());
      }
    } else if (days <= 90) {
      for (var j = 5; j >= 0; j--) {
        var d2 = new Date(end); d2.setDate(d2.getDate() - j * 15);
        out.push(months[d2.getMonth()] + " " + d2.getDate());
      }
    } else {
      for (var m = 5; m >= 0; m--) {
        var d3 = new Date(end); d3.setMonth(d3.getMonth() - m * 2);
        out.push(months[d3.getMonth()]);
      }
    }
    return out;
  }

  var tip = $("#tip");
  function showTip(c, days) {
    var label = days <= 30 ? "day" : days <= 90 ? "3-day total" : "period";
    tip.hidden = false;
    tip.innerHTML = "<b>" + fmtK(c.v) + "</b> · " + label;
    var rect = $("#chart").getBoundingClientRect();
    tip.style.left = (c.x / W * rect.width) + "px";
    tip.style.top = (c.y / H * 260) + "px";
    var hot = document.querySelector(".dot.is-hot");
    if (hot) hot.classList.remove("is-hot");
  }
  function hideTip() { tip.hidden = true; }

  /* ---------- Campaigns render ---------- */
  function renderCampaigns() {
    var totalRaised = computeKpis(parseInt(state.range, 10)).raised.v;
    var max = Math.max.apply(null, campaigns.map(function (c) { return c.share; }));
    var list = $("#campaigns");
    list.innerHTML = "";
    campaigns.forEach(function (c) {
      var amt = totalRaised * c.share;
      var li = document.createElement("li");
      li.className = "campaign" + (state.campaignFilter === c.id ? " is-active" : "");
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      li.innerHTML =
        '<span class="campaign-name">' + c.name + '</span>' +
        '<span class="campaign-amt">' + fmt(amt) + '</span>' +
        '<span class="campaign-bar"><i style="width:' + (c.share / max * 100) + '%"></i></span>' +
        '<span class="campaign-meta">' + c.gifts + ' gifts · ' + Math.round(c.share * 100) + '% of total</span>';
      function activate() { drillCampaign(c.id); }
      li.addEventListener("click", activate);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
      });
      list.appendChild(li);
    });
  }

  function drillCampaign(id) {
    state.campaignFilter = state.campaignFilter === id ? null : id;
    var c = campaigns.filter(function (x) { return x.id === id; })[0];
    if (state.campaignFilter) {
      toast("Drilling into " + c.name);
      $("#tableTitle").textContent = c.name + " donations";
      $("#tableMeta").textContent = "Filtered campaign";
      $("#clearDrill").hidden = false;
    } else {
      $("#tableTitle").textContent = "Recent donations";
      $("#tableMeta").textContent = "All campaigns";
      $("#clearDrill").hidden = true;
    }
    renderCampaigns();
    renderTable();
  }

  /* ---------- Thermometer + recognition ---------- */
  function renderTherm() {
    var goal = 250000;
    var raised = 183420;
    $("#thermFill").style.width = (raised / goal * 100) + "%";
    animateValue("#thermRaised", raised, true);
    var rl = $("#recogList");
    rl.innerHTML = "";
    leadershipGifts.forEach(function (g) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="av">' + g.initials + '</span><span>' + g.name + '</span><b>' + fmt(g.amt) + '</b>';
      rl.appendChild(li);
    });
  }

  /* ---------- Table ---------- */
  function filteredDonations() {
    var q = state.search.trim().toLowerCase();
    return donations.filter(function (d) {
      if (state.campaignFilter && d.campaignId !== state.campaignFilter) return false;
      if (q && d.name.toLowerCase().indexOf(q) === -1 && d.campaign.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function renderTable() {
    var tbody = $("#tbody");
    var rows = filteredDonations();
    tbody.innerHTML = "";
    $("#emptyRow").hidden = rows.length !== 0;
    rows.forEach(function (d) {
      var tr = document.createElement("tr");
      var dateStr = d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      tr.innerHTML =
        '<td><div class="donor-cell"><span class="av" style="background:' + d.color + '">' + d.initials + '</span>' +
        '<span class="donor-name">' + d.name + '</span></div></td>' +
        '<td>' + d.campaign + '</td>' +
        '<td><span class="type-tag ' + (d.type === "recurring" ? "type-recurring" : "type-onetime") + '">' +
        (d.type === "recurring" ? "Monthly" : "One-time") + '</span></td>' +
        '<td class="num">' + fmt(d.amount) + '</td>' +
        '<td>' + dateStr + '</td>' +
        '<td><span class="status status-' + d.status + '">' + d.status.charAt(0).toUpperCase() + d.status.slice(1) + '</span></td>';
      tbody.appendChild(tr);
    });
  }

  /* ---------- Export ---------- */
  function exportCsv() {
    var rows = filteredDonations();
    var header = ["Donor", "Campaign", "Type", "Amount", "Date", "Status"];
    var lines = [header.join(",")];
    rows.forEach(function (d) {
      lines.push([
        '"' + d.name + '"',
        '"' + d.campaign + '"',
        d.type,
        d.amount,
        d.date.toISOString().slice(0, 10),
        d.status
      ].join(","));
    });
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "brightwell-donations.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Exported " + rows.length + " donations to CSV");
  }

  /* ---------- Events ---------- */
  var segBtns = document.querySelectorAll(".seg-btn");
  segBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.classList.contains("is-active")) return;
      segBtns.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("is-active");
      b.setAttribute("aria-pressed", "true");
      state.range = b.getAttribute("data-range");
      renderKpis();
      renderChart();
      renderCampaigns();
      toast("Showing " + RANGES[state.range].label.toLowerCase());
    });
  });

  $("#exportBtn").addEventListener("click", exportCsv);
  $("#donateBtn").addEventListener("click", function () {
    toast("Thank you! Redirecting to the secure donation form…");
  });
  $("#clearDrill").addEventListener("click", function () {
    if (state.campaignFilter) drillCampaign(state.campaignFilter);
  });

  var searchEl = $("#search");
  var searchTimer;
  searchEl.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.search = searchEl.value;
      renderTable();
    }, 130);
  });

  window.addEventListener("resize", function () {
    clearTimeout(window.__rcz);
    window.__rcz = setTimeout(renderChart, 150);
  });

  /* ---------- Init ---------- */
  renderKpis();
  renderChart();
  renderCampaigns();
  renderTherm();
  renderTable();
})();
