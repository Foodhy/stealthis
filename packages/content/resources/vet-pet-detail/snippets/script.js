// Vet pet detail — tabs, chart keyboard access, reminder dismiss. Vanilla JS, no libs.
(function () {
  'use strict';

  // --- Tabbed sections ---
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.tabpanel'));

  function activate(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var targetId = tab.getAttribute('aria-controls');
    panels.forEach(function (p) {
      var show = p.id === targetId;
      p.hidden = !show;
      p.classList.toggle('is-active', show);
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(tab); });
    // Arrow-key navigation between tabs (WAI-ARIA pattern).
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        activate(next);
        next.focus();
      }
    });
  });

  // --- Chart bars: make focusable so the CSS tooltip works via keyboard ---
  Array.prototype.forEach.call(document.querySelectorAll('.bar'), function (bar) {
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('role', 'img');
    var label = bar.getAttribute('data-label');
    if (label) bar.setAttribute('aria-label', label);
  });

  // --- Upcoming-care reminder dismiss ---
  var care = document.getElementById('care-card');
  var empty = document.getElementById('care-empty');
  var dismiss = care ? care.querySelector('.care-dismiss') : null;
  if (dismiss) {
    dismiss.addEventListener('click', function () {
      care.hidden = true;
      if (empty) empty.hidden = false;
    });
  }

  // Confirm button gives quick visual feedback.
  var confirmBtn = care ? care.querySelector('.btn-primary') : null;
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      confirmBtn.textContent = 'Confirmed ✓';
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.75';
    });
  }
})();
