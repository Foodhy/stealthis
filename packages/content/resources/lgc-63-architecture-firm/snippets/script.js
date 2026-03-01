/* ── lgc-63-architecture-firm · script.js ─────────────────────────────────── */

/* ── Counter Animation ─────────────────────────────────────────────────────── */
(function initCounters() {
  var stats = document.querySelector('.stats');
  if (!stats) return;

  var counters = stats.querySelectorAll('.stat-number');
  var started = false;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    var raw = el.dataset.target || el.textContent.replace(/[^\d.]/g, '');
    var target = parseFloat(raw) || 0;
    var suffix = el.dataset.suffix || el.textContent.replace(/[\d.]/g, '').trim();
    var duration = 1600;
    var start = null;

    function tick(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;
      var progress = Math.min(elapsed / duration, 1);
      var value = easeOut(progress) * target;
      var display = target % 1 === 0 ? Math.round(value) : value.toFixed(1);
      el.textContent = display + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // Read targets before animating
  counters.forEach(function(el) {
    var text = el.textContent.trim();
    var num = parseFloat(text.replace(/[^\d.]/g, ''));
    var suffix = text.replace(/[\d.]/g, '').trim();
    el.dataset.target = num;
    el.dataset.suffix = suffix;
    el.textContent = '0' + suffix;
  });

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !started) {
        started = true;
        counters.forEach(animateCounter);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(stats);
})();

/* ── Horizontal Drag Scroll ────────────────────────────────────────────────── */
(function initDragScroll() {
  var container = document.querySelector('.projects-scroll');
  if (!container) return;

  var isDown = false;
  var startX = 0;
  var scrollLeft = 0;

  container.addEventListener('mousedown', function(e) {
    isDown = true;
    container.classList.add('dragging');
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    e.preventDefault();
  });

  document.addEventListener('mouseup', function() {
    if (!isDown) return;
    isDown = false;
    container.classList.remove('dragging');
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDown) return;
    var x = e.pageX - container.offsetLeft;
    var walk = (x - startX) * 1.4;
    container.scrollLeft = scrollLeft - walk;
  });

  // Touch support
  var touchStartX = 0;
  var touchScrollLeft = 0;

  container.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = container.scrollLeft;
  }, { passive: true });

  container.addEventListener('touchmove', function(e) {
    var x = e.touches[0].pageX;
    var walk = touchStartX - x;
    container.scrollLeft = touchScrollLeft + walk;
  }, { passive: true });
})();

/* ── Contact Form ──────────────────────────────────────────────────────────── */
(function initForm() {
  var form = document.querySelector('.contact-form');
  var success = document.querySelector('.form-success');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var submit = form.querySelector('.form-submit');
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Sending…';
    }

    // Simulate async submit
    setTimeout(function() {
      form.style.display = 'none';
      if (success) success.classList.add('visible');
    }, 800);
  });
})();
