(function () {
  'use strict';

  /* ---------- Service-area ZIP check ---------- */
  // Demo coverage: a handful of "in-area" prefixes. Replace with your real lookup.
  var COVERED_PREFIXES = ['100', '112', '900', '941', '787', '606'];
  var areaForm = document.getElementById('area-form');
  var zipInput = document.getElementById('zip');
  var areaMsg = document.getElementById('area-msg');

  if (areaForm && zipInput && areaMsg) {
    areaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var zip = (zipInput.value || '').trim();
      areaMsg.classList.remove('ok', 'no');

      if (!/^\d{5}$/.test(zip)) {
        areaMsg.textContent = 'Please enter a 5-digit ZIP code.';
        areaMsg.classList.add('no');
        zipInput.focus();
        return;
      }

      var covered = COVERED_PREFIXES.indexOf(zip.slice(0, 3)) !== -1;
      if (covered) {
        areaMsg.textContent = '🎉 Great news — we serve ' + zip + '! Book below.';
        areaMsg.classList.add('ok');
      } else {
        areaMsg.textContent =
          "We're not in " + zip + " yet — leave your email below and we'll notify you.";
        areaMsg.classList.add('no');
      }
    });
  }

  /* ---------- Booking form validation ---------- */
  var bookForm = document.getElementById('book-form');
  var formStatus = document.getElementById('form-status');

  function setError(name, message) {
    var span = document.querySelector('.error[data-for="' + name + '"]');
    var field = document.getElementById(name);
    var wrap = field ? field.closest('.field') : null;
    if (span) span.textContent = message || '';
    if (wrap) wrap.classList.toggle('invalid', !!message);
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  if (bookForm) {
    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var data = {
        name: bookForm.name.value.trim(),
        email: bookForm.email.value.trim(),
        pet: bookForm.pet.value.trim(),
      };

      if (!data.name) {
        setError('name', 'Please tell us your name.');
        ok = false;
      } else setError('name', '');

      if (!data.email) {
        setError('email', 'Email is required.');
        ok = false;
      } else if (!isEmail(data.email)) {
        setError('email', 'That email looks off.');
        ok = false;
      } else setError('email', '');

      if (!data.pet) {
        setError('pet', "Your pet's name and species, please.");
        ok = false;
      } else setError('pet', '');

      if (!ok) {
        formStatus.textContent = '';
        var firstInvalid = bookForm.querySelector('.field.invalid input');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var btn = bookForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }

      // Simulated async submit
      setTimeout(function () {
        bookForm.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Request my visit';
        }
        formStatus.textContent =
          '✅ Thanks, ' + data.name + "! We'll confirm your visit window within one business hour.";
      }, 700);
    });

    // Clear an error as the user fixes it
    ['name', 'email', 'pet'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { setError(id, ''); });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
})();
