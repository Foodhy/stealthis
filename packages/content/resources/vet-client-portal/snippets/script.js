(function () {
  'use strict';

  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2600);
  }

  // Live counters --------------------------------------------------------
  var apptsList = document.getElementById('apptsList');
  var apptsPill = document.getElementById('apptsPill');
  var apptCount = document.getElementById('apptCount');
  var rxList = document.getElementById('rxList');
  var rxPill = document.getElementById('rxPill');
  var rxCount = document.getElementById('rxCount') || document.getElementById('refillCount');

  function activeAppts() {
    return apptsList.querySelectorAll('.appt:not(.is-cancelled)').length;
  }
  function pendingRefills() {
    return rxList.querySelectorAll('.rx:not(.is-requested)').length;
  }
  function syncCounts() {
    var a = activeAppts();
    var r = pendingRefills();
    if (apptsPill) apptsPill.textContent = a;
    if (apptCount) apptCount.textContent = a;
    if (rxPill) rxPill.textContent = r;
    if (rxCount) rxCount.textContent = r;
  }

  // Cancel appointment (inline confirm) ----------------------------------
  apptsList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cancel]');
    if (!btn) return;
    var card = btn.closest('.appt');
    if (!card) return;

    if (!btn.classList.contains('is-confirm')) {
      btn.classList.add('is-confirm');
      btn.textContent = 'Confirm cancel?';
      setTimeout(function () {
        if (btn.classList.contains('is-confirm') && card.parentNode) {
          btn.classList.remove('is-confirm');
          btn.textContent = 'Cancel';
        }
      }, 3500);
      return;
    }

    card.classList.add('is-cancelled');
    btn.remove();
    var mod = card.querySelector('.mod');
    if (mod) { mod.textContent = 'Cancelled'; mod.className = 'mod'; }
    syncCounts();
    toast('Appointment cancelled');
  });

  // Pay invoice ----------------------------------------------------------
  var invList = document.getElementById('invList');
  var balanceEl = document.getElementById('balance');
  function recalcBalance() {
    var total = 0;
    invList.querySelectorAll('.inv:not(.is-paid)').forEach(function (li) {
      total += parseFloat(li.getAttribute('data-amount')) || 0;
    });
    if (balanceEl) balanceEl.textContent = '$' + total.toFixed(2);
  }
  invList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-pay]');
    if (!btn) return;
    var li = btn.closest('.inv');
    if (!li || li.classList.contains('is-paid')) return;
    li.classList.add('is-paid');
    btn.textContent = 'Paid ✓';
    recalcBalance();
    toast('Payment received — thank you!');
  });

  // Request refill -------------------------------------------------------
  rxList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-req]');
    if (!btn) return;
    var li = btn.closest('.rx');
    if (!li || li.classList.contains('is-requested')) return;
    li.classList.add('is-requested');
    btn.textContent = 'Requested ✓';
    var meta = li.querySelector('.rx__meta');
    if (meta) meta.textContent = 'Refill requested · ready in ~2 hrs';
    syncCounts();
    toast('Refill request sent to the pharmacy');
  });

  // Quick actions --------------------------------------------------------
  document.querySelectorAll('.qa').forEach(function (qa) {
    qa.addEventListener('click', function () {
      switch (qa.getAttribute('data-action')) {
        case 'book':
          toast('Booking flow would open here');
          break;
        case 'refill': {
          var first = rxList.querySelector('.rx:not(.is-requested) [data-req]');
          if (first) { first.click(); }
          else { toast('No refills pending'); }
          break;
        }
        case 'message':
          toast('Opening secure message to the clinic…');
          break;
      }
    });
  });

  // Recent visit summaries ----------------------------------------------
  document.querySelectorAll('[data-summary]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var title = a.closest('.rv').querySelector('.rv__title').textContent;
      toast('Opening visit summary: ' + title);
    });
  });

  syncCounts();
  recalcBalance();
})();
