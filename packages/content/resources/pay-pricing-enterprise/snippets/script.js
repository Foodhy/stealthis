(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastStack = document.getElementById("toastStack");
  function toast(msg) {
    if (!toastStack) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<span class="dot"></span><span></span>';
    el.lastChild.textContent = msg;
    toastStack.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      el.addEventListener("animationend", function () {
        el.remove();
      });
    }, 2600);
  }

  /* ---------- Billing toggle (Monthly / Yearly) ---------- */
  var billingSwitch = document.getElementById("billingSwitch");
  var lblMonthly = document.getElementById("lblMonthly");
  var lblYearly = document.getElementById("lblYearly");
  var amounts = Array.prototype.slice.call(document.querySelectorAll(".amount"));
  var notes = Array.prototype.slice.call(document.querySelectorAll(".price-note[data-monthly]"));

  function setBilling(yearly) {
    billingSwitch.setAttribute("aria-checked", yearly ? "true" : "false");
    lblMonthly.classList.toggle("is-active", !yearly);
    lblYearly.classList.toggle("is-active", yearly);

    var key = yearly ? "yearly" : "monthly";

    amounts.forEach(function (el) {
      var next = el.getAttribute("data-" + key);
      if (next === null || next === el.textContent) return;
      el.classList.remove("flip");
      // force reflow so the animation can replay
      void el.offsetWidth;
      el.classList.add("flip");
      // swap the value mid-flip
      setTimeout(function () {
        el.textContent = next;
      }, 180);
    });

    notes.forEach(function (el) {
      var n = el.getAttribute("data-" + key);
      if (n !== null) el.textContent = n;
    });
  }

  billingSwitch.addEventListener("click", function () {
    var yearly = billingSwitch.getAttribute("aria-checked") !== "true";
    setBilling(yearly);
  });
  // start in monthly
  setBilling(false);

  /* ---------- Non-enterprise CTAs → toast ---------- */
  document.querySelectorAll(".cta[data-plan]").forEach(function (btn) {
    if (btn.id === "contactSalesBtn") return;
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-plan");
      if (plan === "Starter") {
        toast("Starter account created — welcome aboard!");
      } else {
        toast("Starting your " + plan + " trial…");
      }
    });
  });

  /* ---------- Contact-sales modal ---------- */
  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var openBtn = document.getElementById("contactSalesBtn");
  var closeBtn = document.getElementById("modalClose");
  var form = document.getElementById("leadForm");
  var modalForm = document.getElementById("modalForm");
  var modalSuccess = document.getElementById("modalSuccess");
  var successDone = document.getElementById("successDone");
  var successMsg = document.getElementById("successMsg");
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    // reset to form view each open
    modalSuccess.hidden = true;
    modalForm.hidden = false;
    form.reset();
    clearErrors();
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    var first = document.getElementById("leadName");
    if (first) setTimeout(function () { first.focus(); }, 40);
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  // overlay click (outside the modal) closes
  overlay.addEventListener("mousedown", function (e) {
    if (e.target === overlay) closeModal();
  });

  // Esc closes
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });

  // simple focus trap inside the modal
  overlay.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var list = Array.prototype.filter.call(focusables, function (el) {
      return !el.hidden && el.offsetParent !== null;
    });
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ---------- Validation ---------- */
  var nameEl = document.getElementById("leadName");
  var emailEl = document.getElementById("leadEmail");
  var sizeEl = document.getElementById("leadSize");
  var errName = document.getElementById("errName");
  var errEmail = document.getElementById("errEmail");
  var errSize = document.getElementById("errSize");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, errEl, msg) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    errEl.textContent = msg;
  }
  function clearError(input, errEl) {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    errEl.textContent = "";
  }
  function clearErrors() {
    clearError(nameEl, errName);
    clearError(emailEl, errEmail);
    clearError(sizeEl, errSize);
  }

  // live-clear errors as the user fixes fields
  nameEl.addEventListener("input", function () {
    if (nameEl.value.trim()) clearError(nameEl, errName);
  });
  emailEl.addEventListener("input", function () {
    if (EMAIL_RE.test(emailEl.value.trim())) clearError(emailEl, errEmail);
  });
  sizeEl.addEventListener("change", function () {
    if (sizeEl.value) clearError(sizeEl, errSize);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var firstBad = null;

    if (!nameEl.value.trim()) {
      setError(nameEl, errName, "Please enter your name.");
      firstBad = firstBad || nameEl;
      ok = false;
    } else {
      clearError(nameEl, errName);
    }

    var email = emailEl.value.trim();
    if (!email) {
      setError(emailEl, errEmail, "Work email is required.");
      firstBad = firstBad || emailEl;
      ok = false;
    } else if (!EMAIL_RE.test(email)) {
      setError(emailEl, errEmail, "Enter a valid email address.");
      firstBad = firstBad || emailEl;
      ok = false;
    } else {
      clearError(emailEl, errEmail);
    }

    if (!sizeEl.value) {
      setError(sizeEl, errSize, "Select a company size.");
      firstBad = firstBad || sizeEl;
      ok = false;
    } else {
      clearError(sizeEl, errSize);
    }

    if (!ok) {
      if (firstBad) firstBad.focus();
      toast("Please fix the highlighted fields.");
      return;
    }

    // success
    var firstName = nameEl.value.trim().split(/\s+/)[0];
    successMsg.textContent =
      "Thanks, " + firstName + "! A Northwind specialist will email you within one business day.";
    modalForm.hidden = true;
    modalSuccess.hidden = false;
    toast("Request sent — we'll be in touch soon.");
    if (successDone) setTimeout(function () { successDone.focus(); }, 40);
  });

  successDone.addEventListener("click", closeModal);
})();
