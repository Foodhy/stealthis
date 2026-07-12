(function () {
  "use strict";

  var form = document.getElementById("signup");
  var input = document.getElementById("email");
  var msg = document.getElementById("msg");
  var btn = document.getElementById("submit");
  var card = document.querySelector(".card");
  var success = document.getElementById("success");
  var successSub = document.getElementById("success-sub");
  var resetBtn = document.getElementById("reset");
  var countEl = document.getElementById("count");
  var toastEl = document.getElementById("toast");

  var BASE_COUNT = 18420;
  var current = 0;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Toast helper
  var toastTimer;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2800);
  }

  // Animate the subscriber count up to a target
  function animateCount(to, duration) {
    var from = current;
    var start = null;
    var diff = to - from;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      current = Math.round(from + diff * eased);
      countEl.textContent = current.toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Count up on load
  animateCount(BASE_COUNT, 1400);

  function clearError() {
    card.classList.remove("invalid");
    msg.textContent = "";
    msg.style.color = "";
  }

  input.addEventListener("input", function () {
    if (card.classList.contains("invalid")) clearError();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (btn.classList.contains("loading")) return;

    var value = input.value.trim();

    if (!value) {
      showError("Please enter your email to subscribe.");
      return;
    }
    if (!EMAIL_RE.test(value)) {
      showError("That email looks off — double-check it.");
      return;
    }

    clearError();
    btn.classList.add("loading");
    btn.setAttribute("aria-busy", "true");

    // Simulated async subscribe
    setTimeout(function () {
      btn.classList.remove("loading");
      btn.removeAttribute("aria-busy");

      var name = value.split("@")[0];
      successSub.textContent =
        "Confirmation sent to " + value + ". Your first Dispatch lands this Friday, " + name + ".";

      success.hidden = false;
      success.setAttribute("role", "status");

      animateCount(current + 1, 500);
      toast("You're subscribed — welcome aboard!");
    }, 900);
  });

  function showError(text) {
    card.classList.add("invalid");
    msg.style.color = "var(--pink)";
    msg.textContent = text;
    input.focus();
    // Retrigger shake animation
    var el = input;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
    toast(text);
  }

  resetBtn.addEventListener("click", function () {
    success.hidden = true;
    form.reset();
    clearError();
    input.focus();
    toast("Ready for another email.");
  });
})();
