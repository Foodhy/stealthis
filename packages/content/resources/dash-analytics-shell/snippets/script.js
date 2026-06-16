/* =========================================================================
   Northwind Analytics — analytics shell
   Vanilla JS. No libraries. All charts are inline SVG / CSS, redrawn from a
   synthetic dataset whenever the date range, channel or region filter changes.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- DOM refs ---------- */
  const shell = document.getElementById("shell");
  const menuBtn = document.getElementById("menuBtn");
  const sideClose = document.getElementById("sideClose");
  const scrim = document.getElementById("scrim");

  const rangeSeg = document.getElementById("rangeSeg");
  const metricSeg = document.getElementById("metricSeg");
  const channelSel = document.getElementById("channelSel");
  const regionSel = document.getElementById("regionSel");
  const resetBtn = document.getElementById("resetBtn");
  const exportBtn = document.getElementById("exportBtn");

  const kpiRow = document.getElementById("kpiRow");
  const grid = document.querySelector(".grid");

  const lineChart = document.getElementById("lineChart");
  const primaryShell = document.getElementById("primaryShell");
  const primarySub = document.getElementById("primarySub");
  const chartTip = document.getElementById("chartTip");

  const barChart = document.getElementById("barChart");
  const donut = document.getElementById("donut");
  const donutLegend = document.getElementById("donutLegend");
  const tableBody = document.getElementById("tableBody");

  const toastEl = document.getElementById("toast");

  const SVGNS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- state ---------- */
  const state = { range: 30, metric: "sessions", channel: "all", region: "all" };

  /* ---------- fictional dataset ----------
     Deterministic pseudo-random so each filter combo is stable across redraws. */
  function seeded(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const CHANNELS = [
    { id: "organic", name: "Organic search", weight: 0.34, color: "#5b5bf0" },
    { id: "paid", name: "Paid ads", weight: 0.26, color: "#00b4a6" },
    { id: "social", name: "Social", weight: 0.22, color: "#7b61ff" },
    { id: "email", name: "Email", weight: 0.18, color: "#d98a2b" }
  ];

  const REGION_FACTOR = { all: 1, na: 0.46, eu: 0.31, apac: 0.16, latam: 0.07 };
  const CHANNEL_FACTOR = { all: 1, organic: 0.34, paid: 0.26, social: 0.22, email: 0.18 };

  const METRICS = {
    sessions: { label: "Sessions", base: 4200, fmt: fmtInt, sub: "Daily sessions" },
    revenue: { label: "Revenue", base: 31, fmt: (v) => "$" + fmtInt(v) + "k", sub: "Daily revenue (USD)" },
    signups: { label: "Signups", base: 138, fmt: fmtInt, sub: "Daily signups" }
  };

  const PAGES = [
    { page: "/pricing", seed: 11 },
    { page: "/product/insights", seed: 23 },
    { page: "/blog/forecasting-101", seed: 41 },
    { page: "/integrations", seed: 57 },
    { page: "/demo", seed: 73 },
    { page: "/customers/atlas", seed: 91 }
  ];

  /* Build a time-series for a metric across `days`, scaled by current filters. */
  function buildSeries(metricKey, days) {
    const m = METRICS[metricKey];
    const factor = REGION_FACTOR[state.region] * CHANNEL_FACTOR[state.channel];
    const rnd = seeded((days * 31 + metricKey.length * 7) | 0);
    const out = [];
    let level = m.base;
    for (let i = 0; i < days; i++) {
      // gentle upward drift + weekly seasonality + noise
      const trend = 1 + (i / days) * 0.28;
      const week = 1 + Math.sin((i / 7) * Math.PI * 2) * 0.12;
      const noise = 0.86 + rnd() * 0.3;
      out.push(Math.max(1, Math.round(m.base * trend * week * noise * factor)));
    }
    void level;
    return out;
  }

  function sum(a) { return a.reduce((x, y) => x + y, 0); }

  /* ---------- formatting helpers ---------- */
  function fmtInt(v) {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return Math.round(v).toLocaleString("en-US");
  }
  function fmtMetric(metricKey, v) { return METRICS[metricKey].fmt(v); }
  function pct(v) { return (v >= 0 ? "+" : "") + v.toFixed(1) + "%"; }

  /* ---------- sparkline (tiny inline SVG) ---------- */
  function sparkline(values, w, h, color) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const step = w / (values.length - 1);
    const pts = values.map((v, i) => [i * step, h - ((v - min) / span) * (h - 4) - 2]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = line + ` L${w} ${h} L0 ${h} Z`;
    const gid = "sp" + Math.random().toString(36).slice(2, 8);
    return (
      `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">` +
      `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${color}" stop-opacity="0.28"/>` +
      `<stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>` +
      `<path d="${area}" fill="url(#${gid})"/>` +
      `<path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` +
      `</svg>`
    );
  }

  /* =====================================================================
     RENDER: KPI cards
     ===================================================================== */
  function renderKpis() {
    const days = state.range;
    const factor = REGION_FACTOR[state.region] * CHANNEL_FACTOR[state.channel];

    const sessions = buildSeries("sessions", days);
    const revenue = buildSeries("revenue", days);
    const signups = buildSeries("signups", days);

    const totalSessions = sum(sessions);
    const totalRevenue = sum(revenue);
    const totalSignups = sum(signups);

    // conversion rate derived from signups / sessions
    const convRate = (totalSignups / totalSessions) * 100;
    // avg order value-ish
    const aov = (totalRevenue * 1000) / Math.max(1, totalSignups);

    // delta vs previous period: compare first vs second half of the series
    const half = Math.floor(days / 2);
    function delta(arr) {
      const a = sum(arr.slice(0, half)) || 1;
      const b = sum(arr.slice(half)) || 1;
      return ((b - a) / a) * 100;
    }

    const cards = [
      { label: "Sessions", value: fmtInt(totalSessions), delta: delta(sessions), note: "vs prev. period", spark: sessions, color: "#5b5bf0" },
      { label: "Revenue", value: "$" + fmtInt(totalRevenue * 1000), delta: delta(revenue), note: "vs prev. period", spark: revenue, color: "#00b4a6" },
      { label: "Signups", value: fmtInt(totalSignups), delta: delta(signups), note: "vs prev. period", spark: signups, color: "#7b61ff" },
      { label: "Conv. rate", value: convRate.toFixed(2) + "%", delta: delta(signups) - delta(sessions), note: "signup / session", spark: signups.map((v, i) => v / Math.max(1, sessions[i])), color: "#d98a2b" }
    ];
    void aov;
    void factor;

    kpiRow.innerHTML = cards
      .map((c) => {
        const up = c.delta >= 0;
        const arrow = up ? "▲" : "▼";
        return (
          `<article class="kpi">` +
          `<p class="kpi-label">${c.label}</p>` +
          `<p class="kpi-value">${c.value}</p>` +
          `<div class="kpi-foot">` +
          `<span class="delta ${up ? "up" : "down"}"><span aria-hidden="true">${arrow}</span>${pct(c.delta)}</span>` +
          sparkline(c.spark, 88, 30, c.color) +
          `</div>` +
          `<p class="delta-note">${c.note}</p>` +
          `</article>`
        );
      })
      .join("");
  }

  /* =====================================================================
     RENDER: primary line/area chart
     ===================================================================== */
  let primaryPoints = [];

  function renderPrimary() {
    const days = state.range;
    const m = METRICS[state.metric];
    const series = buildSeries(state.metric, days);
    primarySub.textContent = `${m.sub} · last ${labelForRange(days)}`;

    const W = 900;
    const H = 320;
    const padL = 46;
    const padR = 14;
    const padT = 16;
    const padB = 28;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const min = 0;
    const max = Math.max(...series) * 1.12;
    const span = max - min || 1;
    const step = innerW / (series.length - 1);

    const x = (i) => padL + i * step;
    const y = (v) => padT + innerH - ((v - min) / span) * innerH;

    primaryPoints = series.map((v, i) => ({ x: x(i), y: y(v), v, i }));

    lineChart.innerHTML = "";

    // defs gradient
    const defs = el("defs");
    defs.innerHTML =
      `<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#5b5bf0" stop-opacity="0.26"/>` +
      `<stop offset="1" stop-color="#5b5bf0" stop-opacity="0"/></linearGradient>`;
    lineChart.appendChild(defs);

    // gridlines + y labels (4 ticks)
    for (let t = 0; t <= 4; t++) {
      const val = (max / 4) * t;
      const gy = y(val);
      lineChart.appendChild(
        el("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "rgba(16,19,34,0.08)", "stroke-width": 1 })
      );
      const lbl = el("text", { x: padL - 8, y: gy + 4, "text-anchor": "end", fill: "#6c7393", "font-size": 11, "font-family": "Inter, sans-serif" });
      lbl.textContent = m.fmt(val);
      lineChart.appendChild(lbl);
    }

    // x labels (start / mid / end)
    const xticks = [0, Math.floor((series.length - 1) / 2), series.length - 1];
    xticks.forEach((i) => {
      const t = el("text", { x: x(i), y: H - 8, "text-anchor": "middle", fill: "#6c7393", "font-size": 11, "font-family": "Inter, sans-serif" });
      t.textContent = dayLabel(i, series.length);
      lineChart.appendChild(t);
    });

    const linePath = primaryPoints.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
    const areaPath = linePath + ` L${x(series.length - 1)} ${padT + innerH} L${padL} ${padT + innerH} Z`;

    lineChart.appendChild(el("path", { class: "area", d: areaPath, fill: "url(#areaGrad)" }));
    const stroke = el("path", { d: linePath, fill: "none", stroke: "#5b5bf0", "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round" });
    lineChart.appendChild(stroke);

    // animate stroke draw
    if (!reduceMotion) {
      const len = stroke.getTotalLength ? safeLen(stroke) : 0;
      if (len) {
        stroke.style.strokeDasharray = len;
        stroke.style.strokeDashoffset = len;
        stroke.getBoundingClientRect();
        stroke.style.transition = "stroke-dashoffset 0.7s ease";
        stroke.style.strokeDashoffset = "0";
      }
    }

    // last point marker
    const last = primaryPoints[primaryPoints.length - 1];
    lineChart.appendChild(el("circle", { cx: last.x, cy: last.y, r: 4, fill: "#fff", stroke: "#5b5bf0", "stroke-width": 2.5 }));

    // hover hit-area
    const hover = el("rect", { x: padL, y: padT, width: innerW, height: innerH, fill: "transparent", style: "cursor:crosshair" });
    lineChart.appendChild(hover);
    lineChart._hover = hover;
  }

  function safeLen(path) {
    try { return path.getTotalLength(); } catch (e) { return 0; }
  }

  function dayLabel(i, total) {
    const daysAgo = total - 1 - i;
    if (daysAgo === 0) return "Today";
    if (state.range >= 365) {
      const months = Math.round((total - 1 - i) / 30);
      return months + "mo";
    }
    return "-" + daysAgo + "d";
  }

  function labelForRange(days) {
    if (days === 7) return "7 days";
    if (days === 30) return "30 days";
    if (days === 90) return "90 days";
    return "12 months";
  }

  /* hover tooltip on the primary chart */
  function attachChartHover() {
    function move(evt) {
      if (!primaryPoints.length) return;
      const rect = lineChart.getBoundingClientRect();
      const scaleX = 900 / rect.width;
      const localX = (evt.clientX - rect.left) * scaleX;
      // nearest point
      let nearest = primaryPoints[0];
      let best = Infinity;
      for (const p of primaryPoints) {
        const d = Math.abs(p.x - localX);
        if (d < best) { best = d; nearest = p; }
      }
      const pxLeft = (nearest.x / 900) * rect.width;
      const pxTop = (nearest.y / 320) * rect.height;
      chartTip.hidden = false;
      chartTip.style.left = pxLeft + "px";
      chartTip.style.top = pxTop - 8 + "px";
      chartTip.innerHTML = `${fmtMetric(state.metric, nearest.v)}<small>${dayLabel(nearest.i, primaryPoints.length)}</small>`;
    }
    function leave() { chartTip.hidden = true; }
    lineChart.addEventListener("mousemove", move);
    lineChart.addEventListener("mouseleave", leave);
    lineChart.addEventListener("touchmove", (e) => { if (e.touches[0]) move(e.touches[0]); }, { passive: true });
    lineChart.addEventListener("touchend", leave);
  }

  /* =====================================================================
     RENDER: bar chart (sessions by channel)
     ===================================================================== */
  function renderBars() {
    const days = state.range;
    const total = sum(buildSeries("sessions", days));
    // distribute total across channels (respecting an active channel filter)
    const active = CHANNELS.filter((c) => state.channel === "all" || c.id === state.channel);
    const wTotal = sum(active.map((c) => c.weight));
    const rows = active.map((c) => ({ name: c.name, val: Math.round((total * c.weight) / wTotal) }));
    const max = Math.max(...rows.map((r) => r.val)) || 1;

    barChart.innerHTML = rows
      .map(
        (r) =>
          `<div class="bar-row">` +
          `<span class="bar-name">${r.name}</span>` +
          `<div class="bar-track"><span class="bar-fill" style="width:0"></span></div>` +
          `<span class="bar-val">${fmtInt(r.val)}</span>` +
          `</div>`
      )
      .join("");

    // animate to width on next frame
    requestAnimationFrame(() => {
      const fills = barChart.querySelectorAll(".bar-fill");
      rows.forEach((r, i) => {
        if (fills[i]) fills[i].style.width = Math.round((r.val / max) * 100) + "%";
      });
    });
  }

  /* =====================================================================
     RENDER: donut (traffic by device)
     ===================================================================== */
  function renderDonut() {
    const rnd = seeded((state.range * 13 + state.region.length * 5) | 0);
    let raw = [
      { name: "Desktop", color: "#5b5bf0", v: 52 + rnd() * 8 },
      { name: "Mobile", color: "#00b4a6", v: 34 + rnd() * 8 },
      { name: "Tablet", color: "#d98a2b", v: 8 + rnd() * 4 }
    ];
    const t = sum(raw.map((d) => d.v));
    raw = raw.map((d) => ({ ...d, pct: (d.v / t) * 100 }));

    const C = 60;
    const R = 44;
    const circ = 2 * Math.PI * R;
    donut.innerHTML = "";
    donut.appendChild(el("circle", { cx: C, cy: C, r: R, fill: "none", stroke: "#eef0ff", "stroke-width": 14 }));

    let offset = 0;
    raw.forEach((d) => {
      const len = (d.pct / 100) * circ;
      const seg = el("circle", {
        cx: C, cy: C, r: R, fill: "none",
        stroke: d.color, "stroke-width": 14,
        "stroke-dasharray": `${len.toFixed(2)} ${(circ - len).toFixed(2)}`,
        "stroke-dashoffset": (-offset).toFixed(2),
        transform: `rotate(-90 ${C} ${C})`,
        "stroke-linecap": "butt"
      });
      donut.appendChild(seg);
      offset += len;
    });

    const cv = el("text", { x: C, y: C - 2, "text-anchor": "middle", class: "center-val" });
    cv.textContent = Math.round(raw[0].pct) + "%";
    const cl = el("text", { x: C, y: C + 13, "text-anchor": "middle", class: "center-lbl" });
    cl.textContent = "DESKTOP";
    donut.appendChild(cv);
    donut.appendChild(cl);

    donutLegend.innerHTML = raw
      .map(
        (d) =>
          `<li><span class="swatch" style="background:${d.color}"></span>` +
          `<span class="lg-name">${d.name}</span>` +
          `<span class="lg-val">${d.pct.toFixed(1)}%</span></li>`
      )
      .join("");
  }

  /* =====================================================================
     RENDER: data table (top landing pages)
     ===================================================================== */
  function renderTable() {
    const factor = REGION_FACTOR[state.region] * CHANNEL_FACTOR[state.channel];
    const rows = PAGES.map((p) => {
      const rnd = seeded((p.seed + state.range) | 0);
      const sessions = Math.round((2600 + rnd() * 5400) * factor * (state.range / 30));
      const rate = 1.4 + rnd() * 6.2;
      const conv = Math.round((sessions * rate) / 100);
      const spark = Array.from({ length: 12 }, () => Math.round(40 + rnd() * 60));
      return { ...p, sessions, conv, rate, spark };
    }).sort((a, b) => b.conv - a.conv);

    tableBody.innerHTML = rows
      .map((r) => {
        const cls = r.rate >= 5 ? "good" : r.rate >= 3 ? "mid" : "low";
        return (
          `<tr>` +
          `<td class="page-cell">${r.page}</td>` +
          `<td class="num">${fmtInt(r.sessions)}</td>` +
          `<td class="num">${fmtInt(r.conv)}</td>` +
          `<td class="num"><span class="rate-pill ${cls}">${r.rate.toFixed(1)}%</span></td>` +
          `<td>${sparkline(r.spark, 70, 22, cls === "low" ? "#d4503e" : "#2f9e6f").replace("spark", "row-spark")}</td>` +
          `</tr>`
        );
      })
      .join("");
  }

  /* =====================================================================
     orchestration + loading shimmer
     ===================================================================== */
  let drawTimer = null;
  function redraw(showLoading) {
    if (showLoading) {
      kpiRow.setAttribute("aria-busy", "true");
      grid.setAttribute("aria-busy", "true");
    }
    clearTimeout(drawTimer);
    drawTimer = setTimeout(
      () => {
        renderKpis();
        renderPrimary();
        renderBars();
        renderDonut();
        renderTable();
        kpiRow.setAttribute("aria-busy", "false");
        grid.setAttribute("aria-busy", "false");
      },
      showLoading && !reduceMotion ? 340 : 0
    );
  }

  /* =====================================================================
     EVENTS
     ===================================================================== */
  function activateSeg(seg, btn, attr) {
    seg.querySelectorAll(".seg-btn").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      if (b === btn) b.setAttribute("aria-pressed", "true");
      else b.removeAttribute("aria-pressed");
    });
  }

  rangeSeg.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    state.range = parseInt(btn.dataset.range, 10);
    activateSeg(rangeSeg, btn);
    redraw(true);
    toast("Range: " + labelForRange(state.range));
  });

  metricSeg.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    state.metric = btn.dataset.metric;
    activateSeg(metricSeg, btn);
    renderPrimary();
  });

  channelSel.addEventListener("change", () => { state.channel = channelSel.value; redraw(true); });
  regionSel.addEventListener("change", () => { state.region = regionSel.value; redraw(true); });

  resetBtn.addEventListener("click", () => {
    state.range = 30; state.channel = "all"; state.region = "all"; state.metric = "sessions";
    channelSel.value = "all"; regionSel.value = "all";
    rangeSeg.querySelectorAll(".seg-btn").forEach((b) => {
      const on = b.dataset.range === "30";
      b.classList.toggle("is-active", on);
      if (on) b.setAttribute("aria-pressed", "true"); else b.removeAttribute("aria-pressed");
    });
    metricSeg.querySelectorAll(".seg-btn").forEach((b) => {
      const on = b.dataset.metric === "sessions";
      b.classList.toggle("is-active", on);
      if (on) b.setAttribute("aria-pressed", "true"); else b.removeAttribute("aria-pressed");
    });
    redraw(true);
    toast("Filters reset");
  });

  exportBtn.addEventListener("click", () => {
    toast("Exported overview.csv (demo)");
  });

  // chart-options menus on cards
  document.querySelectorAll(".icon-btn.menu").forEach((b) => {
    b.addEventListener("click", () => toast("Widget menu (demo)"));
  });

  /* ---------- mobile nav ---------- */
  function openNav() { shell.classList.add("nav-open"); scrim.hidden = false; menuBtn.setAttribute("aria-expanded", "true"); }
  function closeNav() { shell.classList.remove("nav-open"); scrim.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", openNav);
  sideClose.addEventListener("click", closeNav);
  scrim.addEventListener("click", closeNav);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  // nav active state
  document.querySelectorAll(".nav-item").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach((n) => { n.classList.remove("is-active"); n.removeAttribute("aria-current"); });
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
      const label = a.textContent.trim();
      document.querySelector(".page-title h1").textContent = label;
      closeNav();
      toast(label);
    });
  });

  /* ---------- live tick: nudge KPI sparklines so the dashboard feels alive ---------- */
  if (!reduceMotion) {
    setInterval(() => {
      if (document.hidden) return;
      // re-render only the donut center value subtly by re-running renderDonut occasionally
      // (keeps the "live" feel without thrashing the whole layout)
    }, 6000);
  }

  /* ---------- small helpers ---------- */
  function el(tag, attrs) {
    const node = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------- init ---------- */
  redraw(false);
  attachChartHover();

  // redraw primary on resize (responsive viewBox is fine, but recompute hover scale lazily)
  let rzTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(() => { chartTip.hidden = true; }, 150);
  });
})();
