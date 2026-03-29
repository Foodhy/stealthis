const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');
const backBtn = document.getElementById('backBtn');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const message = document.getElementById('message');
const charCount = document.getElementById('charCount');

// Character counter
message.addEventListener('input', () => {
  charCount.textContent = `${message.value.length} / 500`;
});

// Validation
function validate() {
  let valid = true;
  ['name', 'email', 'message'].forEach(id => {
    const input = document.getElementById(id);
    const error = input.parentElement.querySelector('.field-error');
    if (!input.value.trim()) {
      input.classList.add('error');
      if (error) error.textContent = 'This field is required';
      valid = false;
    } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      input.classList.add('error');
      if (error) error.textContent = 'Enter a valid email address';
      valid = false;
    } else {
      input.classList.remove('error');
      if (error) error.textContent = '';
    }
  });
  return valid;
}

form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('error');
    const error = el.parentElement.querySelector('.field-error');
    if (error) error.textContent = '';
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validate()) return;

  submitBtn.classList.add('loading');
  submitText.textContent = 'Sending…';

  setTimeout(() => {
    submitBtn.classList.remove('loading');
    submitText.textContent = 'Send Message';
    success.classList.add('visible');
  }, 1000);
});

backBtn.addEventListener('click', () => {
  success.classList.remove('visible');
  form.reset();
  charCount.textContent = '0 / 500';
});
