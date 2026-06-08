const SUBTOTAL = 98.0;
const TAX_RATE = 0.0825;
const DELIVERY_FEE = 4.0;

const SLOTS = [
  { label: "20:00", taken: false },
  { label: "20:15", taken: false },
  { label: "20:30", taken: true },
  { label: "20:45", taken: false },
  { label: "21:00", taken: false },
  { label: "21:15", taken: true },
  { label: "21:30", taken: false },
  { label: "21:45", taken: false },
];

let mode = "pickup";
let slot = "20:00";
let tip = 15;
let step = 1;

const stepsEl = document.getElementById("steps");
const slotsEl = document.getElementById("slots");
const addressField = document.getElementById("addressField");
const deliveryRow = document.getElementById("deliveryRow");
const sumSubtotal = document.getElementById("sumSubtotal");
const sumTax = document.getElementById("sumTax");
const sumTip = document.getElementById("sumTip");
const sumTipTag = document.getElementById("sumTipTag");
const sumTotal = document.getElementById("sumTotal");
const payAmount = document.getElementById("payAmount");
const summaryMeta = document.querySelector(".summary-meta");

function money(v) {
  return `$${v.toFixed(2)}`;
}

function totals() {
  const delivery = mode === "delivery" ? DELIVERY_FEE : 0;
  const tax = SUBTOTAL * TAX_RATE;
  const tipValue = SUBTOTAL * (tip / 100);
  const total = SUBTOTAL + delivery + tax + tipValue;
  return { delivery, tax, tipValue, total };
}

function renderSummary() {
  const { delivery, tax, tipValue, total } = totals();
  sumSubtotal.textContent = money(SUBTOTAL);
  sumTax.textContent = money(tax);
  sumTip.textContent = money(tipValue);
  sumTipTag.textContent = `${tip}%`;
  sumTotal.textContent = money(total);
  deliveryRow.hidden = delivery === 0;
  document.getElementById("sumDelivery").textContent = money(delivery);
  payAmount.textContent = money(total);
  summaryMeta.textContent = `3 items · ${mode === "pickup" ? "Pickup" : "Delivery"}`;
}

function renderSlots() {
  slotsEl.innerHTML = SLOTS.map(
    (s) => `
    <button type="button" class="slot ${s.label === slot ? "is-active" : ""}"
      data-slot="${s.label}" ${s.taken ? "disabled" : ""}>
      ${s.label}
    </button>`
  ).join("");
}

function go(next) {
  if (next === step) return;
  step = next;
  document.querySelectorAll(".panel").forEach((p) => {
    p.hidden = Number(p.dataset.panel) !== step;
  });
  document.querySelectorAll(".step").forEach((s) => {
    const n = Number(s.dataset.step);
    s.classList.toggle("is-active", n === step);
    s.classList.toggle("is-done", n < step);
  });
  if (step === 3) {
    const { total } = totals();
    document.getElementById("confName").textContent =
      document.getElementById("name").value.split(" ")[0] || "guest";
    document.getElementById("confTotal").textContent = money(total);
    document.getElementById("confEmail").textContent =
      document.getElementById("email").value || "—";
    const eta = new Date();
    const minutes = mode === "delivery" ? 50 : 25;
    eta.setMinutes(eta.getMinutes() + minutes);
    document.getElementById("confEta").textContent =
      `${String(eta.getHours()).padStart(2, "0")}:${String(eta.getMinutes()).padStart(2, "0")}`;
  }
  if (step === 1) {
    document.getElementById("confName").textContent = "Lina";
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document
  .querySelectorAll("[data-go]")
  .forEach((btn) => btn.addEventListener("click", () => go(Number(btn.dataset.go))));

document.querySelectorAll('input[name="mode"]').forEach((r) =>
  r.addEventListener("change", () => {
    mode = r.value;
    addressField.hidden = mode !== "delivery";
    renderSummary();
  })
);

slotsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-slot]");
  if (!btn || btn.disabled) return;
  slot = btn.dataset.slot;
  renderSlots();
});

document.querySelectorAll("[data-tip]").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tip]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    tip = Number(btn.dataset.tip);
    renderSummary();
  })
);

document.getElementById("track").addEventListener("click", () => {
  alert("In production this would navigate to the order-tracking page.");
});

renderSlots();
renderSummary();
