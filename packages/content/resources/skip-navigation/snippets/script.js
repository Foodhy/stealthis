// Highlight destination landmark after skip link click
document.querySelectorAll('.skip-link').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.style.transition = 'outline-color 0.3s';
      target.style.outline = '3px solid #6366f1';
      target.style.outlineOffset = '8px';
      target.style.borderRadius = '6px';
      setTimeout(() => { target.style.outline = ''; }, 1200);
    }
  });
});
