// Hale & Renner — Criminal Defense Landing
// Vanilla JS only: rotating testimonials + accessible form validation.

(function () {
  "use strict";

  /* ---------- Rotating testimonials ---------- */
  var quotes = Array.prototype.slice.call(document.querySelectorAll(".quote"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".qdot"));
  var current = 0;
  var timer = null;

  function showQuote(index) {
    current = (index + quotes.length) % quotes.length;
    quotes.forEach(function (q, i) {
      q.classList.toggle("active", i === current);
    });
    dots.forEach(function (d, i) {
      var on = i === current;
      d.classList.toggle("active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function startAuto() {
    stopAuto();
    timer = window.setInterval(function () {
      showQuote(current + 1);
    }, 6000);
  }
  function stopAuto() {
    if (timer) window.clearInterval(timer);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var idx = parseInt(dot.getAttribute("data-dot"), 10);
      showQuote(idx);
      startAuto();
    });
  });

  if (quotes.length) startAuto();

  /* ---------- Free case review form ---------- */
  var form = document.getElementById("reviewForm");
  var status = document.getElementById("formStatus");

  function setError(field, message) {
    var wrap = field.closest(".field");
    var slot = wrap ? wrap.querySelector(".field-error") : null;
    if (wrap) wrap.classList.add("invalid");
    if (slot) slot.textContent = message;
    field.setAttribute("aria-invalid", "true");
  }

  function clearError(field) {
    var wrap = field.closest(".field");
    var slot = wrap ? wrap.querySelector(".field-error") : null;
    if (wrap) wrap.classList.remove("invalid");
    if (slot) slot.textContent = "";
    field.removeAttribute("aria-invalid");
  }

  function validPhone(value) {
    var digits = value.replace(/\D/g, "");
    return digits.length >= 10;
  }

  if (form) {
    var name = form.querySelector("#name");
    var phone = form.querySelector("#phone");
    var charge = form.querySelector("#charge");

    [name, phone, charge].forEach(function (f) {
      f.addEventListener("input", function () {
        clearError(f);
      });
      f.addEventListener("change", function () {
        clearError(f);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      status.classList.remove("show");
      status.textContent = "";

      if (!name.value.trim()) {
        setError(name, "Please enter your name.");
        ok = false;
      }
      if (!phone.value.trim()) {
        setError(phone, "We need a phone number to reach you.");
        ok = false;
      } else if (!validPhone(phone.value)) {
        setError(phone, "Enter a valid 10-digit phone number.");
        ok = false;
      }
      if (!charge.value) {
        setError(charge, "Select the type of charge.");
        ok = false;
      }

      if (!ok) {
        var firstInvalid = form.querySelector(".field.invalid input, .field.invalid select");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var firstName = name.value.trim().split(" ")[0];
      status.textContent =
        "Thank you, " + firstName + ". An attorney will call you shortly. (Demo — nothing was sent.)";
      status.classList.add("show");
      form.reset();
      status.focus && status.focus();
    });
  }
})();
