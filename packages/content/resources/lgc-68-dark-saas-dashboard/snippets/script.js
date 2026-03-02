/* ── lgc-68-dark-saas-dashboard · script.js ───────────────────────────────── */

/* ── Metric Counter Animation ──────────────────────────────────────────────── */
(function initMetricCounters() {
  var dashboard = document.querySelector('.dashboard-preview-section');
  if (!dashboard) return;

  var cards = dashboard.querySelectorAll('.metric-value');
  var started = false;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateValue(el) {
    var target = parseFloat(el.dataset.target) || 0;
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    var duration = 1400;
    var start = null;

    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var value = easeOut(progress) * target;
      var formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
      el.textContent = prefix + formatted + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // Snapshot text as targets before animating
  cards.forEach(function(el) {
    var raw = el.textContent.replace(/[^0-9.]/g, '');
    el.dataset.target = raw || '0';
    el.dataset.prefix = el.textContent.match(/^[^0-9]*/)[0] || '';
    el.dataset.suffix = el.textContent.match(/[^0-9]*$/)[0] || '';
    el.textContent = el.dataset.prefix + '0' + el.dataset.suffix;
  });

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !started) {
        started = true;
        cards.forEach(function(el) { animateValue(el); });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  observer.observe(dashboard);
})();

/* ── SVG Revenue Chart Draw Animation ──────────────────────────────────────── */
(function initChartAnimation() {
  // Target the stroke line path (has stroke-linecap="round" in HTML)
  var line = document.querySelector('.revenue-chart path[stroke-linecap]');
  if (!line) return;

  var animated = false;

  function getTotalLength() {
    try { return line.getTotalLength(); } catch (e) { return 800; }
  }

  function draw() {
    if (animated) return;
    animated = true;
    var len = getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    // Force reflow then trigger CSS transition
    line.getBoundingClientRect();
    line.classList.add('drawn');
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        draw();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(line.closest('.chart-card') || line);
})();

/* ── Chart Tab Switcher ─────────────────────────────────────────────────────── */
(function initChartTabs() {
  var tabs = document.querySelectorAll('.chart-tab');
  if (!tabs.length) return;

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
    });
  });
})();

/* ── Sidebar item active state ─────────────────────────────────────────────── */
(function initSidebarNav() {
  var items = document.querySelectorAll('.sidebar-item');
  if (!items.length) return;

  items.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      items.forEach(function(i) { i.classList.remove('active'); });
      item.classList.add('active');
    });
  });
})();
