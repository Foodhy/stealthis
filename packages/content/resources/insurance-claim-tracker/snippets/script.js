// Insurance Claim Status Tracker — vanilla JS, no libraries.
(function () {
  'use strict';

  // --- Activity timeline: show / hide earlier events ---
  var toggle = document.getElementById('toggle-activity');
  var extras = Array.prototype.slice.call(
    document.querySelectorAll('#timeline [data-extra]')
  );

  if (toggle && extras.length) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      var next = !expanded;
      extras.forEach(function (el) {
        el.classList.toggle('event--hidden', expanded);
      });
      toggle.setAttribute('aria-expanded', String(next));
      toggle.textContent = next
        ? 'Hide earlier activity'
        : 'Show earlier activity';
    });
  }

  // --- Adjuster contact actions ---
  var note = document.getElementById('adjuster-note');
  var noteTimer;

  function flash(message) {
    if (!note) return;
    note.textContent = message;
    window.clearTimeout(noteTimer);
    noteTimer = window.setTimeout(function () {
      note.textContent = '';
    }, 3200);
  }

  document.querySelectorAll('[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = btn.getAttribute('data-action');
      if (action === 'call') {
        flash('Connecting you to Priya Nadkarni at (415) 555-0182…');
      } else if (action === 'message') {
        flash('Message thread opened — typical reply within 2 hours.');
      }
    });
  });
})();
