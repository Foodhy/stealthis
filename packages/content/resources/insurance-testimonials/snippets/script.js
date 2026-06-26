(function () {
  'use strict';

  /* --- Render star rows from each card's data-rating --- */
  document.querySelectorAll('.card').forEach(function (card) {
    var rating = parseInt(card.getAttribute('data-rating'), 10) || 0;
    var holder = card.querySelector('.stars');
    if (!holder) return;
    for (var i = 1; i <= 5; i++) {
      var star = document.createElement('i');
      if (i > rating) star.className = 'off';
      holder.appendChild(star);
    }
  });

  /* --- Rating filter --- */
  var grid = document.getElementById('grid');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');

  function applyFilter(filter) {
    var visible = 0;
    cards.forEach(function (card) {
      var rating = parseInt(card.getAttribute('data-rating'), 10) || 0;
      var show =
        filter === 'all' ||
        (filter === '5' && rating === 5) ||
        (filter === '4' && rating >= 4);
      card.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });
    countEl.textContent = visible + (visible === 1 ? ' story' : ' stories');
    emptyEl.hidden = visible !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      applyFilter(chip.getAttribute('data-filter'));
    });
  });

  /* --- Count-up animation for the trust band --- */
  function formatNum(n, opts) {
    if (opts.compact) {
      if (n >= 1e9) return '$' + (n / 1e9).toFixed(0) + 'B';
      if (n >= 1e6) return (opts.prefix || '') + (n / 1e6).toFixed(0) + 'M';
      if (n >= 1e3) return (opts.prefix || '') + (n / 1e3).toFixed(0) + 'K';
    }
    return (opts.prefix || '') + n.toLocaleString('en-US') + (opts.suffix || '');
  }

  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var opts = {
      prefix: el.getAttribute('data-prefix') || '',
      suffix: el.getAttribute('data-suffix') || '',
      compact: el.getAttribute('data-compact') === 'true'
    };
    var start = performance.now();
    var dur = 1100;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.round(target * eased), opts);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var nums = document.querySelectorAll('.trust-num');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  } else {
    nums.forEach(runCount);
  }
})();
