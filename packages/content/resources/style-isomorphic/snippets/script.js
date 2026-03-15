/* Isometric 3D — Interactive JS */

(function () {
  'use strict';

  const card = document.getElementById('isoCard');
  if (!card) return;

  // ── Card tilt on mouse move (subtle Y-axis rotation within iso context) ──
  let animFrame = null;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let isHovering = false;

  card.addEventListener('mouseenter', () => {
    isHovering = true;
    startTiltAnimation();
  });

  card.addEventListener('mouseleave', () => {
    isHovering = false;
    targetTiltX = 0;
    targetTiltY = 0;
  });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    // Limit to ±8deg tilt
    targetTiltX = -dy * 8;
    targetTiltY = dx * 8;
  });

  function startTiltAnimation() {
    if (animFrame) return;

    function tick() {
      // Lerp toward target
      currentTiltX += (targetTiltX - currentTiltX) * 0.12;
      currentTiltY += (targetTiltY - currentTiltY) * 0.12;

      // Apply: isometric base transform + tilt
      card.style.transform = `
        rotateX(${currentTiltX}deg)
        rotateY(${currentTiltY}deg)
      `;

      // Stop when close enough and not hovering
      const settled =
        Math.abs(targetTiltX - currentTiltX) < 0.01 &&
        Math.abs(targetTiltY - currentTiltY) < 0.01;

      if (settled && !isHovering) {
        card.style.transform = '';
        animFrame = null;
        return;
      }

      animFrame = requestAnimationFrame(tick);
    }

    animFrame = requestAnimationFrame(tick);
  }

  // ── Stagger entrance animation for stats ──
  const stats = document.querySelectorAll('.stat');
  stats.forEach((stat, i) => {
    stat.style.opacity = '0';
    stat.style.transform = 'translateY(12px)';
    stat.style.transition = `opacity 0.4s ease ${0.3 + i * 0.1}s, transform 0.4s ease ${0.3 + i * 0.1}s`;
  });

  // Trigger after a short delay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      stats.forEach((stat) => {
        stat.style.opacity = '1';
        stat.style.transform = 'translateY(0)';
      });
    });
  });

  // ── Badge entrance: slide in from right ──
  const badges = document.querySelectorAll('.badge');
  badges.forEach((badge, i) => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateX(16px)';
    badge.style.transition = `opacity 0.35s ease ${0.5 + i * 0.08}s, transform 0.35s ease ${0.5 + i * 0.08}s`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      badges.forEach((badge) => {
        badge.style.opacity = '1';
        badge.style.transform = 'translateX(0)';
      });
    });
  });

  // ── Button: isometric press effect ──
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousedown', () => {
      btn.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transition = '';
    });
  });

  // ── Decorative cube parallax ──
  const decoCubes = document.querySelectorAll('.deco-cube');
  document.addEventListener('mousemove', (e) => {
    const px = (e.clientX / window.innerWidth - 0.5) * 2;
    const py = (e.clientY / window.innerHeight - 0.5) * 2;

    decoCubes.forEach((cube, i) => {
      const depth = (i + 1) * 6;
      const ox = px * depth;
      const oy = py * depth;
      const baseTransform = cube.style.transform || '';
      // Keep existing scale/rotate, just offset translate
      cube.style.translate = `${ox}px ${oy}px`;
    });
  });
})();
