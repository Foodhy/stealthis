const pwdEl = document.getElementById("password");
const confirmEl = document.getElementById("confirm");
const submitBtn = document.getElementById("registerSubmit");
const bar = document.getElementById("strengthBar");
const label = document.getElementById("strengthLabel");
const meter = document.getElementById("strengthMeter");

function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(4, score);
}
const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

pwdEl?.addEventListener("input", () => {
  const s = passwordStrength(pwdEl.value);
  meter.hidden = !pwdEl.value;
  bar.className = "strength-bar s" + s;
  label.textContent = strengthLabels[s] || "";
});

confirmEl?.addEventListener("input", () => {
  const errEl = document.getElementById("confirm-error");
  if (confirmEl.value && confirmEl.value !== pwdEl.value) {
    errEl.textContent = "Passwords do not match.";
    errEl.hidden = false;
    confirmEl.classList.add("invalid");
  } else {
    errEl.hidden = true;
    confirmEl.classList.remove("invalid");
  }
});

// Pwd toggle
document.getElementById("pwdToggle")?.addEventListener("click", () => {
  pwdEl.type = pwdEl.type === "password" ? "text" : "password";
});

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.hidden = false;
  }
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;

  if (!document.getElementById("firstName").value.trim()) {
    showError("firstName-error", "First name is required.");
    valid = false;
  } else clearError("firstName-error");

  const email = document.getElementById("email").value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("email-error", "Enter a valid email.");
    valid = false;
  } else clearError("email-error");

  if (pwdEl.value.length < 8) {
    showError("password-error", "Password must be at least 8 characters.");
    valid = false;
  } else clearError("password-error");

  if (confirmEl.value !== pwdEl.value) {
    showError("confirm-error", "Passwords do not match.");
    valid = false;
  }

  if (!document.getElementById("terms").checked) {
    showError("terms-error", "You must accept the terms.");
    valid = false;
  } else clearError("terms-error");

  if (!valid) return;

  submitBtn.disabled = true;
  submitBtn.querySelector(".btn-text").hidden = true;
  submitBtn.querySelector(".btn-spinner").hidden = false;

  await new Promise((r) => setTimeout(r, 1400));

  document.getElementById("formState").hidden = true;
  document.getElementById("successState").hidden = false;
});
