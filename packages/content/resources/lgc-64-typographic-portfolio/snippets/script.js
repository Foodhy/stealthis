/* ── lgc-64-typographic-portfolio · script.js ─────────────────────────────── */

/* ── Scroll Progress Bar ───────────────────────────────────────────────────── */
(function initScrollProgress() {
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Role Cycling Text ─────────────────────────────────────────────────────── */
(function initRoleCycler() {
  var el = document.querySelector('.hero-role');
  if (!el) return;

  var roles = ['Designer', 'Developer', 'Creative Director'];
  var current = 0;

  function cycle() {
    el.classList.add('fade-out');
    setTimeout(function() {
      current = (current + 1) % roles.length;
      el.textContent = roles[current];
      el.classList.remove('fade-out');
      el.classList.add('fade-in');
    }, 420);
  }

  el.textContent = roles[0];
  el.classList.add('fade-in');
  setInterval(cycle, 2500);
})();

/* ── Work List: Floating Cursor Dot ────────────────────────────────────────── */
(function initCursorDot() {
  var dot = document.getElementById('cursor-dot');
  var workSection = document.querySelector('.work');
  if (!dot || !workSection) return;

  var items = workSection.querySelectorAll('.work-item');

  items.forEach(function(item) {
    item.addEventListener('mouseenter', function(e) {
      var rect = item.getBoundingClientRect();
      var centerY = rect.top + rect.height / 2;
      dot.style.top  = centerY + 'px';
      dot.style.left = e.clientX + 'px';
      dot.classList.add('visible');
    });

    item.addEventListener('mousemove', function(e) {
      dot.style.left = e.clientX + 'px';
    });

    item.addEventListener('mouseleave', function() {
      dot.classList.remove('visible');
    });
  });
})();

/* ── Work Items Stagger Reveal ─────────────────────────────────────────────── */
(function initWorkReveal() {
  var items = document.querySelectorAll('.work-item');
  if (!items.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var item = entry.target;
        var index = Array.prototype.indexOf.call(items, item);
        setTimeout(function() {
          item.classList.add('revealed');
        }, index * 80);
        observer.unobserve(item);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(function(item) {
    observer.observe(item);
  });
})();
