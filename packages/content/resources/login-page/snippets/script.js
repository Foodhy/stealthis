const form      = document.getElementById('loginForm');
const emailEl   = document.getElementById('email');
const pwdEl     = document.getElementById('password');
const submitBtn = document.getElementById('loginSubmit');
const pwdToggle = document.getElementById('pwdToggle');

// Password visibility toggle
pwdToggle?.addEventListener('click', () => {
  const isPwd = pwdEl.type === 'password';
  pwdEl.type = isPwd ? 'text' : 'password';
  pwdToggle.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
});

// Validation
function validateEmail(val) {
  if (!val.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address.';
  return null;
}
function validatePassword(val) {
  if (!val) return 'Password is required.';
  if (val.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

function showError(input, errorEl, msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
  input.classList.add('invalid');
}
function clearError(input, errorEl) {
  errorEl.hidden = true;
  input.classList.remove('invalid');
}

// Live validation on blur
emailEl?.addEventListener('blur', () => {
  const err = validateEmail(emailEl.value);
  const errEl = document.getElementById('email-error');
  err ? showError(emailEl, errEl, err) : clearError(emailEl, errEl);
});
pwdEl?.addEventListener('blur', () => {
  const err = validatePassword(pwdEl.value);
  const errEl = document.getElementById('password-error');
  err ? showError(pwdEl, errEl, err) : clearError(pwdEl, errEl);
});

// Submit
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailErr = validateEmail(emailEl.value);
  const pwdErr   = validatePassword(pwdEl.value);

  if (emailErr) showError(emailEl, document.getElementById('email-error'), emailErr);
  else clearError(emailEl, document.getElementById('email-error'));

  if (pwdErr) showError(pwdEl, document.getElementById('password-error'), pwdErr);
  else clearError(pwdEl, document.getElementById('password-error'));

  if (emailErr || pwdErr) return;

  // Loading state
  setLoading(true);
  await new Promise(r => setTimeout(r, 1500));
  setLoading(false);
  // Would normally redirect here
  alert('Sign-in successful! (demo)');
});

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.querySelector('.btn-text').hidden = on;
  submitBtn.querySelector('.btn-spinner').hidden = !on;
}

// OAuth buttons
document.getElementById('oauthGoogle')?.addEventListener('click', () => alert('Google OAuth (demo)'));
document.getElementById('oauthGitHub')?.addEventListener('click', () => alert('GitHub OAuth (demo)'));
