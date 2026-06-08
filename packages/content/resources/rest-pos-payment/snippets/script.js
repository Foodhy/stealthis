const SUBTOTAL = 184.0;
const TAX_RATE = 0.0825;
const SERVICE_RATE = 0.1;

let tipMode = "18";
let customTip = 22;
let method = "cash";
let tendered = 0;
let tenderedRaw = ""; // string accumulator for the keypad
let ways = 2;
let splitPaid = new Set();

const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const serviceEl = document.getElementById("service");
const tipEl = document.getElementById("tip");
const totalEl = document.getElementById("total");
const tipTagEl = document.getElementById("tipTag");
const amountEl = document.getElementById("amount");
const changeEl = document.getElementById("change");
const cardAmount = document.getElementById("cardAmount");
const cardStatus = document.getElementById("cardStatus");
const cardPrompt = document.getElementById("cardPrompt");
const confirmLabel = document.getElementById("confirmLabel");
const confirmBtn = document.getElementById("confirm");
const splitList = document.getElementById("splitList");

function money(v) {
  return `$${v.toFixed(2)}`;
}

function tipPercent() {
  if (tipMode === "custom") return Math.max(0, Math.min(100, customTip)) / 100;
  return Number(tipMode) / 100;
}

function total() {
  return SUBTOTAL + SUBTOTAL * TAX_RATE + SUBTOTAL * SERVICE_RATE + SUBTOTAL * tipPercent();
}

function tenderedNum() {
  if (tenderedRaw === "") return 0;
  return Number(tenderedRaw) / 100;
}

function renderBill() {
  const tax = SUBTOTAL * TAX_RATE;
  const service = SUBTOTAL * SERVICE_RATE;
  const tip = SUBTOTAL * tipPercent();
  subtotalEl.textContent = money(SUBTOTAL);
  taxEl.textContent = money(tax);
  serviceEl.textContent = money(service);
  tipEl.textContent = money(tip);
  totalEl.textContent = money(total());
  tipTagEl.textContent = `${Math.round(tipPercent() * 100)}%`;
  cardAmount.textContent = money(total());
}

function renderTendered() {
  const t = tenderedNum();
  amountEl.textContent = money(t);
  const change = t - total();
  if (t === 0) {
    changeEl.textContent = "$0.00";
    changeEl.className = "amount amount-change";
  } else if (change >= 0) {
    changeEl.textContent = money(change);
    changeEl.className = "amount amount-change is-positive";
  } else {
    changeEl.textContent = `-${money(Math.abs(change))}`;
    changeEl.className = "amount amount-change is-short";
  }
}

function renderConfirm() {
  if (method === "cash") {
    confirmLabel.textContent =
      tenderedNum() >= total() ? `Confirm · ${money(total())}` : "Tender first";
    confirmBtn.disabled = tenderedNum() < total();
  } else if (method === "card") {
    confirmLabel.textContent = cardPrompt.classList.contains("is-paid")
      ? "Done"
      : `Charge ${money(total())}`;
    confirmBtn.disabled = false;
  } else {
    const allPaid = splitPaid.size === ways;
    confirmLabel.textContent = allPaid
      ? "Close ticket"
      : `Split ${ways} ways · ${money(total() / ways)}/each`;
    confirmBtn.disabled = false;
  }
}

function renderSplit() {
  splitList.innerHTML = Array.from({ length: ways }, (_, i) => i)
    .map(
      (i) => `
    <li class="split-row ${splitPaid.has(i) ? "is-paid" : ""}" data-split="${i}">
      <span class="split-num">#${i + 1}</span>
      <input class="split-name" placeholder="Guest name" value="${i === 0 ? "Lina" : ""}" />
      <span class="split-amount">${money(total() / ways)}</span>
      <button class="split-paid" data-paid="${i}">${splitPaid.has(i) ? "Paid ✓" : "Mark paid"}</button>
    </li>`
    )
    .join("");
}

function setMethod(next) {
  method = next;
  document
    .querySelectorAll("[data-method]")
    .forEach((b) => b.classList.toggle("is-active", b.dataset.method === next));
  document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.dataset.panel !== next));
  if (next === "card") {
    cardPrompt.classList.remove("is-paid");
    cardStatus.textContent = "Insert or tap card on reader";
  }
  renderConfirm();
  if (next === "split") renderSplit();
}

document.querySelectorAll("[data-tip]").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tip]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    if (btn.dataset.tip === "custom") {
      const val = prompt("Custom tip %", String(customTip));
      const n = Number(val);
      if (!Number.isNaN(n)) {
        customTip = Math.max(0, Math.min(100, n));
        tipMode = "custom";
      }
    } else {
      tipMode = btn.dataset.tip;
    }
    renderBill();
    if (method === "split") renderSplit();
    renderConfirm();
  })
);

document
  .querySelectorAll("[data-method]")
  .forEach((b) => b.addEventListener("click", () => setMethod(b.dataset.method)));

const keypad = document.getElementById("keypad");
keypad.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-key]");
  if (!btn) return;
  const key = btn.dataset.key;
  if (key === "del") tenderedRaw = tenderedRaw.slice(0, -1);
  else tenderedRaw = (tenderedRaw + key).slice(0, 8);
  renderTendered();
  renderConfirm();
});

document.querySelectorAll("[data-quick]").forEach((b) =>
  b.addEventListener("click", () => {
    const q = b.dataset.quick;
    const t = total();
    let next;
    if (q === "exact") next = t;
    else if (q === "next-50") next = Math.ceil(t / 50) * 50;
    else next = Number(q);
    tenderedRaw = String(Math.round(next * 100));
    renderTendered();
    renderConfirm();
  })
);

document.querySelectorAll("[data-ways]").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("[data-ways]").forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    ways = Number(b.dataset.ways);
    splitPaid = new Set();
    renderSplit();
    renderConfirm();
  })
);

splitList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-paid]");
  if (!btn) return;
  const i = Number(btn.dataset.paid);
  if (splitPaid.has(i)) splitPaid.delete(i);
  else splitPaid.add(i);
  renderSplit();
  renderConfirm();
});

confirmBtn.addEventListener("click", () => {
  if (method === "card") {
    cardStatus.textContent = "Approved · receipt printing";
    cardPrompt.classList.add("is-paid");
    renderConfirm();
  } else if (method === "cash") {
    cardStatus.textContent = "Drawer opened";
    confirmLabel.textContent = "Closed ✓";
    confirmBtn.disabled = true;
  } else if (method === "split" && splitPaid.size === ways) {
    confirmLabel.textContent = "Closed ✓";
    confirmBtn.disabled = true;
  }
});

renderBill();
renderTendered();
renderConfirm();
