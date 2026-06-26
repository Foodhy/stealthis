// Bolt & Sons Electric — booking form validation + small UI niceties (vanilla JS)
(function () {
  "use strict";

  var form = document.getElementById("booking-form");
  if (!form) return;

  var status = document.getElementById("form-status");

  var validators = {
    name: function (v) {
      return v.trim().length >= 2 ? "" : "Please enter your name.";
    },
    phone: function (v) {
      var digits = v.replace(/\D/g, "");
      return digits.length >= 10 ? "" : "Enter a 10-digit phone number.";
    },
    service: function (v) {
      return v ? "" : "Pick the service you need.";
    },
    time: function (v) {
      return v ? "" : "Pick a preferred time.";
    },
  };

  function fieldEls(name) {
    var input = form.elements[name];
    return {
      input: input,
      wrap: input.closest(".field"),
      err: form.querySelector('.err[data-for="' + name + '"]'),
    };
  }

  function validateField(name) {
    var f = fieldEls(name);
    var msg = validators[name](f.input.value);
    if (msg) {
      f.wrap.classList.add("invalid");
      f.err.textContent = msg;
      f.input.setAttribute("aria-invalid", "true");
      return false;
    }
    f.wrap.classList.remove("invalid");
    f.err.textContent = "";
    f.input.removeAttribute("aria-invalid");
    return true;
  }

  // Live re-validation once a field has been touched and was invalid.
  Object.keys(validators).forEach(function (name) {
    var f = fieldEls(name);
    var ev = f.input.tagName === "SELECT" ? "change" : "input";
    f.input.addEventListener(ev, function () {
      if (f.wrap.classList.contains("invalid")) validateField(name);
    });
  });

  // Light phone formatting as the user types.
  var phone = form.elements.phone;
  phone.addEventListener("input", function () {
    var d = phone.value.replace(/\D/g, "").slice(0, 10);
    var out = d;
    if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
    else if (d.length > 0) out = "(" + d;
    phone.value = out;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = Object.keys(validators)
      .map(validateField)
      .every(Boolean);

    if (!ok) {
      status.classList.remove("show");
      var firstBad = form.querySelector(".field.invalid input, .field.invalid select");
      if (firstBad) firstBad.focus();
      return;
    }

    var name = form.elements.name.value.trim().split(" ")[0];
    var service = form.elements.service.value;
    status.textContent =
      "Thanks, " + name + "! Your " + service.toLowerCase() +
      " request is in — a coordinator will text you shortly.";
    status.classList.add("show");
    status.scrollIntoView({ behavior: "smooth", block: "center" });
    form.reset();
  });
})();
