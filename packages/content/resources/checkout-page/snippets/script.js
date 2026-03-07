const panels = document.querySelectorAll('.step-panel');
const steps = document.querySelectorAll('.step');

function goToStep(n) {
  panels.forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${n}`).classList.add('active');

  steps.forEach((s, i) => {
    const stepNum = i + 1;
    s.classList.remove('active', 'done');
    if (stepNum < n) s.classList.add('done');
    else if (stepNum === n) s.classList.add('active');
  });

  // Update done step numbers to checkmarks
  steps.forEach(s => {
    const num = s.querySelector('.step-num');
    if (s.classList.contains('done')) num.textContent = '✓';
    else num.textContent = s.dataset.step;
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Next buttons (simple)
document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => goToStep(Number(btn.dataset.next)));
});

// Back buttons
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => goToStep(Number(btn.dataset.back)));
});

// Shipping validation
document.getElementById('shippingNext').addEventListener('click', e => {
  const form = document.getElementById('shippingForm');
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    const error = input.parentElement.querySelector('.field-error');
    if (!input.value.trim()) {
      input.classList.add('error');
      if (error) error.textContent = 'This field is required';
      valid = false;
    } else {
      input.classList.remove('error');
      if (error) error.textContent = '';
    }
  });
  if (valid) goToStep(3);
});

// Card number formatting
const cardInput = document.getElementById('cardNumber');
if (cardInput) {
  cardInput.addEventListener('input', () => {
    let v = cardInput.value.replace(/\D/g, '').slice(0, 16);
    cardInput.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
  });
}

// Expiry formatting
const expiryInput = document.getElementById('expiry');
if (expiryInput) {
  expiryInput.addEventListener('input', () => {
    let v = expiryInput.value.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2);
    expiryInput.value = v;
  });
}

// Payment validation
document.getElementById('payBtn').addEventListener('click', e => {
  const form = document.getElementById('paymentForm');
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    const error = input.parentElement.querySelector('.field-error');
    if (!input.value.trim()) {
      input.classList.add('error');
      if (error) error.textContent = 'Required';
      valid = false;
    } else {
      input.classList.remove('error');
      if (error) error.textContent = '';
    }
  });
  if (valid) goToStep(4);
});

// Remove cart items
document.querySelectorAll('.remove-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.cart-item').remove());
});
