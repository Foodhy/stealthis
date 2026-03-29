const toggle = document.getElementById('billingToggle');
const prices = document.querySelectorAll('.plan-price[data-monthly]');

toggle?.addEventListener('change', () => {
  const isYearly = toggle.checked;
  prices.forEach(el => {
    const val = isYearly ? el.dataset.yearly : el.dataset.monthly;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = val;
      el.style.opacity = '1';
    }, 120);
  });
});
