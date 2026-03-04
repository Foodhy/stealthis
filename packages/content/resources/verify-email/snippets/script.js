const inputs    = [...document.querySelectorAll('.otp-input')];
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const otpError  = document.getElementById('otp-error');
const CORRECT   = '123456';

// Input management
inputs.forEach((input, i) => {
  input.addEventListener('input', () => {
    const val = input.value.replace(/\D/g, '');
    input.value = val;
    input.classList.toggle('filled', !!val);

    if (val && i < inputs.length - 1) inputs[i + 1].focus();
    checkComplete();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && i > 0) {
      inputs[i - 1].focus();
      inputs[i - 1].value = '';
      inputs[i - 1].classList.remove('filled');
    }
  });
});

// Paste handler
inputs[0].addEventListener('paste', (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
  text.split('').forEach((ch, i) => {
    if (inputs[i]) {
      inputs[i].value = ch;
      inputs[i].classList.add('filled');
    }
  });
  checkComplete();
  const lastFilled = Math.min(text.length, inputs.length - 1);
  inputs[lastFilled].focus();
});

function checkComplete() {
  const code = inputs.map(i => i.value).join('');
  verifyBtn.disabled = code.length < 6;
}

// Verify
verifyBtn?.addEventListener('click', async () => {
  const code = inputs.map(i => i.value).join('');
  verifyBtn.disabled = true;
  verifyBtn.querySelector('.btn-text').hidden = true;
  verifyBtn.querySelector('.btn-spinner').hidden = false;

  await new Promise(r => setTimeout(r, 1000));

  if (code === CORRECT) {
    document.getElementById('verifyState').hidden = true;
    document.getElementById('successState').hidden = false;
  } else {
    inputs.forEach(i => i.classList.add('error'));
    otpError.textContent = 'Incorrect code. Please try again.';
    otpError.hidden = false;
    setTimeout(() => {
      inputs.forEach(i => { i.classList.remove('error'); i.value = ''; i.classList.remove('filled'); });
      otpError.hidden = true;
      inputs[0].focus();
    }, 600);
    verifyBtn.querySelector('.btn-text').hidden = false;
    verifyBtn.querySelector('.btn-spinner').hidden = true;
    verifyBtn.disabled = true;
  }
});

// Resend countdown
function startCountdown(secs) {
  let n = secs;
  const countEl = document.getElementById('countdown');
  resendBtn.disabled = true;
  const t = setInterval(() => {
    n--;
    countEl.textContent = n;
    if (n <= 0) { clearInterval(t); resendBtn.disabled = false; resendBtn.innerHTML = 'Resend code'; }
  }, 1000);
}
startCountdown(60);
resendBtn?.addEventListener('click', () => {
  resendBtn.innerHTML = 'Resend (<span id="countdown">60</span>s)';
  startCountdown(60);
});
