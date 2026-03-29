(() => {
  const html = document.documentElement;
  const dirToggle = document.getElementById("dir-toggle");
  const dirLabel = document.getElementById("dir-label");
  const form = document.getElementById("reg-form");
  const successMsg = document.getElementById("success-msg");
  const togglePass = document.getElementById("toggle-pass");
  const passwordInput = document.getElementById("password");
  const strengthBar = document.getElementById("strength-bar");
  const bioInput = document.getElementById("bio");
  const bioCount = document.getElementById("bio-count");

  /* ── Direction toggle ── */
  dirToggle.addEventListener("click", () => {
    const isRtl = html.getAttribute("dir") === "rtl";
    const newDir = isRtl ? "ltr" : "rtl";
    html.setAttribute("dir", newDir);
    html.setAttribute("lang", isRtl ? "en" : "ar");
    dirLabel.textContent = newDir.toUpperCase();
  });

  /* ── Password visibility ── */
  togglePass.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePass.textContent = isPassword ? "\u{1F648}" : "\u{1F441}";
  });

  /* ── Password strength ── */
  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const pct = (score / 4) * 100;
    const colors = ["#ef4444", "#f59e0b", "#f59e0b", "#22c55e"];
    strengthBar.style.inlineSize = pct + "%";
    strengthBar.style.background = score > 0 ? colors[score - 1] : "transparent";
  });

  /* ── Bio char count ── */
  bioInput.addEventListener("input", () => {
    const len = bioInput.value.length;
    bioCount.textContent = len;
    if (len > 200) {
      bioInput.value = bioInput.value.slice(0, 200);
      bioCount.textContent = "200";
    }
  });

  /* ── Validation ── */
  const rules = {
    "first-name": {
      validate: (v) => v.trim().length >= 2,
      msg: "First name must be at least 2 characters.",
    },
    "last-name": {
      validate: (v) => v.trim().length >= 2,
      msg: "Last name must be at least 2 characters.",
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      msg: "Please enter a valid email address.",
    },
    password: {
      validate: (v) => v.length >= 8,
      msg: "Password must be at least 8 characters.",
    },
    country: {
      validate: (v) => v !== "",
      msg: "Please select a country.",
    },
  };

  function validateField(id) {
    const input = document.getElementById(id);
    const errEl = document.getElementById(id + "-err");
    const rule = rules[id];

    if (!rule || !input || !errEl) return true;

    const valid = rule.validate(input.value);
    input.classList.toggle("error", !valid);
    input.classList.toggle("valid", valid);
    errEl.textContent = valid ? "" : rule.msg;
    return valid;
  }

  /* Live validation on blur */
  Object.keys(rules).forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("blur", () => validateField(id));
      input.addEventListener("input", () => {
        if (input.classList.contains("error")) validateField(id);
      });
    }
  });

  /* ── Submit ── */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let allValid = true;
    Object.keys(rules).forEach((id) => {
      if (!validateField(id)) allValid = false;
    });

    /* Check terms */
    const terms = document.getElementById("terms");
    const termsErr = document.getElementById("terms-err");
    if (!terms.checked) {
      termsErr.textContent = "You must agree to the terms.";
      allValid = false;
    } else {
      termsErr.textContent = "";
    }

    if (allValid) {
      form.hidden = true;
      successMsg.hidden = false;
    }
  });
})();
