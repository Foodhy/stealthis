/* ============================================================
   Glassmorphism — Interactive Effects
   Mouse parallax on blobs, badge toggle, button shimmer
   ============================================================ */

(function () {
  'use strict';

  // ── Mouse parallax on background blobs ─────────────────────
  const blob1 = document.querySelector('.blob-1');
  const blob2 = document.querySelector('.blob-2');
  const blob3 = document.querySelector('.blob-3');

  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const xRatio = (e.clientX / window.innerWidth) - 0.5;
      const yRatio = (e.clientY / window.innerHeight) - 0.5;

      if (blob1) blob1.style.transform = `translate(${xRatio * 30}px, ${yRatio * 20}px)`;
      if (blob2) blob2.style.transform = `translate(${xRatio * -25}px, ${yRatio * -18}px)`;
      if (blob3) blob3.style.transform = `translate(${xRatio * 20}px, ${yRatio * 25}px)`;

      ticking = false;
    });
  });

  // ── Badge toggle ────────────────────────────────────────────
  const badges = document.querySelectorAll('.badge');
  badges.forEach(badge => {
    badge.addEventListener('click', () => {
      badge.classList.toggle('badge-active');
    });
  });

  // ── Shimmer effect on solid button ─────────────────────────
  const primaryBtn = document.getElementById('btn-primary');

  if (primaryBtn) {
    // Inject shimmer styles
    const style = document.createElement('style');
    style.textContent = `
      .btn-solid {
        position: relative;
        overflow: hidden;
      }
      .btn-solid::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 60%;
        height: 100%;
        background: linear-gradient(
          105deg,
          transparent 20%,
          rgba(255,255,255,0.45) 50%,
          transparent 80%
        );
        transition: none;
        pointer-events: none;
      }
      .btn-solid.shimmer-run::after {
        animation: glass-shimmer 0.55s ease-out forwards;
      }
      @keyframes glass-shimmer {
        from { left: -80%; }
        to   { left: 120%; }
      }
    `;
    document.head.appendChild(style);

    primaryBtn.addEventListener('mouseenter', function () {
      primaryBtn.classList.remove('shimmer-run');
      void primaryBtn.offsetWidth; // force reflow
      primaryBtn.classList.add('shimmer-run');
    });
  }

  // ── Glass card tilt on hover ────────────────────────────────
  const cards = document.querySelectorAll('.glass-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(700px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();
