(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---------- Billing toggle ---------- */
  var amountEl = document.getElementById("price-amount");
  var periodEl = document.getElementById("price-period");
  var yearNote = document.getElementById("year-note");
  var billingBtns = Array.prototype.slice.call(
    document.querySelectorAll(".billing__btn")
  );

  function setBilling(mode) {
    var monthly = amountEl.getAttribute("data-monthly");
    var yearly = amountEl.getAttribute("data-yearly");
    var next = mode === "yearly" ? yearly : monthly;

    // animate the price swap
    amountEl.classList.add("is-flipping");
    window.setTimeout(function () {
      amountEl.textContent = next;
      periodEl.textContent = mode === "yearly" ? "per month, billed yearly" : "per month";
      amountEl.classList.remove("is-flipping");
    }, 180);

    if (yearNote) yearNote.hidden = mode !== "yearly";

    billingBtns.forEach(function (btn) {
      var active = btn.getAttribute("data-billing") === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  billingBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-billing");
      setBilling(mode);
      toast(
        mode === "yearly"
          ? "Yearly billing — you save 20%."
          : "Switched to monthly billing."
      );
    });
  });

  /* ---------- CTA ---------- */
  var cta = document.getElementById("cta-btn");
  if (cta) {
    cta.addEventListener("click", function () {
      toast("Trial started — check your inbox to confirm.");
    });
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = Array.prototype.slice.call(
    document.querySelectorAll(".acc__trigger")
  );

  function closeAll(except) {
    triggers.forEach(function (trg) {
      if (trg === except) return;
      var panel = document.getElementById(trg.getAttribute("aria-controls"));
      trg.setAttribute("aria-expanded", "false");
      if (panel) panel.hidden = true;
    });
  }

  triggers.forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));

    trigger.addEventListener("click", function () {
      var open = trigger.getAttribute("aria-expanded") === "true";
      if (open) {
        trigger.setAttribute("aria-expanded", "false");
        if (panel) panel.hidden = true;
      } else {
        closeAll(trigger);
        trigger.setAttribute("aria-expanded", "true");
        if (panel) panel.hidden = false;
      }
    });
  });

  /* ---------- Esc closes any open FAQ panel ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var anyOpen = triggers.some(function (t) {
      return t.getAttribute("aria-expanded") === "true";
    });
    if (anyOpen) closeAll(null);
  });
})();
