// Ironbar Design-Build landing — vanilla JS, no libraries.
(function () {
  'use strict';

  /* ── Gallery filter ─────────────────────────── */
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.proj');
  const emptyMsg = document.getElementById('galleryEmpty');

  function applyFilter(cat) {
    let visible = 0;
    projects.forEach((p) => {
      const match = cat === 'all' || p.dataset.cat === cat;
      p.classList.toggle('hide', !match);
      if (match) visible++;
    });
    if (emptyMsg) emptyMsg.hidden = visible !== 0;
  }

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.dataset.filter);
    });
  });

  /* ── Animated stat counters ─────────────────── */
  const counters = document.querySelectorAll('.hero-stats dt[data-count]');
  function runCounter(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ── Scroll reveal + counter trigger ────────── */
  const revealEls = document.querySelectorAll(
    '.section-head, .svc-card, .step, .proj, .review, .consult-inner'
  );
  revealEls.forEach((el) => el.classList.add('reveal'));

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));

    const statObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            counters.forEach(runCounter);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    if (counters.length) statObs.observe(counters[0]);
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
    counters.forEach((el) => {
      el.textContent = el.dataset.count + (el.dataset.suffix || '');
    });
  }

  /* ── Scroll-spy nav highlight ───────────────── */
  const navLinks = document.querySelectorAll('.main-nav a');
  const sections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((a) =>
              a.classList.toggle('active', a.getAttribute('href') === '#' + id)
            );
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ── Consult form validation ────────────────── */
  const form = document.getElementById('consultForm');
  const msg = document.getElementById('formMsg');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const fields = form.querySelectorAll('input[required], select[required]');
      fields.forEach((f) => {
        const wrap = f.closest('.field');
        const ok = f.checkValidity() && f.value.trim() !== '';
        if (wrap) wrap.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        msg.textContent = 'Please fill in every field with a valid value.';
        msg.className = 'form-msg err';
        return;
      }

      const name = form.querySelector('#name').value.trim().split(' ')[0];
      msg.textContent = `Thanks${name ? ', ' + name : ''}! We'll send a ballpark range within 2 business days.`;
      msg.className = 'form-msg ok';
      form.reset();
    });

    // clear invalid state as the user fixes a field
    form.addEventListener('input', (e) => {
      const wrap = e.target.closest('.field');
      if (wrap && wrap.classList.contains('invalid') && e.target.value.trim() !== '') {
        wrap.classList.remove('invalid');
      }
    });
  }
})();
