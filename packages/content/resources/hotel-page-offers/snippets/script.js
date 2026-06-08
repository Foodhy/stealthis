// ── Toast helper ─────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Offer filter ──────────────────────────────────────────────────────────────
const filterBtns = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".offer-card");
const resultsCount = document.getElementById("resultsCount");

function applyFilter(cat) {
  let visible = 0;
  cards.forEach((card) => {
    const match = cat === "all" || card.dataset.cat === cat;
    card.hidden = !match;
    if (match) visible++;
  });
  resultsCount.textContent = `${visible} ${visible === 1 ? "offer" : "offers"}`;
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilter(btn.dataset.cat);
  });
});

// ── Book CTA buttons ──────────────────────────────────────────────────────────
document.querySelectorAll(".btn-book").forEach((btn) => {
  btn.addEventListener("click", () => {
    const offerName = btn.dataset.offer;
    showToast(`Redirecting to booking — ${offerName}…`);
  });
});

// ── Promo code validator ──────────────────────────────────────────────────────
const VALID_CODES = {
  AURELIA10: "10% discount applied — code AURELIA10 is valid ✓",
  SUMMER26: "Summer 2026 discount applied — code SUMMER26 is valid ✓",
};

const promoInput = document.getElementById("promoInput");
const promoApply = document.getElementById("promoApply");
const promoFeedback = document.getElementById("promoFeedback");

// Reset feedback state on input change
promoInput.addEventListener("input", () => {
  promoInput.classList.remove("is-success", "is-error");
  promoFeedback.hidden = true;
  promoFeedback.className = "promo-feedback";
});

promoApply.addEventListener("click", () => {
  const code = promoInput.value.trim().toUpperCase();

  if (!code) {
    showToast("Please enter a promo code.");
    promoInput.focus();
    return;
  }

  if (VALID_CODES[code]) {
    promoInput.classList.add("is-success");
    promoFeedback.textContent = VALID_CODES[code];
    promoFeedback.className = "promo-feedback feedback-success";
    promoFeedback.hidden = false;
    showToast("Promo code applied successfully!");
  } else {
    promoInput.classList.add("is-error");
    promoFeedback.textContent = `"${code}" is not a valid promo code. Please check and try again.`;
    promoFeedback.className = "promo-feedback feedback-error";
    promoFeedback.hidden = false;
    showToast("Invalid promo code — please try again.");
  }
});

// Allow pressing Enter in promo field
promoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") promoApply.click();
});

// ── Init ──────────────────────────────────────────────────────────────────────
applyFilter("all");
