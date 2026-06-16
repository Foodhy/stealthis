(function () {
  "use strict";

  var PLAN_LABELS = {
    starter: "Starter",
    pro: "Pro",
    scale: "Scale",
    enterprise: "Enterprise",
  };

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Billing toggle (monthly / annual) ---------- */
  var matrix = document.getElementById("matrix");
  var billingToggle = document.getElementById("billing-toggle");
  var periodWord = document.getElementById("period-word");
  var billingTexts = document.querySelectorAll(".billing-text");
  var amounts = document.querySelectorAll(".amount[data-monthly]");
  var notes = document.querySelectorAll(".plan-note[data-monthly-note]");
  var annual = false;

  function setBillingTextState() {
    billingTexts.forEach(function (el, i) {
      // index 0 = Monthly label, index 1 = Annual label
      var isActive = i === 0 ? !annual : annual;
      el.classList.toggle("active", isActive);
    });
  }

  function renderPrices() {
    amounts.forEach(function (el) {
      var val = annual ? el.getAttribute("data-annual") : el.getAttribute("data-monthly");
      el.textContent = "$" + val;
      el.classList.remove("bump");
      // force reflow so the animation re-triggers
      void el.offsetWidth;
      el.classList.add("bump");
    });
    notes.forEach(function (el) {
      el.textContent = annual
        ? el.getAttribute("data-annual-note")
        : el.getAttribute("data-monthly-note");
    });
    if (periodWord) periodWord.textContent = annual ? "annually" : "monthly";
  }

  function toggleBilling() {
    annual = !annual;
    billingToggle.setAttribute("aria-checked", annual ? "true" : "false");
    setBillingTextState();
    renderPrices();
    toast(annual ? "Annual billing — save 20%" : "Switched to monthly billing");
  }

  if (billingToggle) {
    billingToggle.addEventListener("click", toggleBilling);
    setBillingTextState();
  }

  /* ---------- Collapsible feature groups ---------- */
  var toggles = document.querySelectorAll(".group-toggle");
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var bodyId = btn.getAttribute("aria-controls");
      var body = document.getElementById(bodyId);
      if (!body) return;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      body.classList.toggle("collapsed", expanded);
    });
  });

  /* ---------- Highlight a plan (dim the others) ---------- */
  var hlButtons = document.querySelectorAll(".hl-btn");
  var resetBtn = document.getElementById("reset-highlight");
  var activePlan = null;

  function applyHighlight(plan) {
    var cells = matrix.querySelectorAll("[data-plan]");
    cells.forEach(function (cell) {
      cell.classList.toggle("is-on", cell.getAttribute("data-plan") === plan);
    });
    matrix.classList.toggle("has-highlight", !!plan);

    hlButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-plan") === plan ? "true" : "false");
    });

    if (resetBtn) resetBtn.hidden = !plan;
  }

  function setHighlight(plan) {
    if (activePlan === plan) {
      // toggling the same plan off
      activePlan = null;
      applyHighlight(null);
      toast("Highlight cleared");
      return;
    }
    activePlan = plan;
    applyHighlight(plan);
    toast("Showing " + (PLAN_LABELS[plan] || plan) + " column");
  }

  hlButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setHighlight(btn.getAttribute("data-plan"));
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      activePlan = null;
      applyHighlight(null);
      toast("Highlight cleared");
    });
  }

  /* ---------- CTA buttons ---------- */
  var ctas = document.querySelectorAll(".cta");
  ctas.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-plan-name") || "this plan";
      if (name === "Enterprise") {
        toast("Opening sales contact for Enterprise…");
      } else if (name === "Starter") {
        toast("Creating your free Starter workspace…");
      } else {
        toast("Starting your 14-day " + name + " trial…");
      }
    });
  });

  /* ---------- Esc clears the highlight ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activePlan) {
      activePlan = null;
      applyHighlight(null);
      toast("Highlight cleared");
    }
  });

  // initial render
  renderPrices();
})();
