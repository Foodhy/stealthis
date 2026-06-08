// ── Toast helper ─────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Sticky nav on scroll ──────────────────────────────────────────────────────
const nav = document.getElementById("nav");
const THRESH = window.innerHeight * 0.75;

window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("visible", window.scrollY > THRESH);
  },
  { passive: true }
);

// ── Date helpers ──────────────────────────────────────────────────────────────
function iso(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function fmtDate(isoStr) {
  return new Date(isoStr + "T00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

// ── Room rates & breakfast ────────────────────────────────────────────────────
const ROOM_RATES = { rose: 95, orchard: 110, lavender: 145 };
const BK_RATE = 18; // per guest per night

// ── Reservation widget ────────────────────────────────────────────────────────
const rciEl = document.getElementById("rci");
const rcoEl = document.getElementById("rco");
const rroomEl = document.getElementById("rroom");
const gvEl = document.getElementById("gv");
const gmBtn = document.getElementById("gm");
const gpBtn = document.getElementById("gp");
const rNightsEl = document.getElementById("rNights");
const rTotalEl = document.getElementById("rTotal");
const bkEl = document.getElementById("bkfast");

// Defaults: check-in 9 Jun, check-out 12 Jun 2026
const today = new Date("2026-06-08");
const defIn = new Date("2026-06-09");
const defOut = new Date("2026-06-12");

rciEl.value = iso(defIn);
rcoEl.value = iso(defOut);
rciEl.min = iso(today);
rcoEl.min = iso(addDays(today, 1));

let gCount = 2;

function calcNights() {
  if (!rciEl.value || !rcoEl.value) return 0;
  const ms = new Date(rcoEl.value) - new Date(rciEl.value);
  return Math.round(ms / 86400000);
}

function renderWidget() {
  const n = calcNights();
  const rate = ROOM_RATES[rroomEl.value] ?? 110;
  const bkInc = bkEl.checked;
  const bkCost = bkInc ? BK_RATE * gCount * n : 0;
  const total = n * rate + bkCost;

  if (n <= 0) {
    rNightsEl.textContent = "—";
    rTotalEl.classList.add("error");
    rTotalEl.textContent = "⚠ Departure must be after arrival";
    return;
  }

  rTotalEl.classList.remove("error");
  rNightsEl.textContent = n;
  const bkNote = bkInc ? ` + <em>£${bkCost} bkfast</em>` : " · no breakfast";
  rTotalEl.innerHTML =
    `<strong>£${total}</strong> total · ${n} night${n === 1 ? "" : "s"}` +
    ` · ${gCount} guest${gCount === 1 ? "" : "s"}${bkNote}`;
}

// Guest stepper
function syncGuests() {
  gvEl.textContent = gCount;
  gmBtn.disabled = gCount <= 1;
  gpBtn.disabled = gCount >= 4;
}
gmBtn.addEventListener("click", () => {
  if (gCount > 1) {
    gCount--;
    syncGuests();
    renderWidget();
  }
});
gpBtn.addEventListener("click", () => {
  if (gCount < 4) {
    gCount++;
    syncGuests();
    renderWidget();
  }
});

rciEl.addEventListener("change", () => {
  const inD = new Date(rciEl.value);
  const minOut = iso(addDays(inD, 1));
  rcoEl.min = minOut;
  if (new Date(rcoEl.value) <= inD) rcoEl.value = minOut;
  renderWidget();
});
rcoEl.addEventListener("change", renderWidget);
rroomEl.addEventListener("change", renderWidget);
bkEl.addEventListener("change", renderWidget);

// Widget form submit
document.getElementById("reserveWidget").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = calcNights();
  if (n <= 0) {
    renderWidget();
    return;
  }
  const room = rroomEl.options[rroomEl.selectedIndex].text.split(" —")[0];
  const rate = ROOM_RATES[rroomEl.value] ?? 110;
  const bkInc = bkEl.checked;
  const bkCost = bkInc ? BK_RATE * gCount * n : 0;
  const total = n * rate + bkCost;
  const bkStr = bkInc ? " · breakfast incl." : "";
  showToast(`🌹 ${room} · ${fmtDate(rciEl.value)} – ${fmtDate(rcoEl.value)} · £${total}${bkStr}`);
});

syncGuests();
renderWidget();

// ── Reserve footer form ───────────────────────────────────────────────────────
document.getElementById("reserveFooter").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("rfn").value.trim();
  const email = document.getElementById("rfe").value.trim();
  const msg = document.getElementById("rfm").value.trim();

  if (!name) {
    showToast("Please enter your name.");
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid email address.");
    return;
  }

  const extra = msg ? " We've noted your message." : "";
  showToast(`✉ Enquiry sent, ${name.split(" ")[0]}! We'll reply within a few hours.${extra}`);
  e.target.reset();
});
