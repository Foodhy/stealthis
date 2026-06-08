const NIGHTS = 3;
const TAX_RATE = 0.11;
const eur = (n) => "€" + n.toLocaleString("en-GB");

// ── Gallery ───────────────────────────────────────────────────────────────────
const main = document.getElementById("galleryMain");
const CAPTIONS = ["Bedroom", "Marble bathroom", "Skyline view", "Workspace"];
main.dataset.caption = CAPTIONS[0];

document.getElementById("thumbs").addEventListener("click", (e) => {
  const t = e.target.closest(".thumb");
  if (!t) return;
  const shot = t.dataset.shot;
  main.dataset.shot = shot;
  main.dataset.caption = CAPTIONS[Number(shot)];
  document.querySelectorAll(".thumb").forEach((x) => x.classList.remove("is-active"));
  t.classList.add("is-active");
});

// ── Rate plan selection ───────────────────────────────────────────────────────
const rates = document.getElementById("rates");
const rateLine = document.getElementById("rateLine");
const subtotalEl = document.getElementById("subtotal");
const taxesEl = document.getElementById("taxes");
const totalEl = document.getElementById("total");
const bfLine = document.getElementById("bfLine");
const planNote = document.getElementById("planNote");
const fine = document.querySelector(".bc-fine");

const PLAN_META = {
  flex: {
    note: "Flexible rate · free cancellation",
    fine: "You won't be charged yet on the flexible rate.",
  },
  bb: {
    note: "Bed & breakfast · free cancellation",
    fine: "Breakfast for 2 included · pay at the hotel.",
  },
  saver: {
    note: "Non-refundable · charged at booking",
    fine: "Non-refundable — your card is charged now.",
  },
};

function recalc() {
  const checked = rates.querySelector("input:checked");
  const price = Number(checked.dataset.price);
  const hasBf = checked.dataset.bf === "1";
  const subtotal = price * NIGHTS;
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + taxes;

  rateLine.textContent = `${eur(price)} × ${NIGHTS} nights`;
  subtotalEl.textContent = eur(subtotal);
  taxesEl.textContent = eur(taxes);
  totalEl.textContent = eur(total);
  bfLine.hidden = !hasBf;

  const meta = PLAN_META[checked.value];
  planNote.textContent = meta.note;
  planNote.style.color = checked.value === "saver" ? "var(--danger)" : "var(--success)";
  fine.textContent = meta.fine;

  document
    .querySelectorAll(".rate")
    .forEach((r) => r.classList.toggle("is-selected", r.contains(checked)));
}

rates.addEventListener("change", recalc);

// ── Reserve ───────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}

document.getElementById("reserve").addEventListener("click", () => {
  const plan = rates.querySelector("input:checked").value;
  showToast(`Reserving Deluxe Double · ${PLAN_META[plan].note} · ${totalEl.textContent}`);
});

recalc();
