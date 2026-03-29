// Minimalist UI — script.js
// Subtle button press feedback and input focus state class toggling.

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousedown', () => {
    btn.style.opacity = '0.75';
  });
  btn.addEventListener('mouseup', () => {
    btn.style.opacity = '';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.opacity = '';
  });
});

// Add a small "Copied!" flash on primary button click
const primaryBtn = document.querySelector('.btn-primary');
if (primaryBtn) {
  const originalText = primaryBtn.textContent;
  primaryBtn.addEventListener('click', () => {
    primaryBtn.textContent = 'Done ✓';
    primaryBtn.style.background = '#222';
    primaryBtn.style.borderColor = '#222';
    setTimeout(() => {
      primaryBtn.textContent = originalText;
      primaryBtn.style.background = '';
      primaryBtn.style.borderColor = '';
    }, 1200);
  });
}
