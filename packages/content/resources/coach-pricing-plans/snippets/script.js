(function () {
  "use strict";

  var toggle = document.getElementById("toggle");
  var buttons = Array.prototype.slice.call(
    toggle.querySelectorAll(".toggle-btn")
  );
  var plans = Array.prototype.slice.call(document.querySelectorAll(".plan"));
  var toastEl = document.getElementById("toast");
  var toastTimer;
  var currentPeriod = "monthly";

  /* --- Toast helper --- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* --- Animated count from current to target --- */
  function animateAmount(el, to) {
    var from = parseInt(el.textContent, 10) || 0;
    if (from === to) {
      el.textContent = to;
      return;
    }
    var start = performance.now();
    var dur = 380;
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = to;
    }
    requestAnimationFrame(frame);
  }

  /* --- Render all prices for a period --- */
  function render(period) {
    currentPeriod = period;
    toggle.setAttribute("data-period", period);

    buttons.forEach(function (b) {
      var active = b.dataset.period === period;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });

    plans.forEach(function (plan) {
      var priceBox = plan.querySelector(".price");
      var amountEl = plan.querySelector("[data-amount]");
      var billedEl = plan.querySelector("[data-billed]");
      var value = parseInt(priceBox.getAttribute("data-" + period), 10);
      animateAmount(amountEl, value);
      if (period === "quarterly") {
        billedEl.textContent = "$" + value * 3 + " billed every 3 months";
      } else {
        billedEl.textContent = "Billed monthly";
      }
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.period !== currentPeriod) render(b.dataset.period);
    });
  });

  /* --- CTA selection --- */
  plans.forEach(function (plan) {
    var cta = plan.querySelector("[data-cta]");
    var name = plan.dataset.plan;

    function choose() {
      plans.forEach(function (p) {
        p.style.removeProperty("--picked");
      });
      var label =
        currentPeriod === "quarterly" ? "quarterly billing" : "monthly billing";
      toast("Nice — " + name + " plan selected (" + label + ").");
    }

    cta.addEventListener("click", function (e) {
      e.stopPropagation();
      choose();
    });

    /* Whole card is keyboard-activatable */
    plan.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        choose();
      }
    });
  });

  render("monthly");
})();
