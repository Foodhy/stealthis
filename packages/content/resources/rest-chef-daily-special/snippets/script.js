/* ── Chef's Daily Special Card — Interactive Logic ── */

(function () {
  'use strict';

  /* ── State ── */
  const MAX_PORTIONS = 8;
  let portions = MAX_PORTIONS;

  /* ── DOM refs ── */
  const ctaBtn         = document.getElementById('cta-button');
  const dotPipsEl      = document.getElementById('dot-pips');
  const availLabel     = document.getElementById('availability-label');
  const countdownText  = document.getElementById('countdown-text');
  const soldOutOverlay = document.getElementById('sold-out-overlay');

  /* ────────────────────────────────────────────
     Dot pips renderer
  ──────────────────────────────────────────── */
  function renderDots() {
    dotPipsEl.innerHTML = '';
    for (let i = 0; i < MAX_PORTIONS; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot-pip' + (i >= portions ? ' empty' : '');
      dot.setAttribute('aria-hidden', 'true');
      dotPipsEl.appendChild(dot);
    }
  }

  /* ────────────────────────────────────────────
     Availability label updater
  ──────────────────────────────────────────── */
  function updateAvailabilityLabel() {
    if (portions === 0) {
      availLabel.textContent = 'No portions remaining';
      availLabel.classList.add('low');
    } else if (portions === 1) {
      availLabel.textContent = '1 portion available — last one!';
      availLabel.classList.add('low');
    } else if (portions <= 3) {
      availLabel.textContent = portions + ' portions available — almost gone!';
      availLabel.classList.add('low');
    } else {
      availLabel.textContent = portions + ' portions available';
      availLabel.classList.remove('low');
    }
  }

  /* ────────────────────────────────────────────
     Sold-out state
  ──────────────────────────────────────────── */
  function triggerSoldOut() {
    ctaBtn.disabled = true;
    ctaBtn.textContent = 'Sold out tonight';

    soldOutOverlay.setAttribute('aria-hidden', 'false');
    soldOutOverlay.classList.add('visible');
  }

  /* ────────────────────────────────────────────
     Ripple helper
  ──────────────────────────────────────────── */
  function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width  = circle.style.height = diameter + 'px';
    circle.style.left   = (event.clientX - rect.left  - radius) + 'px';
    circle.style.top    = (event.clientY - rect.top   - radius) + 'px';
    circle.className    = 'ripple';

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) existingRipple.remove();

    button.appendChild(circle);
  }

  /* ────────────────────────────────────────────
     CTA click handler
  ──────────────────────────────────────────── */
  ctaBtn.addEventListener('click', function (e) {
    if (portions <= 0) return;

    createRipple(e);

    /* Animate the last filled dot out */
    const dots = dotPipsEl.querySelectorAll('.dot-pip:not(.empty)');
    const lastFilled = dots[dots.length - 1];
    if (lastFilled) {
      lastFilled.classList.add('vanish');
      setTimeout(function () {
        portions -= 1;
        renderDots();
        updateAvailabilityLabel();
        if (portions === 0) {
          triggerSoldOut();
        }
      }, 180);
    } else {
      portions -= 1;
      renderDots();
      updateAvailabilityLabel();
      if (portions === 0) {
        triggerSoldOut();
      }
    }
  });

  /* ────────────────────────────────────────────
     Countdown timer
     Reference "now" = 20:46 (fixed, since Date is environment-dependent)
     Service window: 19:00 – 23:00
     Kitchen closes: 23:00
  ──────────────────────────────────────────── */
  var NOW_HOURS   = 20;
  var NOW_MINUTES = 46;
  var NOW_SECONDS = 0;

  /* Total seconds since midnight for the fixed "now" */
  var nowTotalSeconds = (NOW_HOURS * 3600) + (NOW_MINUTES * 60) + NOW_SECONDS;

  /* Closing time: 23:00 */
  var closingTotalSeconds = 23 * 3600;

  /* Service opens: 19:00 */
  var openingTotalSeconds = 19 * 3600;

  /* Elapsed seconds since the page loaded — incremented by setInterval */
  var elapsedSeconds = 0;

  function getCountdownString() {
    var currentSeconds = nowTotalSeconds + elapsedSeconds;

    if (currentSeconds < openingTotalSeconds) {
      return 'Service opens at 19:00';
    }

    if (currentSeconds >= closingTotalSeconds) {
      return 'Kitchen is closed for tonight';
    }

    var remaining = closingTotalSeconds - currentSeconds;
    var hours   = Math.floor(remaining / 3600);
    var minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 0) {
      return 'Service closes in ' + hours + 'h ' + minutes + 'm';
    }
    return 'Service closes in ' + minutes + 'm';
  }

  function updateCountdown() {
    countdownText.textContent = getCountdownString();
  }

  /* Initial render */
  updateCountdown();

  /* Tick every 60 seconds (1 minute) */
  setInterval(function () {
    elapsedSeconds += 60;
    updateCountdown();
  }, 60000);

  /* ────────────────────────────────────────────
     Initial render
  ──────────────────────────────────────────── */
  renderDots();
  updateAvailabilityLabel();

})();
