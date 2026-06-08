(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Billing toggle ---------- */
  var toggle = document.getElementById("billingToggle");
  var saveBadge = document.getElementById("billingSave");
  var labels = document.querySelectorAll(".billing-label");
  var amounts = document.querySelectorAll(".price-amt");
  var notes = document.querySelectorAll(".price-note");

  function setBilling(annual) {
    toggle.setAttribute("aria-checked", annual ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      annual ? "Switch to monthly billing" : "Switch to annual billing"
    );

    labels.forEach(function (label) {
      var side = label.getAttribute("data-side");
      label.classList.toggle(
        "is-on",
        (side === "annual" && annual) || (side === "monthly" && !annual)
      );
    });

    amounts.forEach(function (amt) {
      var target = annual
        ? amt.getAttribute("data-annual")
        : amt.getAttribute("data-monthly");
      animateNumber(amt, parseInt(amt.textContent, 10) || 0, parseInt(target, 10));
    });

    notes.forEach(function (note) {
      note.textContent = annual
        ? note.getAttribute("data-annual-note")
        : "Billed monthly";
    });

    saveBadge.textContent = annual ? "Save up to 25%" : "Switch to annual & save";
  }

  function animateNumber(el, from, to) {
    if (from === to) {
      el.textContent = to;
      return;
    }
    var start = performance.now();
    var dur = 320;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (toggle) {
    // Default state is annual (aria-checked="true" in markup).
    setBilling(true);
    toggle.addEventListener("click", function () {
      var nowAnnual = toggle.getAttribute("aria-checked") !== "true";
      setBilling(nowAnnual);
      toast(nowAnnual ? "Annual billing — you save up to 25%" : "Monthly billing selected");
    });
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = document.querySelectorAll(".acc-trigger");
  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var item = trigger.closest(".acc-item");
      var panel = item.querySelector(".acc-panel");
      var isOpen = item.classList.contains("is-open");

      // Close all (single-open accordion).
      document.querySelectorAll(".acc-item.is-open").forEach(function (open) {
        if (open !== item) {
          open.classList.remove("is-open");
          open.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
          open.querySelector(".acc-panel").style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- CTA toasts ---------- */
  document.querySelectorAll("[data-cta]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.getAttribute("data-cta");
      var annual = toggle && toggle.getAttribute("aria-checked") === "true";
      var suffix = /plan$/.test(label) ? " — " + (annual ? "annual" : "monthly") + " selected" : "";
      toast(label + suffix);
    });
  });
})();
