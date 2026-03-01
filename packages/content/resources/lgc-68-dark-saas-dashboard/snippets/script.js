/* ── lgc-68-dark-saas-dashboard · script.js ───────────────────────────────── */

/* ── Metric Counter Animation ──────────────────────────────────────────────── */
(function initMetricCounters() {
  var dashboard = document.querySelector('.dashboard-wrapper');
  if (!dashboard) return;

  var cards = dashboard.querySelectorAll('.metric-value[data-target]');
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

  // Snapshot targets before animating
  cards.forEach(function(el) {
    if (!el.dataset.target) {
      var raw = el.textContent.replace(/[^0-9.]/g, '');
      el.dataset.target = raw || '0';
      el.dataset.prefix = el.textContent.match(/^[^0-9]*/)[0] || '';
      el.dataset.suffix = el.textContent.match(/[^0-9]*$/)[0] || '';
      el.textContent = el.dataset.prefix + '0' + el.dataset.suffix;
    }
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

/* ── SVG Revenue Chart Animation ───────────────────────────────────────────── */
(function initChartAnimation() {
  var line = document.querySelector('.revenue-line');
  if (!line) return;

  var animated = false;

  function getTotalLength() {
    try { return line.getTotalLength(); } catch (e) { return 600; }
  }

  function draw() {
    if (animated) return;
    animated = true;
    var len = getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    // Force reflow then animate
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

  observer.observe(line.closest('.chart-section') || line);
})();

/* ── Sidebar Collapse Toggle ───────────────────────────────────────────────── */
(function initSidebarCollapse() {
  var sidebar = document.querySelector('.sidebar');
  var toggleBtn = document.querySelector('.sidebar-collapse');
  if (!sidebar || !toggleBtn) return;

  var labels = sidebar.querySelectorAll('.sidebar-section-label, .sidebar-logo span');
  var itemLabels = sidebar.querySelectorAll('.sidebar-item .item-label');
  var collapseLabel = toggleBtn.querySelector('.item-label');

  toggleBtn.addEventListener('click', function() {
    var isCollapsed = sidebar.classList.toggle('collapsed');
    if (collapseLabel) {
      collapseLabel.textContent = isCollapsed ? '→' : '← Collapse';
    }
  });
})();

/* ── Billing Toggle (Monthly / Annual) ─────────────────────────────────────── */
(function initBillingToggle() {
  var options = document.querySelectorAll('.billing-option');
  var pricingCards = document.querySelectorAll('.pricing-card');
  if (!options.length) return;

  // Store monthly prices
  var monthlyPrices = {};
  pricingCards.forEach(function(card, i) {
    var priceEl = card.querySelector('.pricing-price');
    if (priceEl) {
      var numEl = priceEl.querySelector('.price-num') || priceEl;
      monthlyPrices[i] = parseFloat(numEl.textContent.replace(/[^0-9.]/g, '')) || 0;
    }
  });

  options.forEach(function(opt) {
    opt.addEventListener('click', function() {
      options.forEach(function(o) { o.classList.remove('active'); });
      opt.classList.add('active');

      var isAnnual = opt.dataset.billing === 'annual';

      pricingCards.forEach(function(card, i) {
        var priceEl = card.querySelector('.pricing-price');
        var periodEl = card.querySelector('.pricing-period');
        if (!priceEl) return;

        var monthly = monthlyPrices[i] || 0;
        var val = isAnnual ? Math.round(monthly * 0.75) : monthly;
        var numEl = priceEl.querySelector('.price-num');

        if (numEl) {
          numEl.textContent = val;
        } else {
          // Replace just the numeric portion
          priceEl.textContent = priceEl.textContent.replace(/\d+/, val);
        }

        if (periodEl) {
          periodEl.textContent = isAnnual ? 'per month, billed annually' : 'per month';
        }
      });
    });
  });
})();
