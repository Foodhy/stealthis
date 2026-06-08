// ── Inventory data ───────────────────────────────────────────────────────────
// Status is derived, never stored: out = 0, low = onHand <= par, else ok.
const ITEMS = [
  { name: "Nitrile exam gloves (M)", sku: "GLV-NTR-M", onHand: 42, par: 30, restock: "2026-05-28", supplier: "MedSupply Co." },
  { name: "Adhesive bandages, assorted", sku: "BND-ASRT", onHand: 8, par: 20, restock: "2026-04-19", supplier: "CareLine Health" },
  { name: "Isopropyl alcohol prep pads", sku: "PRP-ALC-70", onHand: 0, par: 25, restock: "2026-03-30", supplier: "MedSupply Co." },
  { name: "Sterile gauze 4×4 in", sku: "GZE-4X4-S", onHand: 60, par: 40, restock: "2026-06-02", supplier: "CareLine Health" },
  { name: "Disposable face masks", sku: "MSK-3PLY", onHand: 18, par: 50, restock: "2026-05-11", supplier: "Vireo Medical" },
  { name: "Tongue depressors, wood", sku: "TDP-WD-100", onHand: 120, par: 60, restock: "2026-05-22", supplier: "MedSupply Co." },
  { name: "Vinyl exam gloves (L)", sku: "GLV-VNL-L", onHand: 0, par: 30, restock: "2026-02-14", supplier: "Vireo Medical" },
  { name: "Syringes 3 mL, Luer-lock", sku: "SYR-3ML-LL", onHand: 22, par: 35, restock: "2026-05-30", supplier: "Northgate Pharma" },
  { name: "Examination table paper", sku: "PPR-EXM-RL", onHand: 14, par: 12, restock: "2026-06-04", supplier: "CareLine Health" },
  { name: "Surface disinfectant wipes", sku: "DIS-WIPE-XL", onHand: 9, par: 24, restock: "2026-04-27", supplier: "Vireo Medical" },
  { name: "Cotton-tipped applicators", sku: "APP-CTN-200", onHand: 75, par: 40, restock: "2026-05-18", supplier: "MedSupply Co." },
  { name: "Lancets, 28G safety", sku: "LNC-28G-SF", onHand: 33, par: 30, restock: "2026-06-01", supplier: "Northgate Pharma" },
];

let activeFilter = "all";
let query = "";

const rowsEl = document.getElementById("rows");
const emptyEl = document.getElementById("empty");
const searchEl = document.getElementById("search");
const toastEl = document.getElementById("toast");

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusOf(item) {
  if (item.onHand <= 0) return "out";
  if (item.onHand <= item.par) return "low";
  return "ok";
}

const STATUS_LABEL = { ok: "OK", low: "Low", out: "Out" };

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toastEl.hidden = true), 2600);
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function relativeDays(iso) {
  const then = new Date(iso + "T00:00:00");
  const now = new Date("2026-06-08T00:00:00");
  const days = Math.round((now - then) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return days + " days ago";
  const months = Math.round(days / 30);
  return months + (months === 1 ? " month ago" : " months ago");
}

// ── Render ───────────────────────────────────────────────────────────────────
function rowMarkup(item, idx) {
  const status = statusOf(item);
  const needsReorder = status !== "ok";
  const reorder = needsReorder
    ? `<button class="reorder${status === "low" ? " is-low" : ""}" data-reorder="${idx}">Reorder</button>`
    : "";
  return `
    <tr data-idx="${idx}" data-status="${status}">
      <td class="col-item">
        <div class="item-name">${item.name}</div>
        <div class="item-sku">${item.sku}</div>
      </td>
      <td class="col-onhand">
        <div class="stepper" role="group" aria-label="Adjust on-hand for ${item.name}">
          <button class="step" data-dec="${idx}" aria-label="Decrease on-hand"${item.onHand <= 0 ? " disabled" : ""}>−</button>
          <span class="onhand-val" aria-live="polite">${item.onHand}</span>
          <button class="step" data-inc="${idx}" aria-label="Increase on-hand">+</button>
        </div>
      </td>
      <td class="col-par"><span class="par-val">${item.par}</span></td>
      <td class="col-status">
        <span class="pill ${status}">${STATUS_LABEL[status]}</span>
      </td>
      <td class="col-restock">
        <span class="restock">${formatDate(item.restock)}</span>
        <span class="restock-rel">${relativeDays(item.restock)}</span>
      </td>
      <td class="col-supplier"><span class="supplier">${item.supplier}</span></td>
      <td class="col-action">${reorder}</td>
    </tr>`;
}

function matchesFilter(item) {
  if (activeFilter !== "all" && statusOf(item) !== activeFilter) return false;
  if (query) {
    const hay = (item.name + " " + item.sku).toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function render() {
  const visible = ITEMS.map((item, idx) => ({ item, idx })).filter(({ item }) => matchesFilter(item));
  rowsEl.innerHTML = visible.map(({ item, idx }) => rowMarkup(item, idx)).join("");
  emptyEl.hidden = visible.length > 0;
}

// ── Counts & summary ─────────────────────────────────────────────────────────
function refreshCounts() {
  let low = 0;
  let out = 0;
  ITEMS.forEach((item) => {
    const s = statusOf(item);
    if (s === "low") low++;
    else if (s === "out") out++;
  });
  document.getElementById("stat-total").textContent = ITEMS.length;
  document.getElementById("stat-low").textContent = low;
  document.getElementById("stat-out").textContent = out;
  document.getElementById("count-all").textContent = ITEMS.length;
  document.getElementById("count-low").textContent = low;
  document.getElementById("count-out").textContent = out;
}

// ── Stepper: update a single row in place when possible ──────────────────────
function adjust(idx, delta) {
  const item = ITEMS[idx];
  const next = Math.max(0, item.onHand + delta);
  if (next === item.onHand) return;
  item.onHand = next;
  refreshCounts();

  // If the row would leave the current filter, re-render the whole list.
  if (!matchesFilter(item)) {
    render();
    return;
  }
  const row = rowsEl.querySelector(`tr[data-idx="${idx}"]`);
  if (!row) {
    render();
    return;
  }
  const status = statusOf(item);
  row.dataset.status = status;
  row.querySelector(".onhand-val").textContent = item.onHand;
  const pill = row.querySelector(".pill");
  pill.className = "pill " + status;
  pill.textContent = STATUS_LABEL[status];
  row.querySelector(".step[data-dec]").disabled = item.onHand <= 0;

  const actionCell = row.querySelector(".col-action");
  if (status === "ok") {
    actionCell.innerHTML = "";
  } else {
    actionCell.innerHTML = `<button class="reorder${status === "low" ? " is-low" : ""}" data-reorder="${idx}">Reorder</button>`;
  }
}

// ── Events ───────────────────────────────────────────────────────────────────
rowsEl.addEventListener("click", (e) => {
  const dec = e.target.closest("[data-dec]");
  const inc = e.target.closest("[data-inc]");
  const reorder = e.target.closest("[data-reorder]");
  if (dec) adjust(Number(dec.dataset.dec), -1);
  else if (inc) adjust(Number(inc.dataset.inc), +1);
  else if (reorder) {
    const item = ITEMS[Number(reorder.dataset.reorder)];
    const status = statusOf(item);
    const shortfall = Math.max(item.par - item.onHand, item.par);
    showToast(
      status === "out"
        ? `Reorder raised for ${item.name} — purchase order sent to ${item.supplier}.`
        : `Reorder raised for ${item.name} (suggested ${shortfall} units) — sent to ${item.supplier}.`
    );
  }
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter;
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    render();
  });
});

searchEl.addEventListener("input", () => {
  query = searchEl.value.trim().toLowerCase();
  render();
});

// ── Init ─────────────────────────────────────────────────────────────────────
refreshCounts();
render();
