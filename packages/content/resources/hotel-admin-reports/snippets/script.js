// ── Mock datasets ─────────────────────────────────────────────────────────────

const DATASETS = {
  occupancy: {
    chartTitle: "Occupancy: Actuals vs Forecast",
    tableTitle: "Weekly occupancy breakdown",
    yUnit: "%",
    yMax: 100,
    cols: ["Week", "Actual %", "Forecast %", "Variance", "Rooms sold", "RNs avail."],
    kpis: [
      { label: "Avg occupancy", value: "81", unit: "%", trend: "up", delta: "▲ 3.1% vs LY" },
      { label: "Forecast peak", value: "94", unit: "%", trend: "up", delta: "Week of 22 Jun" },
      { label: "Booked RNs", value: "1,764", unit: "", trend: "up", delta: "▲ 214 vs LY" },
      { label: "Pickup (7d)", value: "+38", unit: " RNs", trend: "up", delta: "▲ vs 7d ago" },
    ],
    weeks7: [
      { label: "9–15 Jun", actual: 81, forecast: 83, rooms: 243, avail: 300 },
      { label: "16–22 Jun", actual: 76, forecast: 80, rooms: 228, avail: 300 },
      { label: "23–29 Jun", actual: null, forecast: 88, rooms: null, avail: 300 },
      { label: "30 Jun–6 Jul", actual: null, forecast: 91, rooms: null, avail: 300 },
      { label: "7–13 Jul", actual: null, forecast: 94, rooms: null, avail: 300 },
      { label: "14–20 Jul", actual: null, forecast: 89, rooms: null, avail: 300 },
      { label: "21–27 Jul", actual: null, forecast: 85, rooms: null, avail: 300 },
    ],
    weeks30: [
      { label: "Jun wk 1", actual: 81, forecast: 83, rooms: 243, avail: 300 },
      { label: "Jun wk 2", actual: 76, forecast: 80, rooms: 228, avail: 300 },
      { label: "Jun wk 3", actual: null, forecast: 88, rooms: null, avail: 300 },
      { label: "Jun wk 4", actual: null, forecast: 91, rooms: null, avail: 300 },
      { label: "Jul wk 1", actual: null, forecast: 94, rooms: null, avail: 300 },
      { label: "Jul wk 2", actual: null, forecast: 89, rooms: null, avail: 300 },
      { label: "Jul wk 3", actual: null, forecast: 87, rooms: null, avail: 300 },
      { label: "Jul wk 4", actual: null, forecast: 84, rooms: null, avail: 300 },
    ],
    weeks90: [
      { label: "Jun wk 1", actual: 81, forecast: 83, rooms: 243, avail: 300 },
      { label: "Jun wk 2", actual: 76, forecast: 80, rooms: 228, avail: 300 },
      { label: "Jun wk 3", actual: null, forecast: 88, rooms: null, avail: 300 },
      { label: "Jun wk 4", actual: null, forecast: 91, rooms: null, avail: 300 },
      { label: "Jul wk 1", actual: null, forecast: 94, rooms: null, avail: 300 },
      { label: "Jul wk 2", actual: null, forecast: 89, rooms: null, avail: 300 },
      { label: "Jul wk 3", actual: null, forecast: 87, rooms: null, avail: 300 },
      { label: "Aug wk 1", actual: null, forecast: 90, rooms: null, avail: 300 },
      { label: "Aug wk 2", actual: null, forecast: 93, rooms: null, avail: 300 },
      { label: "Aug wk 3", actual: null, forecast: 88, rooms: null, avail: 300 },
      { label: "Sep wk 1", actual: null, forecast: 79, rooms: null, avail: 300 },
      { label: "Sep wk 2", actual: null, forecast: 74, rooms: null, avail: 300 },
    ],
  },
  pickup: {
    chartTitle: "Pickup: Reservations booked per window",
    tableTitle: "Pickup report — bookings by window",
    yUnit: " RNs",
    yMax: 120,
    cols: ["Week", "0–7d pickup", "8–30d pickup", "31–90d pickup", "Total RNs", "vs LY"],
    kpis: [
      { label: "7-day pickup", value: "38", unit: " RNs", trend: "up", delta: "▲ 12 vs LY" },
      { label: "30-day pickup", value: "142", unit: " RNs", trend: "up", delta: "▲ 29 vs LY" },
      { label: "90-day pickup", value: "318", unit: " RNs", trend: "neutral", delta: "≈ LY pace" },
      { label: "Avg lead time", value: "22", unit: " days", trend: "up", delta: "▲ 4d vs LY" },
    ],
    weeks7: [
      { label: "9–15 Jun", a: 38, b: 62, c: 48, total: 148 },
      { label: "16–22 Jun", a: 24, b: 71, c: 53, total: 148 },
      { label: "23–29 Jun", a: 31, b: 58, c: 60, total: 149 },
      { label: "30 Jun–6 Jul", a: 18, b: 80, c: 72, total: 170 },
      { label: "7–13 Jul", a: 12, b: 88, c: 82, total: 182 },
      { label: "14–20 Jul", a: 9, b: 76, c: 78, total: 163 },
      { label: "21–27 Jul", a: 7, b: 70, c: 64, total: 141 },
    ],
    weeks30: [
      { label: "Jun wk 1", a: 38, b: 62, c: 48, total: 148 },
      { label: "Jun wk 2", a: 24, b: 71, c: 53, total: 148 },
      { label: "Jun wk 3", a: 31, b: 58, c: 60, total: 149 },
      { label: "Jun wk 4", a: 18, b: 80, c: 72, total: 170 },
      { label: "Jul wk 1", a: 12, b: 88, c: 82, total: 182 },
      { label: "Jul wk 2", a: 9, b: 76, c: 78, total: 163 },
      { label: "Jul wk 3", a: 7, b: 70, c: 64, total: 141 },
      { label: "Jul wk 4", a: 14, b: 64, c: 55, total: 133 },
    ],
    weeks90: [
      { label: "Jun wk 1", a: 38, b: 62, c: 48, total: 148 },
      { label: "Jun wk 2", a: 24, b: 71, c: 53, total: 148 },
      { label: "Jun wk 3", a: 31, b: 58, c: 60, total: 149 },
      { label: "Jun wk 4", a: 18, b: 80, c: 72, total: 170 },
      { label: "Jul wk 1", a: 12, b: 88, c: 82, total: 182 },
      { label: "Jul wk 2", a: 9, b: 76, c: 78, total: 163 },
      { label: "Jul wk 3", a: 7, b: 70, c: 64, total: 141 },
      { label: "Aug wk 1", a: 14, b: 64, c: 55, total: 133 },
      { label: "Aug wk 2", a: 22, b: 58, c: 70, total: 150 },
      { label: "Aug wk 3", a: 18, b: 74, c: 65, total: 157 },
      { label: "Sep wk 1", a: 6, b: 62, c: 52, total: 120 },
      { label: "Sep wk 2", a: 4, b: 54, c: 46, total: 104 },
    ],
  },
  pace: {
    chartTitle: "Pace: On-the-books vs same time last year",
    tableTitle: "Pace comparison — OTB vs LY",
    yUnit: " RNs",
    yMax: 300,
    cols: ["Week", "OTB rooms", "LY rooms", "Variance", "OTB ADR", "Pace index"],
    kpis: [
      { label: "OTB rooms (total)", value: "1,764", unit: "", trend: "up", delta: "▲ 214 vs LY" },
      { label: "OTB revenue", value: "€324k", unit: "", trend: "up", delta: "▲ 11.2% vs LY" },
      { label: "OTB ADR", value: "€184", unit: "", trend: "up", delta: "▲ €6.40 vs LY" },
      { label: "Pace index", value: "1.14", unit: "", trend: "up", delta: "Above LY pace" },
    ],
    weeks7: [
      { label: "9–15 Jun", otb: 243, ly: 218, adr: 184, idx: 1.11 },
      { label: "16–22 Jun", otb: 228, ly: 201, adr: 178, idx: 1.13 },
      { label: "23–29 Jun", otb: 264, ly: 231, adr: 192, idx: 1.14 },
      { label: "30 Jun–6 Jul", otb: 273, ly: 240, adr: 196, idx: 1.14 },
      { label: "7–13 Jul", otb: 282, ly: 248, adr: 202, idx: 1.14 },
      { label: "14–20 Jul", otb: 267, ly: 234, adr: 198, idx: 1.14 },
      { label: "21–27 Jul", otb: 255, ly: 222, adr: 190, idx: 1.15 },
    ],
    weeks30: [
      { label: "Jun wk 1", otb: 243, ly: 218, adr: 184, idx: 1.11 },
      { label: "Jun wk 2", otb: 228, ly: 201, adr: 178, idx: 1.13 },
      { label: "Jun wk 3", otb: 264, ly: 231, adr: 192, idx: 1.14 },
      { label: "Jun wk 4", otb: 273, ly: 240, adr: 196, idx: 1.14 },
      { label: "Jul wk 1", otb: 282, ly: 248, adr: 202, idx: 1.14 },
      { label: "Jul wk 2", otb: 267, ly: 234, adr: 198, idx: 1.14 },
      { label: "Jul wk 3", otb: 255, ly: 222, adr: 190, idx: 1.15 },
      { label: "Jul wk 4", otb: 240, ly: 210, adr: 186, idx: 1.14 },
    ],
    weeks90: [
      { label: "Jun wk 1", otb: 243, ly: 218, adr: 184, idx: 1.11 },
      { label: "Jun wk 2", otb: 228, ly: 201, adr: 178, idx: 1.13 },
      { label: "Jun wk 3", otb: 264, ly: 231, adr: 192, idx: 1.14 },
      { label: "Jun wk 4", otb: 273, ly: 240, adr: 196, idx: 1.14 },
      { label: "Jul wk 1", otb: 282, ly: 248, adr: 202, idx: 1.14 },
      { label: "Jul wk 2", otb: 267, ly: 234, adr: 198, idx: 1.14 },
      { label: "Jul wk 3", otb: 255, ly: 222, adr: 190, idx: 1.15 },
      { label: "Aug wk 1", otb: 240, ly: 210, adr: 186, idx: 1.14 },
      { label: "Aug wk 2", otb: 270, ly: 236, adr: 198, idx: 1.14 },
      { label: "Aug wk 3", otb: 264, ly: 231, adr: 193, idx: 1.14 },
      { label: "Sep wk 1", otb: 237, ly: 206, adr: 181, idx: 1.15 },
      { label: "Sep wk 2", otb: 222, ly: 194, adr: 175, idx: 1.14 },
    ],
  },
  source: {
    chartTitle: "Source mix: Revenue by channel",
    tableTitle: "Source mix breakdown",
    yUnit: "k €",
    yMax: 100,
    cols: ["Channel", "RNs", "Revenue", "ADR", "% of total", "vs LY"],
    kpis: [
      { label: "Direct revenue", value: "41", unit: "%", trend: "up", delta: "▲ 3pp vs LY" },
      { label: "OTA share", value: "34", unit: "%", trend: "down", delta: "▼ 2pp vs LY" },
      { label: "Corp & GDS", value: "18", unit: "%", trend: "neutral", delta: "≈ LY" },
      { label: "Channel cost avg", value: "8.4", unit: "%", trend: "down", delta: "▼ 0.6pp vs LY" },
    ],
    channels: [
      { label: "Direct / Web", rns: 724, rev: 133216, adr: 184, pct: 41 },
      { label: "Booking.com", rns: 392, rev: 68600, adr: 175, pct: 21 },
      { label: "Expedia", rns: 210, rev: 36330, adr: 173, pct: 11 },
      { label: "Corporate GDS", rns: 298, rev: 54236, adr: 182, pct: 17 },
      { label: "Travel agent", rns: 98, rev: 18032, adr: 184, pct: 5 },
      { label: "Walk-in / OTA other", rns: 42, rev: 6930, adr: 165, pct: 3 },
      { label: "Group / MICE", rns: 0, rev: 7312, adr: 0, pct: 2 },
    ],
  },
};

// ── State ────────────────────────────────────────────────────────────────────
let activeReport = "occupancy";
let activeDays = 7;

// ── Helpers ──────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const toast = $("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

function getRows() {
  const ds = DATASETS[activeReport];
  if (activeReport === "source") return ds.channels;
  const key = activeDays === 7 ? "weeks7" : activeDays === 30 ? "weeks30" : "weeks90";
  return ds[key];
}

// ── KPI band ─────────────────────────────────────────────────────────────────
function renderKPIs() {
  const ds = DATASETS[activeReport];
  $("kpiBand").innerHTML = ds.kpis
    .map(
      (k) => `
    <article class="kpi">
      <p class="kpi-label">${k.label}</p>
      <p class="kpi-value">${k.value}<small>${k.unit}</small></p>
      <p class="kpi-trend ${k.trend}">${k.delta}</p>
    </article>`
    )
    .join("");
}

// ── Chart ────────────────────────────────────────────────────────────────────
function renderChart() {
  const ds = DATASETS[activeReport];
  const rows = getRows();
  $("chartTitle").textContent = ds.chartTitle;

  // Y-axis labels (5 steps)
  const yMax = ds.yMax;
  $("chartY").innerHTML = [yMax, yMax * 0.75, yMax * 0.5, yMax * 0.25, 0]
    .map((v) => `<span>${Math.round(v)}${ds.yUnit}</span>`)
    .join("");

  // Determine what the two bars represent per report
  const barsEl = $("chartBars");
  const xEl = $("chartX");
  barsEl.innerHTML = "";
  xEl.innerHTML = "";

  rows.forEach((r) => {
    let valA, valB;
    if (activeReport === "occupancy") {
      valA = r.actual;
      valB = r.forecast;
    } else if (activeReport === "pickup") {
      valA = r.a;
      valB = r.b + r.c;
    } else if (activeReport === "pace") {
      valA = r.otb;
      valB = r.ly;
    } else {
      // source — single bar (pct)
      valA = r.pct;
      valB = null;
    }

    const aHeight = valA != null ? (valA / yMax) * 100 : 0;
    const bHeight = valB != null ? (valB / yMax) * 100 : 0;
    const aStyle = `height:${aHeight}%`;
    const bStyle = valB != null ? `height:${bHeight}%` : "";

    const group = document.createElement("div");
    group.className = "bar-group";
    group.innerHTML = `
      <div class="bar bar-actual" style="${aStyle}" title="${r.label} · actual: ${valA}${ds.yUnit}"></div>
      ${valB != null ? `<div class="bar bar-forecast" style="${bStyle}" title="${r.label} · forecast: ${valB}${ds.yUnit}"></div>` : ""}`;
    barsEl.appendChild(group);

    const xLabel = document.createElement("span");
    xLabel.textContent = r.label;
    xEl.appendChild(xLabel);
  });
}

// ── Table ────────────────────────────────────────────────────────────────────
function renderTable() {
  const ds = DATASETS[activeReport];
  const rows = getRows();
  $("tableTitle").textContent = ds.tableTitle;
  $("tableMeta").textContent = `${rows.length} rows`;

  $("tableHead").innerHTML = `<tr>${ds.cols.map((c) => `<th>${c}</th>`).join("")}</tr>`;

  let tbody = "";
  if (activeReport === "occupancy") {
    rows.forEach((r) => {
      const variance = r.actual != null ? r.actual - r.forecast : null;
      const varClass = variance == null ? "muted" : variance >= 0 ? "up" : "down";
      const varText = variance == null ? "—" : (variance >= 0 ? "+" : "") + variance + "%";
      const barActW = r.actual != null ? r.actual : 0;
      const barFcW = r.forecast;
      tbody += `<tr>
        <td>${r.label}</td>
        <td class="mono">${r.actual != null ? r.actual + "%" : "<span class='muted'>—</span>"}</td>
        <td class="mono">${r.forecast}% <span class="bar-inline fc" style="width:${barFcW * 0.5}px"></span></td>
        <td class="${varClass}">${varText}</td>
        <td class="mono">${r.rooms != null ? r.rooms : "<span class='muted'>est. " + Math.round((r.forecast * r.avail) / 100) + "</span>"}</td>
        <td class="mono">${r.avail}</td>
      </tr>`;
    });
  } else if (activeReport === "pickup") {
    rows.forEach((r) => {
      const ly_est = Math.round(r.total * 0.88);
      const varV = r.total - ly_est;
      tbody += `<tr>
        <td>${r.label}</td>
        <td class="mono">${r.a}</td>
        <td class="mono">${r.b}</td>
        <td class="mono">${r.c}</td>
        <td class="mono">${r.total}</td>
        <td class="${varV >= 0 ? "up" : "down"}">${varV >= 0 ? "+" : ""}${varV}</td>
      </tr>`;
    });
  } else if (activeReport === "pace") {
    rows.forEach((r) => {
      const diff = r.otb - r.ly;
      tbody += `<tr>
        <td>${r.label}</td>
        <td class="mono">${r.otb}</td>
        <td class="mono">${r.ly}</td>
        <td class="${diff >= 0 ? "up" : "down"}">${diff >= 0 ? "+" : ""}${diff}</td>
        <td class="mono">€${r.adr}</td>
        <td class="mono">${r.idx.toFixed(2)}</td>
      </tr>`;
    });
  } else {
    rows.forEach((r) => {
      const ly_rev = Math.round(r.rev * 0.89);
      const diff = r.rev - ly_rev;
      tbody += `<tr>
        <td>${r.label}</td>
        <td class="mono">${r.rns > 0 ? r.rns : "—"}</td>
        <td class="mono">€${r.rev.toLocaleString()}</td>
        <td class="mono">${r.adr > 0 ? "€" + r.adr : "—"}</td>
        <td class="mono">${r.pct}% <span class="bar-inline" style="width:${r.pct}px"></span></td>
        <td class="${diff >= 0 ? "up" : "down"}">${diff >= 0 ? "+" : ""}€${Math.abs(diff).toLocaleString()}</td>
      </tr>`;
    });
  }
  $("tableBody").innerHTML = tbody;
}

// ── Full render ──────────────────────────────────────────────────────────────
function render() {
  renderKPIs();
  renderChart();
  renderTable();
}

// ── Clock ────────────────────────────────────────────────────────────────────
function tick() {
  const now = new Date();
  const hhmm = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const wk = now.toLocaleDateString("en-GB", { weekday: "short" });
  $("clock").textContent = `${hhmm} · ${wk}`;
}
tick();
setInterval(tick, 1000);

// ── Event wiring ─────────────────────────────────────────────────────────────
document.querySelectorAll(".rtab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".rtab").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeReport = btn.dataset.report;
    render();
  });
});

document.querySelectorAll(".hz").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".hz").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeDays = Number(btn.dataset.days);
    render();
  });
});

$("btnCSV").addEventListener("click", () => {
  const reportName = document.querySelector(".rtab.is-active").textContent.trim();
  showToast(`Exporting "${reportName}" as CSV…`);
});

$("btnPDF").addEventListener("click", () => {
  const reportName = document.querySelector(".rtab.is-active").textContent.trim();
  showToast(`Generating PDF report for "${reportName}"…`);
});

// ── Init ─────────────────────────────────────────────────────────────────────
render();
