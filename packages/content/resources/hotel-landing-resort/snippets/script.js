// ── Toast ────────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Sticky nav + CTA band ────────────────────────────────────────────────────
const siteNav = document.getElementById("siteNav");
const stickyCta = document.getElementById("stickyCta");
const heroEl = document.getElementById("home");

function onScroll() {
  const heroBottom = heroEl.getBoundingClientRect().bottom;
  siteNav.classList.toggle("scrolled", window.scrollY > 60);
  // Show the sticky CTA band once the hero is fully scrolled past
  const show = heroBottom < 0;
  stickyCta.classList.toggle("visible", show);
  stickyCta.setAttribute("aria-hidden", String(!show));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll(); // run once on load

// ── Nights calculator helper ─────────────────────────────────────────────────
function calcNights(inVal, outVal) {
  if (!inVal || !outVal) return 0;
  const nights = Math.round((new Date(outVal) - new Date(inVal)) / 864e5);
  return nights > 0 ? nights : 0;
}
function fmtNights(n) {
  return n === 1 ? "1 night" : `${n} nights`;
}

// ── Hero widget ──────────────────────────────────────────────────────────────
const wCheckIn = document.getElementById("wCheckIn");
const wCheckOut = document.getElementById("wCheckOut");
const widgetNights = document.getElementById("widgetNights");

// Seed with defaults (9–12 Jun 2026)
wCheckIn.value = "2026-06-09";
wCheckOut.value = "2026-06-12";

function updateWidgetLabel() {
  const n = calcNights(wCheckIn.value, wCheckOut.value);
  widgetNights.textContent = n > 0 ? `${fmtNights(n)} · ` : "";
}
updateWidgetLabel();

wCheckIn.addEventListener("change", () => {
  if (wCheckOut.value && wCheckOut.value <= wCheckIn.value) {
    const d = new Date(wCheckIn.value);
    d.setDate(d.getDate() + 1);
    wCheckOut.value = d.toISOString().slice(0, 10);
  }
  updateWidgetLabel();
});
wCheckOut.addEventListener("change", updateWidgetLabel);

document.getElementById("widgetSearch").addEventListener("click", () => {
  const n = calcNights(wCheckIn.value, wCheckOut.value);
  if (n <= 0) {
    showToast("Please select valid check-in and check-out dates.");
    return;
  }
  showToast(`Checking availability · ${fmtNights(n)} from ${wCheckIn.value}`);
});

// ── Room cards ───────────────────────────────────────────────────────────────
document.querySelectorAll(".room-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const room = btn.dataset.room;
    showToast(`Opening reservation for "${room}" →`);
  });
});

// ── Reserve form ─────────────────────────────────────────────────────────────
const rIn = document.getElementById("rIn");
const rOut = document.getElementById("rOut");
const rName = document.getElementById("rName");
const rEmail = document.getElementById("rEmail");
const nightsCalc = document.getElementById("nightsCalc");

// Seed defaults
rIn.value = "2026-06-09";
rOut.value = "2026-06-12";

// Rate map per room type
const RATES = { "": 180, garden: 180, ocean: 340, cliff: 680 };

function updateNightsCalc() {
  const n = calcNights(rIn.value, rOut.value);
  const roomType = document.getElementById("rRoom").value;
  const rate = RATES[roomType] || 180;
  if (n > 0) {
    const total = n * rate;
    nightsCalc.innerHTML = `<strong>${fmtNights(n)}</strong> · from €${total.toLocaleString()} (direct −10%)`;
  } else {
    nightsCalc.textContent = "";
  }
}
updateNightsCalc();

rIn.addEventListener("change", () => {
  if (rOut.value && rOut.value <= rIn.value) {
    const d = new Date(rIn.value);
    d.setDate(d.getDate() + 1);
    rOut.value = d.toISOString().slice(0, 10);
  }
  updateNightsCalc();
});
rOut.addEventListener("change", updateNightsCalc);
document.getElementById("rRoom").addEventListener("change", updateNightsCalc);

document.getElementById("reserveForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  // Clear errors
  [rName, rEmail, rIn, rOut].forEach((el) => el.classList.remove("error"));

  if (!rName.value.trim()) {
    rName.classList.add("error");
    valid = false;
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(rEmail.value.trim())) {
    rEmail.classList.add("error");
    valid = false;
  }
  if (calcNights(rIn.value, rOut.value) <= 0) {
    rIn.classList.add("error");
    rOut.classList.add("error");
    valid = false;
  }

  if (!valid) {
    showToast("Please complete all required fields.");
    return;
  }

  const firstName = rName.value.trim().split(" ")[0];
  const n = calcNights(rIn.value, rOut.value);
  showToast(`Booking request sent! See you soon, ${firstName} · ${fmtNights(n)}`);
  document.getElementById("reserveForm").reset();
  nightsCalc.textContent = "";
});

// ── Smooth scroll ────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
