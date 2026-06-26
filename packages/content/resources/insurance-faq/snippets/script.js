(function () {
  'use strict';

  var faq = document.getElementById('faq');
  if (!faq) return;

  var triggers = Array.prototype.slice.call(faq.querySelectorAll('.item__trigger'));
  var items = Array.prototype.slice.call(faq.querySelectorAll('[data-item]'));
  var groups = Array.prototype.slice.call(faq.querySelectorAll('[data-group]'));
  var search = document.getElementById('faq-search');
  var clearBtn = document.getElementById('faq-clear');
  var status = document.getElementById('faq-status');
  var empty = document.getElementById('faq-empty');
  var total = items.length;

  // Cache each question's original text so we can re-render highlights.
  items.forEach(function (item) {
    var q = item.querySelector('.item__q');
    item._qText = q ? q.textContent : '';
    item._panelText = (item.querySelector('.item__panel') || {}).textContent || '';
  });

  /* ---- Accordion ---- */
  function setOpen(item, open) {
    var trigger = item.querySelector('.item__trigger');
    var panel = item.querySelector('.item__panel');
    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  }

  function toggle(item) {
    var isOpen = item.classList.contains('is-open');
    // Single-open within the same group.
    var group = item.closest('[data-group]');
    if (group) {
      group.querySelectorAll('[data-item].is-open').forEach(function (other) {
        if (other !== item) setOpen(other, false);
      });
    }
    setOpen(item, !isOpen);
  }

  triggers.forEach(function (trigger, i) {
    var item = trigger.closest('[data-item]');

    trigger.addEventListener('click', function () {
      toggle(item);
    });

    trigger.addEventListener('keydown', function (e) {
      var visible = triggers.filter(function (t) {
        return !t.closest('[data-item]').hidden;
      });
      var idx = visible.indexOf(trigger);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        (visible[idx + 1] || visible[0]).focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        (visible[idx - 1] || visible[visible.length - 1]).focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        visible[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        visible[visible.length - 1].focus();
      }
    });
  });

  /* ---- Search filter ---- */
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function escapeReg(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(item, term) {
    var q = item.querySelector('.item__q');
    if (!q) return;
    var text = item._qText;
    if (!term) {
      q.textContent = text;
      return;
    }
    var re = new RegExp('(' + escapeReg(term) + ')', 'ig');
    q.innerHTML = escapeHtml(text).replace(re, '<mark>$1</mark>');
  }

  function filter() {
    var term = (search.value || '').trim().toLowerCase();
    clearBtn.hidden = term.length === 0;

    var visibleCount = 0;
    items.forEach(function (item) {
      var hay = (item._qText + ' ' + item._panelText).toLowerCase();
      var match = !term || hay.indexOf(term) !== -1;
      item.hidden = !match;
      highlight(item, term);
      if (!match) setOpen(item, false);
      if (match) visibleCount++;
    });

    // Hide groups that have no visible items.
    groups.forEach(function (group) {
      var any = group.querySelector('[data-item]:not([hidden])');
      group.hidden = !any;
    });

    empty.hidden = visibleCount !== 0;

    if (!term) {
      status.textContent = 'Showing all ' + total + ' questions';
    } else if (visibleCount === 0) {
      status.textContent = 'No questions match "' + term + '"';
    } else {
      status.textContent =
        visibleCount + ' of ' + total + ' question' + (visibleCount === 1 ? '' : 's') + ' match "' + term + '"';
    }
  }

  search.addEventListener('input', filter);

  clearBtn.addEventListener('click', function () {
    search.value = '';
    search.focus();
    filter();
  });

  search.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && search.value) {
      e.preventDefault();
      search.value = '';
      filter();
    }
  });

  // Initialize.
  filter();
})();
