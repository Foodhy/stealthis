(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastStack = document.getElementById("toast-stack");

  function toast(msg) {
    if (!toastStack) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");

    var dot = document.createElement("span");
    dot.className = "toast-dot";
    el.appendChild(dot);

    var text = document.createElement("span");
    text.textContent = msg;
    el.appendChild(text);

    toastStack.appendChild(el);
    // Force reflow so the entrance transition runs.
    void el.offsetWidth;
    el.classList.add("is-in");

    window.setTimeout(function () {
      el.classList.remove("is-in");
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }, 2600);
  }

  /* ---------- Plan selection ---------- */
  var planInputs = Array.prototype.slice.call(
    document.querySelectorAll(".plan-input")
  );
  var continueBtn = document.querySelector("[data-continue]");
  var continueLabel = document.querySelector("[data-continue-label]");
  var yearlyNote = document.querySelector("[data-yearly-note]");

  function selectedPlan() {
    var checked = document.querySelector(".plan-input:checked");
    if (!checked) return null;
    return checked.closest(".plan");
  }

  function syncPlan() {
    var plan = selectedPlan();
    if (!plan) return;
    var label = plan.getAttribute("data-label") || "plan";
    var price = parseInt(plan.getAttribute("data-price"), 10) || 0;

    if (continueLabel) continueLabel.textContent = "Continue with " + label;
    if (yearlyNote) {
      // ~2 months free when paid annually.
      var annual = price * 10;
      yearlyNote.textContent = "$" + annual + "/yr if paid annually";
    }
  }

  planInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      if (input.checked) {
        syncPlan();
        var plan = input.closest(".plan");
        toast(
          (plan && plan.getAttribute("data-label") ? plan.getAttribute("data-label") : "Plan") +
            " plan selected"
        );
      }
    });
  });

  // Allow clicking anywhere on a plan card to select it (label already does,
  // but keep keyboard arrow behavior consistent + initialise).
  syncPlan();

  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      var plan = selectedPlan();
      var label = plan ? plan.getAttribute("data-label") : "your plan";
      toast("Starting checkout for the " + label + " plan…");
    });
  }

  /* ---------- Inline sign-in form toggle ---------- */
  var signinForm = document.getElementById("signin-form");
  var signinTriggers = Array.prototype.slice.call(
    document.querySelectorAll("[data-open-signin]")
  );
  var signinInput = document.getElementById("signin-email");
  var signinHint = document.querySelector("[data-signin-hint]");
  var signinLinkBtn = document.querySelector(".gate-signin-link");

  function setSigninExpanded(open) {
    if (signinLinkBtn) signinLinkBtn.setAttribute("aria-expanded", String(open));
  }

  function openSignin() {
    if (!signinForm) return;
    signinForm.hidden = false;
    setSigninExpanded(true);
    if (signinInput) {
      window.requestAnimationFrame(function () {
        try {
          signinInput.focus();
        } catch (e) {}
      });
    }
  }

  function closeSignin() {
    if (!signinForm) return;
    signinForm.hidden = true;
    setSigninExpanded(false);
    if (signinHint) {
      signinHint.textContent = "";
      signinHint.className = "signin-hint";
    }
  }

  function toggleSignin() {
    if (!signinForm) return;
    if (signinForm.hidden) {
      openSignin();
    } else {
      closeSignin();
    }
  }

  signinTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (ev) {
      // Top-bar / inline links may be anchors — stop them navigating.
      if (trigger.tagName === "A") ev.preventDefault();
      toggleSignin();
      if (!signinForm.hidden) {
        signinForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });

  if (signinForm) {
    signinForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var value = signinInput ? signinInput.value.trim() : "";
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!valid) {
        if (signinHint) {
          signinHint.textContent = "Enter a valid email address to continue.";
          signinHint.className = "signin-hint is-error";
        }
        if (signinInput) signinInput.focus();
        return;
      }

      if (signinHint) {
        signinHint.textContent = "Sending a secure login link to " + value + "…";
        signinHint.className = "signin-hint is-ok";
      }
      toast("Login link sent to " + value);
    });
  }

  /* ---------- Esc closes the inline form ---------- */
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && signinForm && !signinForm.hidden) {
      closeSignin();
      if (signinLinkBtn) signinLinkBtn.focus();
    }
  });
})();
