(() => {
  "use strict";

  const form = document.getElementById("signup");
  const submitBtn = document.getElementById("submit");
  const done = document.getElementById("done");
  const doneEmail = document.getElementById("done-email");
  const resetBtn = document.getElementById("reset");
  const toastEl = document.getElementById("toast");

  /* ── Toast helper ── */
  let toastTimer = null;
  function toast(msg, isError = false) {
    toastEl.textContent = msg;
    toastEl.classList.toggle("is-error", isError);
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2600);
  }

  /* ── Field registry ──
     Each validator returns "" when valid, else a specific error message. */
  const fields = {
    name: {
      el: form.elements.name,
      help: document.getElementById("name-help"),
      defaultHelp: "Use the name on your ID. At least 2 characters.",
      validate(v) {
        const t = v.trim();
        if (!t) return "Please enter your full name.";
        if (t.length < 2) return "Name is too short.";
        if (!/[a-zA-ZÀ-ɏ]/.test(t)) return "Use letters for your name.";
        return "";
      },
    },
    email: {
      el: form.elements.email,
      help: document.getElementById("email-help"),
      defaultHelp: "We'll send a confirmation link here.",
      validate(v) {
        const t = v.trim();
        if (!t) return "Email is required.";
        // Pragmatic email shape: local@domain.tld
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return "Enter a valid email, like name@site.com.";
        return "";
      },
      okText: "Looks good.",
    },
    password: {
      el: form.elements.password,
      help: null, // uses rules + meter instead of single help line
      validate(v) {
        if (!v) return "Create a password.";
        if (v.length < 8) return "Use at least 8 characters.";
        if (!/[a-z]/.test(v) || !/[A-Z]/.test(v)) return "Mix upper and lowercase letters.";
        if (!/\d/.test(v)) return "Include at least one number.";
        return "";
      },
    },
    confirm: {
      el: form.elements.confirm,
      help: document.getElementById("confirm-help"),
      defaultHelp: "Type it again so we know it matches.",
      validate(v) {
        if (!v) return "Please confirm your password.";
        if (v !== fields.password.el.value) return "Passwords don't match.";
        return "";
      },
      okText: "Passwords match.",
    },
    phone: {
      el: form.elements.phone,
      help: document.getElementById("phone-help"),
      defaultHelp: "US format. At least 10 digits.",
      validate(v) {
        const digits = v.replace(/\D/g, "");
        if (!digits) return "Phone number is required.";
        if (digits.length < 10) return "Enter at least 10 digits.";
        if (digits.length > 11) return "That's too many digits.";
        if (digits.length === 11 && digits[0] !== "1") return "11-digit numbers must start with 1.";
        return "";
      },
      okText: "Valid number.",
    },
  };

  // Track which fields have been "touched" (blurred at least once).
  const touched = new Set();
  const debounceTimers = {};

  /* ── Apply a field's visual + ARIA state ── */
  function render(key) {
    const f = fields[key];
    const wrap = f.el.closest(".field");
    const error = f.validate(f.el.value);

    if (error) {
      wrap.classList.add("is-error");
      wrap.classList.remove("is-valid");
      f.el.setAttribute("aria-invalid", "true");
      if (f.help) {
        f.help.textContent = error;
        f.help.classList.add("is-error");
        f.help.classList.remove("is-ok");
      }
    } else {
      wrap.classList.remove("is-error");
      wrap.classList.add("is-valid");
      f.el.setAttribute("aria-invalid", "false");
      if (f.help) {
        f.help.textContent = f.okText || f.defaultHelp;
        f.help.classList.toggle("is-ok", Boolean(f.okText));
        f.help.classList.remove("is-error");
      }
    }
    return !error;
  }

  /* Reset a field's display to neutral (used before first touch). */
  function clearState(key) {
    const f = fields[key];
    const wrap = f.el.closest(".field");
    wrap.classList.remove("is-error", "is-valid");
    f.el.setAttribute("aria-invalid", "false");
    if (f.help) {
      f.help.textContent = f.defaultHelp;
      f.help.classList.remove("is-error", "is-ok");
    }
  }

  /* ── Password strength + rules ── */
  const meter = document.querySelector("[data-meter]");
  const meterBar = document.querySelector("[data-meter-bar]");
  const meterLabel = document.querySelector("[data-meter-label]");
  const ruleEls = {
    len: document.querySelector('[data-rule="len"]'),
    case: document.querySelector('[data-rule="case"]'),
    num: document.querySelector('[data-rule="num"]'),
  };
  const STRENGTH = ["Weak", "Weak", "Fair", "Good", "Strong"];

  function renderPassword() {
    const v = fields.password.el.value;
    const met = {
      len: v.length >= 8,
      case: /[a-z]/.test(v) && /[A-Z]/.test(v),
      num: /\d/.test(v),
    };
    let score = 0;
    Object.keys(met).forEach((k) => {
      ruleEls[k].classList.toggle("is-met", met[k]);
      if (met[k]) score++;
    });
    // Bonus point for length >= 12 once base rules pass.
    if (score === 3 && v.length >= 12) score = 4;

    const pct = v ? Math.max(8, (score / 4) * 100) : 0;
    meterBar.style.width = pct + "%";
    meter.setAttribute("data-level", String(Math.min(score, 4)));
    meterLabel.textContent = v ? STRENGTH[Math.min(score, 4)] : "Strength";
  }

  /* ── Overall form gate ── */
  function refreshSubmit() {
    const allValid = Object.keys(fields).every((k) => fields[k].validate(fields[k].el.value) === "");
    submitBtn.disabled = !allValid;
    return allValid;
  }

  /* ── Wire up each field ── */
  Object.keys(fields).forEach((key) => {
    const f = fields[key];

    // First blur marks the field touched and shows its state.
    f.el.addEventListener("blur", () => {
      touched.add(key);
      render(key);
      refreshSubmit();
    });

    // As-you-type, but only after first blur. Debounced so messages
    // don't flicker on every keystroke.
    f.el.addEventListener("input", () => {
      if (key === "password") renderPassword();

      // The confirm field depends on password — re-check it live.
      if (key === "password" && touched.has("confirm")) {
        clearTimeout(debounceTimers.confirm);
        debounceTimers.confirm = setTimeout(() => render("confirm"), 220);
      }

      if (touched.has(key)) {
        clearTimeout(debounceTimers[key]);
        debounceTimers[key] = setTimeout(() => {
          render(key);
          refreshSubmit();
        }, 240);
      } else {
        // Not yet touched: still update the submit gate quietly.
        refreshSubmit();
      }
    });

    clearState(key);
  });

  /* ── Phone live formatting (light touch) ── */
  fields.phone.el.addEventListener("input", (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let local = digits;
    let prefix = "";
    if (digits.length === 11) {
      prefix = "1 ";
      local = digits.slice(1);
    }
    let out = local;
    if (local.length > 6) out = `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
    else if (local.length > 3) out = `(${local.slice(0, 3)}) ${local.slice(3)}`;
    else if (local.length > 0) out = `(${local}`;
    e.target.value = (prefix + out).trim();
  });

  /* ── Password reveal toggles ── */
  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.getAttribute("data-toggle"));
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      input.focus();
    });
  });

  /* ── Submit ── */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Touch and validate everything; focus the first invalid field.
    let firstInvalid = null;
    Object.keys(fields).forEach((key) => {
      touched.add(key);
      const ok = render(key);
      if (!ok && !firstInvalid) firstInvalid = fields[key].el;
    });
    renderPassword();

    if (!refreshSubmit()) {
      if (firstInvalid) firstInvalid.focus();
      toast("Please fix the highlighted fields.", true);
      return;
    }

    // Simulate an async account creation request.
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;
    submitBtn.querySelector(".submit__label").textContent = "Creating…";

    setTimeout(() => {
      const email = fields.email.el.value.trim();
      doneEmail.textContent = email || "your inbox";
      done.hidden = false;
      done.querySelector(".done__title").focus?.();
      toast("Account created.");
    }, 900);
  });

  /* ── Start over ── */
  resetBtn.addEventListener("click", () => {
    form.reset();
    touched.clear();
    submitBtn.classList.remove("is-loading");
    submitBtn.querySelector(".submit__label").textContent = "Create account";
    submitBtn.disabled = true;
    Object.keys(fields).forEach(clearState);
    renderPassword();
    done.hidden = true;
    fields.name.el.focus();
  });

  // Initial paint.
  renderPassword();
  refreshSubmit();
})();
