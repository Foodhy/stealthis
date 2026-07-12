(function () {
  "use strict";

  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2600);
  }

  /* ---- rate toggle ---- */
  var rateBtns = document.querySelectorAll(".switch__btn");
  var priceNums = document.querySelectorAll(".price__num");
  var rateHint = document.getElementById("rateHint");
  var hints = { weekday: "Weekday rate", weekend: "Weekend rate" };

  function setRate(rate) {
    rateBtns.forEach(function (b) {
      var active = b.getAttribute("data-rate") === rate;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });

    priceNums.forEach(function (num) {
      var next = num.getAttribute("data-" + rate);
      if (next && next !== num.textContent) {
        num.textContent = next;
        num.classList.remove("is-bump");
        // reflow to restart animation
        void num.offsetWidth;
        num.classList.add("is-bump");
      }
    });

    if (rateHint) rateHint.textContent = hints[rate] || "";
  }

  rateBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setRate(btn.getAttribute("data-rate"));
    });
  });

  /* ---- disclosure ---- */
  document.querySelectorAll(".disclose").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("aria-controls"));
      if (!target) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      target.hidden = open;
      btn.querySelector("span").textContent = open ? "What's included" : "Hide details";
    });
  });

  /* ---- book ---- */
  document.querySelectorAll(".book").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-name") || "your session";
      var activeRate = document.querySelector(".switch__btn.is-active");
      var label = activeRate ? activeRate.textContent.trim().toLowerCase() : "weekday";
      toast("Reserved · " + name + " (" + label + " rate). Check your email to confirm.");
    });
  });
})();
