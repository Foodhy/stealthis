document.querySelectorAll('.alert-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const alert = btn.closest('.alert');
    alert.classList.add('dismissing');
    alert.addEventListener('animationend', () => alert.remove(), { once: true });
  });
});
