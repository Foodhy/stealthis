(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const SVGNS = "http://www.w3.org/2000/svg";

  const usd = (n) =>
    "$" + Math.round(n).toLocaleString("en-US");
  const usd2 = (n) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function el(tag, attrs, txt) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }

  // Deterministic pseudo-random generator so data is stable per period.
  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => (t.hidden = true), 220);
    }, 2400);
  }

  /* ------------------------------------------------------------------ */
  /* Data model                                                         */
  /* ------------------------------------------------------------------ */
  // Per-period config: days of series, multiplier, conversion baseline.
  const PERIODS = {
    7:   { points: 7,  unit: "day",  label: "Last 7 days",  conv: 3.4, scale: 1 },
    30:  { points: 30, unit: "day",  label: "Last 30 days", conv: 3.1, scale: 1 },
    90:  { points: 13, unit: "week", label: "Last 90 days", conv: 2.8, scale: 7.1 },
    365: { points: 12, unit: "month",label: "Last 12 months",conv: 2.9, scale: 30.5 }
  };

  // Generate a revenue series + total metrics for a given period.
  function buildPeriod(days) {
    const cfg = PERIODS[days];
    const rand = rng(days * 131 + 7);
    const base = 1850 + rand() * 600;
    const series = [];
    let trend = base;
    for (let i = 0; i < cfg.points; i++) {
      trend *= 0.985 + rand() * 0.045; // gentle organic walk
      const weekend = cfg.unit === "day" && (i % 7 === 5 || i % 7 === 6);
      const v = trend * cfg.scale * (weekend ? 1.28 : 1) * (0.85 + rand() * 0.3);
      series.push(Math.max(180, v));
    }
    // previous-period comparison series (slightly lower on average)
    const prev = series.map((v, i) => v * (0.82 + (rng(days * 31 + i)() * 0.22)));

    const revenue = series.reduce((a, b) => a + b, 0);
    const prevRevenue = prev.reduce((a, b) => a + b, 0);
    const aov = 58 + rand() * 26 + days * 0.02;
    const orders = Math.round(revenue / aov);
    const prevOrders = Math.round(prevRevenue / (aov * (0.95 + rand() * 0.08)));
    const conv = cfg.conv + (rand() - 0.5) * 0.6;
    const prevConv = conv * (0.9 + rand() * 0.16);

    return {
      cfg, series, prev,
      sales: { value: revenue, fmt: usd(revenue), delta: pct(revenue, prevRevenue) },
      orders: { value: orders, fmt: orders.toLocaleString("en-US"), delta: pct(orders, prevOrders) },
      aov: { value: aov, fmt: usd2(aov), delta: pct(aov, aov * (0.94 + rand() * 0.1)) },
      conv: { value: conv, fmt: conv.toFixed(1) + "%", delta: pct(conv, prevConv) }
    };
  }

  const pct = (a, b) => (b === 0 ? 0 : ((a - b) / b) * 100);

  // Top products (revenue scales softly with period).
  const PRODUCTS = [
    { name: "Aurora Wireless Earbuds", sku: "LG-AUR-021", units: 482, revenue: 38560, margin: 41, stock: 132, tint: "#eef1ff", ink: "#3457ff", icon: "earbuds" },
    { name: "Drift Merino Beanie", sku: "LG-DRF-118", units: 651, revenue: 19530, margin: 58, stock: 8, tint: "#fef0f4", ink: "#e0245e", icon: "beanie" },
    { name: "Lumen Desk Lamp", sku: "LG-LMP-007", units: 214, revenue: 17120, margin: 47, stock: 0, tint: "#fff4e6", ink: "#d97706", icon: "lamp" },
    { name: "Halo Ceramic Mug 12oz", sku: "LG-MUG-330", units: 903, revenue: 13545, margin: 63, stock: 47, tint: "#f0ecff", ink: "#8b5cf6", icon: "mug" },
    { name: "Trail Canvas Backpack", sku: "LG-BPK-205", units: 176, revenue: 12320, margin: 39, stock: 21, tint: "#e9faf0", ink: "#1f9d55", icon: "bag" },
    { name: "Pulse Smart Bottle 750ml", sku: "LG-BTL-094", units: 388, revenue: 11640, margin: 52, stock: 4, tint: "#eef1ff", ink: "#3457ff", icon: "bottle" },
    { name: "Nimbus Throw Blanket", sku: "LG-BLK-411", units: 142, revenue: 9940, margin: 44, stock: 63, tint: "#fef0f4", ink: "#e0245e", icon: "blanket" }
  ];

  const ICONS = {
    earbuds: '<path d="M8 4a4 4 0 00-4 4v6a3 3 0 003 3 2 2 0 002-2v-7a4 4 0 014-4M16 4a4 4 0 014 4v6a3 3 0 01-3 3 2 2 0 01-2-2v-7a4 4 0 00-4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    beanie: '<path d="M4 16a8 8 0 0116 0M3 16h18v3H3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    lamp: '<path d="M9 3h6l3 7H6l3-7zM12 10v8M8 21h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    mug: '<path d="M5 6h11v9a4 4 0 01-4 4H9a4 4 0 01-4-4V6zM16 8h2a2 2 0 012 2v1a2 2 0 01-2 2h-2" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>',
    bag: '<path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 016 0v2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    bottle: '<path d="M10 2h4v3l1.5 2.5V20a2 2 0 01-2 2h-3a2 2 0 01-2-2V7.5L10 5V2zM8.5 11h7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    blanket: '<path d="M4 6h16v9a3 3 0 01-3 3H4V6zM4 18l3-3M20 6v9" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  const STATUS = [
    { key: "Paid", value: 0, color: "var(--c-2)" },
    { key: "Shipped", value: 0, color: "var(--c-1)" },
    { key: "Pending", value: 0, color: "var(--c-3)" },
    { key: "Refunded", value: 0, color: "var(--c-5)" }
  ];

  const FEED = [
    { name: "Priya Nair", sku: "#LG-9043", items: "Aurora Earbuds +1", amt: 89.0, status: "paid", color: "#3457ff" },
    { name: "Marcus Webb", sku: "#LG-9042", items: "Lumen Desk Lamp", amt: 64.0, status: "shipped", color: "#1f9d55" },
    { name: "Hana Sato", sku: "#LG-9041", items: "Halo Mug ×3", amt: 45.0, status: "pending", color: "#d97706" },
    { name: "Diego Alvarez", sku: "#LG-9040", items: "Trail Backpack", amt: 70.0, status: "paid", color: "#8b5cf6" },
    { name: "Lena Fischer", sku: "#LG-9039", items: "Drift Beanie ×2", amt: 60.0, status: "refunded", color: "#e0245e" },
    { name: "Omar Haddad", sku: "#LG-9038", items: "Pulse Bottle", amt: 30.0, status: "paid", color: "#3457ff" }
  ];

  /* ------------------------------------------------------------------ */
  /* KPI cards + sparklines                                             */
  /* ------------------------------------------------------------------ */
  function sparkPoints(seed, up) {
    const rand = rng(seed);
    const vals = [];
    let v = 0.5;
    for (let i = 0; i < 14; i++) {
      v += (rand() - (up ? 0.42 : 0.58)) * 0.22;
      v = Math.max(0.08, Math.min(0.92, v));
      vals.push(v);
    }
    return vals;
  }

  function drawSpark(svg, seed, up) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const W = 120, H = 36, vals = sparkPoints(seed, up);
    const stepX = W / (vals.length - 1);
    const pts = vals.map((v, i) => [i * stepX, H - v * (H - 6) - 3]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = line + ` L${W} ${H} L0 ${H} Z`;
    const color = up ? "var(--ok)" : "var(--sale)";
    const gid = "sg" + seed;
    const defs = el("defs");
    const grad = el("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(el("stop", { offset: "0", "stop-color": color, "stop-opacity": ".28" }));
    grad.appendChild(el("stop", { offset: "1", "stop-color": color, "stop-opacity": "0" }));
    defs.appendChild(grad);
    svg.appendChild(defs);
    svg.appendChild(el("path", { d: area, fill: `url(#${gid})` }));
    svg.appendChild(el("path", { d: line, fill: "none", stroke: color, "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" }));
    const last = pts[pts.length - 1];
    svg.appendChild(el("circle", { cx: last[0], cy: last[1], r: "2.4", fill: color }));
  }

  function renderKPIs(data) {
    const map = { sales: data.sales, orders: data.orders, aov: data.aov, conv: data.conv };
    $$(".kpi").forEach((card) => {
      const key = card.dataset.kpi;
      const m = map[key];
      $("[data-value]", card).textContent = m.fmt;
      const d = $("[data-delta]", card);
      const up = m.delta >= 0;
      d.className = "kpi-delta " + (up ? "up" : "down");
      d.textContent = (up ? "▲ " : "▼ ") + Math.abs(m.delta).toFixed(1) + "%";
      drawSpark($(".spark", card), (key.charCodeAt(0) + key.length) * 17 + Object.keys(map).indexOf(key) * 5, up);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Revenue line/area chart                                            */
  /* ------------------------------------------------------------------ */
  const revChart = $("#revChart");
  const chartTip = $("#chartTip");
  let chartState = null; // { xs, ys, series, labels }

  function fmtAxis(i, cfg) {
    if (cfg.unit === "month") return ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"][i] || "";
    if (cfg.unit === "week") return "W" + (i + 1);
    return "D" + (i + 1);
  }

  function drawRevenue(data) {
    const svg = revChart;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const W = 720, H = 260, padL = 46, padR = 14, padT = 14, padB = 28;
    const series = data.series, prev = data.prev;
    const max = Math.max(...series, ...prev) * 1.08;
    const min = 0;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const xAt = (i) => padL + (i / (series.length - 1)) * plotW;
    const yAt = (v) => padT + plotH - ((v - min) / (max - min)) * plotH;

    // gradient defs
    const defs = el("defs");
    const grad = el("linearGradient", { id: "revGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(el("stop", { offset: "0", "stop-color": "var(--brand)", "stop-opacity": ".22" }));
    grad.appendChild(el("stop", { offset: "1", "stop-color": "var(--brand)", "stop-opacity": "0" }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    // y grid + labels
    const ticks = 4;
    for (let t = 0; t <= ticks; t++) {
      const v = (max / ticks) * t;
      const y = yAt(v);
      svg.appendChild(el("line", { class: "grid-line", x1: padL, y1: y, x2: W - padR, y2: y }));
      const lbl = el("text", { class: "axis-label", x: padL - 8, y: y + 4, "text-anchor": "end" }, "$" + Math.round(v / 1000) + "k");
      svg.appendChild(lbl);
    }

    // x labels (max ~7 spread)
    const xs = series.map((_, i) => xAt(i));
    const ys = series.map((v) => yAt(v));
    const labelEvery = Math.ceil(series.length / 7);
    series.forEach((_, i) => {
      if (i % labelEvery === 0 || i === series.length - 1) {
        svg.appendChild(el("text", { class: "axis-label", x: xAt(i), y: H - 8, "text-anchor": "middle" }, fmtAxis(i, data.cfg)));
      }
    });

    // prev line (dashed)
    const prevPath = prev.map((v, i) => (i ? "L" : "M") + xAt(i).toFixed(1) + " " + yAt(v).toFixed(1)).join(" ");
    svg.appendChild(el("path", { class: "prev-line", d: prevPath }));

    // area + line
    const linePath = series.map((v, i) => (i ? "L" : "M") + xs[i].toFixed(1) + " " + ys[i].toFixed(1)).join(" ");
    const areaPath = linePath + ` L${xs[xs.length - 1]} ${padT + plotH} L${xs[0]} ${padT + plotH} Z`;
    const area = el("path", { class: "rev-area", d: areaPath });
    svg.appendChild(area);
    const line = el("path", { class: "rev-line", d: linePath });
    svg.appendChild(line);

    // animate line draw
    const len = line.getTotalLength ? line.getTotalLength() : 0;
    if (len) {
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      requestAnimationFrame(() => {
        line.style.transition = "stroke-dashoffset .7s ease";
        line.style.strokeDashoffset = "0";
      });
    }

    // hover layer
    const rule = el("line", { class: "hover-rule", x1: 0, y1: padT, x2: 0, y2: padT + plotH, opacity: "0" });
    const dot = el("circle", { class: "hover-dot", r: "4.5", cx: 0, cy: 0, opacity: "0" });
    svg.appendChild(rule);
    svg.appendChild(dot);
    const hit = el("rect", { class: "hit", x: padL, y: padT, width: plotW, height: plotH });
    svg.appendChild(hit);

    chartState = { xs, ys, series, cfg: data.cfg, padL, plotW, rule, dot, W, H };

    hit.addEventListener("pointermove", onHover);
    hit.addEventListener("pointerleave", () => {
      rule.setAttribute("opacity", "0");
      dot.setAttribute("opacity", "0");
      chartTip.hidden = true;
    });
  }

  function onHover(e) {
    const st = chartState;
    if (!st) return;
    const rect = revChart.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * st.W;
    // nearest index
    let i = Math.round(((relX - st.padL) / st.plotW) * (st.series.length - 1));
    i = Math.max(0, Math.min(st.series.length - 1, i));
    const x = st.xs[i], y = st.ys[i];
    st.rule.setAttribute("x1", x); st.rule.setAttribute("x2", x); st.rule.setAttribute("opacity", "1");
    st.dot.setAttribute("cx", x); st.dot.setAttribute("cy", y); st.dot.setAttribute("opacity", "1");
    chartTip.hidden = false;
    chartTip.innerHTML = `<b>${usd(st.series[i])}</b><span>${fmtAxis(i, st.cfg)}</span>`;
    const px = (x / st.W) * rect.width;
    const py = (y / st.H) * rect.height;
    chartTip.style.left = px + "px";
    chartTip.style.top = py + "px";
  }

  /* ------------------------------------------------------------------ */
  /* Donut — orders by status                                          */
  /* ------------------------------------------------------------------ */
  function drawDonut(totalOrders) {
    const rand = rng(totalOrders + 3);
    // distribute total across statuses
    const weights = [0.62, 0.21, 0.12, 0.05].map((w) => w * (0.85 + rand() * 0.3));
    const sum = weights.reduce((a, b) => a + b, 0);
    STATUS.forEach((s, i) => (s.value = Math.round((weights[i] / sum) * totalOrders)));
    // fix rounding so it sums to total
    const diff = totalOrders - STATUS.reduce((a, b) => a + b.value, 0);
    STATUS[0].value += diff;

    const svg = $("#donut");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const cx = 60, cy = 60, r = 44, sw = 18, C = 2 * Math.PI * r;
    let offset = 0;
    const total = STATUS.reduce((a, b) => a + b.value, 0) || 1;

    // track
    svg.appendChild(el("circle", { cx, cy, r, fill: "none", stroke: "var(--line-soft)", "stroke-width": sw }));

    STATUS.forEach((s) => {
      const frac = s.value / total;
      const seg = el("circle", {
        class: "donut-seg",
        cx, cy, r,
        fill: "none",
        stroke: s.color,
        "stroke-width": sw,
        "stroke-dasharray": `${(frac * C).toFixed(2)} ${C.toFixed(2)}`,
        "stroke-dashoffset": (-offset * C).toFixed(2),
        transform: `rotate(-90 ${cx} ${cy})`,
        "stroke-linecap": "butt"
      });
      const t = el("title", {}, `${s.key}: ${s.value} (${(frac * 100).toFixed(0)}%)`);
      seg.appendChild(t);
      svg.appendChild(seg);
      offset += frac;
    });

    svg.appendChild(el("text", { class: "donut-center-val", x: cx, y: cy - 2, "text-anchor": "middle" }, total.toLocaleString("en-US")));
    svg.appendChild(el("text", { class: "donut-center-lbl", x: cx, y: cy + 12, "text-anchor": "middle" }, "Orders"));

    // legend
    const lg = $("#donutLegend");
    lg.innerHTML = "";
    STATUS.forEach((s) => {
      const li = document.createElement("li");
      li.innerHTML =
        `<span class="dl-swatch" style="background:${s.color}"></span>` +
        `<span class="dl-name">${s.key}</span>` +
        `<span class="dl-val">${s.value.toLocaleString("en-US")}</span>` +
        `<span class="dl-pct">${((s.value / total) * 100).toFixed(0)}%</span>`;
      lg.appendChild(li);
    });
    $("#donutTotal").textContent = total.toLocaleString("en-US") + " orders";
  }

  /* ------------------------------------------------------------------ */
  /* Top products table + sorting                                      */
  /* ------------------------------------------------------------------ */
  let sortKey = "revenue", sortDir = "desc", periodScale = 1;

  function stockClass(n) { return n === 0 ? "out" : n <= 12 ? "low" : ""; }
  function stockLabel(n) { return n === 0 ? "Out of stock" : n + " left"; }

  function renderTable() {
    const body = $("#productsBody");
    body.innerHTML = "";
    const rows = PRODUCTS.map((p) => ({
      ...p,
      units: Math.round(p.units * periodScale),
      revenue: Math.round(p.revenue * periodScale)
    }));
    rows.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    rows.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td><div class="prod-cell">
            <span class="prod-thumb" style="background:${p.tint};color:${p.ink}">
              <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[p.icon]}</svg>
            </span>
            <span><span class="prod-name">${p.name}</span><br><span class="prod-sku">${p.sku}</span></span>
          </div></td>` +
        `<td class="num">${p.units.toLocaleString("en-US")}</td>` +
        `<td class="num rev-strong">${usd(p.revenue)}</td>` +
        `<td class="num"><span class="margin-chip">${p.margin}%</span></td>` +
        `<td class="num"><span class="stock-chip ${stockClass(p.stock)}">${stockLabel(p.stock)}</span></td>`;
      body.appendChild(tr);
    });
  }

  function wireSort() {
    $$(".th-sort").forEach((btn) => {
      if (!btn.dataset.sort) return;
      btn.addEventListener("click", () => {
        const key = btn.dataset.sort;
        if (key === sortKey) {
          sortDir = sortDir === "asc" ? "desc" : "asc";
        } else {
          sortKey = key;
          sortDir = key === "name" ? "asc" : "desc";
        }
        $$(".th-sort").forEach((b) => { b.classList.remove("is-sorted"); b.removeAttribute("data-dir"); });
        btn.classList.add("is-sorted");
        btn.setAttribute("data-dir", sortDir);
        renderTable();
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Low stock list                                                    */
  /* ------------------------------------------------------------------ */
  function renderLowStock() {
    const list = $("#lowStock");
    list.innerHTML = "";
    const low = PRODUCTS.filter((p) => p.stock <= 12).sort((a, b) => a.stock - b.stock);
    $("#lowCount").textContent = low.length;
    low.forEach((p) => {
      const li = document.createElement("li");
      li.className = "alert-item";
      const ratio = Math.max(0.04, Math.min(1, p.stock / 40));
      const barColor = p.stock === 0 ? "var(--sale)" : "var(--warn)";
      li.innerHTML =
        `<span class="alert-thumb" style="background:${p.tint};color:${p.ink}">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[p.icon]}</svg>
         </span>
         <div class="alert-body">
            <div class="alert-name">${p.name}</div>
            <div class="alert-meta">${p.sku} · ${stockLabel(p.stock)}</div>
            <div class="stock-bar"><i style="width:${(ratio * 100).toFixed(0)}%;background:${barColor}"></i></div>
         </div>
         <button class="reorder-btn" type="button">Reorder</button>`;
      const btn = $(".reorder-btn", li);
      btn.addEventListener("click", () => {
        btn.disabled = true;
        btn.textContent = "Queued";
        toast("Reorder queued for " + p.name);
      });
      list.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Recent orders feed                                                */
  /* ------------------------------------------------------------------ */
  function renderFeed() {
    const ul = $("#feed");
    ul.innerHTML = "";
    const labels = { paid: "Paid", pending: "Pending", shipped: "Shipped", refunded: "Refunded" };
    FEED.forEach((o, idx) => {
      const li = document.createElement("li");
      li.className = "feed-item";
      const initials = o.name.split(" ").map((s) => s[0]).join("").slice(0, 2);
      li.innerHTML =
        `<span class="feed-avatar" style="background:${o.color}">${initials}</span>
         <div class="feed-body">
            <div class="feed-name">${o.name}</div>
            <div class="feed-sub">${o.sku} · ${o.items}</div>
         </div>
         <div class="feed-right">
            <div class="feed-amt">${usd2(o.amt)}</div>
            <span class="feed-status st-${o.status}">${labels[o.status]}</span>
         </div>`;
      ul.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Period switching                                                  */
  /* ------------------------------------------------------------------ */
  function setPeriod(days) {
    const data = buildPeriod(days);
    periodScale = days === 7 ? 0.32 : days === 30 ? 1 : days === 90 ? 2.7 : 11;
    renderKPIs(data);
    drawRevenue(data);
    drawDonut(data.orders.value);
    renderTable();
    renderLowStock();
    renderFeed();
    $("#revRange").textContent = data.cfg.label;
  }

  function wirePeriod() {
    $$(".period-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".period-btn").forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        setPeriod(Number(btn.dataset.period));
        toast("Showing " + PERIODS[Number(btn.dataset.period)].label.toLowerCase());
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sidebar toggle (mobile) + export                                  */
  /* ------------------------------------------------------------------ */
  function wireChrome() {
    const app = $(".app");
    const menuBtn = $("#menuBtn");
    let scrim = null;
    menuBtn.addEventListener("click", () => {
      const open = app.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      if (open) {
        scrim = document.createElement("button");
        scrim.className = "scrim";
        scrim.setAttribute("aria-label", "Close navigation");
        scrim.addEventListener("click", closeNav);
        app.appendChild(scrim);
      } else {
        closeNav();
      }
    });
    function closeNav() {
      app.classList.remove("nav-open");
      menuBtn.setAttribute("aria-expanded", "false");
      if (scrim) { scrim.remove(); scrim = null; }
    }
    $$(".nav-link").forEach((l) =>
      l.addEventListener("click", (e) => {
        e.preventDefault();
        $$(".nav-link").forEach((n) => { n.classList.remove("is-active"); n.removeAttribute("aria-current"); });
        l.classList.add("is-active");
        l.setAttribute("aria-current", "page");
        if (window.innerWidth <= 860) closeNav();
      })
    );
    $("#exportBtn").addEventListener("click", () => toast("Report exported to CSV"));
  }

  // redraw chart on resize so the hit-area math stays correct
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const active = $(".period-btn.is-active");
      if (active) {
        const data = buildPeriod(Number(active.dataset.period));
        drawRevenue(data);
      }
    }, 180);
  });

  /* ------------------------------------------------------------------ */
  /* Init                                                              */
  /* ------------------------------------------------------------------ */
  wireSort();
  wirePeriod();
  wireChrome();
  setPeriod(30);
})();
