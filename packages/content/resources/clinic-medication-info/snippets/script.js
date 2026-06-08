// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2600);
}

// ── Text-size toggle (A / A+ / A++) ──────────────────────────────────────────
// Each step scales the leaflet's --scale lever; everything sized in em flexes.
const SCALES = { md: 1, lg: 1.15, xl: 1.32 };
const LABELS = { md: "Normal", lg: "Large", xl: "Extra large" };
const sheet = document.getElementById("sheet");
const sizeBtns = document.querySelectorAll(".size-btn");

function setSize(size) {
  if (!SCALES[size]) return;
  sheet.dataset.size = size;
  sheet.style.setProperty("--scale", String(SCALES[size]));
  sizeBtns.forEach((btn) => {
    const active = btn.dataset.size === size;
    btn.setAttribute("aria-pressed", String(active));
  });
}

sizeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const size = btn.dataset.size;
    setSize(size);
    showToast(`Text size set to ${LABELS[size]}.`);
  });
});

// Initialise from the markup's default.
setSize(sheet.dataset.size || "md");

// ── Print ────────────────────────────────────────────────────────────────────
document.getElementById("print").addEventListener("click", () => {
  showToast("Opening print dialog…");
  // Let the toast paint before the (blocking) print dialog appears.
  setTimeout(() => window.print(), 120);
});
