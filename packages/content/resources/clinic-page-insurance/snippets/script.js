// ── Toast ──────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2800);
}

// ── Payer search filter ──────────────────────────────────────────────────────
const search = document.getElementById("payer-search");
const payers = Array.from(document.querySelectorAll("#payer-grid .payer"));
const payerEmpty = document.getElementById("payer-empty");

search.addEventListener("input", () => {
  const q = search.value.trim().toLowerCase();
  let shown = 0;
  payers.forEach((p) => {
    const match = p.dataset.name.toLowerCase().includes(q);
    p.hidden = !match;
    if (match) shown++;
  });
  payerEmpty.hidden = shown !== 0;
});

// ── Self-pay pricing toggle (Standard vs Care Member −15%) ────────────────────
const segBtns = Array.from(document.querySelectorAll(".seg-btn"));
const priceCells = Array.from(document.querySelectorAll(".trow[data-base]"));
const MEMBER_RATE = 0.85; // −15%

function renderPrices(cycle) {
  const member = cycle === "member";
  priceCells.forEach((row) => {
    const base = Number(row.dataset.base);
    const cell = row.querySelector("[data-price]");
    const value = member ? Math.round(base * MEMBER_RATE) : base;
    cell.textContent = "$" + value;
    cell.classList.toggle("is-member", member);
  });
}

segBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    segBtns.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    renderPrices(btn.dataset.cycle);
    if (btn.dataset.cycle === "member") {
      showToast("Care Member rates applied — save 15% on self-pay services.");
    }
  });
});

// ── FAQ accordion (single-open) ──────────────────────────────────────────────
const faqButtons = Array.from(document.querySelectorAll(".faq-q"));

function closePanel(btn) {
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  btn.setAttribute("aria-expanded", "false");
  panel.style.maxHeight = "0px";
}

function openPanel(btn) {
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  btn.setAttribute("aria-expanded", "true");
  panel.style.maxHeight = panel.scrollHeight + "px";
}

faqButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    faqButtons.forEach((other) => {
      if (other !== btn) closePanel(other);
    });
    if (isOpen) closePanel(btn);
    else openPanel(btn);
  });
});

// Keep an open panel sized correctly when the viewport changes.
window.addEventListener("resize", () => {
  faqButtons.forEach((btn) => {
    if (btn.getAttribute("aria-expanded") === "true") {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
});

// ── Coverage check form ──────────────────────────────────────────────────────
const form = document.getElementById("coverage-form");
const planInput = document.getElementById("cv-plan");
const idInput = document.getElementById("cv-id");

[planInput, idInput].forEach((input) => {
  input.addEventListener("input", () => {
    input.closest(".field").classList.remove("invalid");
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;
  [planInput, idInput].forEach((input) => {
    const ok = input.value.trim().length > 0;
    input.closest(".field").classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });

  if (!valid) {
    showToast("Add your plan and member ID so we can verify coverage.");
    (planInput.value.trim() ? idInput : planInput).focus();
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const planName = planInput.value.trim();
  submitBtn.disabled = true;
  submitBtn.textContent = "Checking…";
  showToast("Submitting your details to our billing team…");

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Check coverage";
    form.reset();
    showToast(`Thanks — we'll confirm your ${planName} coverage within one business day.`);
  }, 1400);
});
