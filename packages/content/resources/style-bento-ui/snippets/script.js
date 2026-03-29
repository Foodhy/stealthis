// Bento UI — subtle hover glow effect
document.querySelectorAll('.bento-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(99, 102, 241, 0.06), rgba(255,255,255,0.04) 60%)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

// Animate stat bars on scroll into view
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target.querySelector('.stat-bar-fill');
        if (bar) {
          const width = bar.style.width;
          bar.style.width = '0%';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              bar.style.width = width;
            });
          });
        }
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.bento-card--stat').forEach((card) => observer.observe(card));
