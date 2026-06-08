// ── Config ───────────────────────────────────────────────────────────────────
const START_DATE = new Date("2026-06-09T00:00:00");
const NUM_DAYS = 14;

// ── Room types ───────────────────────────────────────────────────────────────
const ROOM_TYPES = [
  { code: "STD", name: "Standard Double", base: 145 },
  { code: "STD", name: "Standard Twin", base: 140 },
  { code: "DLX", name: "Deluxe Double", base: 185 },
  { code: "DLX", name: "Deluxe Sea View", base: 210 },
  { code: "JNR", name: "Junior Suite", base: 285 },
  { code: "STE", name: "Grand Suite", base: 420 },
  { code: "STE", name: "Penthouse Suite", base: 595 },
];

// ── Occupancy seeds (per date index, 0–13) ───────────────────────────────────
const OCC_SEEDS = [58, 62, 74, 81, 88, 95, 96, 70, 65, 72, 84, 90, 93, 78];

// ── State ────────────────────────────────────────────────────────────────────
// cells[rtIdx][dayIdx] = { rate, occ, minStay, closed }
const cells = [];
let dirtySet = new Set(); // "rtIdx-dayIdx" keys
let selectedSet = new Set(); // same key format

// ── Initialise cell state ────────────────────────────────────────────────────
function initCells() {
  ROOM_TYPES.forEach((rt, ri) => {
    cells[ri] = [];
    for (let di = 0; di < NUM_DAYS; di++) {
      const occ = Math.min(
        100,
        OCC_SEEDS[di] + Math.round((rt.base / 145 - 1) * -8) + Math.round(Math.random() * 6 - 3)
      );
      const rate = rt.base + Math.round((occ - 65) * (rt.base * 0.004));
      // weekend uplift
      const dayOfWeek = new Date(START_DATE.getTime() + di * 86400000).getDay();
      const wkuplift = dayOfWeek === 5 || dayOfWeek === 6 ? Math.round(rt.base * 0.12) : 0;
      cells[ri][di] = {
        rate: Math.round(rate + wkuplift),
        occ: Math.max(20, Math.min(100, occ)),
        minStay: di === 5 || di === 6 || di === 12 || di === 13,
        closed: false,
      };
    }
  });
}

// ── Demand tier from occupancy ────────────────────────────────────────────────
function demandTier(c) {
  if (c.closed) return "closed";
  if (c.occ >= 95) return "peak";
  if (c.occ >= 80) return "high";
  if (c.occ >= 50) return "med";
  return "low";
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

// ── Render helpers ───────────────────────────────────────────────────────────
const gridHead = document.getElementById("gridHead");
const gridBody = document.getElementById("gridBody");
const bulkCount = document.getElementById("bulkCount");
const saveMsg = document.getElementById("saveMsg");
const toast = document.getElementById("toast");

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

function updateSaveBar() {
  saveMsg.textContent =
    dirtySet.size === 0
      ? "No unsaved changes"
      : `${dirtySet.size} unsaved change${dirtySet.size !== 1 ? "s" : ""}`;
}

function updateBulkBar() {
  bulkCount.textContent = `${selectedSet.size} cell${selectedSet.size !== 1 ? "s" : ""} selected`;
}

// ── Build thead ──────────────────────────────────────────────────────────────
function buildHead() {
  const tr = document.createElement("tr");
  // corner cell
  const thCorner = document.createElement("th");
  thCorner.className = "th-room";
  thCorner.innerHTML = `<div class="th-room-inner">
    <input type="checkbox" class="th-room-cb" id="cbAll" title="Select all" />
    <span class="room-label">Room Type</span>
  </div>`;
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

  // select-all checkbox
  document.getElementById("cbAll").addEventListener("change", (e) => {
    const visRt = getVisibleRtIndices();
    if (e.target.checked) {
      visRt.forEach((ri) => {
        for (let di = 0; di < NUM_DAYS; di++) {
          const key = `${ri}-${di}`;
          if (!cells[ri][di].closed) selectedSet.add(key);
        }
      });
    } else {
      selectedSet.clear();
    }
    renderSelected();
    updateBulkBar();
  });
}

// ── Build tbody ──────────────────────────────────────────────────────────────
function buildBody() {
  gridBody.innerHTML = "";
  ROOM_TYPES.forEach((rt, ri) => {
    const tr = document.createElement("tr");
    tr.dataset.ri = ri;

    // row header
    const tdHead = document.createElement("td");
    tdHead.className = "row-head";
    tdHead.innerHTML = `<div class="row-head-inner">
      <input type="checkbox" class="row-cb" data-ri="${ri}" title="Select row" />
      <div>
        <div class="row-type-name">${rt.name}</div>
        <div class="row-type-code">${rt.code}</div>
      </div>
    </div>`;
    tr.appendChild(tdHead);

    // rate cells
    for (let di = 0; di < NUM_DAYS; di++) {
      const td = buildCell(ri, di);
      tr.appendChild(td);
    }
    gridBody.appendChild(tr);
  });

  // row checkboxes
  gridBody.querySelectorAll(".row-cb").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const ri = parseInt(e.target.dataset.ri);
      for (let di = 0; di < NUM_DAYS; di++) {
        const key = `${ri}-${di}`;
        if (e.target.checked && !cells[ri][di].closed) selectedSet.add(key);
        else selectedSet.delete(key);
      }
      renderSelected();
      updateBulkBar();
    });
  });
}

// ── Build a single rate cell ──────────────────────────────────────────────────
function buildCell(ri, di) {
  const c = cells[ri][di];
  const key = `${ri}-${di}`;
  const td = document.createElement("td");
  td.className = "rate-cell";
  td.dataset.ri = ri;
  td.dataset.di = di;
  td.dataset.demand = demandTier(c);
  if (dirtySet.has(key)) td.classList.add("is-dirty");
  if (selectedSet.has(key)) td.classList.add("is-selected");

  td.innerHTML = `<div class="cell-inner">
    <span class="cell-rate">${c.closed ? "Closed" : "€" + c.rate}</span>
    <span class="cell-occ">${c.occ}% occ</span>
    <div class="cell-flags">
      ${c.minStay ? `<span class="cell-flag min">2N min</span>` : ""}
      ${c.closed ? `<span class="cell-flag cls">Closed</span>` : ""}
    </div>
    <div class="cell-controls">
      <button class="cc-btn min-btn${c.minStay ? " active" : ""}" title="Toggle min-stay">M</button>
      <button class="cc-btn cls-btn${c.closed ? " active" : ""}" title="Toggle closed">X</button>
    </div>
  </div>`;

  // click to select / edit
  td.addEventListener("click", (e) => {
    if (e.target.closest(".cc-btn")) return; // handled separately
    if (e.target.closest(".cell-edit-input")) return;
    if (c.closed) return;
    startEdit(td, ri, di);
  });

  // min-stay toggle
  td.querySelector(".min-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].minStay = !cells[ri][di].minStay;
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSaveBar();
    showToast(cells[ri][di].minStay ? "Min-stay set to 2 nights" : "Min-stay removed");
  });

  // closed toggle
  td.querySelector(".cls-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].closed = !cells[ri][di].closed;
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSaveBar();
    showToast(cells[ri][di].closed ? "Cell marked closed" : "Cell reopened");
  });

  return td;
}

// ── Refresh a single cell in place ───────────────────────────────────────────
function refreshCell(td, ri, di) {
  const c = cells[ri][di];
  const key = `${ri}-${di}`;
  td.dataset.demand = demandTier(c);
  td.classList.toggle("is-dirty", dirtySet.has(key));
  td.classList.toggle("is-selected", selectedSet.has(key));

  const inner = td.querySelector(".cell-inner");
  inner.innerHTML = `
    <span class="cell-rate">${c.closed ? "Closed" : "€" + c.rate}</span>
    <span class="cell-occ">${c.occ}% occ</span>
    <div class="cell-flags">
      ${c.minStay ? `<span class="cell-flag min">2N min</span>` : ""}
      ${c.closed ? `<span class="cell-flag cls">Closed</span>` : ""}
    </div>
    <div class="cell-controls">
      <button class="cc-btn min-btn${c.minStay ? " active" : ""}" title="Toggle min-stay">M</button>
      <button class="cc-btn cls-btn${c.closed ? " active" : ""}" title="Toggle closed">X</button>
    </div>`;

  // rebind toggle buttons
  inner.querySelector(".min-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].minStay = !cells[ri][di].minStay;
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSaveBar();
    showToast(cells[ri][di].minStay ? "Min-stay set to 2 nights" : "Min-stay removed");
  });
  inner.querySelector(".cls-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    cells[ri][di].closed = !cells[ri][di].closed;
    dirtySet.add(key);
    refreshCell(td, ri, di);
    updateSaveBar();
    showToast(cells[ri][di].closed ? "Cell marked closed" : "Cell reopened");
  });
}

// ── Inline edit ──────────────────────────────────────────────────────────────
function startEdit(td, ri, di) {
  if (td.querySelector(".cell-edit-input")) return; // already editing
  const c = cells[ri][di];
  const key = `${ri}-${di}`;
  const inner = td.querySelector(".cell-inner");
  const rateEl = inner.querySelector(".cell-rate");

  const input = document.createElement("input");
  input.className = "cell-edit-input";
  input.type = "number";
  input.value = c.rate;
  input.min = 1;
  input.step = 1;

  rateEl.replaceWith(input);
  input.focus();
  input.select();

  function commit() {
    const val = Math.max(1, Math.round(parseFloat(input.value) || c.rate));
    const changed = val !== c.rate;
    cells[ri][di].rate = val;
    if (changed) dirtySet.add(key);
    input.replaceWith(rateEl);
    rateEl.textContent = "€" + val;
    td.dataset.demand = demandTier(cells[ri][di]);
    td.classList.toggle("is-dirty", dirtySet.has(key));
    updateSaveBar();
    if (changed) showToast(`Rate updated → €${val}`);
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      input.replaceWith(rateEl);
    }
  });
  input.addEventListener("blur", commit);
}

// ── Render selected state ─────────────────────────────────────────────────────
function renderSelected() {
  gridBody.querySelectorAll(".rate-cell").forEach((td) => {
    const key = `${td.dataset.ri}-${td.dataset.di}`;
    td.classList.toggle("is-selected", selectedSet.has(key));
  });
}

// ── Bulk apply ───────────────────────────────────────────────────────────────
document.getElementById("bulkApply").addEventListener("click", () => {
  const op = document.getElementById("bulkOp").value;
  const val = parseFloat(document.getElementById("bulkVal").value);
  if (isNaN(val) || val <= 0) {
    showToast("Enter a positive value first");
    return;
  }
  if (selectedSet.size === 0) {
    showToast("Select at least one cell first");
    return;
  }

  selectedSet.forEach((key) => {
    const [ri, di] = key.split("-").map(Number);
    const c = cells[ri][di];
    if (c.closed) return;
    let newRate = c.rate;
    if (op === "raise-pct") newRate = Math.round(c.rate * (1 + val / 100));
    if (op === "lower-pct") newRate = Math.round(c.rate * (1 - val / 100));
    if (op === "raise-amt") newRate = c.rate + Math.round(val);
    if (op === "lower-amt") newRate = c.rate - Math.round(val);
    if (op === "set-amt") newRate = Math.round(val);
    cells[ri][di].rate = Math.max(1, newRate);
    dirtySet.add(key);
  });

  // re-render affected cells
  gridBody.querySelectorAll(".rate-cell").forEach((td) => {
    const key = `${td.dataset.ri}-${td.dataset.di}`;
    if (selectedSet.has(key)) refreshCell(td, parseInt(td.dataset.ri), parseInt(td.dataset.di));
  });
  updateSaveBar();
  showToast(`Bulk applied to ${selectedSet.size} cell${selectedSet.size !== 1 ? "s" : ""}`);
});

// ── Clear selection ──────────────────────────────────────────────────────────
document.getElementById("bulkClear").addEventListener("click", () => {
  selectedSet.clear();
  renderSelected();
  updateBulkBar();
  document.getElementById("cbAll").checked = false;
  gridBody.querySelectorAll(".row-cb").forEach((cb) => (cb.checked = false));
});

// ── Save / discard ───────────────────────────────────────────────────────────
document.getElementById("saveBtn").addEventListener("click", () => {
  const n = dirtySet.size;
  if (n === 0) {
    showToast("Nothing to save");
    return;
  }
  dirtySet.clear();
  gridBody.querySelectorAll(".rate-cell.is-dirty").forEach((td) => td.classList.remove("is-dirty"));
  updateSaveBar();
  showToast(`${n} rate${n !== 1 ? "s" : ""} saved successfully`);
});
document.getElementById("discardBtn").addEventListener("click", () => {
  if (dirtySet.size === 0) {
    showToast("Nothing to discard");
    return;
  }
  initCells();
  dirtySet.clear();
  selectedSet.clear();
  buildBody();
  updateSaveBar();
  updateBulkBar();
  showToast("Changes discarded");
});

// ── Room type filter ──────────────────────────────────────────────────────────
function getVisibleRtIndices() {
  const f = document.getElementById("filterType").value;
  return ROOM_TYPES.reduce((acc, rt, i) => {
    if (f === "all" || rt.code === f) acc.push(i);
    return acc;
  }, []);
}
function applyRtFilter() {
  const vis = new Set(getVisibleRtIndices());
  gridBody.querySelectorAll("tr[data-ri]").forEach((tr) => {
    tr.style.display = vis.has(parseInt(tr.dataset.ri)) ? "" : "none";
  });
}
document.getElementById("filterType").addEventListener("change", applyRtFilter);
document.getElementById("filterPlan").addEventListener("change", () => {
  showToast("Rate plan switched — reloading rates…");
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
updateSaveBar();
updateBulkBar();
