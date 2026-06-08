// ── Helpers ───────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const toast = $("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Sticky nav on scroll ──────────────────────────────────────────────────────
const nav = $("mainNav");
function handleScroll() {
  nav.classList.toggle("is-scrolled", window.scrollY > 40);
}
window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll(); // run once on load

// ── Mini search — date defaults & nights calc ─────────────────────────────────
const checkInEl = $("sCheckIn");
const checkOutEl = $("sCheckOut");
const nightsEl = $("nightsCalc");

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// Default: 11 Jun 2026 → 13 Jun 2026 (2 nights)
const defIn = new Date("2026-06-11");
const defOut = new Date("2026-06-13");
checkInEl.value = isoDate(defIn);
checkOutEl.value = isoDate(defOut);

function calcNights() {
  const a = new Date(checkInEl.value);
  const b = new Date(checkOutEl.value);
  if (isNaN(a) || isNaN(b) || b <= a) {
    nightsEl.textContent = "—";
    return;
  }
  const n = Math.round((b - a) / 86_400_000);
  nightsEl.textContent = n;
}

checkInEl.addEventListener("change", () => {
  // push check-out to at least one day after check-in
  const a = new Date(checkInEl.value);
  const b = new Date(checkOutEl.value);
  if (!isNaN(a) && (!checkOutEl.value || b <= a)) {
    const next = new Date(a);
    next.setDate(next.getDate() + 1);
    checkOutEl.value = isoDate(next);
  }
  calcNights();
});
checkOutEl.addEventListener("change", calcNights);
calcNights(); // initial render

// ── Search button ─────────────────────────────────────────────────────────────
$("searchBtn").addEventListener("click", () => {
  const nights = nightsEl.textContent;
  const guests = $("sGuests").value;
  if (!checkInEl.value || !checkOutEl.value) {
    showToast("Please select check-in and check-out dates.");
    return;
  }
  if (nights === "—") {
    showToast("Check-out must be after check-in.");
    return;
  }
  const checkIn = new Date(checkInEl.value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const checkOut = new Date(checkOutEl.value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  showToast(
    `Checking availability · ${checkIn} → ${checkOut} · ${nights} nights · ${guests} guest${guests > 1 ? "s" : ""}`
  );
  // scroll to rooms section
  document.getElementById("rooms").scrollIntoView({ behavior: "smooth" });
});

// ── Room card select buttons ──────────────────────────────────────────────────
document.querySelectorAll(".room-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const room = btn.dataset.room;
    const price = Number(btn.dataset.price);
    const nights = Number(nightsEl.textContent) || 1;
    const total = price * nights;
    const fmtAmt = `€${total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
    showToast(`${room} selected · ${nights} night${nights !== 1 ? "s" : ""} · ${fmtAmt} total`);
  });
});

// ── Newsletter form validation & submit ───────────────────────────────────────
$("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("nlEmail");
  const errorEl = $("nlError");
  const val = input.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  if (!valid) {
    input.classList.add("is-error");
    errorEl.hidden = false;
    input.focus();
    return;
  }

  input.classList.remove("is-error");
  errorEl.hidden = true;
  input.value = "";
  showToast(`Subscribed · ${val}`);
});

$("nlEmail").addEventListener("input", () => {
  $("nlEmail").classList.remove("is-error");
  $("nlError").hidden = true;
});
