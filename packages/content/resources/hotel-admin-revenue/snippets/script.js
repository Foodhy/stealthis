// ── Toast helper ─────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Dataset ───────────────────────────────────────────────────────────────────
// Each dataset keyed by propertyId + rangeId.
// days: label, revenue (€), occupancy (%)
// segments: name, amount (€), cssClass
// roomTypes: name, rooms, occ, adr, revenue

const DATASETS = {
  "mad-w1": {
    property: "Aurelia Madrid",
    period: "9–15 Jun 2026",
    totalRooms: 210,
    days: [
      { label: "Mon 9", revenue: 41200, occupancy: 82 },
      { label: "Tue 10", revenue: 38600, occupancy: 78 },
      { label: "Wed 11", revenue: 43800, occupancy: 88 },
      { label: "Thu 12", revenue: 46200, occupancy: 91 },
      { label: "Fri 13", revenue: 51400, occupancy: 96 },
      { label: "Sat 14", revenue: 54100, occupancy: 98 },
      { label: "Sun 15", revenue: 39700, occupancy: 80 },
    ],
    segments: [
      { name: "Corporate", amount: 108200, cls: "fill-corporate" },
      { name: "Leisure", amount: 92400, cls: "fill-leisure" },
      { name: "Groups", amount: 52600, cls: "fill-groups" },
      { name: "OTA", amount: 41800, cls: "fill-ota" },
      { name: "Direct", amount: 20000, cls: "fill-direct" },
    ],
    roomTypes: [
      { name: "Signature Suite", rooms: 14, occ: 98, adr: 658, revenue: 64484 },
      { name: "Junior Suite", rooms: 28, occ: 95, adr: 412, revenue: 109564 },
      { name: "Deluxe Double", rooms: 80, occ: 91, adr: 248, revenue: 143416 },
      { name: "Superior Twin", rooms: 60, occ: 86, adr: 194, revenue: 100128 },
      { name: "Classic Room", rooms: 28, occ: 74, adr: 154, revenue: 30044 },
    ],
    prevOcc: 79,
    prevAdr: 262,
    prevRev: 293400,
  },
  "mad-w2": {
    property: "Aurelia Madrid",
    period: "2–8 Jun 2026",
    totalRooms: 210,
    days: [
      { label: "Mon 2", revenue: 36200, occupancy: 74 },
      { label: "Tue 3", revenue: 34800, occupancy: 71 },
      { label: "Wed 4", revenue: 37600, occupancy: 76 },
      { label: "Thu 5", revenue: 40100, occupancy: 82 },
      { label: "Fri 6", revenue: 46000, occupancy: 90 },
      { label: "Sat 7", revenue: 48200, occupancy: 92 },
      { label: "Sun 8", revenue: 34900, occupancy: 71 },
    ],
    segments: [
      { name: "Corporate", amount: 95600, cls: "fill-corporate" },
      { name: "Leisure", amount: 78200, cls: "fill-leisure" },
      { name: "Groups", amount: 38400, cls: "fill-groups" },
      { name: "OTA", amount: 37800, cls: "fill-ota" },
      { name: "Direct", amount: 17800, cls: "fill-direct" },
    ],
    roomTypes: [
      { name: "Signature Suite", rooms: 14, occ: 90, adr: 640, revenue: 56448 },
      { name: "Junior Suite", rooms: 28, occ: 86, adr: 395, revenue: 94556 },
      { name: "Deluxe Double", rooms: 80, occ: 80, adr: 232, revenue: 118272 },
      { name: "Superior Twin", rooms: 60, occ: 75, adr: 180, revenue: 85050 },
      { name: "Classic Room", rooms: 28, occ: 64, adr: 146, revenue: 27453 },
    ],
    prevOcc: 76,
    prevAdr: 248,
    prevRev: 258400,
  },
  "mad-w3": {
    property: "Aurelia Madrid",
    period: "26 May–1 Jun 2026",
    totalRooms: 210,
    days: [
      { label: "Mon 26", revenue: 32100, occupancy: 66 },
      { label: "Tue 27", revenue: 30400, occupancy: 63 },
      { label: "Wed 28", revenue: 33800, occupancy: 69 },
      { label: "Thu 29", revenue: 37200, occupancy: 76 },
      { label: "Fri 30", revenue: 43600, occupancy: 86 },
      { label: "Sat 31", revenue: 46100, occupancy: 89 },
      { label: "Sun 1", revenue: 30600, occupancy: 63 },
    ],
    segments: [
      { name: "Corporate", amount: 88200, cls: "fill-corporate" },
      { name: "Leisure", amount: 70400, cls: "fill-leisure" },
      { name: "Groups", amount: 32000, cls: "fill-groups" },
      { name: "OTA", amount: 29600, cls: "fill-ota" },
      { name: "Direct", amount: 13600, cls: "fill-direct" },
    ],
    roomTypes: [
      { name: "Signature Suite", rooms: 14, occ: 82, adr: 616, revenue: 47414 },
      { name: "Junior Suite", rooms: 28, occ: 79, adr: 378, revenue: 83584 },
      { name: "Deluxe Double", rooms: 80, occ: 74, adr: 218, revenue: 102466 },
      { name: "Superior Twin", rooms: 60, occ: 68, adr: 166, revenue: 67603 },
      { name: "Classic Room", rooms: 28, occ: 56, adr: 138, revenue: 20741 },
    ],
    prevOcc: 64,
    prevAdr: 228,
    prevRev: 219600,
  },
  "bcn-w1": {
    property: "Aurelia Barcelona",
    period: "9–15 Jun 2026",
    totalRooms: 180,
    days: [
      { label: "Mon 9", revenue: 38200, occupancy: 80 },
      { label: "Tue 10", revenue: 36000, occupancy: 76 },
      { label: "Wed 11", revenue: 40400, occupancy: 86 },
      { label: "Thu 12", revenue: 43200, occupancy: 89 },
      { label: "Fri 13", revenue: 49000, occupancy: 94 },
      { label: "Sat 14", revenue: 52600, occupancy: 97 },
      { label: "Sun 15", revenue: 37400, occupancy: 78 },
    ],
    segments: [
      { name: "Corporate", amount: 98000, cls: "fill-corporate" },
      { name: "Leisure", amount: 88400, cls: "fill-leisure" },
      { name: "Groups", amount: 48200, cls: "fill-groups" },
      { name: "OTA", amount: 44800, cls: "fill-ota" },
      { name: "Direct", amount: 17400, cls: "fill-direct" },
    ],
    roomTypes: [
      { name: "Terrace Suite", rooms: 12, occ: 97, adr: 690, revenue: 56448 },
      { name: "Junior Suite", rooms: 24, occ: 94, adr: 430, revenue: 86640 },
      { name: "Deluxe Sea View", rooms: 60, occ: 88, adr: 262, revenue: 97354 },
      { name: "Superior Room", rooms: 58, occ: 82, adr: 196, revenue: 65774 },
      { name: "Classic Room", rooms: 26, occ: 72, adr: 162, revenue: 21258 },
    ],
    prevOcc: 77,
    prevAdr: 274,
    prevRev: 270800,
  },
};

// Provide fallbacks for bcn-w2, bcn-w3, lis-*, sev-* (reuse mad data with minor tweaks)
["bcn", "lis", "sev"].forEach((p) => {
  ["w2", "w3"].forEach((w) => {
    const base = DATASETS[`mad-${w}`];
    const scaleFactor = p === "bcn" ? 0.92 : p === "lis" ? 0.78 : 0.65;
    DATASETS[`${p}-${w}`] = {
      ...base,
      property: { bcn: "Aurelia Barcelona", lis: "Aurelia Lisbon", sev: "Aurelia Seville" }[p],
      totalRooms: { bcn: 180, lis: 150, sev: 120 }[p],
      days: base.days.map((d) => ({
        ...d,
        revenue: Math.round(d.revenue * scaleFactor),
        occupancy: Math.min(99, Math.round(d.occupancy * (scaleFactor + 0.05))),
      })),
      segments: base.segments.map((s) => ({
        ...s,
        amount: Math.round(s.amount * scaleFactor),
      })),
      roomTypes: base.roomTypes.map((r) => ({
        ...r,
        revenue: Math.round(r.revenue * scaleFactor),
        adr: Math.round(r.adr * scaleFactor),
        occ: Math.min(99, Math.round(r.occ * (scaleFactor + 0.04))),
      })),
      prevRev: Math.round(base.prevRev * scaleFactor),
    };
  });
});
["lis", "sev"].forEach((p) => {
  const base = DATASETS[`bcn-w1`];
  const scaleFactor = p === "lis" ? 0.78 : 0.65;
  DATASETS[`${p}-w1`] = {
    ...base,
    property: { lis: "Aurelia Lisbon", sev: "Aurelia Seville" }[p],
    totalRooms: { lis: 150, sev: 120 }[p],
    days: base.days.map((d) => ({
      ...d,
      revenue: Math.round(d.revenue * scaleFactor),
      occupancy: Math.min(99, Math.round(d.occupancy * (scaleFactor + 0.08))),
    })),
    segments: base.segments.map((s) => ({
      ...s,
      amount: Math.round(s.amount * scaleFactor),
    })),
    roomTypes: base.roomTypes.map((r) => ({
      ...r,
      revenue: Math.round(r.revenue * scaleFactor),
      adr: Math.round(r.adr * scaleFactor),
      occ: Math.min(99, Math.round(r.occ * scaleFactor)),
    })),
    prevRev: Math.round(base.prevRev * scaleFactor),
  };
});

// ── State ─────────────────────────────────────────────────────────────────────
let currentMetric = "revenue"; // "revenue" | "occupancy"

function getKey() {
  const prop = document.getElementById("propSelect").value;
  const range = document.getElementById("rangeSelect").value;
  return `${prop}-${range}`;
}

function getDataset() {
  return DATASETS[getKey()] || DATASETS["mad-w1"];
}

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtEuro(n) {
  if (n >= 1000000) return "€" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "€" + (n / 1000).toFixed(0) + "k";
  return "€" + n.toLocaleString("en-GB");
}
function fmtPct(n) {
  return n.toFixed(1) + "%";
}
function trendArrow(val, prev, suffix) {
  const diff = val - prev;
  const sign = diff > 0 ? "▲" : diff < 0 ? "▼" : "–";
  const cls = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
  const abs = Math.abs(diff);
  return { html: `${sign} ${abs}${suffix} vs prev period`, cls };
}

// ── KPI render ────────────────────────────────────────────────────────────────
function renderKPIs(ds) {
  const totalRev = ds.days.reduce((s, d) => s + d.revenue, 0);
  const avgOcc = ds.days.reduce((s, d) => s + d.occupancy, 0) / 7;
  const roomsSold = Math.round((avgOcc / 100) * ds.totalRooms * 7);
  // ADR = totalRev / roomsSold
  const adr = totalRev / roomsSold;
  // RevPAR = totalRev / (totalRooms * 7)
  const revpar = totalRev / (ds.totalRooms * 7);

  // Occupancy KPI
  document.getElementById("kpiOcc").textContent = fmtPct(avgOcc);
  document.getElementById("subOcc").textContent = `${roomsSold.toLocaleString()} rooms sold`;
  const tOcc = trendArrow(avgOcc, ds.prevOcc, "%");
  const tOccEl = document.getElementById("trendOcc");
  tOccEl.textContent = tOcc.html;
  tOccEl.className = "kpi-trend " + tOcc.cls;

  // ADR KPI
  document.getElementById("kpiAdr").textContent = "€" + Math.round(adr).toLocaleString("en-GB");
  document.getElementById("subAdr").textContent = "avg daily rate";
  const tAdr = trendArrow(Math.round(adr), ds.prevAdr, "€");
  const tAdrEl = document.getElementById("trendAdr");
  tAdrEl.textContent = tAdr.html;
  tAdrEl.className = "kpi-trend " + tAdr.cls;

  // RevPAR KPI
  document.getElementById("kpiRevpar").textContent =
    "€" + Math.round(revpar).toLocaleString("en-GB");
  document.getElementById("subRevpar").textContent = "rev per avail room";
  const prevRevpar = ds.prevRev / (ds.totalRooms * 7);
  const tRevpar = trendArrow(Math.round(revpar), Math.round(prevRevpar), "€");
  const tRevparEl = document.getElementById("trendRevpar");
  tRevparEl.textContent = tRevpar.html;
  tRevparEl.className = "kpi-trend " + tRevpar.cls;

  // Total Revenue KPI
  document.getElementById("kpiRev").textContent = fmtEuro(totalRev);
  document.getElementById("subRev").textContent = "7-day period";
  const tRev = trendArrow(totalRev, ds.prevRev, "€");
  const tRevEl = document.getElementById("trendRev");
  tRevEl.textContent = tRev.html;
  tRevEl.className = "kpi-trend " + tRev.cls;
}

// ── Bar chart render ──────────────────────────────────────────────────────────
function renderChart(ds) {
  const chart = document.getElementById("barChart");
  const legend = document.getElementById("chartLegend");

  const values = ds.days.map((d) => (currentMetric === "revenue" ? d.revenue : d.occupancy));
  const maxVal = Math.max(...values);

  // Update titles
  document.getElementById("chartTitle").textContent =
    currentMetric === "revenue" ? "Daily Revenue" : "Daily Occupancy";
  document.getElementById("chartSub").textContent = `${ds.period} · ${ds.property}`;

  // Build / update bars
  const todayLabel = "Thu 12"; // fixed reference for "today" highlight

  if (chart.children.length !== ds.days.length) {
    // Initial render — create DOM nodes
    chart.innerHTML = "";
    legend.innerHTML = "";
    ds.days.forEach((d, i) => {
      const wrap = document.createElement("div");
      wrap.className = "bar-wrap";

      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = "4px"; // start collapsed for animation
      wrap.appendChild(bar);
      chart.appendChild(wrap);

      const lbl = document.createElement("div");
      lbl.className = "legend-day" + (d.label === todayLabel ? " today" : "");
      lbl.textContent = d.label.split(" ")[0]; // just the day name
      legend.appendChild(lbl);
    });
  }

  // Animate bar heights
  const bars = chart.querySelectorAll(".bar");
  bars.forEach((bar, i) => {
    const pct = maxVal > 0 ? (values[i] / maxVal) * 100 : 0;
    const heightPx = Math.max(4, Math.round((pct / 100) * 168));

    // Reset to 0 first so transition fires on re-render
    bar.style.transition = "none";
    bar.style.height = "4px";
    bar.className = "bar " + (currentMetric === "revenue" ? "bar-revenue" : "bar-occupancy");

    const tip =
      currentMetric === "revenue" ? `€${values[i].toLocaleString("en-GB")}` : `${values[i]}% occ`;
    bar.setAttribute("data-tip", ds.days[i].label + ": " + tip);

    // Use rAF double-tap to let the reset paint before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = "";
        bar.style.height = heightPx + "px";
      });
    });
  });
}

// ── Segments render ───────────────────────────────────────────────────────────
function renderSegments(ds) {
  const total = ds.segments.reduce((s, seg) => s + seg.amount, 0);
  const list = document.getElementById("segList");
  list.innerHTML = "";

  // Sort descending
  const sorted = [...ds.segments].sort((a, b) => b.amount - a.amount);

  sorted.forEach((seg) => {
    const pct = total > 0 ? (seg.amount / total) * 100 : 0;

    const row = document.createElement("div");
    row.className = "seg-row";
    row.innerHTML = `
      <div class="seg-info">
        <span class="seg-name">${seg.name}</span>
        <span class="seg-amount">${fmtEuro(seg.amount)}<span class="seg-pct">${pct.toFixed(0)}%</span></span>
      </div>
      <div class="seg-bar-track">
        <div class="seg-bar-fill ${seg.cls}" style="width:0%"></div>
      </div>
    `;
    list.appendChild(row);
  });

  document.getElementById("segSub").textContent = `${ds.period} · Total ${fmtEuro(total)}`;

  // Animate bar widths
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      list.querySelectorAll(".seg-bar-fill").forEach((fill, i) => {
        const pct = total > 0 ? (sorted[i].amount / total) * 100 : 0;
        fill.style.transition = "width 0.45s cubic-bezier(0.34,1.3,0.64,1)";
        fill.style.width = pct.toFixed(1) + "%";
      });
    });
  });
}

// ── Room types table ──────────────────────────────────────────────────────────
function renderRoomTypes(ds) {
  const tbody = document.getElementById("rtBody");
  tbody.innerHTML = "";

  const sorted = [...ds.roomTypes].sort((a, b) => b.revenue - a.revenue);

  sorted.forEach((rt) => {
    const occClass = rt.occ >= 90 ? "occ-good" : rt.occ >= 75 ? "occ-mid" : "occ-low";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="room-name">${rt.name}</td>
      <td class="num">${rt.rooms}</td>
      <td class="num ${occClass}">${rt.occ}%</td>
      <td class="num">€${rt.adr}</td>
      <td class="num">€${rt.revenue.toLocaleString("en-GB")}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("tableSubHead").textContent = `Performance · ${ds.period}`;
}

// ── Snapshot items ────────────────────────────────────────────────────────────
function renderSnap(ds) {
  const totalRev = ds.days.reduce((s, d) => s + d.revenue, 0);
  const avgOcc = ds.days.reduce((s, d) => s + d.occupancy, 0) / 7;
  const roomsSold = Math.round((avgOcc / 100) * ds.totalRooms * 7);
  const adr = totalRev / roomsSold;
  const revpar = totalRev / (ds.totalRooms * 7);
  const peakDay = ds.days.reduce((best, d) => (d.revenue > best.revenue ? d : best), ds.days[0]);
  const peakOcc = ds.days.reduce(
    (best, d) => (d.occupancy > best.occupancy ? d : best),
    ds.days[0]
  );

  const items = [
    { label: "Total Rooms", val: ds.totalRooms },
    { label: "Rooms Sold", val: roomsSold.toLocaleString() },
    { label: "RevPAR", val: "€" + Math.round(revpar) },
    { label: "ADR", val: "€" + Math.round(adr) },
    { label: "Peak Rev Day", val: peakDay.label },
    { label: "Peak Occ Day", val: peakOcc.label },
    { label: "Prev Period Rev", val: fmtEuro(ds.prevRev) },
    {
      label: "Revenue Growth",
      val: (((totalRev - ds.prevRev) / ds.prevRev) * 100).toFixed(1) + "%",
    },
  ];

  const grid = document.getElementById("snapGrid");
  grid.innerHTML = "";
  items.forEach((it) => {
    const el = document.createElement("div");
    el.className = "snap-item";
    el.innerHTML = `<div class="snap-label">${it.label}</div><div class="snap-val">${it.val}</div>`;
    grid.appendChild(el);
  });
}

// ── Full render ───────────────────────────────────────────────────────────────
function renderAll() {
  const ds = getDataset();
  renderKPIs(ds);
  renderChart(ds);
  renderSegments(ds);
  renderRoomTypes(ds);
  renderSnap(ds);
}

// ── Controls ──────────────────────────────────────────────────────────────────
document.getElementById("propSelect").addEventListener("change", () => {
  const ds = getDataset();
  showToast(`Switched to ${ds.property}`);
  renderAll();
});
document.getElementById("rangeSelect").addEventListener("change", () => {
  const ds = getDataset();
  showToast(`Period: ${ds.period}`);
  renderAll();
});

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMetric = btn.dataset.metric;
    renderChart(getDataset());
  });
});

// ── Timestamp clock ───────────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById("topbarTs");
  const now = new Date();
  el.textContent = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
setInterval(updateClock, 1000);
updateClock();

// ── Init ──────────────────────────────────────────────────────────────────────
renderAll();
