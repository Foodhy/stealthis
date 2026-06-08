// ── Folio data ─────────────────────────────────────────────────────────────
const LINES = [
  { id: 1, section: "Accommodation" },
  {
    id: 2,
    date: "20 May",
    desc: "Junior Suite · Night",
    cat: "acc",
    catLabel: "Acc",
    qty: 4,
    amount: 241,
  },
  { id: 3, date: "20 May", desc: "City tax", cat: "tax", catLabel: "Tax", qty: 4, amount: 4.125 },

  { id: 4, section: "Food & Beverage" },
  {
    id: 5,
    date: "20 May",
    desc: "Welcome bottle · cava",
    cat: "fb",
    catLabel: "F&B",
    qty: 1,
    amount: 22,
  },
  {
    id: 6,
    date: "21 May",
    desc: "Restaurant · dinner for 2",
    cat: "fb",
    catLabel: "F&B",
    qty: 1,
    amount: 96,
  },
  {
    id: 7,
    date: "22 May",
    desc: "Breakfast buffet",
    cat: "fb",
    catLabel: "F&B",
    qty: 2,
    amount: 18,
  },
  {
    id: 8,
    date: "23 May",
    desc: "Room service · lunch",
    cat: "fb",
    catLabel: "F&B",
    qty: 1,
    amount: 38,
  },

  { id: 9, section: "Mini-bar" },
  {
    id: 10,
    date: "21 May",
    desc: "Mini-bar · 2 × water · 1 × nuts",
    cat: "mini",
    catLabel: "Mini",
    qty: 1,
    amount: 14,
  },
  {
    id: 11,
    date: "23 May",
    desc: "Mini-bar · 1 × whisky",
    cat: "mini",
    catLabel: "Mini",
    qty: 1,
    amount: 18,
  },

  { id: 12, section: "Spa & Wellness" },
  {
    id: 13,
    date: "22 May",
    desc: "Spa · couples massage 60'",
    cat: "spa",
    catLabel: "Spa",
    qty: 1,
    amount: 145,
  },
];

// state per line: { folio: "A"|"B", void: bool }
const state = new Map();
LINES.forEach((l) => {
  if (!l.section) state.set(l.id, { folio: "A", void: false, qty: l.qty });
});
// Put one mini-bar item already on folio B (€18 + tax) to match the pill in mock.
state.get(11).folio = "B";

const PAID_DEPOSIT = 482;
const VAT_RATE = 0.1;
const CITY_TAX = 16.5;

let activeFolio = "A";
let payMethod = "card";
let settled = false;

const tbody = document.getElementById("rows");
const checkAll = document.getElementById("checkAll");
const bulk = document.getElementById("bulk");
const bulkN = document.getElementById("bulkN");
const subEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const balEl = document.getElementById("balance");
const payBody = document.getElementById("payBody");
const settleAmt = document.getElementById("settleAmt");
const settleBtn = document.getElementById("settle");
const result = document.getElementById("result");
const toast = document.getElementById("toast");

const fmt = (n) =>
  `€${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function visibleLines() {
  return LINES.filter((l) => l.section || state.get(l.id).folio === activeFolio);
}

function lineAmount(l) {
  const s = state.get(l.id);
  return s.qty * l.amount;
}

function renderRows() {
  tbody.innerHTML = visibleLines()
    .map((l) => {
      if (l.section) {
        return `<tr class="is-section"><td colspan="7">${l.section}</td></tr>`;
      }
      const s = state.get(l.id);
      const cls = s.void ? "is-voided" : "";
      return `
        <tr class="${cls}" data-id="${l.id}">
          <td class="ck"><input type="checkbox" class="line-ck" /></td>
          <td>${l.date}</td>
          <td>${l.desc}</td>
          <td><span class="cat-pill ${l.cat}">${l.catLabel}</span></td>
          <td class="num">${s.qty}</td>
          <td class="num">${fmt(lineAmount(l))}</td>
          <td class="actions"><button class="row-act" title="Void">✕</button></td>
        </tr>`;
    })
    .join("");
  // Restore check state on visible rows (we re-render, so reset)
  checkAll.checked = false;
  updateBulk();
}

function activeLines() {
  return LINES.filter(
    (l) => !l.section && state.get(l.id).folio === activeFolio && !state.get(l.id).void
  );
}

function totals() {
  const subtotal = activeLines().reduce((sum, l) => sum + lineAmount(l), 0);
  // City tax line (id 3) already in subtotal; here we model VAT as 10% of non-tax categories.
  const taxable = activeLines()
    .filter((l) => l.cat !== "tax")
    .reduce((sum, l) => sum + lineAmount(l), 0);
  const tax = taxable * VAT_RATE;
  const grand = subtotal + tax; // city tax separate display
  return { subtotal, tax, grand };
}

function renderTotals() {
  const { subtotal, tax, grand } = totals();
  subEl.textContent = fmt(subtotal);
  taxEl.textContent = fmt(tax);
  let balance =
    subtotal + tax + (activeFolio === "A" ? 0 : 0) - (activeFolio === "A" ? PAID_DEPOSIT : 0);
  if (balance < 0) balance = 0;
  balEl.textContent = fmt(balance);
  settleAmt.textContent = fmt(balance);
  settleBtn.disabled = balance < 0.01 || settled;
}

function updateBulk() {
  const checked = tbody.querySelectorAll(".line-ck:checked");
  if (checked.length) {
    bulk.hidden = false;
    bulkN.textContent = checked.length;
  } else {
    bulk.hidden = true;
  }
}

tbody.addEventListener("change", (e) => {
  if (e.target.matches(".line-ck")) updateBulk();
});
tbody.addEventListener("click", (e) => {
  if (e.target.matches(".row-act")) {
    const tr = e.target.closest("tr");
    const id = parseInt(tr.dataset.id, 10);
    state.get(id).void = !state.get(id).void;
    renderRows();
    renderTotals();
    showToast("Line voided");
  }
});
checkAll.addEventListener("change", () => {
  tbody.querySelectorAll(".line-ck").forEach((c) => (c.checked = checkAll.checked));
  updateBulk();
});

document.getElementById("bulk").addEventListener("click", (e) => {
  const btn = e.target.closest(".bulk-btn");
  if (!btn) return;
  const action = btn.dataset.bulk;
  const checked = [...tbody.querySelectorAll(".line-ck:checked")].map((c) =>
    parseInt(c.closest("tr").dataset.id, 10)
  );
  checked.forEach((id) => {
    if (action === "void") state.get(id).void = true;
    if (action === "transfer") state.get(id).folio = activeFolio === "A" ? "B" : "A";
  });
  showToast(`${checked.length} line(s) ${action === "void" ? "voided" : "transferred"}`);
  renderRows();
  renderTotals();
});

// Folio tabs
document.querySelectorAll(".folio-head .seg-btn").forEach((b) =>
  b.addEventListener("click", () => {
    if (b.dataset.fol === "C") {
      showToast("New folio created (mock)");
      return;
    }
    document
      .querySelectorAll(".folio-head .seg-btn")
      .forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    activeFolio = b.dataset.fol;
    renderRows();
    renderTotals();
  })
);

// Payment seg
const PAY_TEXT = {
  card: `Charge balance to card on file <strong>Visa •••• 4421</strong>. Authorisation typically clears in 4–10 seconds.`,
  cash: `Collect balance in cash. Cash drawer opens after confirmation. Change calculated automatically.`,
  split: `<div class="split-row"><span>Card · Visa •••• 4421</span><span><strong>€350.00</strong></span></div>
         <div class="split-row"><span>Cash</span><span><strong>€68.00</strong></span></div>
         <p style="margin-top:6px;font-size:.78rem;color:var(--warm-gray);">Adjust amounts before settling.</p>`,
  company: `Direct bill to <strong>Innovo Travel S.L.</strong> (NIF B-3382041). Folio transferred to AR · invoice issued.`,
};
function renderPay() {
  payBody.innerHTML = PAY_TEXT[payMethod];
}
renderPay();
document.getElementById("paySeg").addEventListener("click", (e) => {
  const b = e.target.closest(".seg-btn");
  if (!b) return;
  document.querySelectorAll("#paySeg .seg-btn").forEach((x) => x.classList.remove("is-active"));
  b.classList.add("is-active");
  payMethod = b.dataset.pay;
  renderPay();
});

settleBtn.addEventListener("click", () => {
  settled = true;
  settleBtn.disabled = true;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  showToast("Folio settled · room released");
});

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 1600);
}

renderRows();
renderTotals();
