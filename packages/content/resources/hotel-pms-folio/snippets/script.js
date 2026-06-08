// ── Toast helper ──
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Formatters ──
const fmt = (n) =>
  "€" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const $ = (id) => document.getElementById(id);

// ── Initial charge data (mock, dates around 9–12 Jun 2026) ──
let charges = [
  {
    id: 1,
    date: "09 Jun",
    desc: "Room 302 — Standard Double",
    cat: "room",
    ref: "RM-001",
    amount: 184.0,
    voided: false,
  },
  {
    id: 2,
    date: "09 Jun",
    desc: "City tourist tax",
    cat: "tax",
    ref: "TX-001",
    amount: 1.65,
    voided: false,
  },
  {
    id: 3,
    date: "09 Jun",
    desc: "Restaurant — Dinner",
    cat: "fb",
    ref: "FB-101",
    amount: 62.4,
    voided: false,
  },
  {
    id: 4,
    date: "10 Jun",
    desc: "Room 302 — Standard Double",
    cat: "room",
    ref: "RM-002",
    amount: 184.0,
    voided: false,
  },
  {
    id: 5,
    date: "10 Jun",
    desc: "City tourist tax",
    cat: "tax",
    ref: "TX-002",
    amount: 1.65,
    voided: false,
  },
  {
    id: 6,
    date: "10 Jun",
    desc: "Minibar restock",
    cat: "minibar",
    ref: "MB-031",
    amount: 18.0,
    voided: false,
  },
  {
    id: 7,
    date: "10 Jun",
    desc: "Spa — Massage 60 min",
    cat: "spa",
    ref: "SP-017",
    amount: 85.0,
    voided: false,
  },
  {
    id: 8,
    date: "11 Jun",
    desc: "Room 302 — Standard Double",
    cat: "room",
    ref: "RM-003",
    amount: 184.0,
    voided: false,
  },
  {
    id: 9,
    date: "11 Jun",
    desc: "City tourist tax",
    cat: "tax",
    ref: "TX-003",
    amount: 1.65,
    voided: false,
  },
  {
    id: 10,
    date: "11 Jun",
    desc: "Restaurant — Breakfast",
    cat: "fb",
    ref: "FB-102",
    amount: 28.5,
    voided: false,
  },
];
let nextId = 11;
let settled = false;

// ── Payments applied (fixed mock) ──
const paymentsApplied = 400.0;

// ── Category label map ──
const catLabel = {
  room: ["Room night", "cat-room"],
  tax: ["Tax", "cat-tax"],
  fb: ["F&B", "cat-fb"],
  spa: ["Spa", "cat-spa"],
  minibar: ["Minibar", "cat-minibar"],
  other: ["Other", "cat-other"],
};

// ── Render table ──
function renderCharges() {
  const tbody = $("chargesBody");
  tbody.innerHTML = charges
    .map((c) => {
      const [label, cls] = catLabel[c.cat] || ["Other", "cat-other"];
      return `
        <tr class="${c.voided ? "is-voided" : ""}" data-id="${c.id}">
          <td class="td-date">${c.date}</td>
          <td class="td-desc">
            ${c.desc}
            <span class="td-cat ${cls}">${label}</span>
          </td>
          <td class="td-ref">${c.ref}</td>
          <td class="td-amt">${fmt(c.amount)}</td>
          <td class="td-act">
            <button
              class="btn-void ${c.voided ? "is-voided" : ""}"
              data-id="${c.id}"
              type="button"
              title="${c.voided ? "Already voided" : "Void this charge"}"
              ${c.voided ? "disabled" : ""}
            >${c.voided ? "Void" : "Void"}</button>
          </td>
        </tr>`;
    })
    .join("");
}

// ── Recalculate totals ──
function recalcTotals() {
  const activeCharges = charges.filter((c) => !c.voided);
  const subtotalNet = activeCharges.reduce((s, c) => s + c.amount, 0);
  // Treat subtotalNet as net-of-VAT for F&B/Spa; room/tax already gross for simplicity
  // For the demo: VAT = 10% of room+fb+spa+minibar lines; tax line is itself a tax
  const vatBase = activeCharges.filter((c) => c.cat !== "tax").reduce((s, c) => s + c.amount, 0);
  const vat = parseFloat((vatBase * 0.1).toFixed(2));
  const total = parseFloat((subtotalNet + vat).toFixed(2));
  const balance = parseFloat((total - paymentsApplied).toFixed(2));

  $("subtotal").textContent = fmt(subtotalNet);
  $("vat").textContent = fmt(vat);
  $("total").textContent = fmt(total);
  $("payments").textContent = "−" + fmt(paymentsApplied);
  $("balance").textContent = fmt(Math.max(0, balance));
}

// ── Void handler ──
document.getElementById("chargesBody").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-void");
  if (!btn || btn.disabled) return;
  const id = parseInt(btn.dataset.id, 10);
  const charge = charges.find((c) => c.id === id);
  if (!charge || charge.voided) return;
  charge.voided = true;
  renderCharges();
  recalcTotals();
  showToast(`Voided: ${charge.desc} (${fmt(charge.amount)})`);
});

// ── Add charge ──
const chargeDescMap = {
  restaurant: { desc: "Restaurant — Dinner", cat: "fb", ref: () => `FB-${100 + nextId}` },
  spa: { desc: "Spa — Massage 60 min", cat: "spa", ref: () => `SP-${16 + nextId}` },
  minibar: { desc: "Minibar restock", cat: "minibar", ref: () => `MB-${30 + nextId}` },
  laundry: { desc: "Laundry service", cat: "other", ref: () => `LN-${nextId}` },
  parking: { desc: "Parking", cat: "other", ref: () => `PK-${nextId}` },
  phone: { desc: "International call", cat: "other", ref: () => `PH-${nextId}` },
};

$("btnAdd").addEventListener("click", () => {
  if (settled) {
    showToast("Folio is already settled.");
    return;
  }
  const sel = $("chargeType");
  const key = sel.value;
  if (!key) {
    showToast("Pick a charge type first.");
    return;
  }
  const opt = sel.options[sel.selectedIndex];
  const amount = parseFloat(opt.dataset.amount);
  const meta = chargeDescMap[key];
  const todayDates = ["09 Jun", "10 Jun", "11 Jun", "12 Jun"];
  const date = todayDates[Math.floor(Math.random() * 3)];
  charges.push({
    id: nextId,
    date,
    desc: meta.desc,
    cat: meta.cat,
    ref: meta.ref(),
    amount,
    voided: false,
  });
  nextId++;
  sel.value = "";
  renderCharges();
  recalcTotals();
  showToast(`Posted: ${meta.desc} — ${fmt(amount)}`);
});

// ── Settle / mark paid ──
$("btnSettle").addEventListener("click", () => {
  if (settled) {
    showToast("Already settled.");
    return;
  }
  settled = true;
  $("paidStamp").hidden = false;
  $("footActs").querySelector(".primary").disabled = true;
  $("addChargeBar").style.opacity = "0.4";
  $("addChargeBar").style.pointerEvents = "none";
  $("balance").textContent = "€0.00";
  showToast("Folio settled — receipt ready to print.");
});

// ── Print folio (mock) ──
$("btnPrint").addEventListener("click", () => {
  showToast("Print job sent to front-desk printer.");
});

// ── Init ──
renderCharges();
recalcTotals();
