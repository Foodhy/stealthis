(function () {
  'use strict';

  /* ---------- Opening hours + open/closed status ---------- */
  // 0 = Sunday … 6 = Saturday. open/close in 24h minutes; null = closed.
  var SCHEDULE = [
    { label: 'Sunday', open: null, close: null },
    { label: 'Monday', open: 8 * 60, close: 18 * 60 },
    { label: 'Tuesday', open: 8 * 60, close: 18 * 60 },
    { label: 'Wednesday', open: 8 * 60, close: 18 * 60 },
    { label: 'Thursday', open: 8 * 60, close: 19 * 60 },
    { label: 'Friday', open: 8 * 60, close: 18 * 60 },
    { label: 'Saturday', open: 9 * 60, close: 14 * 60 }
  ];

  function fmt(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    return h12 + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ampm;
  }

  function renderHours() {
    var list = document.getElementById('hours');
    var badge = document.getElementById('status-badge');
    if (!list || !badge) return;

    var now = new Date();
    var todayIdx = now.getDay();
    var nowMins = now.getHours() * 60 + now.getMinutes();

    list.innerHTML = '';
    SCHEDULE.forEach(function (d, i) {
      var li = document.createElement('li');
      if (i === todayIdx) li.className = 'today';

      var day = document.createElement('span');
      day.className = 'day';
      day.textContent = d.label;

      var time = document.createElement('span');
      time.className = 'time';
      if (d.open === null) {
        time.textContent = 'Closed';
        time.classList.add('closed');
      } else {
        time.textContent = fmt(d.open) + ' – ' + fmt(d.close);
      }

      li.appendChild(day);
      li.appendChild(time);
      list.appendChild(li);
    });

    var today = SCHEDULE[todayIdx];
    var isOpen = today.open !== null && nowMins >= today.open && nowMins < today.close;

    badge.classList.remove('open', 'closed');
    if (isOpen) {
      badge.classList.add('open');
      badge.textContent = '● Open now · until ' + fmt(today.close);
    } else {
      badge.classList.add('closed');
      // find next opening day
      var next = null;
      for (var step = 0; step < 7; step++) {
        var idx = (todayIdx + step) % 7;
        var d = SCHEDULE[idx];
        if (d.open === null) continue;
        if (step === 0 && nowMins < d.open) { next = 'today at ' + fmt(d.open); break; }
        if (step > 0) { next = (step === 1 ? 'tomorrow' : d.label) + ' at ' + fmt(d.open); break; }
      }
      badge.textContent = '● Closed' + (next ? ' · opens ' + next : '');
    }
  }

  /* ---------- Form validation ---------- */
  var form = document.getElementById('vet-form');
  var statusEl = document.getElementById('form-status');

  var validators = {
    owner: function (v) { return v.trim().length >= 2 || 'Please enter your name.'; },
    pet: function (v) { return v.trim().length >= 1 || "Please enter your pet's name."; },
    phone: function (v) {
      var digits = v.replace(/\D/g, '');
      return digits.length >= 7 || 'Enter a valid phone number.';
    },
    reason: function (v) { return v !== '' || 'Please choose a reason.'; }
  };

  function validateField(name) {
    var input = form.elements[name];
    if (!input) return true;
    var field = input.closest('.field');
    var errEl = form.querySelector('[data-error-for="' + name + '"]');
    var result = validators[name](input.value);

    if (result === true) {
      field.classList.remove('invalid');
      if (errEl) errEl.textContent = '';
      input.removeAttribute('aria-invalid');
      return true;
    }
    field.classList.add('invalid');
    if (errEl) errEl.textContent = result;
    input.setAttribute('aria-invalid', 'true');
    return false;
  }

  if (form) {
    Object.keys(validators).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', function () { validateField(name); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('invalid')) validateField(name);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.className = 'form-status';
      statusEl.textContent = '';

      var ok = Object.keys(validators).every(function (name) {
        return validateField(name);
      });

      if (!ok) {
        statusEl.classList.add('error');
        statusEl.textContent = 'Please fix the highlighted fields.';
        var firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var pet = form.elements.pet.value.trim();
      statusEl.classList.add('success');
      statusEl.textContent = 'Thanks! We\'ll confirm ' + pet + "'s appointment within one business day.";
      form.reset();
      form.querySelectorAll('.field.invalid').forEach(function (f) {
        f.classList.remove('invalid');
      });
    });
  }

  renderHours();
})();
