/* Motion / Kinetic — Interactive JS */

(function () {
  'use strict';

  // ── Elastic click animation on primary button ──
  const primaryBtn = document.getElementById('primaryBtn');
  if (primaryBtn) {
    primaryBtn.addEventListener('click', () => {
      primaryBtn.style.transition = 'transform 0.08s ease';
      primaryBtn.style.transform = 'scale(0.92)';
      setTimeout(() => {
        primaryBtn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        primaryBtn.style.transform = 'scale(1)';
        setTimeout(() => {
          primaryBtn.style.transition = '';
          primaryBtn.style.transform = '';
        }, 500);
      }, 80);
    });
  }

  // ── Mouse parallax on the motion card ──
  const card = document.getElementById('motionCard');
  if (card) {
    document.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;

      // Max 8px parallax
      const ox = dx * 8;
      const oy = dy * 8;
      card.style.transform = `translate(${ox}px, ${oy}px)`;
    });

    document.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  // ── IntersectionObserver: re-trigger entrance animations on scroll ──
  const animItems = document.querySelectorAll('.anim-up, .word, .anim-badge');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Reset animation by toggling class
          const el = entry.target;
          el.style.animationPlayState = 'running';
        }
      });
    },
    { threshold: 0.1 }
  );

  animItems.forEach((el) => observer.observe(el));

  // ── Stat counter animation ──
  function animateCounter(el, target, duration = 1000, suffix = '') {
    const start = performance.now();
    const isFloat = target % 1 !== 0;
    const targetNum = parseFloat(target);

    requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = eased * targetNum;
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;

      if (progress < 1) requestAnimationFrame(tick);
    });
  }

  // Parse stat values and animate them in
  const statValues = document.querySelectorAll('.stat__value');
  statValues.forEach((el) => {
    const raw = el.textContent.trim();
    let num, suffix;

    if (raw.endsWith('k')) {
      num = parseFloat(raw);
      suffix = 'k';
    } else if (raw.endsWith('%')) {
      num = parseFloat(raw);
      suffix = '%';
    } else {
      num = parseFloat(raw);
      suffix = '';
    }

    el.textContent = '0' + suffix;

    // Trigger after entrance animation delay
    setTimeout(() => animateCounter(el, num, 1200, suffix), 900);
  });

  // ── All buttons: ripple effect ──
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.15);
        top: ${e.clientY - rect.top - size / 2}px;
        left: ${e.clientX - rect.left - size / 2}px;
        transform: scale(0);
        animation: rippleKinetic 0.5s ease-out forwards;
        pointer-events: none;
        z-index: 0;
      `;

      if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
          @keyframes rippleKinetic {
            to { transform: scale(1); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });
})();
