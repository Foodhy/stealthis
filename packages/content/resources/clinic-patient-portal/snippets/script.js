// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Live countdown to the next appointment ───────────────────────────────────
// Illustrative: target is set ~22h ahead of an arbitrary fixed "now".
const countdownEl = document.getElementById("countdown");
let remaining = 22 * 3600 + 14 * 60; // seconds

function renderCountdown() {
  if (remaining <= 0) {
    countdownEl.textContent = "starting now";
    return;
  }
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  countdownEl.textContent = `starts in ${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  remaining -= 1;
}
renderCountdown();
setInterval(renderCountdown, 1000);

// ── Next-visit actions ───────────────────────────────────────────────────────
const nextVisit = document.getElementById("nextVisit");
const checkinBtn = document.getElementById("checkinBtn");

nextVisit.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "checkin") {
    nextVisit.classList.add("is-checked-in");
    checkinBtn.textContent = "Checked in ✓";
    checkinBtn.disabled = true;
    showToast("You're checked in — the clinic has been notified.");
  } else if (action === "join") {
    showToast("Opening secure video room…");
  } else if (action === "reschedule") {
    showToast("Reschedule: pick a new slot from the calendar.");
  }
});

// ── Quick actions ────────────────────────────────────────────────────────────
const QUICK_MSG = {
  book: "Booking flow: choose a specialty and time.",
  refill: "Refill request: select a medication below.",
  message: "New secure message to your care team.",
  results: "Opening your full results history.",
};
document.querySelector(".quick-grid").addEventListener("click", (e) => {
  const card = e.target.closest("[data-action]");
  if (!card) return;
  showToast(QUICK_MSG[card.dataset.action]);
});

// ── Prescription refills ─────────────────────────────────────────────────────
document.getElementById("meds").addEventListener("click", (e) => {
  const btn = e.target.closest(".refill-btn");
  if (!btn || btn.classList.contains("is-done")) return;
  btn.classList.add("is-done");
  btn.textContent = "Requested ✓";
  showToast(`Refill requested for ${btn.dataset.med} — we'll text you when it's ready.`);
});
