/* ── lgc-64-typographic-portfolio · script.js ──────────────────────────────── */

/* ── Role Cycling Text ─────────────────────────────────────────────────────── */
(function initRoleCycler() {
  var roles = document.querySelectorAll('.roles-ticker .role');
  if (!roles.length) return;

  var current = 0;

  function cycle() {
    roles[current].classList.remove('active');
    current = (current + 1) % roles.length;
    roles[current].classList.add('active');
  }

  setInterval(cycle, 2500);
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

  items.forEach(function(item) { observer.observe(item); });
})();
