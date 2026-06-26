(function () {
  'use strict';

  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  // Renew policy: bump the renewal date forward one year and confirm.
  var renewBtn = document.getElementById('renewBtn');
  var renewDate = document.getElementById('renewDate');
  if (renewBtn) {
    renewBtn.addEventListener('click', function () {
      if (renewDate) renewDate.textContent = 'Jan 15, 2028';
      renewBtn.textContent = 'Renewal confirmed ✓';
      renewBtn.disabled = true;
      renewBtn.style.opacity = '.7';
      renewBtn.style.cursor = 'default';
      showToast('Policy renewed through Jan 15, 2028.');
    });
  }

  // Cancel flow with an accessible confirmation dialog.
  var cancelBtn = document.getElementById('cancelBtn');
  var dialog = document.getElementById('cancelDialog');
  var dlgKeep = document.getElementById('dlgKeep');
  var dlgConfirm = document.getElementById('dlgConfirm');
  var statusBadge = document.getElementById('statusBadge');

  function openDialog() {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    if (dlgKeep) dlgKeep.focus();
  }
  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    if (cancelBtn) cancelBtn.focus();
  }

  if (cancelBtn) cancelBtn.addEventListener('click', openDialog);
  if (dlgKeep) dlgKeep.addEventListener('click', closeDialog);
  if (dlgConfirm) {
    dlgConfirm.addEventListener('click', function () {
      if (statusBadge) {
        statusBadge.textContent = 'Cancellation pending';
        statusBadge.classList.remove('badge--active');
        statusBadge.classList.add('badge--cancel');
      }
      if (cancelBtn) {
        cancelBtn.textContent = 'Cancellation requested';
        cancelBtn.disabled = true;
        cancelBtn.style.opacity = '.7';
        cancelBtn.style.cursor = 'default';
      }
      closeDialog();
      showToast('Cancellation requested — an agent will follow up.');
    });
  }

  // Close on backdrop click for <dialog> support.
  if (dialog) {
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeDialog();
    });
  }

  // Download buttons: lightweight feedback only (illustrative UI).
  var dls = document.querySelectorAll('.docs__dl');
  Array.prototype.forEach.call(dls, function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var name = a.closest('li').querySelector('.docs__name').textContent;
      showToast('Preparing “' + name + '” for download…');
    });
  });
})();
