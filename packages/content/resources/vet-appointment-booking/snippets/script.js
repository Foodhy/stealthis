(function () {
  'use strict';

  var form = document.getElementById('bookingForm');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-step-dot]'));
  var successEl = document.getElementById('success');

  var state = {
    step: 1,
    pet: 'Luna',
    petMeta: 'Cat · 4 yrs',
    reason: '',
    vet: '',
    date: null, // Date object
    time: ''
  };

  // ---------- step navigation ----------
  function showStep(n) {
    state.step = n;
    steps.forEach(function (s) {
      var match = Number(s.getAttribute('data-step')) === n;
      s.classList.toggle('is-active', match);
      s.hidden = !match;
    });
    dots.forEach(function (d) {
      var dn = Number(d.getAttribute('data-step-dot'));
      d.classList.toggle('is-active', dn === n);
      d.classList.toggle('is-done', dn < n);
    });
    if (n === 4) renderSummary();
    var heading = steps[n - 1] && steps[n - 1].querySelector('.step__title');
    if (heading) heading.setAttribute('tabindex', '-1'), heading.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- validation helpers ----------
  function setError(name, msg) {
    var el = form.querySelector('[data-error="' + name + '"]');
    if (el) el.textContent = msg || '';
    var field = el && el.closest('.field');
    if (field) field.classList.toggle('is-invalid', !!msg);
  }

  function clearErrors() {
    form.querySelectorAll('.error').forEach(function (e) { e.textContent = ''; });
    form.querySelectorAll('.is-invalid').forEach(function (f) { f.classList.remove('is-invalid'); });
  }

  function validateStep(n) {
    var ok = true;
    if (n === 1) {
      if (state.pet === '__new') {
        var nm = form.newPetName.value.trim();
        if (!nm) { setError('newPetName', 'Please name your pet.'); ok = false; }
        else setError('newPetName', '');
      }
      if (!form.reason.value) { setError('reason', 'Pick a reason for the visit.'); ok = false; }
      else setError('reason', '');
    }
    if (n === 2) {
      if (!state.date) { setError('date', 'Choose a date.'); ok = false; }
      else setError('date', '');
      if (state.date && !state.time) { setError('time', 'Choose a time slot.'); ok = false; }
      else if (state.time) setError('time', '');
    }
    if (n === 3) {
      var owner = form.owner.value.trim();
      var phone = form.phone.value.trim();
      var email = form.email.value.trim();
      if (!owner) { setError('owner', 'Your name is required.'); ok = false; } else setError('owner', '');
      if (phone.replace(/\D/g, '').length < 7) { setError('phone', 'Enter a valid phone number.'); ok = false; } else setError('phone', '');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email', 'Enter a valid email.'); ok = false; } else setError('email', '');
    }
    return ok;
  }

  // ---------- pet selection ----------
  form.querySelectorAll('input[name="pet"]').forEach(function (r) {
    r.addEventListener('change', function () {
      state.pet = r.value;
      state.petMeta = r.getAttribute('data-kind') || '';
      document.getElementById('newPet').hidden = r.value !== '__new';
      if (r.value !== '__new') setError('newPetName', '');
    });
  });

  form.reason.addEventListener('change', function () { state.reason = form.reason.value; });
  form.vet.addEventListener('change', function () { state.vet = form.vet.value; });

  // ---------- calendar ----------
  var calGrid = document.getElementById('calGrid');
  var calMonth = document.getElementById('calMonth');
  var prevBtn = document.querySelector('[data-cal-prev]');
  var nextBtn = document.querySelector('[data-cal-next]');
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var minView = new Date(today.getFullYear(), today.getMonth(), 1);

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function renderCalendar() {
    calMonth.textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
    prevBtn.disabled = view.getFullYear() === minView.getFullYear() && view.getMonth() === minView.getMonth();
    calGrid.innerHTML = '';

    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    var startDow = first.getDay();
    var daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    for (var i = 0; i < startDow; i++) {
      var blank = document.createElement('span');
      blank.className = 'day day--empty';
      calGrid.appendChild(blank);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var cellDate = new Date(view.getFullYear(), view.getMonth(), d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day';
      btn.textContent = String(d);
      btn.setAttribute('role', 'gridcell');

      var isPast = cellDate < today;
      var isSunday = cellDate.getDay() === 0; // clinic closed Sundays
      if (isPast || isSunday) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      }
      if (sameDay(cellDate, today)) btn.classList.add('is-today');
      if (state.date && sameDay(cellDate, state.date)) {
        btn.classList.add('is-selected');
        btn.setAttribute('aria-selected', 'true');
      }

      (function (cd) {
        btn.addEventListener('click', function () {
          state.date = cd;
          state.time = '';
          setError('date', '');
          renderCalendar();
          renderSlots();
        });
      })(cellDate);

      calGrid.appendChild(btn);
    }
  }

  prevBtn.addEventListener('click', function () {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    renderCalendar();
  });
  nextBtn.addEventListener('click', function () {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    renderCalendar();
  });

  // ---------- time slots ----------
  var slotsWrap = document.getElementById('slotsWrap');
  var slotsGrid = document.getElementById('slotsGrid');
  var slotsLabel = document.getElementById('slotsLabel');
  var BASE_SLOTS = ['9:00', '9:40', '10:20', '11:00', '11:40',
    '13:20', '14:00', '14:40', '15:20', '16:00', '16:40'];

  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function renderSlots() {
    if (!state.date) { slotsWrap.hidden = true; return; }
    slotsWrap.hidden = false;
    slotsLabel.textContent = 'Available times — ' + fmtDate(state.date);
    slotsGrid.innerHTML = '';

    // deterministically mark a couple of slots taken, based on the date
    var seed = state.date.getDate();
    BASE_SLOTS.forEach(function (t, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.textContent = t;
      var taken = (idx + seed) % 4 === 0;
      if (taken) {
        btn.disabled = true;
        btn.title = 'Fully booked';
      }
      if (state.time === t) btn.classList.add('is-selected');
      btn.addEventListener('click', function () {
        state.time = t;
        setError('time', '');
        slotsGrid.querySelectorAll('.slot').forEach(function (s) { s.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
      });
      slotsGrid.appendChild(btn);
    });
  }

  // ---------- summary ----------
  function petLabel() {
    if (state.pet === '__new') {
      var nm = form.newPetName.value.trim() || 'New pet';
      var kind = form.newPetKind.value.trim();
      return { name: nm, meta: kind || 'New patient' };
    }
    return { name: state.pet, meta: state.petMeta };
  }

  function renderSummary() {
    var pet = petLabel();
    var rows = [
      { ico: '🐾', k: 'Pet', v: pet.name + ' · ' + pet.meta, badge: 'New' },
      { ico: '🩺', k: 'Reason', v: form.reason.value || '—' },
      { ico: '👩‍⚕️', k: 'Vet', v: form.vet.value || 'No preference' },
      { ico: '📆', k: 'Date', v: state.date ? fmtDate(state.date) : '—' },
      { ico: '⏰', k: 'Time', v: state.time || '—' },
      { ico: '📞', k: 'Contact', v: form.owner.value.trim() + ' · ' + form.phone.value.trim() }
    ];
    var html = rows.map(function (r) {
      var badge = (r.badge && state.pet === '__new') ? '<span class="sum-badge">' + r.badge + '</span>' : '';
      return '<div class="sum-row"><span class="sum-row__ico">' + r.ico + '</span>' +
        '<div><p class="sum-row__k">' + r.k + '</p><p class="sum-row__v">' + escapeHtml(r.v) + '</p></div>' +
        badge + '</div>';
    }).join('');
    document.getElementById('summary').innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- buttons ----------
  form.querySelectorAll('[data-next]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (validateStep(state.step)) showStep(state.step + 1);
    });
  });
  form.querySelectorAll('[data-prev]').forEach(function (b) {
    b.addEventListener('click', function () { showStep(state.step - 1); });
  });

  // ---------- submit ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(3)) { showStep(3); return; }
    var pet = petLabel();
    var ref = 'PW-' + (1000 + Math.floor(Math.random() * 9000));
    document.getElementById('successRef').textContent = ref;
    document.getElementById('successMsg').textContent =
      pet.name + "'s " + (form.reason.value || 'visit').toLowerCase() +
      ' is booked for ' + fmtDate(state.date) + ' at ' + state.time + '.';
    form.hidden = true;
    document.querySelector('.booking__head .steps').style.display = 'none';
    successEl.hidden = false;
    successEl.querySelector('h2').setAttribute('tabindex', '-1');
    successEl.querySelector('h2').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('bookAnother').addEventListener('click', function () {
    form.reset();
    clearErrors();
    state.pet = 'Luna';
    state.petMeta = 'Cat · 4 yrs';
    state.reason = '';
    state.vet = '';
    state.date = null;
    state.time = '';
    document.getElementById('newPet').hidden = true;
    slotsWrap.hidden = true;
    view = new Date(minView.getFullYear(), minView.getMonth(), 1);
    renderCalendar();
    successEl.hidden = true;
    form.hidden = false;
    document.querySelector('.booking__head .steps').style.display = '';
    showStep(1);
  });

  // ---------- init ----------
  renderCalendar();
  showStep(1);
})();
