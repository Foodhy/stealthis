const BASE = 48;
const MAX_EXTRAS = 3;
const MAX_QTY = 10;

const sheet = document.getElementById("sheet");
const backdrop = document.getElementById("backdrop");
const addBtn = document.getElementById("add");
const totalEl = document.getElementById("total");
const qtyEl = document.getElementById("qty");
const hint = document.getElementById("hint");
const toast = document.getElementById("toast");

let qty = 1;

function open() {
  sheet.hidden = false;
  backdrop.hidden = false;
  document.body.style.overflow = "hidden";
}
function close() {
  sheet.hidden = true;
  backdrop.hidden = true;
  document.body.style.overflow = "";
}

document.getElementById("open").addEventListener("click", open);
document.getElementById("close").addEventListener("click", close);
backdrop.addEventListener("click", close);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !sheet.hidden) close();
});

function readDelta() {
  let d = 0;
  document.querySelectorAll("input[data-delta]:checked").forEach((i) => {
    d += Number(i.dataset.delta) || 0;
  });
  return d;
}

function refresh() {
  const unit = BASE + readDelta();
  totalEl.textContent = `$${(unit * qty).toFixed(2)}`;

  const extras = document.querySelectorAll('fieldset[data-name="extras"] input[type="checkbox"]');
  const checked = [...extras].filter((c) => c.checked);
  extras.forEach((c) => {
    c.disabled = !c.checked && checked.length >= MAX_EXTRAS;
  });

  document.querySelectorAll("[data-step]").forEach((btn) => {
    const s = Number(btn.dataset.step);
    if (s < 0) btn.disabled = qty <= 1;
    if (s > 0) btn.disabled = qty >= MAX_QTY;
  });

  // Required check: doneness must be selected to enable Add
  const requiredOK = document.querySelector('fieldset[data-required="true"] input:checked');
  addBtn.disabled = !requiredOK;
}

document.querySelectorAll("[data-step]").forEach((b) =>
  b.addEventListener("click", () => {
    const next = qty + Number(b.dataset.step);
    if (next < 1 || next > MAX_QTY) return;
    qty = next;
    qtyEl.textContent = qty;
    refresh();
  })
);

document
  .querySelectorAll(".group input, #notes")
  .forEach((el) => el.addEventListener("change", refresh));

addBtn.addEventListener("click", () => {
  const doneness = document.querySelector('input[name="doneness"]:checked')?.value || "—";
  const side = document.querySelector('input[name="side"]:checked')?.value || "—";
  const extras = [...document.querySelectorAll('input[name="extras"]:checked')].map((c) => c.value);
  hint.innerHTML = `<strong>Added · ${qty} × Ribeye 14oz</strong> · ${doneness} · ${side}${extras.length ? ` · ${extras.join(" · ")}` : ""}`;
  hint.style.color = "var(--forest-d)";
  toast.textContent = `Added · ${totalEl.textContent}`;
  toast.hidden = false;
  clearTimeout(addBtn._t);
  addBtn._t = setTimeout(() => (toast.hidden = true), 2200);
  close();
});

refresh();
