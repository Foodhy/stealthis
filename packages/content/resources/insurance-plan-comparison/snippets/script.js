// Insurance plan comparison — monthly / annual billing toggle (vanilla JS)
(function () {
  "use strict";

  var toggle = document.getElementById("billingToggle");
  var lblMonthly = document.getElementById("lbl-monthly");
  var lblAnnual = document.getElementById("lbl-annual");
  var amounts = document.querySelectorAll(".plan__amount");
  var billedLines = document.querySelectorAll(".plan__billed");

  if (!toggle) return;

  // Cache the original "billed monthly" text so we can restore it.
  billedLines.forEach(function (el) {
    el.dataset.billedMonthly = el.textContent.trim();
  });

  function setActiveLabel(annual) {
    lblMonthly.classList.toggle("is-active", !annual);
    lblAnnual.classList.toggle("is-active", annual);
  }

  function animateValue(el, to) {
    var from = parseInt(el.textContent, 10) || 0;
    if (from === to) return;
    var steps = 12;
    var i = 0;
    var step = (to - from) / steps;
    clearInterval(el._timer);
    el._timer = setInterval(function () {
      i++;
      if (i >= steps) {
        el.textContent = to;
        clearInterval(el._timer);
      } else {
        el.textContent = Math.round(from + step * i);
      }
    }, 20);
  }

  function render(annual) {
    amounts.forEach(function (el) {
      var key = annual ? "annual" : "monthly";
      var value = parseInt(el.dataset[key], 10);
      if (!isNaN(value)) animateValue(el, value);
    });
    billedLines.forEach(function (el) {
      el.textContent = annual
        ? (el.dataset.billedAnnual || el.dataset.billedMonthly)
        : el.dataset.billedMonthly;
    });
    setActiveLabel(annual);
  }

  function flip() {
    var annual = toggle.getAttribute("aria-checked") !== "true";
    toggle.setAttribute("aria-checked", String(annual));
    render(annual);
  }

  toggle.addEventListener("click", flip);
  toggle.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flip();
    }
  });

  // Initial state.
  setActiveLabel(false);
})();
