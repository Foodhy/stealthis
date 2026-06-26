(function () {
  'use strict';

  var list = document.getElementById('cards');
  var filterEl = document.getElementById('filter');
  var sortEl = document.getElementById('sort');
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  if (!list || !filterEl || !sortEl) return;

  // Snapshot the original cards so we can re-order and re-filter from a stable source.
  var cards = Array.prototype.slice.call(list.querySelectorAll('.card'));

  function rating(card) {
    return parseInt(card.getAttribute('data-rating'), 10) || 0;
  }

  function dateValue(card) {
    return Date.parse(card.getAttribute('data-date')) || 0;
  }

  function render() {
    var filter = filterEl.value; // 'all' or '1'..'5'
    var sort = sortEl.value; // 'recent' or 'highest'

    var visible = cards.filter(function (card) {
      return filter === 'all' || String(rating(card)) === filter;
    });

    visible.sort(function (a, b) {
      if (sort === 'highest') {
        // Highest rating first, then newest as a tiebreaker.
        return rating(b) - rating(a) || dateValue(b) - dateValue(a);
      }
      return dateValue(b) - dateValue(a); // most recent first
    });

    // Hide everything, then append the visible set in order.
    cards.forEach(function (card) {
      card.hidden = true;
    });
    visible.forEach(function (card) {
      card.hidden = false;
      list.appendChild(card);
    });

    var n = visible.length;
    countEl.textContent = 'Showing ' + n + (n === 1 ? ' review' : ' reviews');
    list.hidden = n === 0;
    emptyEl.hidden = n !== 0;
  }

  filterEl.addEventListener('change', render);
  sortEl.addEventListener('change', render);

  render();
})();
