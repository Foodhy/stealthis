// ── Config ───────────────────────────────────────────────────────────────────
const START_DATE = new Date("2026-06-09T00:00:00");
const NUM_DAYS = 14;

// ── Room types ───────────────────────────────────────────────────────────────
const ROOM_TYPES = [
  { code: "STD", name: "Standard Double", physical: 12 },
  { code: "STD", name: "Standard Twin", physical: 8 },
  { code: "DLX", name: "Deluxe Double", physical: 10 },
  { code: "DLX", name: "Deluxe Sea View", physical: 6 },
  { code: "JNR", name: "Junior Suite", physical: 5 },
  { code: "STE", name: "Grand Suite", physical: 3 },
  { code: "STE", name: "Penthouse Suite", physical: 2 },
];

// ── Occupancy seeds (per date index, 0-13) ───────────────────────────────────
const OCC_SEEDS = [0.52, 0.58, 0.7, 0.78, 0.86, 0.92, 0.96, 0.65, 0.6, 0.7, 0.81, 0.88, 0.91, 0.74];

// ── State ────────────────────────────────────────────────────────────────────
// cells[rtIdx][dayIdx] = { allotment, sold, stopSell }
const cells = [];
let dirtySet = new Set(); // "ri-di" keys

// ── Init state ────────────────────────────────────────────────────────────────
function initCells() {
  ROOM_TYPES.forEach((rt, ri) => {
    cells[ri] = [];
    for (let di = 0; di < NUM_DAYS; di++) {
      const occ = OCC_SEEDS[di] + (Math.random() * 0.1 - 0.05);
      const sold = Math.min(rt.physical, Math.round(rt.physical * occ));
      cells[ri][di] = {
        allotment: rt.physical,
        sold: sold,
        stopSell: false,
      };
    }
  });
}

// ── Availability tier ─────────────────────────────────────────────────────────
function avTier(c) {
  if (c.stopSell) return "stop";
  const avail = c.allotment - c.sold;
  if (avail <= 0) return "none";
  if (avail <= 3) return "low";
  return "ok";
}

// ── Date helpers ─────────────────────────────────────────────────────────────
function addDays(d, n) {
  return new Date(d.getTime() + n * 86400000);
}
function fmtDate(d) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function fmtDow(d) {
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

// ── Toast helper ─────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Summary bar ──────────────────────────────────────────────────────────────
function updateSummary() {
  const vis = getVisibleRtIndices();
  let totalAllotment = 0,
    totalSold = 0,
    totalAvail = 0,
    stopSells = 0,
    soldOuts = 0;

  vis.forEach((ri) => {
    for (let di = 0; di < NUM_DAYS; di++) {
      const c = cells[ri][di];
      totalAllotment += c.allotment;
      totalSold += c.sold;
      totalAvail += Math.max(0, c.allotment - c.sold);
      if (c.stopSell) stopSells++;
      if (!c.stopSell && c.allotment - c.sold <= 0) soldOuts++;
    }
  });

  document.getElementById("sumAvailable").textContent = totalAvail;
  document.getElementById("sumSold").textContent = totalSold;
  document.getElementById("sumAllotment").textContent = totalAllotment;
  document.getElementById("sumStopSell").textContent = stopSells;
  document.getElementById("sumSoldOut").textContent = soldOuts;
}

// ── Build thead ──────────────────────────────────────────────────────────────
function buildHead() {
  const gridHead = document.getElementById("gridHead");
  const tr = document.createElement("tr");

  const thCorner = document.createElement("th");
  thCorner.innerHTML = `<span class="th-room-label">Room Type</span>`;
  tr.appendChild(thCorner);

  for (let di = 0; di < NUM_DAYS; di++) {
    const d = addDays(START_DATE, di);
    const dow = fmtDow(d);
    const isWk = d.getDay() === 0 || d.getDay() === 6;
    const th = document.createElement("th");
    th.innerHTML = `<div class="th-inner">
      <span class="th-date">${fmtDate(d)}</span>
      <span class="th-dow${isWk ? " weekend" : ""}">${dow}</span>
    </div>`;
    tr.appendChild(th);
  }
  gridHead.innerHTML = "";
  gridHead.appendChild(tr);
}

// ── Build tbody ──────────────────────────────────────────────────────────────
function buildBody() {
  const gridBody = document.getElementById("gridBody");
  gridBody.innerHTML = "";
  ROOM_TYPES.forEach((rt, ri) => {
    const tr = document.createElement("tr");
    tr.dataset.ri = ri;

    const tdHead = document.createElement("td");
    tdHead.className = "row-head";
    tdHead.innerHTML = `<div class="row-head-inner">
      <div class="row-type-name">${rt.name}</div>
      <div class="row-type-sub">${rt.code} · ${rt.physical} rooms</div>
    </div>`;
    tr.appendChild(tdHead);

    for (let di = 0; di < NUM_DAYS; di++) {
      tr.appendChild(buildCell(ri, di));
    }
    gridBody.appendChild(tr);
  });
}

// ── Build single cell ─────────────────────────────────────────────────────────
function buildCell(ri, di) {
  const c = cells[ri][di];
  const key = `${ri}-${di}`;
  const avail = Math.max(0, c.allotment - c.sold);
  const tier = avTier(c);

  const td = document.createElement("td");
  td.className = "inv-cell";
  td.dataset.ri = ri;
  td.dataset.di = di;
  td.dataset.av = tier;
  if (dirtySet.has(key)) td.classList.add("is-dirty");

  td.innerHTML = cellHTML(c, avail, tier);

  // wire stepper buttons
  td.querySelector(".step-up").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].allotment = Math.min(ROOM_TYPES[ri].physical + 4, c.allotment + 1);
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSummary();
  });
  td.querySelector(".step-dn").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].allotment = Math.max(c.sold, c.allotment - 1);
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSummary();
  });
  td.querySelector(".stop-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].stopSell = !c.stopSell;
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSummary();
    showToast(cells[ri][di].stopSell ? "Stop-sell activated" : "Stop-sell removed");
  });

  return td;
}

// ── Cell inner HTML ───────────────────────────────────────────────────────────
function cellHTML(c, avail, tier) {
  const canStepUp = c.allotment < ROOM_TYPES[0].physical + 4; // loose upper cap
  const canStepDn = c.allotment > c.sold;
  return `<div class="cell-inner">
    <span class="cell-avail${avail === 0 && !c.stopSell ? " zero" : ""}">${c.stopSell ? "—" : avail}</span>
    <span class="cell-sub">${c.sold} sold / ${c.allotment} allot</span>
    ${c.stopSell ? `<span class="cell-stop-badge">Stop-sell</span>` : ""}
    <div class="cell-controls">
      <button class="step-btn step-dn"${c.stopSell || !canStepDn ? " disabled" : ""}>−</button>
      <button class="step-btn step-up"${c.stopSell ? " disabled" : ""}>+</button>
      <button class="stop-btn${c.stopSell ? " active" : ""}" title="Toggle stop-sell">S</button>
    </div>
  </div>`;
}

// ── Refresh single cell in place ──────────────────────────────────────────────
function refreshCell(td, ri, di) {
  const c = cells[ri][di];
  const key = `${ri}-${di}`;
  const avail = Math.max(0, c.allotment - c.sold);
  const tier = avTier(c);
  td.dataset.av = tier;
  td.classList.toggle("is-dirty", dirtySet.has(key));
  td.innerHTML = cellHTML(c, avail, tier);

  // rebind after innerHTML replacement
  td.querySelector(".step-up").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].allotment = Math.min(ROOM_TYPES[ri].physical + 4, c.allotment + 1);
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSummary();
  });
  td.querySelector(".step-dn").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].allotment = Math.max(c.sold, c.allotment - 1);
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSummary();
  });
  td.querySelector(".stop-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].stopSell = !c.stopSell;
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSummary();
    showToast(cells[ri][di].stopSell ? "Stop-sell activated" : "Stop-sell removed");
  });
}

// ── Room type filter ──────────────────────────────────────────────────────────
function getVisibleRtIndices() {
  const f = document.getElementById("filterType").value;
  return ROOM_TYPES.reduce((acc, rt, i) => {
    if (f === "all" || rt.code === f) acc.push(i);
    return acc;
  }, []);
}
function applyFilter() {
  const vis = new Set(getVisibleRtIndices());
  document.querySelectorAll("#gridBody tr[data-ri]").forEach((tr) => {
    tr.style.display = vis.has(parseInt(tr.dataset.ri)) ? "" : "none";
  });
  updateSummary();
}
document.getElementById("filterType").addEventListener("change", applyFilter);

// ── Save ──────────────────────────────────────────────────────────────────────
document.getElementById("saveBtn").addEventListener("click", () => {
  const n = dirtySet.size;
  if (n === 0) {
    showToast("No changes to save");
    return;
  }
  dirtySet.clear();
  document.querySelectorAll(".inv-cell.is-dirty").forEach((td) => td.classList.remove("is-dirty"));
  updateSummary();
  showToast(`${n} allotment change${n !== 1 ? "s" : ""} saved`);
});

// ── Date range label ─────────────────────────────────────────────────────────
function setDateRange() {
  const end = addDays(START_DATE, NUM_DAYS - 1);
  document.getElementById("dateRange").textContent = `${fmtDate(START_DATE)} – ${fmtDate(end)}`;
}

// ── Clock ────────────────────────────────────────────────────────────────────
function tick() {
  const now = new Date();
  const hhmm = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const wk = now.toLocaleDateString("en-GB", { weekday: "short" });
  document.getElementById("clock").textContent = `${hhmm} · ${wk}`;
}
tick();
setInterval(tick, 1000);

// ── Boot ─────────────────────────────────────────────────────────────────────
initCells();
buildHead();
buildBody();
setDateRange();
updateSummary();
