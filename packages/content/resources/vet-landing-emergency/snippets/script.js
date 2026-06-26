(function () {
  'use strict';

  // --- Live clock + open-now indicator -------------------------------------
  var clockEl = document.getElementById('clock');
  var pill = document.getElementById('statusPill');
  var statusText = document.getElementById('statusText');

  function tick() {
    var now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    // This hospital is open 24/7, so it is always "Open now" — but we still
    // compute it so the indicator behaves like a real hours check.
    var open = true; // 24/7
    if (pill && statusText) {
      if (open) {
        pill.classList.remove('status--closed');
        statusText.textContent = 'Open now · 24/7';
      } else {
        pill.classList.add('status--closed');
        statusText.textContent = 'Closed';
      }
    }
  }
  tick();
  setInterval(tick, 15000);

  // --- Toast helper --------------------------------------------------------
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = msg;
    // force reflow so the transition runs
    void toast.offsetWidth;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-show');
      setTimeout(function () { toast.hidden = true; }, 250);
    }, 2600);
  }

  // --- Confirm the number on every call CTA --------------------------------
  document.querySelectorAll('.js-call').forEach(function (link) {
    link.addEventListener('click', function () {
      var num = link.getAttribute('data-number') || 'our 24/7 line';
      showToast('Connecting you to ' + num + ' …');
    });
  });

  // --- Tiny live touch: nudge the estimated wait slightly over time --------
  var waitEl = document.getElementById('waitText');
  var waits = ['~6 minutes', '~8 minutes', '~5 minutes', '~10 minutes'];
  var wi = 1;
  if (waitEl) {
    setInterval(function () {
      wi = (wi + 1) % waits.length;
      waitEl.textContent = waits[wi];
    }, 20000);
  }
})();
