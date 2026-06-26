/* Evergreen Life — landing interactions (vanilla JS, no libraries) */
(function () {
  "use strict";

  /* ---------- Coverage calculator ---------- */
  var form = document.getElementById("calc-form");
  if (form) {
    var ageInput = document.getElementById("age");
    var coverageInput = document.getElementById("coverage");
    var termInput = document.getElementById("term");
    var ageOut = document.getElementById("age-out");
    var coverageOut = document.getElementById("coverage-out");
    var termOut = document.getElementById("term-out");
    var amountEl = document.getElementById("calc-amount");
    var toggleBtns = form.querySelectorAll(".toggle-btn");
    var tobacco = 0;

    var usd = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });

    function estimate() {
      var age = Number(ageInput.value);
      var coverage = Number(coverageInput.value);
      var term = Number(termInput.value);

      // Illustrative pricing model only — not real actuarial math.
      // Base cost per $1,000 of coverage scaled by age, term and tobacco.
      var ratePerThousand = 0.018;
      var ageFactor = 1 + Math.max(0, age - 30) * 0.035;
      var termFactor = 1 + (term - 10) * 0.018;
      var tobaccoFactor = tobacco ? 2.4 : 1;

      var monthly =
        (coverage / 1000) *
        ratePerThousand *
        ageFactor *
        termFactor *
        tobaccoFactor;

      monthly = Math.max(8, monthly); // floor
      return Math.round(monthly);
    }

    function render() {
      ageOut.textContent = ageInput.value;
      coverageOut.textContent = usd.format(Number(coverageInput.value));
      termOut.textContent = termInput.value + " years";

      var value = estimate();
      amountEl.textContent = usd.format(value);

      // brief highlight on change
      amountEl.style.color = "var(--green)";
      window.clearTimeout(amountEl._t);
      amountEl._t = window.setTimeout(function () {
        amountEl.style.color = "";
      }, 280);
    }

    [ageInput, coverageInput, termInput].forEach(function (el) {
      el.addEventListener("input", render);
    });

    toggleBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tobacco = Number(btn.getAttribute("data-tobacco"));
        toggleBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        render();
      });
    });

    render();
  }

  /* ---------- Quote form (demo only) ---------- */
  var quoteForm = document.getElementById("quote-form");
  if (quoteForm) {
    var msg = document.getElementById("quote-msg");
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = quoteForm.querySelector("#q-email");
      var zip = quoteForm.querySelector("#q-zip");

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var zipOk = /^\d{5}$/.test(zip.value.trim());

      if (!emailOk) {
        msg.textContent = "Please enter a valid email address.";
        msg.style.color = "#ffd9d9";
        email.focus();
        return;
      }
      if (!zipOk) {
        msg.textContent = "Please enter a 5-digit ZIP code.";
        msg.style.color = "#ffd9d9";
        zip.focus();
        return;
      }

      msg.style.color = "#d9ffe9";
      msg.textContent = "Thanks! Your illustrative quote for " + zip.value + " is on its way (demo).";
      quoteForm.reset();
    });
  }

  /* ---------- FAQ: keep accordion single-open ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
