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

window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
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
function fmt(isoStr) {
  return new Date(isoStr + "T00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Booking widget ────────────────────────────────────────────────────────────
const bciEl = document.getElementById("bci");
const bcoEl = document.getElementById("bco");
const broomEl = document.getElementById("broom");
const bgValEl = document.getElementById("bgVal");
const bgMinus = document.getElementById("bgMinus");
const bgPlus = document.getElementById("bgPlus");
const bNightsEl = document.getElementById("bNights");
const bTotalEl = document.getElementById("bTotal");
const corpEl = document.getElementById("corpRate");

// Room rates
const RATES = { standard: 149, superior: 189, executive: 279 };
const CORP_DISCOUNT = 0.12;

// Defaults: check-in Jun 9, check-out Jun 11
const today = new Date("2026-06-08");
const defIn = new Date("2026-06-09");
const defOut = new Date("2026-06-11");

bciEl.value = iso(defIn);
bcoEl.value = iso(defOut);
bciEl.min = iso(today);
bcoEl.min = iso(addDays(today, 1));

let bgCount = 1;

function calcNights() {
  if (!bciEl.value || !bcoEl.value) return 0;
  const ms = new Date(bcoEl.value) - new Date(bciEl.value);
  return Math.round(ms / 86400000);
}

function renderWidget() {
  const n = calcNights();
  const rate = RATES[broomEl.value] ?? 189;
  const corp = corpEl.checked;
  const final = corp ? rate * (1 - CORP_DISCOUNT) : rate;
  const total = Math.round(final * n * bgCount);

  if (n <= 0) {
    bNightsEl.textContent = "—";
    bTotalEl.classList.add("error");
    bTotalEl.textContent = "⚠ Check-out must be after check-in";
    return;
  }

  bNightsEl.textContent = n;
  bTotalEl.classList.remove("error");
  const corpNote = corp ? ` <em style="color:var(--success);">−12% corp</em>` : "";
  bTotalEl.innerHTML =
    `<strong>€${total}</strong>&nbsp;total · ${n} night${n === 1 ? "" : "s"} ` +
    `· ${bgCount} guest${bgCount === 1 ? "" : "s"} · €${Math.round(final)}/night${corpNote}`;
}

// Guest stepper
function syncGuests() {
  bgValEl.textContent = bgCount;
  bgMinus.disabled = bgCount <= 1;
  bgPlus.disabled = bgCount >= 6;
}
bgMinus.addEventListener("click", () => {
  if (bgCount > 1) {
    bgCount--;
    syncGuests();
    renderWidget();
  }
});
bgPlus.addEventListener("click", () => {
  if (bgCount < 6) {
    bgCount++;
    syncGuests();
    renderWidget();
  }
});

bciEl.addEventListener("change", () => {
  const inD = new Date(bciEl.value);
  const minOut = iso(addDays(inD, 1));
  bcoEl.min = minOut;
  if (new Date(bcoEl.value) <= inD) bcoEl.value = minOut;
  renderWidget();
});
bcoEl.addEventListener("change", renderWidget);
broomEl.addEventListener("change", renderWidget);
corpEl.addEventListener("change", renderWidget);

// Widget submit
document.getElementById("bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = calcNights();
  if (n <= 0) {
    renderWidget();
    return;
  }
  const room = broomEl.options[broomEl.selectedIndex].text.split(" —")[0];
  const rate = RATES[broomEl.value] ?? 189;
  const corp = corpEl.checked;
  const final = corp ? rate * (1 - CORP_DISCOUNT) : rate;
  const total = Math.round(final * n * bgCount);
  showToast(
    `Checking availability: ${room} · ${fmt(bciEl.value)} – ${fmt(bcoEl.value)} · €${total}`
  );
});

syncGuests();
renderWidget();

// ── Reserve footer form ───────────────────────────────────────────────────────
document.getElementById("reserveFooterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("rfName").value.trim();
  const email = document.getElementById("rfEmail").value.trim();
  const company = document.getElementById("rfCompany").value.trim();

  if (!name) {
    showToast("Please enter your full name.");
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid work email.");
    return;
  }

  const co = company ? ` (${company})` : "";
  showToast(`Reservation request sent for ${name}${co}. We'll confirm within 1 hour.`);
  e.target.reset();
});
