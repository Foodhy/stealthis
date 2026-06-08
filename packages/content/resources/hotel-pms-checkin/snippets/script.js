// ── Mock data ──────────────────────────────────────────────────────────────
const ARRIVALS = [
  { code: "AUR-21847", name: "Aiko Tanaka", meta: "2 adults · Junior Suite · 5 nights", dates: "24 May → 29 May", status: "Expected" },
  { code: "AUR-21848", name: "Mariana Sosa", meta: "2 adults · 1 child · Deluxe Suite", dates: "24 May → 27 May", status: "Expected" },
  { code: "AUR-21849", name: "Thomas Reuter", meta: "1 adult · Classic Double", dates: "24 May → 25 May", status: "Expected" },
  { code: "AUR-21850", name: "Olivier Banks", meta: "2 adults · Twin Standard · late ETA", dates: "24 May → 26 May", status: "Late" },
];

const ROOMS = [
  { no: "302", label: "Junior Suite · King", floor: 3, status: "Ready" },
  { no: "303", label: "Junior Suite · King", floor: 3, status: "Ready" },
  { no: "304", label: "Junior Suite · Twin", floor: 3, status: "In service" },
];

// ── State ──────────────────────────────────────────────────────────────────
let step = 1;
let selectedRes = null;
let selectedRoom = null;
let payMethod = "card";

const panels = document.querySelectorAll(".step-panel");
const steps = document.querySelectorAll(".step");
const lines = document.querySelectorAll(".step-line");
const next = document.getElementById("next");
const back = document.getElementById("back");
const footerMeta = document.getElementById("footerMeta");
const summary = document.getElementById("summary");
const toast = document.getElementById("toast");

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 1800);
}

// ── Step 1: Lookup ─────────────────────────────────────────────────────────
const resultsEl = document.getElementById("results");
const lookupInput = document.getElementById("lookup");

function renderResults() {
  const q = (lookupInput.value || "").toLowerCase().trim();
  const list = ARRIVALS.filter((r) =>
    !q ||
    r.name.toLowerCase().includes(q) ||
    r.code.toLowerCase().includes(q) ||
    r.meta.toLowerCase().includes(q)
  );
  resultsEl.innerHTML = list
    .map(
      (r) => `
      <button class="res ${selectedRes?.code === r.code ? "is-selected" : ""}" data-code="${r.code}">
        <span class="res-code">${r.code}</span>
        <span class="res-body">
          <span class="res-name">${r.name}</span>
          <span class="res-meta">${r.meta}</span>
        </span>
        <span class="res-dates">${r.dates}</span>
        <span class="res-status">${r.status}</span>
      </button>`
    )
    .join("");
}
renderResults();
lookupInput.addEventListener("input", renderResults);
resultsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".res");
  if (!btn) return;
  selectedRes = ARRIVALS.find((r) => r.code === btn.dataset.code);
  renderResults();
  renderSummary();
  updateNav();
});

// ── Step 2: Rooms ──────────────────────────────────────────────────────────
const roomsEl = document.getElementById("rooms");
roomsEl.innerHTML = ROOMS.map(
  (r) => `
  <button class="room-pick" data-no="${r.no}">
    <strong>${r.no}</strong>
    <small>${r.label}</small>
    <em>${r.status}</em>
  </button>`
).join("");

roomsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".room-pick");
  if (!btn) return;
  roomsEl.querySelectorAll(".room-pick").forEach((x) => x.classList.remove("is-selected"));
  btn.classList.add("is-selected");
  selectedRoom = ROOMS.find((r) => r.no === btn.dataset.no);
  renderSummary();
});

// ── Step 3: Payment ────────────────────────────────────────────────────────
const payBody = document.getElementById("payBody");
const PAY_TEXT = {
  card: `Charge <strong>€1,221.50</strong> to card on file <strong>Visa •••• 4421</strong>. Authorisation will appear on the guest folio within 10 seconds.`,
  auth: `Pre-authorise <strong>€1,500.00</strong> on card on file as incidental hold. Released on check-out if no additional charges.`,
  cash: `Collect <strong>€1,221.50</strong> in cash. Drawer will open after confirming. A printed receipt is issued automatically.`,
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

// ── Summary ────────────────────────────────────────────────────────────────
function renderSummary() {
  if (!selectedRes) {
    summary.innerHTML = `<h2>Reservation</h2><p class="summary-empty">Select a reservation to populate this panel.</p>`;
    return;
  }
  summary.innerHTML = `
    <h2>Reservation</h2>
    <div class="sum-row"><span>Guest</span><span>${selectedRes.name}</span></div>
    <div class="sum-row"><span>Confirmation</span><span>${selectedRes.code}</span></div>
    <div class="sum-row"><span>Dates</span><span>${selectedRes.dates}</span></div>
    <div class="sum-row"><span>Stay</span><span>${selectedRes.meta}</span></div>
    <div class="sum-row"><span>Room</span><span>${selectedRoom ? selectedRoom.no + " · " + selectedRoom.label : "—"}</span></div>
    <div class="sum-block">
      <strong>€1,221.50</strong>
      <small>folio balance (incl. tax)</small>
    </div>
  `;
}
renderSummary();

// ── Stepper logic ──────────────────────────────────────────────────────────
function goto(n) {
  step = n;
  panels.forEach((p) => p.classList.toggle("is-active", parseInt(p.dataset.panel, 10) === n));
  steps.forEach((s) => {
    const sn = parseInt(s.dataset.step, 10);
    s.classList.toggle("is-active", sn === n);
    s.classList.toggle("is-done", sn < n);
  });
  updateNav();
}
function updateNav() {
  back.disabled = step === 1;
  footerMeta.textContent = `Step ${step} of 3`;
  if (step === 3) {
    next.textContent = "Complete check-in";
    next.classList.add("is-final");
    next.disabled = false;
  } else {
    next.textContent = "Continue →";
    next.classList.remove("is-final");
    if (step === 1) next.disabled = !selectedRes;
    if (step === 2) next.disabled = false;
  }
}
next.addEventListener("click", () => {
  if (step === 1 && !selectedRes) return;
  if (step < 3) {
    goto(step + 1);
  } else {
    showToast(`Check-in complete · welcome to ${selectedRoom?.no || "—"}`);
    next.disabled = true;
  }
});
back.addEventListener("click", () => step > 1 && goto(step - 1));
steps.forEach((s) =>
  s.addEventListener("click", () => {
    const target = parseInt(s.dataset.step, 10);
    if (target === 1 || (target === 2 && selectedRes) || (target === 3 && selectedRes)) goto(target);
  })
);

updateNav();
