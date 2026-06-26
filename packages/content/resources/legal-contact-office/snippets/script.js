(function () {
  "use strict";

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  var validators = {
    name: function (v) {
      if (!v.trim()) return "Please enter your full name.";
      if (v.trim().length < 2) return "That name looks too short.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "Please enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter a valid email address.";
      return "";
    },
    phone: function (v) {
      if (!v.trim()) return "Please enter a phone number.";
      var digits = v.replace(/\D/g, "");
      if (digits.length < 7) return "Enter a valid phone number.";
      return "";
    },
    matter: function (v) {
      if (!v) return "Please choose a matter type.";
      return "";
    },
    message: function (v) {
      if (!v.trim()) return "Please tell us how we can help.";
      if (v.trim().length < 10) return "Please add a little more detail.";
      return "";
    },
  };

  function fieldWrap(input) {
    return input.closest(".field");
  }

  function errorEl(name) {
    return form.querySelector('[data-error-for="' + name + '"]');
  }

  function validateField(input) {
    var name = input.name;
    if (!validators[name]) return true;
    var msg = validators[name](input.value);
    var wrap = fieldWrap(input);
    var err = errorEl(name);
    if (msg) {
      wrap.classList.add("invalid");
      if (err) err.textContent = msg;
      input.setAttribute("aria-invalid", "true");
      return false;
    }
    wrap.classList.remove("invalid");
    if (err) err.textContent = "";
    input.removeAttribute("aria-invalid");
    return true;
  }

  if (form) {
    // Re-validate on input once a field has been touched/marked invalid.
    Array.prototype.forEach.call(
      form.querySelectorAll("input, select, textarea"),
      function (el) {
        el.addEventListener("blur", function () {
          validateField(el);
        });
        el.addEventListener("input", function () {
          if (fieldWrap(el).classList.contains("invalid")) validateField(el);
        });
      }
    );

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      var fields = ["name", "email", "phone", "matter", "message"];
      var firstInvalid = null;
      var ok = true;

      fields.forEach(function (name) {
        var input = form.elements[name];
        if (!validateField(input)) {
          ok = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!ok) {
        if (firstInvalid) firstInvalid.focus();
        status.style.color = "var(--closed)";
        status.textContent = "Please correct the highlighted fields.";
        return;
      }

      var name = form.elements.name.value.trim().split(" ")[0];
      form.reset();
      status.style.color = "var(--ok)";
      status.textContent =
        "Thank you, " + name + ". Your enquiry has been received — we'll respond within one business day.";
    });
  }

  /* ---------- Live open/closed office status ---------- */
  function hourInZone(tz) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        hour12: false,
        weekday: "short",
      }).formatToParts(new Date());
      var hour = 0;
      var weekday = "";
      parts.forEach(function (p) {
        if (p.type === "hour") hour = parseInt(p.value, 10) % 24;
        if (p.type === "weekday") weekday = p.value;
      });
      return { hour: hour, weekday: weekday };
    } catch (err) {
      var d = new Date();
      return { hour: d.getHours(), weekday: d.toLocaleDateString("en-US", { weekday: "short" }) };
    }
  }

  function refreshOffices() {
    var offices = document.querySelectorAll(".office");
    Array.prototype.forEach.call(offices, function (office) {
      var tz = office.getAttribute("data-tz");
      var open = parseInt(office.getAttribute("data-open"), 10);
      var close = parseInt(office.getAttribute("data-close"), 10);
      var badge = office.querySelector("[data-status]");
      if (!badge) return;

      var now = hourInZone(tz);
      var isWeekday = ["Sat", "Sun"].indexOf(now.weekday) === -1;
      var isOpen = isWeekday && now.hour >= open && now.hour < close;

      badge.classList.remove("is-open", "is-closed");
      if (isOpen) {
        badge.classList.add("is-open");
        badge.textContent = "Open now";
      } else {
        badge.classList.add("is-closed");
        badge.textContent = "Closed";
      }
    });
  }

  refreshOffices();
  // Re-check every minute so the badge stays accurate near opening/closing.
  setInterval(refreshOffices, 60 * 1000);
})();
