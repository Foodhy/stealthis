(function () {
  'use strict';

  /* ---- Overall completion gauge ----
     Computed as the average of the per-phase progress bars so the header
     stays in sync with the phase list. */
  var CIRC = 2 * Math.PI * 52; // matches r="52" in the SVG

  function readPhasePercents() {
    var fills = document.querySelectorAll('.phase .bar__fill');
    var vals = [];
    fills.forEach(function (el) {
      var raw = (el.style.getPropertyValue('--pct') || '0').trim();
      vals.push(parseFloat(raw) || 0);
    });
    return vals;
  }

  function average(arr) {
    if (!arr.length) return 0;
    var sum = arr.reduce(function (a, b) { return a + b; }, 0);
    return Math.round(sum / arr.length);
  }

  function animateGauge(target) {
    var fill = document.getElementById('gaugeFill');
    var label = document.getElementById('gaugePct');
    if (!fill || !label) return;

    fill.style.strokeDasharray = CIRC;
    fill.style.strokeDashoffset = CIRC;

    // Force reflow so the transition runs from the initial value.
    void fill.getBoundingClientRect();

    var offset = CIRC * (1 - target / 100);
    fill.style.strokeDashoffset = offset;

    // Count up the numeric label over the same window.
    var start = performance.now();
    var dur = 1200;
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      label.textContent = Math.round(target * eased) + '%';
      if (t < 1) requestAnimationFrame(tick);
      else label.textContent = target + '%';
    }
    requestAnimationFrame(tick);
  }

  /* ---- Animate the per-phase bars in from zero ---- */
  function animateBars() {
    document.querySelectorAll('.phase .bar__fill').forEach(function (el) {
      var pct = (el.style.getPropertyValue('--pct') || '0%').trim();
      el.style.width = '0';
      void el.getBoundingClientRect();
      el.style.width = pct;
    });
  }

  /* ---- Milestone filtering ---- */
  function initFilters() {
    var chips = document.querySelectorAll('.chip');
    var items = Array.prototype.slice.call(document.querySelectorAll('.mile'));
    var count = document.getElementById('msCount');
    var empty = document.getElementById('msEmpty');

    function apply(filter) {
      var shown = 0;
      items.forEach(function (li) {
        var match = filter === 'all' || li.getAttribute('data-type') === filter;
        li.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' ahead' : ' ahead');
      if (empty) empty.hidden = shown !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('is-on');
          c.removeAttribute('aria-pressed');
        });
        chip.classList.add('is-on');
        chip.setAttribute('aria-pressed', 'true');
        apply(chip.getAttribute('data-filter'));
      });
    });
  }

  function init() {
    var pct = average(readPhasePercents());
    // Respect reduced-motion preferences.
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      var fill = document.getElementById('gaugeFill');
      var label = document.getElementById('gaugePct');
      if (fill) {
        fill.style.strokeDasharray = CIRC;
        fill.style.strokeDashoffset = CIRC * (1 - pct / 100);
      }
      if (label) label.textContent = pct + '%';
      document.querySelectorAll('.phase .bar__fill').forEach(function (el) {
        el.style.width = (el.style.getPropertyValue('--pct') || '0%').trim();
      });
    } else {
      // Defer slightly so the entrance reads as motion, not a static render.
      requestAnimationFrame(function () {
        animateGauge(pct);
        animateBars();
      });
    }

    initFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
