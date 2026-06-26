// RedValve Plumbing landing — vanilla JS, no libraries.
(function () {
  'use strict';

  /* ---- Coupon: copy code to clipboard ---- */
  var couponBtn = document.getElementById('couponBtn');
  if (couponBtn) {
    var label = couponBtn.querySelector('.coupon__label');
    var defaultLabel = label ? label.textContent : '';
    couponBtn.addEventListener('click', function () {
      var code = 'PIPE50';
      var done = function () {
        couponBtn.classList.add('copied');
        if (label) label.textContent = 'Copied!';
        window.setTimeout(function () {
          couponBtn.classList.remove('copied');
          if (label) label.textContent = defaultLabel;
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  /* ---- Booking form: inline validation ---- */
  var form = document.getElementById('bookForm');
  if (!form) return;
  var ok = document.getElementById('bookOk');

  function setError(field, msg) {
    var wrap = field.closest('.field');
    var slot = form.querySelector('.error[data-for="' + field.name + '"]');
    if (msg) {
      wrap.classList.add('invalid');
      field.setAttribute('aria-invalid', 'true');
      if (slot) slot.textContent = msg;
    } else {
      wrap.classList.remove('invalid');
      field.removeAttribute('aria-invalid');
      if (slot) slot.textContent = '';
    }
  }

  function validateField(field) {
    var v = (field.value || '').trim();
    if (field.name === 'name') {
      if (v.length < 2) return setError(field, 'Please enter your name.'), false;
    } else if (field.name === 'phone') {
      var digits = v.replace(/\D/g, '');
      if (digits.length < 10) return setError(field, 'Enter a 10-digit phone number.'), false;
    } else if (field.required && !v) {
      return setError(field, 'This field is required.'), false;
    }
    setError(field, '');
    return true;
  }

  var fields = Array.prototype.slice.call(
    form.querySelectorAll('input[required], select[required]')
  );

  fields.forEach(function (f) {
    f.addEventListener('blur', function () { validateField(f); });
    f.addEventListener('input', function () {
      if (f.closest('.field').classList.contains('invalid')) validateField(f);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var allOk = true;
    var firstBad = null;
    fields.forEach(function (f) {
      if (!validateField(f)) {
        allOk = false;
        if (!firstBad) firstBad = f;
      }
    });
    if (!allOk) {
      if (firstBad) firstBad.focus();
      if (ok) ok.hidden = true;
      return;
    }
    form.querySelector('button[type="submit"]').disabled = true;
    if (ok) {
      ok.hidden = false;
      ok.focus && ok.focus();
    }
  });
})();
