const TAX_RATE = 0.0825;

const STARTING_ORDER = [
  {
    id: "burrata",
    name: "Burrata de la huerta",
    price: 16,
    qty: 1,
    mods: ["Add focaccia"],
  },
  {
    id: "ribeye",
    name: "Ribeye 14oz",
    price: 48,
    qty: 1,
    mods: ["Medium rare", "Truffle fries (+$4)", "Bone marrow (+$6)"],
  },
  {
    id: "risotto",
    name: "Risotto de hongos",
    price: 26,
    qty: 1,
    mods: ["No parmesan"],
  },
  {
    id: "tarta",
    name: "Tarta de queso quemada",
    price: 11,
    qty: 2,
    mods: [],
  },
];

let order = STARTING_ORDER.map((i) => ({ ...i }));
let tipMode = "18"; // "0" | "15" | "18" | "20" | "custom"
let customTip = 22;

const linesEl = document.getElementById("lines");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const tipAmountEl = document.getElementById("tipAmount");
const tipTagEl = document.getElementById("tipTag");
const totalEl = document.getElementById("total");
const tipBtns = document.querySelectorAll(".tip-btn");
const tipCustomWrap = document.getElementById("tipCustomWrap");
const tipCustomInput = document.getElementById("tipCustom");
const sendBtn = document.getElementById("send");
const resetBtn = document.getElementById("reset");
const toast = document.getElementById("toast");

function money(value) {
  return `$${value.toFixed(2)}`;
}

function tipPercent() {
  if (tipMode === "custom") return Math.max(0, Math.min(100, customTip)) / 100;
  return Number(tipMode) / 100;
}

function renderLines() {
  if (order.length === 0) {
    linesEl.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  linesEl.innerHTML = order
    .map(
      (line) => `
      <li class="line" data-id="${line.id}">
        <div class="line-body">
          <p class="line-name">${line.name}</p>
          ${
            line.mods.length
              ? `<p class="line-mods">${line.mods.map((m) => `<span>${m}</span>`).join("")}</p>`
              : ""
          }
          <div class="line-controls">
            <div class="qty" aria-label="Quantity">
              <button class="qty-btn" data-action="dec" aria-label="Decrease">−</button>
              <span class="qty-num">${line.qty}</span>
              <button class="qty-btn" data-action="inc" aria-label="Increase">+</button>
            </div>
            <button class="line-remove" data-action="remove">Remove</button>
          </div>
        </div>
        <span class="line-price">${money(line.price * line.qty)}</span>
      </li>`
    )
    .join("");
}

function renderTotals() {
  const subtotal = order.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const tipPct = tipPercent();
  const tipValue = subtotal * tipPct;
  const total = subtotal + tax + tipValue;

  const itemCount = order.reduce((n, l) => n + l.qty, 0);
  countEl.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  subtotalEl.textContent = money(subtotal);
  taxEl.textContent = money(tax);
  tipAmountEl.textContent = money(tipValue);
  totalEl.textContent = money(total);
  tipTagEl.textContent = `${Math.round(tipPct * 100)}%`;

  sendBtn.disabled = order.length === 0;
}

function render() {
  renderLines();
  renderTotals();
}

linesEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const li = btn.closest("[data-id]");
  if (!li) return;
  const line = order.find((l) => l.id === li.dataset.id);
  if (!line) return;
  const action = btn.dataset.action;
  if (action === "inc") line.qty = Math.min(99, line.qty + 1);
  if (action === "dec") {
    line.qty -= 1;
    if (line.qty <= 0) order = order.filter((l) => l.id !== line.id);
  }
  if (action === "remove") order = order.filter((l) => l.id !== line.id);
  render();
});

tipBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tipBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    tipMode = btn.dataset.tip;
    tipCustomWrap.hidden = tipMode !== "custom";
    renderTotals();
  });
});
tipCustomInput.addEventListener("input", (e) => {
  customTip = Number(e.target.value) || 0;
  if (tipMode === "custom") renderTotals();
});

sendBtn.addEventListener("click", () => {
  toast.hidden = false;
  toast.textContent = `Order sent to kitchen · ${totalEl.textContent}`;
  clearTimeout(sendBtn._t);
  sendBtn._t = setTimeout(() => (toast.hidden = true), 2400);
});

resetBtn.addEventListener("click", () => {
  order = STARTING_ORDER.map((i) => ({ ...i }));
  tipMode = "18";
  customTip = 22;
  tipBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.tip === "18"));
  tipCustomWrap.hidden = true;
  tipCustomInput.value = 22;
  render();
});

render();
