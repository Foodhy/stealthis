/* Aurora / Gradient Mesh — Interactive JS */

(function () {
  'use strict';

  // ── Slow parallax on aurora streaks with mouse position ──
  const streaks = [
    { el: document.getElementById('streak1'), depth: 0.8 },
    { el: document.getElementById('streak2'), depth: -0.6 },
    { el: document.getElementById('streak3'), depth: 0.5 },
    { el: document.getElementById('streak4'), depth: -0.9 },
  ];

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    // Normalize to -1 → 1
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;

    if (!rafId) {
      rafId = requestAnimationFrame(animateStreaks);
    }
  });

  function animateStreaks() {
    rafId = null;

    // Smooth lerp
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    streaks.forEach(({ el, depth }) => {
      if (!el) return;
      // Max 15px parallax
      const ox = currentX * 15 * depth;
      const oy = currentY * 15 * depth;
      el.style.translate = `${ox}px ${oy}px`;
    });

    // Continue until settled
    const settled =
      Math.abs(targetX - currentX) < 0.001 &&
      Math.abs(targetY - currentY) < 0.001;

    if (!settled) {
      rafId = requestAnimationFrame(animateStreaks);
    }
  }

  // ── Entrance: slide up with stagger ──
  const page = document.querySelector('.page');
  const sections = page ? Array.from(page.children) : [];

  sections.forEach((section, i) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = `
      opacity 0.6s ease ${i * 0.15}s,
      transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.15}s
    `;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sections.forEach((section) => {
        section.style.opacity = '1';
        section.style.transform = '';
      });
    });
  });

  // ── Stat counter animation ──
  function animateCounter(el, targetStr, duration = 1000) {
    const start = performance.now();
    const isFloat = targetStr.includes('.');
    const numStr = targetStr.replace(/[^0-9.]/g, '');
    const suffix = targetStr.replace(/[0-9.]/g, '');
    const target = parseFloat(numStr);

    requestAnimationFrame(function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;

      if (progress < 1) requestAnimationFrame(tick);
    });
  }

  setTimeout(() => {
    document.querySelectorAll('.stat__value').forEach((el) => {
      const raw = el.textContent.trim();
      el.textContent = '0';
      animateCounter(el, raw, 1200);
    });
  }, 600);

  // ── Button: ripple on click ──
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: auroraRipple 0.55s ease-out forwards;
        pointer-events: none;
        z-index: 0;
      `;

      if (!document.getElementById('aurora-ripple-style')) {
        const style = document.createElement('style');
        style.id = 'aurora-ripple-style';
        style.textContent = `
          @keyframes auroraRipple {
            to { transform: scale(1); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ── Input focus: shimmer ──
  const input = document.getElementById('auroraInput');
  if (input) {
    input.addEventListener('focus', () => {
      input.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.12), 0 0 30px rgba(255,255,255,0.08)';
    });
    input.addEventListener('blur', () => {
      input.style.boxShadow = '';
    });
  }
})();
