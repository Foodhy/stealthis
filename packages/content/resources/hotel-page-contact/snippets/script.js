// ── Toast helper ─────────────────────────────────────────────────────────────
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

// ── Copy address ──────────────────────────────────────────────────────────────
document.getElementById("copyAddress").addEventListener("click", () => {
  const addr = document.getElementById("hotelAddress").textContent;
  navigator.clipboard
    .writeText(addr)
    .then(() => {
      showToast("Address copied to clipboard!");
    })
    .catch(() => {
      // Fallback for restricted clipboard contexts
      showToast("Address: " + addr);
    });
});

// ── Character counter ─────────────────────────────────────────────────────────
const messageArea = document.getElementById("message");
const charCount = document.getElementById("charCount");
const MAX_CHARS = 500;

messageArea.addEventListener("input", () => {
  const len = messageArea.value.length;
  charCount.textContent = len;
  charCount.parentElement.classList.toggle("over", len > MAX_CHARS);
});

// ── Contact form validation ───────────────────────────────────────────────────
const form = document.getElementById("contactForm");

function setError(fieldId, msg) {
  const fg = document.getElementById("fg-" + fieldId);
  const err = document.getElementById("err-" + fieldId);
  fg.classList.toggle("has-error", !!msg);
  err.textContent = msg || "";
}

function clearErrors() {
  ["name", "email", "subject", "message"].forEach((id) => setError(id, ""));
}

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function runValidation() {
  let valid = true;

  const nameVal = document.getElementById("guestName").value.trim();
  if (!nameVal) {
    setError("name", "Please enter your full name.");
    valid = false;
  } else if (nameVal.length < 2) {
    setError("name", "Name must be at least 2 characters.");
    valid = false;
  } else {
    setError("name", "");
  }

  const emailVal = document.getElementById("guestEmail").value.trim();
  if (!emailVal) {
    setError("email", "Please enter your email address.");
    valid = false;
  } else if (!validateEmail(emailVal)) {
    setError("email", "Please enter a valid email address.");
    valid = false;
  } else {
    setError("email", "");
  }

  const subjectVal = document.getElementById("subject").value;
  if (!subjectVal) {
    setError("subject", "Please select a subject.");
    valid = false;
  } else {
    setError("subject", "");
  }

  const msgVal = document.getElementById("message").value.trim();
  if (!msgVal) {
    setError("message", "Please enter your message.");
    valid = false;
  } else if (msgVal.length < 10) {
    setError("message", "Message must be at least 10 characters.");
    valid = false;
  } else if (msgVal.length > MAX_CHARS) {
    setError("message", `Message must be ${MAX_CHARS} characters or fewer.`);
    valid = false;
  } else {
    setError("message", "");
  }

  return valid;
}

// Clear individual field errors on input
["guestName", "guestEmail", "subject", "message"].forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener("input", () => {
    const fieldId = id === "guestName" ? "name" : id === "guestEmail" ? "email" : id;
    setError(fieldId, "");
    el.closest(".field-group").classList.remove("has-error");
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearErrors();

  if (!runValidation()) {
    showToast("Please fix the errors before sending.");
    return;
  }

  const name = document.getElementById("guestName").value.trim();
  const email = document.getElementById("guestEmail").value.trim();

  // Show success state
  document.getElementById("contactForm").hidden = true;
  document.querySelector(".form-header").hidden = true;
  document.getElementById("successName").textContent = name;
  document.getElementById("successEmail").textContent = email;
  document.getElementById("successState").hidden = false;

  showToast("Message sent — we'll be in touch soon!");
});

// Reset back to form
document.getElementById("btnReset").addEventListener("click", () => {
  form.reset();
  charCount.textContent = "0";
  clearErrors();
  document.getElementById("contactForm").hidden = false;
  document.querySelector(".form-header").hidden = false;
  document.getElementById("successState").hidden = true;
});

// ── FAQ accordion ─────────────────────────────────────────────────────────────
document.querySelectorAll(".acc-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".acc-item");
    const body = item.querySelector(".acc-body");
    const isOpen = trigger.getAttribute("aria-expanded") === "true";

    // Close all others
    document.querySelectorAll(".acc-item").forEach((el) => {
      el.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
      el.querySelector(".acc-body").style.maxHeight = "0";
    });

    // Toggle this one
    if (!isOpen) {
      trigger.setAttribute("aria-expanded", "true");
      body.style.maxHeight = body.scrollHeight + "px";
    }
  });
});
