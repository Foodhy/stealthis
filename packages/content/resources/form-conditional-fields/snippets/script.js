(function () {
  "use strict";

  var form = document.getElementById("account");
  var submitBtn = document.getElementById("submit");
  var summary = document.getElementById("summary");
  var summaryList = document.getElementById("summary-list");
  var summaryTitle = document.getElementById("summary-title");
  var done = document.getElementById("done");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  // ── Toast helper ──────────────────────────────────────────────
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.classList.remove("is-error", "is-ok");
    if (kind) toastEl.classList.add("is-" + kind);
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  // ── Field helpers ─────────────────────────────────────────────
  // A "field" is the .field wrapper holding one control + help text.
  function fieldOf(input) {
    return input.closest(".field");
  }

  function helpOf(input) {
    var f = fieldOf(input);
    return f ? f.querySelector(".help") : null;
  }

  function setError(input, msg) {
    var f = fieldOf(input);
    if (f) f.classList.remove("is-valid");
    if (f) f.classList.add("is-error");
    input.setAttribute("aria-invalid", "true");
    var help = helpOf(input);
    if (help) {
      if (!help.dataset.base) help.dataset.base = help.textContent;
      help.textContent = msg;
      help.classList.add("is-error");
      help.classList.remove("is-ok");
    }
  }

  function setValid(input) {
    var f = fieldOf(input);
    if (f) f.classList.remove("is-error");
    if (f) f.classList.add("is-valid");
    input.setAttribute("aria-invalid", "false");
    var help = helpOf(input);
    if (help) {
      if (help.dataset.base) help.textContent = help.dataset.base;
      help.classList.remove("is-error");
    }
  }

  function clearState(input) {
    var f = fieldOf(input);
    if (f) f.classList.remove("is-error", "is-valid");
    input.removeAttribute("aria-invalid");
    var help = helpOf(input);
    if (help) {
      if (help.dataset.base) help.textContent = help.dataset.base;
      help.classList.remove("is-error", "is-ok");
    }
  }

  // ── Conditional reveal blocks ─────────────────────────────────
  // Each reveal block is gated by an answer. When closed, its inner
  // controls become non-required, disabled, and are skipped entirely
  // by validation.
  var reveals = {
    company: document.querySelector('[data-reveal="company"]'),
    shipping: document.querySelector('[data-reveal="shipping"]'),
    referral: document.querySelector('[data-reveal="referral"]'),
  };

  // Controls that only count when their parent block is open.
  function conditionalInputs(key) {
    return Array.prototype.slice.call(
      document.querySelectorAll('[data-conditional="' + key + '"]')
    );
  }

  function openReveal(key) {
    var block = reveals[key];
    if (!block || block.classList.contains("is-open")) return;
    block.hidden = false;
    // force reflow so the grid-rows transition runs from 0fr
    void block.offsetHeight;
    block.classList.add("is-open");
    conditionalInputs(key).forEach(function (input) {
      input.disabled = false;
      input.required = true;
      input.setAttribute("aria-required", "true");
    });
  }

  function closeReveal(key) {
    var block = reveals[key];
    if (!block || !block.classList.contains("is-open")) {
      // Still make sure controls are inert if block was never opened.
      conditionalInputs(key).forEach(function (input) {
        input.disabled = true;
        input.required = false;
        input.removeAttribute("aria-required");
        clearState(input);
      });
      if (block) block.hidden = true;
      return;
    }
    block.classList.remove("is-open");
    conditionalInputs(key).forEach(function (input) {
      input.disabled = true;
      input.required = false;
      input.removeAttribute("aria-required");
      clearState(input);
    });
    // hide after the collapse transition completes
    var hide = function () {
      if (!block.classList.contains("is-open")) block.hidden = true;
      block.removeEventListener("transitionend", hide);
    };
    block.addEventListener("transitionend", hide);
    // fallback for reduced-motion (no transitionend fires)
    setTimeout(function () {
      if (!block.classList.contains("is-open")) block.hidden = true;
    }, 400);
  }

  // Initialise: company hidden, shipping hidden (same-as-billing checked),
  // referral-other hidden. Disable their controls up front.
  ["company", "shipping", "referral"].forEach(function (key) {
    conditionalInputs(key).forEach(function (input) {
      input.disabled = true;
      input.required = false;
    });
  });

  // ── Validators ────────────────────────────────────────────────
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Returns "" when valid, otherwise an error message.
  function validateInput(input) {
    var name = input.name;
    var value = (input.value || "").trim();

    // Hidden / disabled conditional controls never fail.
    if (input.disabled) return "";

    if (input.required && value === "") {
      return requiredMessage(name);
    }

    switch (name) {
      case "name":
        if (value.length < 2) return "Enter at least 2 characters.";
        break;
      case "email":
        if (!EMAIL_RE.test(value))
          return "Enter a valid email, like name@company.com.";
        break;
      case "companyName":
        if (value.length < 2) return "Enter your company's legal name.";
        break;
      case "billing":
        if (value.length < 8) return "Enter a full street address.";
        break;
      case "shipping":
        if (value.length < 8) return "Enter a full shipping address.";
        break;
      case "referralOther":
        if (value.length < 2) return "A couple of words is enough.";
        break;
      default:
        break;
    }
    return "";
  }

  function requiredMessage(name) {
    var msgs = {
      name: "Your name is required.",
      email: "An email address is required.",
      companyName: "Company name is required.",
      companySize: "Pick a team size.",
      billing: "A billing address is required.",
      shipping: "A shipping address is required.",
      referral: "Please choose an option.",
      referralOther: "Please tell us where.",
    };
    return msgs[name] || "This field is required.";
  }

  function fieldLabel(name) {
    var labels = {
      name: "Full name",
      email: "Work email",
      hasCompany: "Company question",
      companyName: "Company name",
      companySize: "Team size",
      billing: "Billing address",
      shipping: "Shipping address",
      referral: "How you heard about us",
      referralOther: "Referral detail",
    };
    return labels[name] || name;
  }

  // Live validation for a single text/select input.
  function checkField(input) {
    var msg = validateInput(input);
    if (msg) {
      setError(input, msg);
      return false;
    }
    if (!input.disabled && (input.value || "").trim() !== "") {
      setValid(input);
    } else {
      clearState(input);
    }
    return true;
  }

  // ── Radio group: "Do you have a company?" ─────────────────────
  form.querySelectorAll('input[name="hasCompany"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      var group = radio.closest(".group");
      if (group) group.classList.remove("is-error");
      if (radio.value === "yes") {
        openReveal("company");
        toast("Company details added", "ok");
      } else {
        closeReveal("company");
      }
    });
  });

  // ── Checkbox: "Shipping same as billing" ──────────────────────
  var sameAddr = document.getElementById("sameAddr");
  sameAddr.addEventListener("change", function () {
    if (sameAddr.checked) {
      closeReveal("shipping");
    } else {
      openReveal("shipping");
      toast("Add a separate shipping address", "ok");
    }
  });

  // ── Select: "How did you hear about us?" ──────────────────────
  var referralSel = document.getElementById("referral");
  referralSel.addEventListener("change", function () {
    checkField(referralSel);
    if (referralSel.value === "other") {
      openReveal("referral");
    } else {
      closeReveal("referral");
    }
  });

  // ── Live + blur validation wiring ─────────────────────────────
  var watched = ["name", "email", "billing"];
  watched.forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener("blur", function () {
      input.dataset.touched = "1";
      checkField(input);
    });
    input.addEventListener("input", function () {
      if (input.dataset.touched) checkField(input);
    });
  });

  // Conditional text inputs validate live once touched.
  ["companyName", "shipping", "referralOther"].forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener("blur", function () {
      input.dataset.touched = "1";
      checkField(input);
    });
    input.addEventListener("input", function () {
      if (input.dataset.touched) checkField(input);
    });
  });

  // Selects validate on change.
  var companySize = document.getElementById("companySize");
  companySize.addEventListener("change", function () {
    checkField(companySize);
  });

  // ── Full validation pass on submit ────────────────────────────
  function collectActiveControls() {
    // Every named control that is currently enabled (i.e. visible
    // or always-on). Disabled = inside a closed reveal = skipped.
    var list = [];
    form
      .querySelectorAll("input[name], select[name]")
      .forEach(function (el) {
        if (el.type === "radio" || el.type === "checkbox") return;
        if (el.disabled) return;
        list.push(el);
      });
    return list;
  }

  function runFullValidation() {
    var errors = [];

    // Radio group is required (company question must be answered).
    var hasCompany = form.querySelector('input[name="hasCompany"]:checked');
    if (!hasCompany) {
      var grp = form.querySelector('[data-group="company"]');
      if (grp) grp.classList.add("is-error");
      errors.push({
        id: form.querySelector('input[name="hasCompany"]').id,
        name: "hasCompany",
        msg: "Tell us if this is for a company.",
      });
    }

    collectActiveControls().forEach(function (input) {
      var msg = validateInput(input);
      if (msg) {
        setError(input, msg);
        errors.push({ id: input.id, name: input.name, msg: msg });
      } else {
        setValid(input);
      }
    });

    return errors;
  }

  function showSummary(errors) {
    summaryList.innerHTML = "";
    summaryTitle.textContent =
      errors.length === 1
        ? "Please fix 1 field"
        : "Please fix " + errors.length + " fields";
    errors.forEach(function (err) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + err.id;
      a.textContent = fieldLabel(err.name) + " — " + err.msg;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.getElementById(err.id);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      li.appendChild(a);
      summaryList.appendChild(li);
    });
    summary.hidden = false;
    summary.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errors = runFullValidation();

    if (errors.length) {
      showSummary(errors);
      toast(
        errors.length === 1
          ? "1 field needs attention"
          : errors.length + " fields need attention",
        "error"
      );
      return;
    }

    summary.hidden = true;

    // Simulated async submit.
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;
    submitBtn.querySelector(".submit__label").textContent = "Creating…";

    setTimeout(function () {
      finish();
    }, 950);
  });

  // ── Success state ─────────────────────────────────────────────
  function finish() {
    var name = (document.getElementById("name").value || "").trim();
    var email = (document.getElementById("email").value || "").trim();

    // Describe which conditional sections were actually filled in.
    var extras = [];
    if (form.querySelector('input[name="hasCompany"]:checked') &&
        form.querySelector('input[name="hasCompany"]:checked').value === "yes") {
      var cn = (document.getElementById("companyName").value || "").trim();
      extras.push(cn ? cn : "your company");
    }
    if (!sameAddr.checked) extras.push("a separate shipping address");
    if (referralSel.value === "other") extras.push("how you found us");

    document.getElementById("done-name").textContent = name || "there";
    document.getElementById("done-email").textContent = email || "you";
    document.getElementById("done-fields").textContent = extras.length
      ? extras.join(", ")
      : "your account details";

    form.style.display = "none";
    summary.hidden = true;
    done.hidden = false;
    done.querySelector(".done__title").focus();
    toast("Account requested", "ok");
  }

  // ── Reset / start over ────────────────────────────────────────
  document.getElementById("reset").addEventListener("click", function () {
    form.reset();
    form.style.display = "";
    done.hidden = true;
    summary.hidden = true;

    // Reset visual field states + touched flags.
    form.querySelectorAll(".field").forEach(function (f) {
      f.classList.remove("is-error", "is-valid");
    });
    form.querySelectorAll(".group").forEach(function (g) {
      g.classList.remove("is-error");
    });
    form.querySelectorAll("input, select").forEach(function (el) {
      delete el.dataset.touched;
      el.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".help").forEach(function (h) {
      if (h.dataset.base) h.textContent = h.dataset.base;
      h.classList.remove("is-error", "is-ok");
    });

    // Collapse all reveals (sameAddr returns to checked → shipping hidden).
    closeReveal("company");
    closeReveal("referral");
    sameAddr.checked = true;
    closeReveal("shipping");

    // Restore submit button.
    submitBtn.classList.remove("is-loading");
    submitBtn.disabled = false;
    submitBtn.querySelector(".submit__label").textContent = "Create account";

    document.getElementById("name").focus();
    toast("Form cleared", "ok");
  });
})();
