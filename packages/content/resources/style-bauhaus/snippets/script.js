/* ============================================================
   Bauhaus — Interactive Effects
   Button shadow press, badge color cycle, input underline
   ============================================================ */

(function () {
  'use strict';

  const COLORS = ['#E63329', '#F9C12E', '#1B3FDC', '#1A1A1A'];

  // ── Button hard-shadow press ────────────────────────────────
  // Already handled via CSS :active, but add a satisfying click pop
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      // Brief flash of yellow on the clicked button
      const orig = btn.style.background;
      btn.style.transition = 'none';
      if (!btn.classList.contains('btn-yellow')) {
        btn.style.outline = '3px solid #F9C12E';
        btn.style.outlineOffset = '2px';
      }
      setTimeout(() => {
        btn.style.outline = '';
        btn.style.outlineOffset = '';
      }, 300);
    });
  });

  // ── Badge color rotation on click ──────────────────────────
  const badges = document.querySelectorAll('.badge');
  const badgeColorClasses = ['badge-black', 'badge-red', 'badge-yellow', 'badge-blue'];

  badges.forEach((badge, i) => {
    let colorIdx = badgeColorClasses.findIndex(cls => badge.classList.contains(cls));
    if (colorIdx === -1) colorIdx = -1; // plain badge

    badge.addEventListener('click', () => {
      // Remove current color class
      badgeColorClasses.forEach(cls => badge.classList.remove(cls));

      // Advance to next color
      colorIdx = (colorIdx + 1) % (badgeColorClasses.length + 1);

      if (colorIdx < badgeColorClasses.length) {
        badge.classList.add(badgeColorClasses[colorIdx]);
      }
      // else: plain (cream) badge
    });
  });

  // ── Input focus: accent underline color ────────────────────
  const input = document.getElementById('bh-input');
  const label = document.querySelector('.input-label');

  if (input) {
    const accentColors = [
      { border: '#1B3FDC', label: '#1B3FDC' },
      { border: '#E63329', label: '#E63329' },
    ];
    let accentIdx = 0;

    input.addEventListener('focus', () => {
      const accent = accentColors[accentIdx];
      input.style.borderBottomColor = accent.border;
      if (label) label.style.color = accent.label;
    });

    input.addEventListener('blur', () => {
      input.style.borderBottomColor = '';
      if (label) label.style.color = '';
      accentIdx = (accentIdx + 1) % accentColors.length;
    });
  }

  // ── Geometric accent: animate background circle on load ────
  const circle1 = document.querySelector('.geo-circle-1');
  if (circle1) {
    let rotation = 0;
    function rotateSlow() {
      rotation += 0.05;
      circle1.style.transform = `rotate(${rotation}deg)`;
      requestAnimationFrame(rotateSlow);
    }
    rotateSlow();
  }

})();
