// DriveSure auto-insurance landing — quick-quote estimator + discount calculator.
// Vanilla JS, no libraries. Estimates are illustrative only.

(function () {
  'use strict';

  /* ---- Quick quote estimator ---- */
  var form = document.getElementById('quoteForm');
  var estimate = document.getElementById('estimate');
  var estPrice = document.getElementById('estPrice');
  var estSave = document.getElementById('estSave');
  var zip = document.getElementById('zip');

  // Keep ZIP numeric.
  if (zip) {
    zip.addEventListener('input', function () {
      zip.value = zip.value.replace(/\D/g, '').slice(0, 5);
    });
  }

  var COVERAGE_BASE = { basic: 78, standard: 112, full: 158 };

  function yearFactor(year) {
    var y = parseInt(year, 10);
    if (y >= 2024) return 1.18;
    if (y >= 2022) return 1.08;
    if (y >= 2019) return 1.0;
    if (y >= 2015) return 0.92;
    return 0.85;
  }

  function zipFactor(z) {
    // Deterministic, friendly variance from the ZIP digits (demo only).
    var sum = 0;
    for (var i = 0; i < z.length; i++) sum += z.charCodeAt(i);
    return 0.92 + ((sum % 17) / 100); // 0.92 – 1.08
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var z = (zip.value || '').trim();
      if (z.length < 5) {
        zip.focus();
        zip.setAttribute('aria-invalid', 'true');
        return;
      }
      zip.removeAttribute('aria-invalid');

      var coverage = document.getElementById('coverage').value;
      var year = document.getElementById('year').value;
      var safe = document.getElementById('safe').checked;
      var bundle = document.getElementById('bundle').checked;

      var monthly = COVERAGE_BASE[coverage] * yearFactor(year) * zipFactor(z);
      var fullPrice = monthly;

      if (safe) monthly *= 0.9;   // safe-driver discount
      if (bundle) monthly *= 0.88; // bundle discount

      monthly = Math.round(monthly);
      var saved = Math.round((fullPrice - monthly) * 12);

      estPrice.textContent = '$' + monthly;
      if (saved > 0) {
        estSave.textContent = 'You could save about $' + saved + '/yr with your discounts';
        estSave.style.display = '';
      } else {
        estSave.textContent = 'Add discounts below to save even more';
        estSave.style.display = '';
      }

      estimate.hidden = false;
      estimate.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* ---- Discount badge calculator ---- */
  var badges = document.getElementById('badges');
  var totalEl = document.getElementById('discountTotal');

  function renderTotal() {
    if (!badges || !totalEl) return;
    var total = 0;
    badges.querySelectorAll('.badge.is-on').forEach(function (b) {
      total += parseInt(b.getAttribute('data-save'), 10) || 0;
    });
    totalEl.innerHTML = '$' + total + '<small>/yr</small>';
  }

  if (badges) {
    badges.addEventListener('click', function (e) {
      var btn = e.target.closest('.badge');
      if (!btn) return;
      btn.classList.toggle('is-on');
      btn.setAttribute('aria-pressed', btn.classList.contains('is-on') ? 'true' : 'false');
      renderTotal();
    });
    // Initialise aria state.
    badges.querySelectorAll('.badge').forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
    });
    renderTotal();
  }
})();
