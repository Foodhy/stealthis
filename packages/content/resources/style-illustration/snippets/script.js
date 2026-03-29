/* Illustration-First — Interactive JS */

(function () {
  'use strict';

  const COLORS = ['#FFB347', '#87CEEB', '#98FB98', '#DDA0DD', '#F08080', '#FDE68A'];

  // ── Confetti burst on primary button click ──
  const confettiBtn = document.getElementById('confettiBtn');
  const container = document.getElementById('confettiContainer');

  if (confettiBtn && container) {
    confettiBtn.addEventListener('click', (e) => {
      const rect = confettiBtn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Create 12 confetti bits
      for (let i = 0; i < 12; i++) {
        const bit = document.createElement('div');
        bit.className = 'confetti-bit';

        const angle = (i / 12) * 2 * Math.PI;
        const distance = 60 + Math.random() * 60;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 30;

        bit.style.cssText = `
          left: ${cx - 5}px;
          top: ${cy - 5}px;
          background: ${COLORS[i % COLORS.length]};
          --tx: ${tx}px;
          --ty: ${ty}px;
          width: ${8 + Math.random() * 8}px;
          height: ${8 + Math.random() * 8}px;
          animation-delay: ${Math.random() * 0.1}s;
        `;

        container.appendChild(bit);
        setTimeout(() => bit.remove(), 800);
      }

      // Button bounce feedback
      confettiBtn.style.transform = 'rotate(-2deg) scale(0.9)';
      setTimeout(() => {
        confettiBtn.style.transform = 'rotate(-3deg) scale(1.1)';
        setTimeout(() => {
          confettiBtn.style.transform = '';
        }, 250);
      }, 80);
    });
  }

  // ── Wiggle animation on badges on hover ──
  document.querySelectorAll('.badge').forEach((badge) => {
    badge.addEventListener('mouseenter', () => {
      const rot = (Math.random() - 0.5) * 12;
      badge.style.transform = `rotate(${rot}deg) scale(1.08)`;
    });
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = '';
    });
  });

  // ── Stagger entrance for card stats ──
  const statBubbles = document.querySelectorAll('.stat-bubble');
  statBubbles.forEach((bubble, i) => {
    bubble.style.opacity = '0';
    bubble.style.transform += ' scale(0.7)';
    bubble.style.transition = `opacity 0.4s ease ${0.3 + i * 0.12}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.12}s`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      statBubbles.forEach((bubble) => {
        const originalTransform = bubble.style.transform.replace('scale(0.7)', '');
        bubble.style.opacity = '1';
        bubble.style.transform = originalTransform + ' scale(1)';
      });
    });
  });

  // ── Doodle decorations parallax ──
  const decoItems = document.querySelectorAll('.deco-item');
  document.addEventListener('mousemove', (e) => {
    const px = (e.clientX / window.innerWidth - 0.5);
    const py = (e.clientY / window.innerHeight - 0.5);

    decoItems.forEach((item, i) => {
      const depth = (i + 1) * 4;
      item.style.translate = `${px * depth}px ${py * depth}px`;
    });
  });

  // ── Input: fun placeholder cycle ──
  const input = document.getElementById('illusInput');
  const placeholders = [
    'A dancing cactus...',
    'A cloud with sunglasses...',
    'A tiny rocket ship...',
    'A dragon playing piano...',
    'A rainbow snail...',
  ];
  let phIdx = 0;

  if (input) {
    setInterval(() => {
      if (document.activeElement !== input) {
        phIdx = (phIdx + 1) % placeholders.length;
        input.placeholder = placeholders[phIdx];
      }
    }, 3000);
  }
})();
