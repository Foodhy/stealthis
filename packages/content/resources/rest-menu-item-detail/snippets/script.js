const BASE_PRICE = 48;
const MAX_EXTRAS = 3;
const MAX_QTY = 10;

const qtyEl = document.getElementById("qty");
const totalEl = document.getElementById("total");
const addBtn = document.getElementById("add");
const toast = document.getElementById("toast");
const extras = document.querySelectorAll('fieldset[data-name="extras"] input[type="checkbox"]');

let qty = 1;

function readDelta() {
  let delta = 0;
  document.querySelectorAll("input[data-delta]:checked").forEach((input) => {
    delta += Number(input.dataset.delta) || 0;
  });
  return delta;
}

function format(value) {
  return `$${value.toFixed(2)}`;
}

function refresh() {
  const unit = BASE_PRICE + readDelta();
  totalEl.textContent = format(unit * qty);

  // Enforce max extras
  const checked = [...extras].filter((c) => c.checked);
  extras.forEach((c) => {
    c.disabled = !c.checked && checked.length >= MAX_EXTRAS;
  });

  // Qty button states
  document.querySelectorAll(".qty-btn").forEach((btn) => {
    const step = Number(btn.dataset.step);
    if (step < 0) btn.disabled = qty <= 1;
    if (step > 0) btn.disabled = qty >= MAX_QTY;
  });
}

document.querySelectorAll(".qty-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = qty + Number(btn.dataset.step);
    if (next < 1 || next > MAX_QTY) return;
    qty = next;
    qtyEl.textContent = qty;
    refresh();
  });
});

document.querySelectorAll("input[data-delta], .group input").forEach((input) => {
  input.addEventListener("change", refresh);
});

addBtn.addEventListener("click", () => {
  toast.hidden = false;
  toast.textContent = `Added ${qty} × Ribeye 14oz · ${totalEl.textContent}`;
  clearTimeout(addBtn._t);
  addBtn._t = setTimeout(() => (toast.hidden = true), 2200);
});

refresh();
