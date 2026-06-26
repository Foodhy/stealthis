(function () {
  'use strict';

  var search = document.getElementById('faqSearch');
  var clearBtn = document.getElementById('searchClear');
  var countEl = document.getElementById('searchCount');
  var emptyEl = document.getElementById('emptyState');
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-group]'));
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-item]'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.item__btn'));

  /* ---- Accordion toggling ---- */
  function toggle(btn) {
    var item = btn.closest('[data-item]');
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    item.classList.toggle('is-open', !open);
    if (open) {
      panel.hidden = true;
    } else {
      panel.hidden = false;
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggle(btn);
    });
  });

  /* ---- Keyboard navigation between headers ---- */
  document.querySelector('.faq').addEventListener('keydown', function (e) {
    var current = document.activeElement;
    if (!current || !current.classList.contains('item__btn')) return;
    var visible = buttons.filter(function (b) {
      return !b.closest('[data-item]').hidden && b.offsetParent !== null;
    });
    var idx = visible.indexOf(current);
    if (idx === -1) return;

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

  /* ---- Highlight helper ---- */
  function setText(el, text, term) {
    if (!term) {
      el.textContent = text;
      return;
    }
    var lower = text.toLowerCase();
    var i = lower.indexOf(term);
    if (i === -1) {
      el.textContent = text;
      return;
    }
    el.textContent = '';
    el.appendChild(document.createTextNode(text.slice(0, i)));
    var mark = document.createElement('mark');
    mark.textContent = text.slice(i, i + term.length);
    el.appendChild(mark);
    el.appendChild(document.createTextNode(text.slice(i + term.length)));
  }

  /* cache original text */
  items.forEach(function (item) {
    var q = item.querySelector('.item__q');
    var p = item.querySelector('.item__panel p');
    item._q = q.textContent;
    item._a = p.textContent;
    item._qEl = q;
    item._pEl = p;
    item._hay = (item._q + ' ' + item._a).toLowerCase();
  });

  /* ---- Live search filter ---- */
  function filter() {
    var term = search.value.trim().toLowerCase();
    clearBtn.hidden = term.length === 0;
    var visible = 0;

    items.forEach(function (item) {
      var hit = term === '' || item._hay.indexOf(term) !== -1;
      item.hidden = !hit;
      if (hit) {
        visible++;
        setText(item._qEl, item._q, term);
        setText(item._pEl, item._a, term);
      } else {
        item._qEl.textContent = item._q;
        item._pEl.textContent = item._a;
      }
    });

    groups.forEach(function (group) {
      var anyVisible = group.querySelector('[data-item]:not([hidden])');
      group.hidden = !anyVisible;
    });

    emptyEl.hidden = visible !== 0;

    if (term === '') {
      countEl.textContent = items.length + ' questions';
    } else {
      countEl.textContent =
        visible === 0
          ? 'No matches'
          : visible + (visible === 1 ? ' match' : ' matches') + ' for “' + search.value.trim() + '”';
    }
  }

  search.addEventListener('input', filter);

  clearBtn.addEventListener('click', function () {
    search.value = '';
    filter();
    search.focus();
  });

  search.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && search.value) {
      e.preventDefault();
      search.value = '';
      filter();
    }
  });

  filter();
})();
