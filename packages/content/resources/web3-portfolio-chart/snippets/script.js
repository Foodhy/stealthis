/* Web3 — Portfolio Value Chart (PnL) — UI simulation, mock data only. */
(() => {
  "use strict";

  const W = 720;
  const H = 260;
  const PAD_TOP = 18;
  const PAD_BOTTOM = 14;

  const $ = (id) => document.getElementById(id);

  const chart = $("chart");
  const linePath = $("linePath");
  const areaPath = $("areaPath");
  const gridLines = $("gridLines");
  const crosshair = $("crosshair");
  const crossLine = $("crossLine");
  const crossDot = $("crossDot");
  const crossDotHalo = $("crossDotHalo");
  const tooltip = $("tooltip");
  const tipValue = $("tipValue");
  const tipDate = $("tipDate");
  const chartWrap = $("chartWrap");
  const chartLabels = $("chartLabels");
  const bigValue = $("bigValue");
  const pnlRow = $("pnlRow");
  const pnlAbs = $("pnlAbs");
  const pnlPctText = $("pnlPctText");
  const pnlRangeLabel = $("pnlRangeLabel");
  const toastEl = $("toast");
  const refreshBtn = $("refreshBtn");

  /* ---------- helpers ---------- */

  const fmtUSD = (n) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtSigned = (n) => (n >= 0 ? "+" : "−") + fmtUSD(Math.abs(n)).replace("$", "$");

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2400);
  }

  // Deterministic PRNG so each range has a stable, realistic-looking series.
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- mock data ---------- */

  const NOW = Date.now();
  const MIN = 60e3;
  const HOUR = 3600e3;
  const DAY = 24 * HOUR;

  const RANGES = {
    "1H": { points: 60, step: MIN, seed: 11, drift: 0.0004, vol: 0.0016, label: "past hour" },
    "1D": { points: 96, step: 15 * MIN, seed: 23, drift: 0.0007, vol: 0.004, label: "past 24h" },
    "1W": { points: 84, step: 2 * HOUR, seed: 7, drift: 0.0011, vol: 0.009, label: "past week" },
    "1M": { points: 90, step: 8 * HOUR, seed: 41, drift: -0.0009, vol: 0.013, label: "past month" },
    "1Y": { points: 104, step: 3.5 * DAY, seed: 5, drift: 0.004, vol: 0.03, label: "past year" },
    ALL: { points: 120, step: 9 * DAY, seed: 19, drift: 0.0085, vol: 0.045, label: "all time" },
  };

  const CURRENT_VALUE = 128440.92;

  function buildSeries(key) {
    const cfg = RANGES[key];
    const rnd = mulberry32(cfg.seed);
    // Random walk built backwards from the current value so all ranges end at the same number.
    const values = new Array(cfg.points);
    values[cfg.points - 1] = CURRENT_VALUE;
    for (let i = cfg.points - 2; i >= 0; i--) {
      const shock = (rnd() - 0.5) * 2 * cfg.vol;
      values[i] = values[i + 1] / (1 + cfg.drift + shock);
    }
    return values.map((v, i) => ({
      t: NOW - (cfg.points - 1 - i) * cfg.step,
      v,
    }));
  }

  const seriesCache = {};
  const getSeries = (key) => (seriesCache[key] ||= buildSeries(key));

  /* ---------- chart geometry ---------- */

  let current = { key: "1W", data: [], min: 0, max: 1, pts: [] };

  function project(data) {
    let min = Infinity;
    let max = -Infinity;
    for (const d of data) {
      if (d.v < min) min = d.v;
      if (d.v > max) max = d.v;
    }
    const span = max - min || 1;
    const innerH = H - PAD_TOP - PAD_BOTTOM;
    const pts = data.map((d, i) => ({
      x: (i / (data.length - 1)) * W,
      y: PAD_TOP + (1 - (d.v - min) / span) * innerH,
      t: d.t,
      v: d.v,
    }));
    return { min, max, pts };
  }

  // Catmull-Rom → cubic Bézier for a smooth line through every point.
  function smoothPath(pts) {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  function drawGrid() {
    gridLines.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const y = PAD_TOP + ((H - PAD_TOP - PAD_BOTTOM) / 4) * i;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "0");
      line.setAttribute("x2", String(W));
      line.setAttribute("y1", y.toFixed(1));
      line.setAttribute("y2", y.toFixed(1));
      gridLines.appendChild(line);
    }
  }

  function fmtTick(ts, key) {
    const d = new Date(ts);
    if (key === "1H" || key === "1D") {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    if (key === "1W" || key === "1M") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }

  function drawLabels(data, key) {
    chartLabels.innerHTML = "";
    const idxs = [0, Math.floor(data.length / 3), Math.floor((2 * data.length) / 3), data.length - 1];
    for (const i of idxs) {
      const span = document.createElement("span");
      span.textContent = fmtTick(data[i].t, key);
      chartLabels.appendChild(span);
    }
  }

  /* ---------- animated number ---------- */

  let valueAnim = null;
  function animateValue(from, to) {
    cancelAnimationFrame(valueAnim);
    const dur = 600;
    const start = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      bigValue.textContent = fmtUSD(from + (to - from) * ease(p));
      if (p < 1) valueAnim = requestAnimationFrame(tick);
    };
    valueAnim = requestAnimationFrame(tick);
  }

  /* ---------- render range ---------- */

  let lastShownValue = CURRENT_VALUE;

  function renderRange(key, animate = true) {
    const data = getSeries(key);
    const { min, max, pts } = project(data);
    current = { key, data, min, max, pts };

    const d = smoothPath(pts);
    linePath.setAttribute("d", d);
    areaPath.setAttribute(
      "d",
      `${d} L ${W} ${H} L 0 ${H} Z`
    );

    // PnL vs the first point of the range
    const open = data[0].v;
    const close = data[data.length - 1].v;
    const abs = close - open;
    const pct = (abs / open) * 100;
    const pos = abs >= 0;

    pnlRow.classList.toggle("is-pos", pos);
    pnlRow.classList.toggle("is-neg", !pos);
    pnlAbs.textContent = (pos ? "+" : "−") + fmtUSD(Math.abs(abs));
    pnlPctText.textContent = (pos ? "+" : "−") + Math.abs(pct).toFixed(2) + "%";
    pnlRangeLabel.textContent = RANGES[key].label;

    animateValue(lastShownValue, close);
    lastShownValue = close;

    drawLabels(data, key);
    hideCrosshair();

    if (animate) {
      const len = linePath.getTotalLength();
      linePath.style.transition = "none";
      linePath.style.strokeDasharray = `${len}`;
      linePath.style.strokeDashoffset = `${len}`;
      areaPath.style.transition = "none";
      areaPath.style.opacity = "0";
      // force reflow, then animate draw-in
      linePath.getBoundingClientRect();
      linePath.style.transition = "stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)";
      linePath.style.strokeDashoffset = "0";
      areaPath.style.transition = "opacity 0.7s ease 0.35s";
      areaPath.style.opacity = "1";
      linePath.addEventListener(
        "transitionend",
        () => {
          linePath.style.strokeDasharray = "none";
        },
        { once: true }
      );
    }
  }

  /* ---------- crosshair / tooltip ---------- */

  function fmtTooltipDate(ts, key) {
    const d = new Date(ts);
    if (key === "1H" || key === "1D") {
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function showCrosshair(clientX) {
    const rect = chart.getBoundingClientRect();
    const xRatio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const pts = current.pts;
    const i = Math.round(xRatio * (pts.length - 1));
    const p = pts[i];
    if (!p) return;

    crossLine.setAttribute("x1", p.x.toFixed(2));
    crossLine.setAttribute("x2", p.x.toFixed(2));
    crossDot.setAttribute("cx", p.x.toFixed(2));
    crossDot.setAttribute("cy", p.y.toFixed(2));
    crossDotHalo.setAttribute("cx", p.x.toFixed(2));
    crossDotHalo.setAttribute("cy", p.y.toFixed(2));
    crosshair.style.opacity = "1";

    tipValue.textContent = fmtUSD(p.v);
    tipDate.textContent = fmtTooltipDate(p.t, current.key);
    tooltip.hidden = false;

    // position tooltip in CSS pixels, clamped inside the wrap
    const pxX = (p.x / W) * rect.width;
    const pxY = (p.y / H) * rect.height;
    const tw = tooltip.offsetWidth;
    const clampedX = Math.min(rect.width - tw / 2 - 4, Math.max(tw / 2 + 4, pxX));
    const above = pxY > 70;
    tooltip.style.left = `${clampedX}px`;
    tooltip.style.top = `${above ? pxY - tooltip.offsetHeight - 18 : pxY + 18}px`;
  }

  function hideCrosshair() {
    crosshair.style.opacity = "0";
    tooltip.hidden = true;
  }

  chartWrap.addEventListener("pointermove", (e) => showCrosshair(e.clientX));
  chartWrap.addEventListener("pointerdown", (e) => showCrosshair(e.clientX));
  chartWrap.addEventListener("pointerleave", hideCrosshair);

  /* ---------- range tabs ---------- */

  const tabs = Array.from(document.querySelectorAll(".range-tab"));
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("is-active")) return;
      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      renderRange(tab.dataset.range);
      toast(`Range → ${tab.dataset.range} (mock data)`);
    });
  });

  // arrow-key navigation on the tablist
  document.querySelector(".range-tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.classList.contains("is-active"));
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    next.click();
  });

  /* ---------- refresh (simulated) ---------- */

  refreshBtn.addEventListener("click", () => {
    refreshBtn.classList.add("is-spinning");
    refreshBtn.disabled = true;
    setTimeout(() => {
      refreshBtn.classList.remove("is-spinning");
      refreshBtn.disabled = false;
      renderRange(current.key);
      toast("Portfolio refreshed — simulated snapshot");
    }, 900);
  });

  /* ---------- init ---------- */

  drawGrid();
  lastShownValue = getSeries("1W")[0].v; // count up from the range open on first paint
  renderRange("1W");
})();
