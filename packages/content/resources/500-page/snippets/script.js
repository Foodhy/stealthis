const retryBtn = document.getElementById('retryBtn');
const retryText = document.getElementById('retryText');
let countdown = null;

function startCountdown(seconds) {
  clearInterval(countdown);
  retryBtn.disabled = true;
  retryBtn.classList.add('loading');

  let remaining = seconds;
  retryText.textContent = `Retrying in ${remaining}s…`;

  countdown = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(countdown);
      retryBtn.disabled = false;
      retryBtn.classList.remove('loading');
      retryText.textContent = 'Try Again';
    } else {
      retryText.textContent = `Retrying in ${remaining}s…`;
    }
  }, 1000);
}

retryBtn.addEventListener('click', () => {
  startCountdown(5);
  // In a real app: window.location.reload();
});
