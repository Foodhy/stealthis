// ── Medication formulary (illustrative) ──────────────────────────────────────
const DRUGS = [
  { name: "Amoxicillin 500mg", cat: "Antibiotic" },
  { name: "Atorvastatin 20mg", cat: "Statin" },
  { name: "Lisinopril 10mg", cat: "ACE inhibitor" },
  { name: "Metformin 500mg", cat: "Antidiabetic" },
  { name: "Omeprazole 20mg", cat: "PPI" },
  { name: "Ibuprofen 400mg", cat: "NSAID" },
  { name: "Amlodipine 5mg", cat: "Calcium blocker" },
  { name: "Sertraline 50mg", cat: "SSRI" },
  { name: "Levothyroxine 50mcg", cat: "Thyroid" },
  { name: "Salbutamol inhaler", cat: "Bronchodilator" },
];

// ── Element refs ──────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const form = $("rxForm");
const drugInput = $("drug");
const acList = $("acList");
const fields = {
  dose: $("dose"),
  route: $("route"),
  frequency: $("frequency"),
  duration: $("duration"),
  quantity: $("quantity"),
  refills: $("refills"),
  prn: $("prn"),
  notes: $("notes"),
};
const pv = {
  drug: $("pvDrug"),
  sig: $("pvSig"),
  notes: $("pvNotes"),
  qty: $("pvQty"),
  refills: $("pvRefills"),
};
const rxList = $("rxList");
const emptyState = $("emptyState");
const countPill = $("countPill");
const sendBtn = $("sendBtn");
const toast = $("toast");

let prescriptions = [];
let activeIndex = -1;

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, isError) {
  toast.textContent = msg;
  toast.classList.toggle("is-error", Boolean(isError));
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2800);
}

// ── Sig assembly ──────────────────────────────────────────────────────────────
function buildSig() {
  const parts = [];
  if (fields.dose.value.trim()) parts.push(fields.dose.value.trim());
  if (fields.route.value) parts.push(fields.route.value.toLowerCase());
  if (fields.frequency.value) parts.push(fields.frequency.value.toLowerCase());
  if (fields.prn.checked) parts.push("as needed (PRN)");
  if (fields.duration.value.trim()) parts.push(`for ${fields.duration.value.trim()}`);
  return parts.length
    ? `Sig: ${parts.join(" · ")}`
    : "Sig: complete the fields to assemble instructions.";
}

function renderPreview() {
  pv.drug.textContent = drugInput.value.trim() || "—";
  pv.sig.textContent = buildSig();
  pv.qty.textContent = fields.quantity.value || "0";
  pv.refills.textContent = fields.refills.value || "0";
  const note = fields.notes.value.trim();
  pv.notes.textContent = note;
  pv.notes.hidden = !note;
}

// ── Autocomplete ──────────────────────────────────────────────────────────────
function highlight(name, q) {
  const i = name.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return name;
  return `${name.slice(0, i)}<mark>${name.slice(i, i + q.length)}</mark>${name.slice(i + q.length)}`;
}

function closeList() {
  acList.hidden = true;
  acList.innerHTML = "";
  activeIndex = -1;
  drugInput.setAttribute("aria-expanded", "false");
}

function openList() {
  const q = drugInput.value.trim();
  if (!q) return closeList();
  const matches = DRUGS.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));
  activeIndex = -1;
  acList.innerHTML = matches.length
    ? matches
        .map(
          (d) =>
            `<li class="ac-item" role="option" data-name="${d.name}"><span>${highlight(d.name, q)}</span><span class="ac-cat">${d.cat}</span></li>`
        )
        .join("")
    : `<li class="ac-empty">No matching medication</li>`;
  acList.hidden = false;
  drugInput.setAttribute("aria-expanded", "true");
}

function selectDrug(name) {
  drugInput.value = name;
  closeList();
  renderPreview();
  fields.dose.focus();
}

drugInput.addEventListener("input", () => {
  openList();
  renderPreview();
});
drugInput.addEventListener("focus", openList);

drugInput.addEventListener("keydown", (e) => {
  const items = [...acList.querySelectorAll(".ac-item")];
  if (!items.length) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex += e.key === "ArrowDown" ? 1 : -1;
    if (activeIndex < 0) activeIndex = items.length - 1;
    if (activeIndex >= items.length) activeIndex = 0;
    items.forEach((it, i) => it.classList.toggle("is-active", i === activeIndex));
    items[activeIndex].scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter" && activeIndex > -1) {
    e.preventDefault();
    selectDrug(items[activeIndex].dataset.name);
  } else if (e.key === "Escape") {
    closeList();
  }
});

acList.addEventListener("mousedown", (e) => {
  const item = e.target.closest(".ac-item");
  if (item) {
    e.preventDefault();
    selectDrug(item.dataset.name);
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".combo")) closeList();
});

// ── Live preview on any field change ──────────────────────────────────────────
form.addEventListener("input", renderPreview);
form.addEventListener("change", renderPreview);

// ── List rendering ────────────────────────────────────────────────────────────
function refreshList() {
  countPill.textContent = `${prescriptions.length} item${prescriptions.length === 1 ? "" : "s"}`;
  sendBtn.disabled = prescriptions.length === 0;
  emptyState.hidden = prescriptions.length > 0;
  rxList.querySelectorAll(".rx-item").forEach((n) => n.remove());
  prescriptions.forEach((rx, i) => {
    const li = document.createElement("li");
    li.className = "rx-item";
    const sig = rx.sig.replace(/^Sig:\s*/, "");
    li.innerHTML =
      `<div><p class="li-name">${rx.drug}</p><p class="li-sig">${sig}</p></div>` +
      `<button class="remove-btn" data-i="${i}" aria-label="Remove ${rx.drug}">✕</button>`;
    rxList.appendChild(li);
  });
}

rxList.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove-btn");
  if (!btn) return;
  const removed = prescriptions.splice(Number(btn.dataset.i), 1)[0];
  refreshList();
  showToast(`Removed ${removed.drug} from the list.`);
});

// ── Add / submit ──────────────────────────────────────────────────────────────
form.addEventListener("submit", (e) => {
  e.preventDefault();
  drugInput.classList.remove("is-invalid");
  fields.frequency.classList.remove("is-invalid");
  if (!drugInput.value.trim()) {
    drugInput.classList.add("is-invalid");
    drugInput.focus();
    return showToast("Select or enter a medication first.", true);
  }
  if (!fields.frequency.value) {
    fields.frequency.classList.add("is-invalid");
    fields.frequency.focus();
    return showToast("Choose a frequency before adding.", true);
  }
  prescriptions.push({ drug: drugInput.value.trim(), sig: buildSig() });
  refreshList();
  showToast(`Added ${drugInput.value.trim()} to the prescription.`);
  form.reset();
  renderPreview();
});

form.addEventListener("reset", () => {
  drugInput.classList.remove("is-invalid");
  fields.frequency.classList.remove("is-invalid");
  setTimeout(renderPreview, 0);
});

// ── Send all ──────────────────────────────────────────────────────────────────
sendBtn.addEventListener("click", () => {
  if (!prescriptions.length) return;
  const n = prescriptions.length;
  prescriptions = [];
  refreshList();
  showToast(`Sent ${n} prescription${n === 1 ? "" : "s"} to the pharmacy.`);
});

renderPreview();
refreshList();
