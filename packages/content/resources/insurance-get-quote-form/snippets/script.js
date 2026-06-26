(function () {
  "use strict";

  var form = document.getElementById("quoteForm");
  var formCard = document.getElementById("formCard");
  var resultCard = document.getElementById("resultCard");
  var amountInput = document.getElementById("amount");

  var COVERAGE_LABELS = {
    auto: "auto insurance",
    home: "home insurance",
    renters: "renters insurance",
    "term-life": "term life insurance",
    health: "health insurance",
  };

  // Base monthly premium per $1,000 of coverage, by plan (illustrative only).
  var RATE_PER_K = {
    auto: 0.42,
    home: 0.11,
    renters: 0.05,
    "term-life": 0.06,
    health: 0.95,
  };

  // Live-format the coverage amount with thousands separators.
  amountInput.addEventListener("input", function () {
    var digits = amountInput.value.replace(/[^\d]/g, "").slice(0, 9);
    amountInput.value = digits ? Number(digits).toLocaleString("en-US") : "";
  });

  function setError(id, message) {
    var field = document.getElementById(id).closest(".field");
    var err = document.getElementById(id + "-err");
    field.classList.add("invalid");
    err.textContent = message;
    err.hidden = false;
  }

  function clearError(id) {
    var field = document.getElementById(id).closest(".field");
    var err = document.getElementById(id + "-err");
    field.classList.remove("invalid");
    err.hidden = true;
    err.textContent = "";
  }

  function num(value) {
    return Number(String(value).replace(/[^\d]/g, ""));
  }

  function validate() {
    var ok = true;
    var first = null;

    var coverage = form.coverage.value;
    if (!coverage) {
      setError("coverage", "Please pick a coverage type.");
      ok = false;
      first = first || "coverage";
    } else {
      clearError("coverage");
    }

    var age = num(form.age.value);
    if (!form.age.value) {
      setError("age", "Enter your age.");
      ok = false;
      first = first || "age";
    } else if (age < 18 || age > 99) {
      setError("age", "Age must be between 18 and 99.");
      ok = false;
      first = first || "age";
    } else {
      clearError("age");
    }

    var zip = form.zip.value.trim();
    if (!/^\d{5}$/.test(zip)) {
      setError("zip", "Enter a valid 5-digit ZIP.");
      ok = false;
      first = first || "zip";
    } else {
      clearError("zip");
    }

    var amount = num(form.amount.value);
    if (!amount) {
      setError("amount", "Enter a coverage amount.");
      ok = false;
      first = first || "amount";
    } else if (amount < 1000) {
      setError("amount", "Coverage must be at least $1,000.");
      ok = false;
      first = first || "amount";
    } else {
      clearError("amount");
    }

    var name = form.name.value.trim();
    if (name.length < 2) {
      setError("name", "Please enter your full name.");
      ok = false;
      first = first || "name";
    } else {
      clearError("name");
    }

    var email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("email", "Enter a valid email address.");
      ok = false;
      first = first || "email";
    } else {
      clearError("email");
    }

    if (first) {
      document.getElementById(first).focus();
    }
    return ok;
  }

  function estimate(coverage, age, amount) {
    var base = (amount / 1000) * (RATE_PER_K[coverage] || 0.1);
    // Older applicants pay more; clamp so demo numbers stay sensible.
    var ageFactor = 1 + Math.max(0, age - 25) * 0.012;
    var monthly = base * ageFactor;
    var low = Math.max(8, Math.round(monthly * 0.85));
    var high = Math.round(monthly * 1.2) + 4;
    return { low: low, high: high };
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var coverage = form.coverage.value;
    var range = estimate(coverage, num(form.age.value), num(form.amount.value));

    document.getElementById("resultName").textContent =
      form.name.value.trim().split(" ")[0] || "there";
    document.getElementById("resultCoverage").textContent =
      COVERAGE_LABELS[coverage] || "coverage";
    document.getElementById("resultEmail").textContent = form.email.value.trim();
    document.getElementById("estLow").textContent = money(range.low);
    document.getElementById("estHigh").textContent = money(range.high);

    formCard.hidden = true;
    resultCard.hidden = false;
    resultCard.focus && resultCard.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Clear a field's error as soon as the user starts fixing it.
  ["coverage", "age", "zip", "amount", "name", "email"].forEach(function (id) {
    var el = document.getElementById(id);
    var evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, function () {
      if (el.closest(".field").classList.contains("invalid")) clearError(id);
    });
  });

  document.getElementById("restart").addEventListener("click", function () {
    form.reset();
    ["coverage", "age", "zip", "amount", "name", "email"].forEach(clearError);
    resultCard.hidden = true;
    formCard.hidden = false;
    form.coverage.focus();
  });
})();
