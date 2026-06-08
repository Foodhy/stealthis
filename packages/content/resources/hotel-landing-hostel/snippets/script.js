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
const HERO_THRESH = window.innerHeight * 0.7;

window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("visible", window.scrollY > HERO_THRESH);
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

// ── Reservation widget ────────────────────────────────────────────────────────
const cinEl = document.getElementById("cin");
const coutEl = document.getElementById("cout");
const bedEl = document.getElementById("bedtype");
const gCountEl = document.getElementById("gCount");
const gMinus = document.getElementById("gMinus");
const gPlus = document.getElementById("gPlus");
const nightsEl = document.getElementById("nightsVal");
const totalEl = document.getElementById("widgetTotal");

// Bed prices map
const BED_PRICES = {
  dorm4: 18,
  dorm6: 15,
  dorm10: 12,
  private: 62,
  twin: 74,
};

// Set defaults: check-in Jun 9, check-out Jun 12
const today = new Date("2026-06-08");
const defIn = new Date("2026-06-09");
const defOut = new Date("2026-06-12");

cinEl.value = iso(defIn);
coutEl.value = iso(defOut);
cinEl.min = iso(today);
coutEl.min = iso(addDays(today, 1));

let guestCount = 1;

function getPrice(key) {
  return BED_PRICES[key] ?? 18;
}

function calcNights() {
  if (!cinEl.value || !coutEl.value) return 0;
  const ms = new Date(coutEl.value) - new Date(cinEl.value);
  return Math.round(ms / 86400000);
}

function renderWidget() {
  const n = calcNights();
  const price = getPrice(bedEl.value);
  const total = n * price * guestCount;

  if (n <= 0) {
    nightsEl.textContent = "—";
    totalEl.classList.add("error");
    totalEl.textContent = "⚠ Check-out must be after check-in";
    return;
  }

  totalEl.classList.remove("error");
  nightsEl.textContent = n;
  totalEl.innerHTML = `<strong>€${total}</strong>&nbsp; total · ${n} night${n === 1 ? "" : "s"} · ${guestCount} guest${guestCount === 1 ? "" : "s"} · €${price}/night`;
}

// Guest stepper
function syncGuests() {
  gCountEl.textContent = guestCount;
  gMinus.disabled = guestCount <= 1;
  gPlus.disabled = guestCount >= 10;
}
gMinus.addEventListener("click", () => {
  if (guestCount > 1) {
    guestCount--;
    syncGuests();
    renderWidget();
  }
});
gPlus.addEventListener("click", () => {
  if (guestCount < 10) {
    guestCount++;
    syncGuests();
    renderWidget();
  }
});

// Date / bed change listeners
cinEl.addEventListener("change", () => {
  const inD = new Date(cinEl.value);
  const minOut = iso(addDays(inD, 1));
  coutEl.min = minOut;
  if (new Date(coutEl.value) <= inD) coutEl.value = minOut;
  renderWidget();
});
coutEl.addEventListener("change", renderWidget);
bedEl.addEventListener("change", renderWidget);

// Widget form submit
document.getElementById("reserveForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = calcNights();
  if (n <= 0) {
    renderWidget();
    return;
  }
  const bed = bedEl.options[bedEl.selectedIndex].text.split(" —")[0];
  const price = getPrice(bedEl.value);
  const total = n * price * guestCount;
  showToast(
    `🎒 ${bed} · ${n} nights · ${guestCount} guest${guestCount === 1 ? "" : "s"} · €${total}`
  );
});

syncGuests();
renderWidget();

// ── Reserve footer form ───────────────────────────────────────────────────────
document.getElementById("reserveFooterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("rName").value.trim();
  const email = document.getElementById("rEmail").value.trim();

  if (!name) {
    showToast("⚠ Please enter your name.");
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("⚠ Please enter a valid email.");
    return;
  }

  showToast(`✅ Reservation request sent for ${name}! Check your inbox.`);
  document.getElementById("rName").value = "";
  document.getElementById("rEmail").value = "";
});
