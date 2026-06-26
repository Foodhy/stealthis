(function () {
  "use strict";

  var form = document.getElementById("quoteForm");
  if (!form) return;

  // ---- elements ----
  var ageEl = document.getElementById("age");
  var zipEl = document.getElementById("zip");
  var amountEl = document.getElementById("amount");
  var dedEl = document.getElementById("deductible");
  var bundleEl = document.getElementById("bundle");
  var quickBtns = Array.prototype.slice.call(document.querySelectorAll(".quick__btn"));

  var monthlyEl = document.getElementById("monthly");
  var annualEl = document.getElementById("annual");
  var dedOut = document.getElementById("deductibleOut");
  var dedTier = document.getElementById("deductibleTier");
  var zipEcho = document.getElementById("zipEcho");
  var approvalPill = document.getElementById("approvalPill");
  var savePill = document.getElementById("savePill");
  var quoteIdEl = document.getElementById("quoteId");
  var lockBtn = document.getElementById("lockBtn");

  // base monthly rate per coverage type (USD)
  var BASE = { auto: 96, home: 84, health: 168, life: 42 };
  // sensitivity of premium to coverage amount, per type
  var COV_RATE = { auto: 0.00018, home: 0.00009, health: 0.00012, life: 0.00006 };

  var fmt = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  // deterministic location factor derived from ZIP digits
  function locationFactor(zip) {
    var digits = (zip || "").replace(/\D/g, "");
    if (digits.length < 5) return { mult: 1, score: 0 };
    var sum = 0;
    for (var i = 0; i < digits.length; i++) sum += parseInt(digits[i], 10);
    // map 0..45 -> roughly 0.88..1.18
    var mult = 0.88 + (sum / 45) * 0.3;
    return { mult: mult, score: sum };
  }

  function ageFactor(age) {
    age = parseInt(age, 10) || 34;
    if (age < 25) return 1.34;
    if (age < 35) return 1.0;
    if (age < 50) return 0.94;
    if (age < 65) return 1.08;
    return 1.42;
  }

  function getCoverageType() {
    var checked = form.querySelector('input[name="coverage"]:checked');
    return checked ? checked.value : "auto";
  }

  function setBreakdown(k, val) {
    var el = document.querySelector('.break__num[data-k="' + k + '"]');
    if (el) el.textContent = val;
  }

  function recalc() {
    var type = getCoverageType();
    var age = parseInt(ageEl.value, 10) || 34;
    var amount = Math.max(0, parseInt(amountEl.value, 10) || 0);
    var ded = parseInt(dedEl.value, 10) || 1000;
    var bundle = bundleEl.checked;

    var base = BASE[type];
    var aFactor = ageFactor(age);
    var loc = locationFactor(zipEl.value);

    // component contributions (all monthly)
    var ageAdj = base * (aFactor - 1);
    var locAdj = base * (loc.mult - 1);
    var covAdj = amount * COV_RATE[type];

    var subtotal = base + ageAdj + locAdj + covAdj;

    // deductible discount: higher deductible -> bigger discount (up to ~28%)
    var dedPct = ((ded - 250) / (5000 - 250)) * 0.28;
    var dedDiscount = subtotal * dedPct;

    var afterDed = subtotal - dedDiscount;

    var bundleDiscount = bundle ? afterDed * 0.12 : 0;
    var monthly = Math.max(8, afterDed - bundleDiscount);
    var annual = monthly * 12;

    // ---- render headline ----
    monthlyEl.textContent = fmt(monthly);
    annualEl.textContent = fmt(annual);

    // ---- breakdown ----
    setBreakdown("base", fmt(base));
    setBreakdown("age", (ageAdj >= 0 ? "+" : "−") + fmt(Math.abs(ageAdj)));
    setBreakdown("loc", (locAdj >= 0 ? "+" : "−") + fmt(Math.abs(locAdj)));
    setBreakdown("cov", "+" + fmt(covAdj));
    setBreakdown("ded", "−" + fmt(dedDiscount));
    setBreakdown("total", fmt(monthly) + "/mo");
    zipEcho.textContent = (zipEl.value || "").replace(/\D/g, "") || "—";

    var bundleRow = document.querySelector("[data-bundle]");
    if (bundle) {
      bundleRow.hidden = false;
      setBreakdown("bundle", "−" + fmt(bundleDiscount));
    } else {
      bundleRow.hidden = true;
    }

    // ---- deductible UI ----
    dedOut.textContent = fmt(ded);
    var fillPct = ((ded - dedEl.min) / (dedEl.max - dedEl.min)) * 100;
    dedEl.style.setProperty("--fill", fillPct + "%");

    if (ded <= 500) {
      dedTier.textContent = "Low tier — higher premium, less out-of-pocket if you claim.";
    } else if (ded <= 2000) {
      dedTier.textContent = "Standard tier — balanced premium and out-of-pocket.";
    } else {
      dedTier.textContent = "High tier — lowest premium, more out-of-pocket if you claim.";
    }

    // ---- approval likelihood (heuristic) ----
    var approvalScore = 100 - Math.abs(age - 38) * 0.6 - (covAdj * 0.4) + (ded > 1500 ? 6 : 0);
    var label, cls;
    if (approvalScore >= 78) { label = "Very likely approval"; cls = "pill--save"; }
    else if (approvalScore >= 55) { label = "Likely approval"; cls = ""; }
    else { label = "Manual review likely"; cls = ""; }
    approvalPill.textContent = label;
    approvalPill.className = "pill " + cls;

    // ---- savings pill (vs lowest-deductible, no-bundle baseline) ----
    var baselineMonthly = Math.max(8, subtotal); // ded=250-ish, no bundle
    var saving = (baselineMonthly - monthly) * 12;
    savePill.textContent = saving > 0 ? "Saving " + fmt(saving) + "/yr" : "Best coverage";

    // reset any locked state on change
    if (lockBtn.classList.contains("is-locked")) {
      lockBtn.classList.remove("is-locked");
      lockBtn.textContent = "Lock this rate for 30 days";
    }
  }

  // ---- quick amount chips ----
  function syncQuick() {
    quickBtns.forEach(function (b) {
      b.classList.toggle("is-active", parseInt(b.dataset.amount, 10) === parseInt(amountEl.value, 10));
    });
  }
  quickBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      amountEl.value = b.dataset.amount;
      syncQuick();
      recalc();
    });
  });

  // ---- random but stable-looking quote id ----
  function makeQuoteId() {
    var n = Math.floor(100000 + Math.random() * 899999);
    quoteIdEl.textContent = "NB-" + n;
  }

  // ---- lock CTA ----
  lockBtn.addEventListener("click", function () {
    if (lockBtn.classList.contains("is-locked")) return;
    lockBtn.classList.add("is-locked");
    lockBtn.textContent = "✓ Rate locked · " + quoteIdEl.textContent;
  });

  // ---- wire up ----
  form.addEventListener("input", function () { syncQuick(); recalc(); });
  form.addEventListener("change", recalc);

  // init
  makeQuoteId();
  syncQuick();
  recalc();
})();
