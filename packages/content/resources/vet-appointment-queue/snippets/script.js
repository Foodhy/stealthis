(function () {
  'use strict';

  var BADGE = {
    booked: 'Booked',
    'checked-in': 'Checked in',
    'in-room': 'In room',
    done: 'Done'
  };

  var live = document.getElementById('live');
  var roomCounter = 1;

  function announce(msg) {
    if (live) live.textContent = msg;
  }

  // Render the action buttons + badge for an appointment based on its status.
  function render(appt) {
    var status = appt.getAttribute('data-status');
    var badge = appt.querySelector('[data-badge]');
    var actions = appt.querySelector('[data-actions]');
    var roomEl = appt.querySelector('[data-room]');
    var petName = (appt.querySelector('.appt__pet') || {}).childNodes;
    var name = petName && petName[0] ? petName[0].textContent.trim() : 'Patient';

    if (badge) badge.textContent = BADGE[status] || status;
    if (actions) actions.innerHTML = '';

    // Room label only when the pet is in a room.
    if (roomEl) {
      var roomNo = appt.getAttribute('data-room-no');
      if (status === 'in-room' && roomNo) {
        roomEl.textContent = 'Room ' + roomNo;
        roomEl.hidden = false;
      } else {
        roomEl.hidden = true;
      }
    }

    if (!actions) return;

    if (status === 'booked') {
      addButton(actions, 'Check in', 'btn--teal', function () {
        appt.setAttribute('data-status', 'checked-in');
        render(appt);
        update();
        announce(name + ' checked in.');
      });
    } else if (status === 'checked-in') {
      addButton(actions, 'Call back', 'btn--teal', function () {
        appt.setAttribute('data-status', 'in-room');
        appt.setAttribute('data-room-no', String(roomCounter));
        roomCounter = roomCounter >= 4 ? 1 : roomCounter + 1;
        render(appt);
        update();
        announce(name + ' called back to room ' + appt.getAttribute('data-room-no') + '.');
      });
    } else if (status === 'in-room') {
      addButton(actions, 'Mark done', 'btn--ghost', function () {
        appt.setAttribute('data-status', 'done');
        appt.removeAttribute('data-room-no');
        render(appt);
        update();
        announce(name + "'s visit complete.");
      });
    }
    // done: no actions
  }

  function addButton(parent, label, variant, handler) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn ' + variant;
    b.textContent = label;
    b.addEventListener('click', handler);
    parent.appendChild(b);
  }

  // Recompute the header counters from the live DOM.
  function update() {
    var appts = document.querySelectorAll('.appt');
    var c = { booked: 0, 'checked-in': 0, 'in-room': 0, done: 0 };
    appts.forEach(function (a) {
      var s = a.getAttribute('data-status');
      if (c[s] != null) c[s]++;
    });
    setText('stat-waiting', c['checked-in']);
    setText('stat-inroom', c['in-room']);
    setText('stat-booked', c.booked);
    setText('stat-done', c.done);
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // Emergency / walk-in strip buttons: fade out once handled.
  document.querySelectorAll('[data-emergency]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.alert');
      var pet = card ? (card.querySelector('strong') || {}).textContent : '';
      btn.textContent = 'Queued ✓';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      announce((pet || 'Patient') + ' added to the queue.');
    });
  });

  // Initial render of every appointment.
  document.querySelectorAll('.appt').forEach(render);
  update();
})();
