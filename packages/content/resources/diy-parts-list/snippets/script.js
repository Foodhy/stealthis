/* ============================================================
   DIY — Parts & Tools Checklist
   Bluetooth speaker build sheet. Vanilla JS, localStorage state.
   ============================================================ */
(() => {
  "use strict";

  const STORAGE_KEY = "diy-parts-list:bld-2041";

  /* ---------- data ---------- */
  const PARTS = [
    { id: "p-driver",  name: 'Fenwick Audio 3" full-range driver (pair)', ref: "FA-3FR-8",   price: 24.9, qty: 2, min: 2, max: 4, vendor: "Fenwick Audio" },
    { id: "p-amp",     name: "HexTone 2×20W Class-D amp board",           ref: "HT-AMP-2020", price: 18.5, qty: 1, min: 1, max: 2, vendor: "HexTone Labs" },
    { id: "p-bt",      name: "BlueCore 5.3 receiver module",              ref: "BC-53-RX",    price: 11.2, qty: 1, min: 1, max: 2, vendor: "BlueCore" },
    { id: "p-batt",    name: "VoltCrate 18650 cells (2600 mAh)",          ref: "VC-18650-26", price: 6.4,  qty: 4, min: 2, max: 8, vendor: "VoltCrate" },
    { id: "p-bms",     name: "VoltCrate 3S BMS protection board",         ref: "VC-BMS-3S",   price: 7.8,  qty: 1, min: 1, max: 2, vendor: "VoltCrate" },
    { id: "p-ply",     name: 'Birch plywood sheet 12 mm (600×400)',       ref: "PLY-B12-64",  price: 14.0, qty: 1, min: 1, max: 3, vendor: "Timberline Supply" },
    { id: "p-grille",  name: "Steel speaker grille mesh (black)",         ref: "GRL-STL-BK",  price: 5.6,  qty: 2, min: 2, max: 4, vendor: "Timberline Supply" },
    { id: "p-knob",    name: "Machined aluminum volume knob",             ref: "KNB-AL-28",   price: 4.2,  qty: 1, min: 1, max: 2, vendor: "HexTone Labs" },
    { id: "p-wire",    name: "Silicone hookup wire kit, 18 AWG",          ref: "WIR-18-KIT",  price: 8.9,  qty: 1, min: 1, max: 3, vendor: "VoltCrate" },
    { id: "p-hw",      name: "M3 hardware pack (screws + inserts)",       ref: "HW-M3-MIX",   price: 3.5,  qty: 1, min: 1, max: 3, vendor: "Timberline Supply" },
  ];

  const TOOLS = [
    { id: "t-iron",   name: "Soldering iron (temp-controlled)", ref: "TL-SLDR-60", price: 32.0, vendor: "BenchMate" },
    { id: "t-jig",    name: "Jigsaw with fine wood blade",      ref: "TL-JIG-01",  price: 45.0, vendor: "Timberline Supply" },
    { id: "t-drill",  name: "Cordless drill + brad point bits", ref: "TL-DRL-12V", price: 58.0, vendor: "BenchMate" },
    { id: "t-clamp",  name: "Bar clamps, 300 mm (set of 4)",    ref: "TL-CLMP-4",  price: 21.0, vendor: "Timberline Supply" },
    { id: "t-multi",  name: "Digital multimeter",               ref: "TL-DMM-830", price: 16.5, vendor: "VoltCrate" },
    { id: "t-strip",  name: "Wire stripper / crimper",          ref: "TL-STRP-01", price: 9.8,  vendor: "BenchMate" },
    { id: "t-sand",   name: "Sanding block + 120/240 grit",     ref: "TL-SND-KIT", price: 6.2,  vendor: "Timberline Supply" },
    { id: "t-glue",   name: "Wood glue + flush trim saw",       ref: "TL-GLU-SAW", price: 11.4, vendor: "Timberline Supply" },
  ];

  /* ---------- state ---------- */
  // state = { checked: {id:true}, qty: {id:number} }
  let state = { checked: {}, qty: {} };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        state.checked = parsed.checked && typeof parsed.checked === "object" ? parsed.checked : {};
        state.qty = parsed.qty && typeof parsed.qty === "object" ? parsed.qty : {};
      }
    } catch (_) { /* corrupted state — start fresh */ }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* storage unavailable (private mode) */ }
  }

  const qtyOf = (part) => {
    const q = state.qty[part.id];
    return Number.isInteger(q) ? Math.min(part.max, Math.max(part.min, q)) : part.qty;
  };

  const money = (n) => "$" + n.toFixed(2);

  /* ---------- toast ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  /* ---------- render ---------- */
  const partsList = document.getElementById("partsList");
  const toolsList = document.getElementById("toolsList");

  const CHECK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  const LINK_SVG =
    '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M7 7h5v2H9v6h6v-3h2v5H7zm7-2h5v5h-2V8.41l-5.3 5.3-1.41-1.42L15.59 7H14z"/></svg>';

  function buildRow(item, isPart) {
    const li = document.createElement("li");
    li.className = "row";
    li.dataset.id = item.id;

    const checked = !!state.checked[item.id];
    if (checked) li.classList.add("is-checked");
    const qty = isPart ? qtyOf(item) : 1;

    li.innerHTML = `
      <label class="chk">
        <input type="checkbox" ${checked ? "checked" : ""}
          aria-label="${isPart ? "Acquired" : "Owned"}: ${item.name}" data-action="toggle" />
        <span class="chk-box">${CHECK_SVG}</span>
      </label>
      <div class="row-body">
        <span class="row-name">${item.name}</span>
        <span class="row-meta">
          <span class="badge badge-ref mono">${item.ref}</span>
          ${isPart
            ? `<span class="badge badge-qty mono" data-role="qty-badge">×${qty}</span>`
            : `<span class="badge badge-owned mono" data-role="owned-badge" ${checked ? "" : "hidden"}>OWNED</span>`}
        </span>
      </div>
      <div class="row-side">
        ${isPart ? `
        <span class="stepper" role="group" aria-label="Quantity for ${item.name}">
          <button type="button" class="step-btn" data-action="dec" aria-label="Decrease quantity">−</button>
          <span class="step-val" data-role="qty-val" aria-live="polite">${qty}</span>
          <button type="button" class="step-btn" data-action="inc" aria-label="Increase quantity">+</button>
        </span>` : ""}
        <span class="row-price mono" data-role="price">${money(item.price * qty)}</span>
        <button type="button" class="buy-link" data-action="buy"
          aria-label="Where to buy ${item.name}" title="Where to buy">${LINK_SVG}</button>
      </div>`;
    return li;
  }

  function renderLists() {
    partsList.replaceChildren(...PARTS.map((p) => buildRow(p, true)));
    toolsList.replaceChildren(...TOOLS.map((t) => buildRow(t, false)));
  }

  /* ---------- totals / summary ---------- */
  const el = (id) => document.getElementById(id);
  const RING_CIRC = 2 * Math.PI * 52;

  function updateTotals() {
    let partsChecked = 0, toolsChecked = 0;
    let partsRemaining = 0, toolsRemaining = 0;

    for (const p of PARTS) {
      const cost = p.price * qtyOf(p);
      if (state.checked[p.id]) partsChecked++;
      else partsRemaining += cost;
    }
    for (const t of TOOLS) {
      if (state.checked[t.id]) toolsChecked++;
      else toolsRemaining += t.price;
    }

    const totalItems = PARTS.length + TOOLS.length;
    const totalChecked = partsChecked + toolsChecked;
    const remaining = partsRemaining + toolsRemaining;
    const pct = totalItems ? Math.round((totalChecked / totalItems) * 100) : 0;

    el("partsCount").textContent = `${partsChecked}/${PARTS.length}`;
    el("toolsCount").textContent = `${toolsChecked}/${TOOLS.length}`;
    el("partsTotal").textContent = money(partsRemaining);
    el("toolsTotal").textContent = money(toolsRemaining);

    el("sumChecked").textContent = `${totalChecked} / ${totalItems}`;
    el("sumRemaining").textContent = money(remaining);

    const bar = el("sumBar");
    bar.style.width = pct + "%";
    bar.classList.toggle("is-complete", pct === 100);

    const ring = el("ringFill");
    ring.style.strokeDashoffset = String(RING_CIRC * (1 - pct / 100));
    ring.classList.toggle("is-complete", pct === 100);
    el("ringPct").textContent = pct + "%";
  }

  /* ---------- row interactions (event delegation) ---------- */
  function findItem(id) {
    return PARTS.find((p) => p.id === id) || TOOLS.find((t) => t.id === id) || null;
  }

  function setChecked(row, item, on) {
    state.checked[item.id] = on;
    if (!on) delete state.checked[item.id];
    row.classList.toggle("is-checked", on);
    const ownedBadge = row.querySelector('[data-role="owned-badge"]');
    if (ownedBadge) ownedBadge.hidden = !on;
    saveState();
    updateTotals();
  }

  function setQty(row, part, next) {
    const q = Math.min(part.max, Math.max(part.min, next));
    state.qty[part.id] = q;
    row.querySelector('[data-role="qty-val"]').textContent = String(q);
    row.querySelector('[data-role="qty-badge"]').textContent = "×" + q;
    row.querySelector('[data-role="price"]').textContent = money(part.price * q);
    const [dec, inc] = row.querySelectorAll(".step-btn");
    dec.disabled = q <= part.min;
    inc.disabled = q >= part.max;
    saveState();
    updateTotals();
  }

  function onListEvent(e) {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;
    const row = actionEl.closest(".row");
    const item = findItem(row.dataset.id);
    if (!item) return;
    const action = actionEl.dataset.action;

    if (action === "toggle" && e.type === "change") {
      setChecked(row, item, actionEl.checked);
    } else if (e.type === "click") {
      if (action === "inc") setQty(row, item, qtyOf(item) + 1);
      else if (action === "dec") setQty(row, item, qtyOf(item) - 1);
      else if (action === "buy") toast(`${item.ref} — stocked by ${item.vendor} (demo link)`);
    }
  }

  for (const list of [partsList, toolsList]) {
    list.addEventListener("click", onListEvent);
    list.addEventListener("change", onListEvent);
  }

  /* ---------- header actions ---------- */
  el("btnOwnTools").addEventListener("click", () => {
    let flipped = 0;
    for (const t of TOOLS) {
      if (!state.checked[t.id]) { state.checked[t.id] = true; flipped++; }
    }
    if (!flipped) { toast("All tools already marked as owned"); return; }
    // sync DOM
    for (const row of toolsList.querySelectorAll(".row")) {
      row.classList.add("is-checked");
      row.querySelector('input[type="checkbox"]').checked = true;
      const badge = row.querySelector('[data-role="owned-badge"]');
      if (badge) badge.hidden = false;
    }
    saveState();
    updateTotals();
    toast(`Marked ${flipped} tool${flipped > 1 ? "s" : ""} as owned`);
  });

  el("btnPrint").addEventListener("click", () => {
    toast("Build sheet BLD-2041 queued for print / PDF export (demo)");
  });

  el("btnReset").addEventListener("click", () => {
    state = { checked: {}, qty: {} };
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    renderLists();
    syncStepperDisabled();
    updateTotals();
    toast("Checklist reset — fresh build sheet");
  });

  /* ---------- init ---------- */
  function syncStepperDisabled() {
    for (const row of partsList.querySelectorAll(".row")) {
      const part = PARTS.find((p) => p.id === row.dataset.id);
      if (!part) continue;
      const q = qtyOf(part);
      const [dec, inc] = row.querySelectorAll(".step-btn");
      dec.disabled = q <= part.min;
      inc.disabled = q >= part.max;
    }
  }

  loadState();
  renderLists();
  syncStepperDisabled();
  updateTotals();
})();
