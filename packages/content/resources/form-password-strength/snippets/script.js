(function () {
  "use strict";

  var form = document.getElementById("pw-form");
  var pw = document.getElementById("pw");
  var confirm = document.getElementById("confirm");
  var submitBtn = document.getElementById("submit-btn");
  var meter = document.querySelector(".meter");
  var meterLabel = document.getElementById("meter-label");
  var meterText = meterLabel.querySelector(".meter-text");
  var rulesList = document.getElementById("rules-list");
  var ruleEls = {};
  rulesList.querySelectorAll(".rule").forEach(function (el) {
    ruleEls[el.dataset.rule] = el;
  });
  var fieldPw = document.getElementById("field-pw");
  var fieldConfirm = document.getElementById("field-confirm");
  var confirmHelp = document.getElementById("confirm-help");
  var successCard = document.getElementById("success-card");
  var resetBtn = document.getElementById("reset-btn");
  var toastWrap = document.getElementById("toast-wrap");

  // Strength label per level (0 = none, 4 = strong)
  var LEVELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

  /* ---- toast helper ------------------------------------------------ */
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    el.appendChild(document.createTextNode(msg));
    toastWrap.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("show");
    });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () {
        el.remove();
      }, 260);
    }, 3200);
  }

  /* ---- rule checks ------------------------------------------------- */
  function checkRules(value) {
    return {
      len: value.length >= 10,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[^A-Za-z0-9]/.test(value),
    };
  }

  // Count met rules → score 0..5, mapped to level 0..4.
  function levelFromRules(rules) {
    var passed = 0;
    Object.keys(rules).forEach(function (k) {
      if (rules[k]) passed++;
    });
    // Need all 5 rules to reach "Strong".
    if (passed <= 2) return 1; // Weak
    if (passed === 3) return 2; // Fair
    if (passed === 4) return 3; // Good
    return 4; // Strong (all 5)
  }

  function allRulesMet(rules) {
    return rules.len && rules.upper && rules.lower && rules.number && rules.symbol;
  }

  /* ---- render ------------------------------------------------------ */
  function renderMeter(value, rules) {
    if (!value) {
      meter.removeAttribute("data-level");
      meterLabel.removeAttribute("data-level");
      meterText.textContent = "Start typing to check strength";
      return 0;
    }
    var level = levelFromRules(rules);
    meter.setAttribute("data-level", String(level));
    meterLabel.setAttribute("data-level", String(level));
    meterText.textContent = LEVELS[level] + " password";
    return level;
  }

  function renderRules(rules) {
    Object.keys(rules).forEach(function (key) {
      var el = ruleEls[key];
      if (!el) return;
      el.classList.toggle("met", rules[key]);
    });
  }

  /* ---- confirm match ---------------------------------------------- */
  function renderConfirm(pwVal, confirmVal, strong) {
    // Nothing typed yet in confirm.
    if (!confirmVal) {
      fieldConfirm.classList.remove("is-error", "is-success");
      confirm.removeAttribute("aria-invalid");
      confirmHelp.className = "help";
      confirmHelp.textContent = "Both passwords must match.";
      return false;
    }
    var match = pwVal === confirmVal && pwVal.length > 0;
    if (match) {
      fieldConfirm.classList.remove("is-error");
      fieldConfirm.classList.add("is-success");
      confirm.setAttribute("aria-invalid", "false");
      confirmHelp.className = "help is-ok";
      confirmHelp.textContent = strong
        ? "Passwords match."
        : "Passwords match — strengthen the password above to continue.";
    } else {
      fieldConfirm.classList.remove("is-success");
      fieldConfirm.classList.add("is-error");
      confirm.setAttribute("aria-invalid", "true");
      confirmHelp.className = "help is-error";
      confirmHelp.textContent = "Passwords do not match yet.";
    }
    return match;
  }

  /* ---- master update ----------------------------------------------- */
  function update() {
    var pwVal = pw.value;
    var confirmVal = confirm.value;
    var rules = checkRules(pwVal);

    renderRules(rules);
    renderMeter(pwVal, rules);

    var strong = allRulesMet(rules);
    var match = renderConfirm(pwVal, confirmVal, strong);

    // Password field state for screen readers.
    if (pwVal && !strong) {
      pw.setAttribute("aria-invalid", "true");
      fieldPw.classList.remove("is-success");
    } else if (strong) {
      pw.setAttribute("aria-invalid", "false");
      fieldPw.classList.add("is-success");
      fieldPw.classList.remove("is-error");
    } else {
      pw.removeAttribute("aria-invalid");
      fieldPw.classList.remove("is-success", "is-error");
    }

    var canSubmit = strong && match;
    submitBtn.disabled = !canSubmit;
    submitBtn.setAttribute("aria-disabled", String(!canSubmit));
  }

  /* ---- show / hide toggles ---------------------------------------- */
  function wireToggle(id, input) {
    var btn = document.getElementById(id);
    btn.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      btn.querySelector(".ico-eye").hidden = show;
      btn.querySelector(".ico-eye-off").hidden = !show;
      input.focus();
    });
  }

  wireToggle("pw-toggle", pw);
  wireToggle("confirm-toggle", confirm);

  /* ---- events ------------------------------------------------------ */
  pw.addEventListener("input", update);
  confirm.addEventListener("input", update);

  // Validate confirm on blur even if empty after touching.
  confirm.addEventListener("blur", function () {
    if (!confirm.value && pw.value) {
      fieldConfirm.classList.add("is-error");
      confirm.setAttribute("aria-invalid", "true");
      confirmHelp.className = "help is-error";
      confirmHelp.textContent = "Please re-enter your password.";
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var rules = checkRules(pw.value);
    if (!allRulesMet(rules) || pw.value !== confirm.value) {
      update();
      toast("Fix the highlighted fields first.");
      return;
    }
    // Success state.
    form.hidden = true;
    successCard.hidden = false;
    successCard.focus && successCard.focus();
    toast("Password created successfully.");
  });

  resetBtn.addEventListener("click", function () {
    form.reset();
    successCard.hidden = true;
    form.hidden = false;
    fieldPw.classList.remove("is-success", "is-error");
    fieldConfirm.classList.remove("is-success", "is-error");
    pw.removeAttribute("aria-invalid");
    confirm.removeAttribute("aria-invalid");
    confirmHelp.className = "help";
    confirmHelp.textContent = "Both passwords must match.";
    update();
    pw.focus();
  });

  // Initial paint.
  update();
})();
