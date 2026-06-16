/* Form — Top error summary + jump-to-field
 * GOV.UK style accessible error-summary pattern.
 * - On invalid submit, an error summary (role=alert) lists every invalid field
 *   as links. The summary receives focus; activating a link focuses the field.
 * - Each field shows its own inline error with aria-invalid + aria-describedby.
 * - Fixing a field removes it from the summary live (on blur / input).
 * - A valid submit shows a success confirmation panel.
 */
(function () {
  "use strict";

  var form = document.getElementById("signup-form");
  if (!form) return;

  var summary = document.getElementById("error-summary");
  var summaryList = document.getElementById("summary-list");
  var summaryHeading = document.getElementById("summary-heading");
  var statusEl = document.getElementById("form-status");
  var successPanel = document.getElementById("success-panel");
  var successText = document.getElementById("success-text");
  var restartBtn = document.getElementById("restart");
  var toastEl = document.getElementById("toast");

  /* Field order matters: summary links follow document/visual order. */
  var ORDER = ["fullName", "email", "memberId", "age", "plan", "password", "terms"];

  var LABELS = {
    fullName: "Full name",
    email: "Email address",
    memberId: "Member ID",
    age: "Age",
    plan: "Membership plan",
    password: "Password",
    terms: "Terms acceptance",
  };

  /* Whether the form has been submitted once. Before that we don't nag
     on every keystroke — classic "validate on submit, then live-correct". */
  var submitted = false;

  /* ── Toast helper ─────────────────────────────────── */
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    /* force reflow so the transition runs from hidden */
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 240);
    }, 2600);
  }

  /* ── Validators ───────────────────────────────────── */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var validators = {
    fullName: function () {
      var v = form.elements.fullName.value.trim();
      if (!v) return "Enter your full name.";
      if (v.length < 2) return "Your name looks too short.";
      if (!/\s/.test(v)) return "Enter your first and last name.";
      return "";
    },
    email: function () {
      var v = form.elements.email.value.trim();
      if (!v) return "Enter your email address.";
      if (!EMAIL_RE.test(v)) return "Enter a valid email, like name@example.com.";
      return "";
    },
    memberId: function () {
      var v = form.elements.memberId.value.trim();
      if (!v) return "Enter your 6-digit member ID.";
      if (!/^\d{6}$/.test(v)) return "Member ID must be exactly 6 digits.";
      return "";
    },
    age: function () {
      var raw = form.elements.age.value.trim();
      if (!raw) return "Enter your age.";
      if (!/^\d{1,3}$/.test(raw)) return "Age must be a whole number.";
      var n = parseInt(raw, 10);
      if (n < 18) return "You must be 18 or older to apply.";
      if (n > 120) return "Enter a realistic age.";
      return "";
    },
    plan: function () {
      var checked = form.querySelector('input[name="plan"]:checked');
      if (!checked) return "Choose a membership plan.";
      return "";
    },
    password: function () {
      var v = form.elements.password.value;
      if (!v) return "Create a password.";
      if (v.length < 8) return "Use at least 8 characters.";
      if (!/\d/.test(v)) return "Include at least one number.";
      return "";
    },
    terms: function () {
      if (!form.elements.terms.checked) return "You must accept the terms to continue.";
      return "";
    },
  };

  /* The control that should receive focus when jumping to a field. */
  function focusTargetFor(name) {
    if (name === "plan") {
      var checked = form.querySelector('input[name="plan"]:checked');
      return checked || form.querySelector('input[name="plan"]');
    }
    return form.elements[name];
  }

  function wrapperFor(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  /* ── Per-field UI ─────────────────────────────────── */
  function showFieldError(name, message) {
    var wrap = wrapperFor(name);
    var errEl = document.getElementById(name + "-error");
    var control = focusTargetFor(name);
    if (!wrap || !errEl) return;

    wrap.classList.add("is-error");
    wrap.classList.remove("is-valid");
    errEl.textContent = message;
    errEl.hidden = false;

    if (control) {
      control.setAttribute("aria-invalid", "true");
      linkDescribedBy(name, control, true);
    }
  }

  function clearFieldError(name, opts) {
    var wrap = wrapperFor(name);
    var errEl = document.getElementById(name + "-error");
    var control = focusTargetFor(name);
    if (!wrap || !errEl) return;

    wrap.classList.remove("is-error");
    errEl.hidden = true;
    errEl.textContent = "";

    if (control) {
      control.removeAttribute("aria-invalid");
      linkDescribedBy(name, control, false);
    }
    /* Mark valid (green tick) only for text-like inputs that have content. */
    if (opts && opts.markValid && control && "value" in control && control.value) {
      wrap.classList.add("is-valid");
    } else {
      wrap.classList.remove("is-valid");
    }
  }

  /* Keep aria-describedby pointing at hint (+ error when present). */
  function linkDescribedBy(name, control, hasError) {
    var hintId = name + "-hint";
    var errId = name + "-error";
    var ids = [];
    if (document.getElementById(hintId)) ids.push(hintId);
    if (hasError) ids.push(errId);
    if (ids.length) control.setAttribute("aria-describedby", ids.join(" "));
    else if (document.getElementById(hintId)) control.setAttribute("aria-describedby", hintId);
    else control.removeAttribute("aria-describedby");
  }

  /* ── Summary ──────────────────────────────────────── */
  function buildSummary(errors) {
    summaryList.innerHTML = "";
    ORDER.forEach(function (name) {
      if (!errors[name]) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + name;
      a.textContent = errors[name];
      a.dataset.target = name;
      li.appendChild(a);
      summaryList.appendChild(li);
    });

    var count = summaryList.children.length;
    summaryHeading.textContent =
      count === 1
        ? "There is a problem with 1 field"
        : "There are problems with " + count + " fields";
  }

  function hideSummary() {
    summary.hidden = true;
    summaryList.innerHTML = "";
  }

  /* Update the summary in place (after a fix), without stealing focus. */
  function refreshSummary() {
    if (summary.hidden) return;
    var errors = collectErrors();
    if (Object.keys(errors).length === 0) {
      hideSummary();
      setStatus("All fields look good. Ready to submit.", "ok");
      return;
    }
    buildSummary(errors);
    setStatus("", "");
  }

  function collectErrors() {
    var errors = {};
    ORDER.forEach(function (name) {
      var msg = validators[name]();
      if (msg) errors[name] = msg;
    });
    return errors;
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.classList.remove("is-error", "is-ok");
    if (kind === "error") statusEl.classList.add("is-error");
    if (kind === "ok") statusEl.classList.add("is-ok");
  }

  /* ── Summary link clicks → jump to field ──────────── */
  summaryList.addEventListener("click", function (e) {
    var link = e.target.closest("a[data-target]");
    if (!link) return;
    e.preventDefault();
    var name = link.dataset.target;
    var control = focusTargetFor(name);
    var wrap = wrapperFor(name);
    if (wrap) wrap.scrollIntoView({ behavior: "smooth", block: "center" });
    if (control) {
      /* slight delay lets the scroll start before focus */
      setTimeout(function () {
        control.focus({ preventScroll: true });
      }, 60);
    }
  });

  /* ── Live correction after first submit ───────────── */
  function validateSingle(name, markValid) {
    var msg = validators[name]();
    if (msg) {
      showFieldError(name, msg);
    } else {
      clearFieldError(name, { markValid: markValid });
    }
    return !msg;
  }

  ORDER.forEach(function (name) {
    var wrap = wrapperFor(name);
    if (!wrap) return;
    var controls = wrap.querySelectorAll("input");

    controls.forEach(function (control) {
      /* Re-validate on blur once the form has been submitted once. */
      control.addEventListener("blur", function () {
        if (!submitted) return;
        validateSingle(name, true);
        refreshSummary();
      });

      /* If a field is already in error, clear it as soon as it becomes valid. */
      var ev = control.type === "radio" || control.type === "checkbox" ? "change" : "input";
      control.addEventListener(ev, function () {
        if (!submitted) return;
        var wasError = wrap.classList.contains("is-error");
        if (wasError && !validators[name]()) {
          clearFieldError(name, { markValid: control.type === "text" || control.type === "email" || control.type === "password" });
          refreshSummary();
        } else if (wrap.classList.contains("is-error")) {
          /* still invalid — keep summary text fresh */
          var m = validators[name]();
          if (m) showFieldError(name, m);
        }
      });
    });
  });

  /* Keep member ID / age numeric-only for a tidier UX. */
  ["memberId", "age"].forEach(function (name) {
    form.elements[name].addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  });

  /* ── Submit ───────────────────────────────────────── */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    submitted = true;

    var errors = collectErrors();

    /* Apply every field's state (errors + valid ticks). */
    ORDER.forEach(function (name) {
      if (errors[name]) showFieldError(name, errors[name]);
      else clearFieldError(name, { markValid: true });
    });

    var keys = Object.keys(errors);
    if (keys.length > 0) {
      buildSummary(errors);
      summary.hidden = false;
      /* Move focus to the summary so screen-reader users hear it first. */
      summary.focus();
      summary.scrollIntoView({ behavior: "smooth", block: "start" });
      setStatus(
        keys.length === 1
          ? "1 field needs your attention."
          : keys.length + " fields need your attention.",
        "error"
      );
      toast("Check the highlighted fields.");
      return;
    }

    /* Valid — show success state. */
    hideSummary();
    var name = form.elements.fullName.value.trim().split(/\s+/)[0];
    var email = form.elements.email.value.trim();
    successText.textContent =
      "Thanks, " + name + ". We have emailed your confirmation to " + email +
      " and your membership is being set up.";

    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
    toast("Application submitted successfully.");
  });

  /* ── Reset ────────────────────────────────────────── */
  form.addEventListener("reset", function () {
    submitted = false;
    hideSummary();
    setStatus("", "");
    ORDER.forEach(function (name) {
      var wrap = wrapperFor(name);
      if (wrap) wrap.classList.remove("is-error", "is-valid");
      var errEl = document.getElementById(name + "-error");
      if (errEl) {
        errEl.hidden = true;
        errEl.textContent = "";
      }
      var control = focusTargetFor(name);
      if (control) control.removeAttribute("aria-invalid");
    });
    toast("Form cleared.");
  });

  /* ── Restart from success panel ───────────────────── */
  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      successPanel.hidden = true;
      form.hidden = false;
      form.reset();
      submitted = false;
      form.elements.fullName.focus();
    });
  }
})();
