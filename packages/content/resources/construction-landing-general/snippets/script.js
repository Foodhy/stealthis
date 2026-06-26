(function () {
  "use strict";

  /* ---------- Live "quotes requested" counter ---------- */
  var counterEl = document.getElementById("quoteCount");
  var quoteCount = counterEl ? parseInt(counterEl.textContent, 10) || 0 : 0;

  function bumpCounter() {
    if (!counterEl) return;
    quoteCount += 1;
    counterEl.textContent = quoteCount;
    counterEl.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }],
      { duration: 360, easing: "ease-out" }
    );
  }

  /* ---------- Budget hint ---------- */
  var budget = document.getElementById("budget");
  var budgetHint = document.getElementById("budgetHint");
  var hints = {
    "Under $25k": "Great for repairs, decks and small remodels.",
    "$25k – $75k": "Typical kitchen or bath remodel range.",
    "$75k – $200k": "Additions and large renovations.",
    "$200k+": "New construction and major projects.",
    "": "We'll help you scope a realistic budget.",
  };
  if (budget && budgetHint) {
    budget.addEventListener("change", function () {
      budgetHint.textContent = hints[budget.value] || "";
    });
  }

  /* ---------- Form validation ---------- */
  var form = document.getElementById("estimateForm");
  var status = document.getElementById("formStatus");

  function setError(name, msg) {
    var span = form.querySelector('.error[data-for="' + name + '"]');
    var field = form.querySelector("#" + name);
    if (span) span.textContent = msg || "";
    if (field && field.parentElement) {
      field.parentElement.classList.toggle("invalid", !!msg);
    }
  }

  function validators(data) {
    var errs = {};
    if (!data.name.trim()) errs.name = "Please enter your name.";
    var digits = data.phone.replace(/\D/g, "");
    if (digits.length < 10) errs.phone = "Enter a 10-digit phone number.";
    if (!/^\d{5}$/.test(data.zip.trim())) errs.zip = "Enter a valid 5-digit ZIP.";
    if (!data.project) errs.project = "Pick a project type.";
    return errs;
  }

  if (form) {
    // Clear individual errors as the user types
    ["name", "phone", "zip", "project"].forEach(function (n) {
      var el = form.querySelector("#" + n);
      if (el) {
        el.addEventListener("input", function () { setError(n, ""); });
        el.addEventListener("change", function () { setError(n, ""); });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {
        name: form.name.value,
        phone: form.phone.value,
        zip: form.zip.value,
        project: form.project.value,
      };
      var errs = validators(data);
      ["name", "phone", "zip", "project"].forEach(function (n) {
        setError(n, errs[n] || "");
      });

      var keys = Object.keys(errs);
      if (keys.length) {
        status.textContent = "Please fix the highlighted fields.";
        status.className = "form-status err";
        var first = form.querySelector("#" + keys[0]);
        if (first) first.focus();
        return;
      }

      status.textContent =
        "Thanks, " + data.name.trim().split(" ")[0] +
        "! Your request is in — we'll call within 48 hours.";
      status.className = "form-status ok";
      bumpCounter();
      form.reset();
      if (budgetHint) budgetHint.textContent = "";
    });
  }

  /* ---------- Smooth-scroll active nav highlight ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (a) {
              a.style.borderColor =
                a.getAttribute("href") === "#" + entry.target.id ? "var(--hv)" : "transparent";
            });
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    sections.forEach(function (s) { obs.observe(s); });
  }
})();
