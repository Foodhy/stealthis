// ── Input formatting ──────────────────────────────────────────────────────────
const cardnum = document.getElementById("cardnum");
const expiry = document.getElementById("expiry");
const cvc = document.getElementById("cvc");
const phone = document.getElementById("phone");

cardnum.addEventListener("input", () => {
  const digits = cardnum.value.replace(/\D/g, "").slice(0, 16);
  cardnum.value = digits.replace(/(.{4})/g, "$1 ").trim();
  clearError(cardnum);
});

expiry.addEventListener("input", () => {
  let d = expiry.value.replace(/\D/g, "").slice(0, 4);
  if (d.length >= 3) d = d.slice(0, 2) + "/" + d.slice(2);
  expiry.value = d;
  clearError(expiry);
});

cvc.addEventListener("input", () => {
  cvc.value = cvc.value.replace(/\D/g, "").slice(0, 4);
  clearError(cvc);
});

phone.addEventListener("input", () => {
  phone.value = phone.value.replace(/[^\d+\s]/g, "");
  clearError(phone);
});

// ── Validation ────────────────────────────────────────────────────────────────
function fieldOf(input) {
  return input.closest(".field");
}
function clearError(input) {
  const f = fieldOf(input);
  if (f) f.classList.remove("invalid");
}
function setError(input) {
  const f = fieldOf(input);
  if (f) f.classList.add("invalid");
}

const validators = {
  first: (v) => v.trim().length > 0,
  last: (v) => v.trim().length > 0,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v) => v.replace(/\D/g, "").length >= 6,
  cardname: (v) => v.trim().length > 1,
  cardnum: (v) => v.replace(/\s/g, "").length === 16,
  expiry: (v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v),
  cvc: (v) => /^\d{3,4}$/.test(v),
};

const form = document.getElementById("form");
const termsErr = document.querySelector(".err-terms");
const terms = document.getElementById("terms");

terms.addEventListener("change", () => {
  if (terms.checked) termsErr.classList.remove("show");
});

// Clear error as the guest corrects each field.
Object.keys(validators).forEach((name) => {
  const el = form.elements[name];
  if (el) el.addEventListener("blur", () => validateField(el));
});

function validateField(el) {
  const ok = validators[el.name](el.value);
  if (ok) clearError(el);
  else setError(el);
  return ok;
}

// ── Submit → process → confirm ────────────────────────────────────────────────
const payBtn = document.getElementById("payBtn");
const confirmed = document.getElementById("confirmed");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let firstInvalid = null;
  for (const name of Object.keys(validators)) {
    const el = form.elements[name];
    if (!validateField(el) && !firstInvalid) firstInvalid = el;
  }
  let termsOk = terms.checked;
  termsErr.classList.toggle("show", !termsOk);

  if (firstInvalid || !termsOk) {
    (firstInvalid || terms).focus();
    showToast("Please fix the highlighted fields.");
    return;
  }

  // Processing state.
  payBtn.disabled = true;
  payBtn.textContent = "Processing payment…";

  setTimeout(() => {
    document.getElementById("confEmail").textContent = form.elements.email.value.trim();
    document.getElementById("confRef").textContent = "AUR-" + randomRef();
    confirmed.hidden = false;
  }, 1100);
});

function randomRef() {
  // 6-char alphanumeric reference.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

document.getElementById("confDone").addEventListener("click", () => {
  confirmed.hidden = true;
  payBtn.disabled = false;
  payBtn.textContent = "Confirm & pay €686";
  showToast("Opening your booking…");
});

// ── Toast ─────────────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2400);
}
