const container = document.getElementById('snackbarContainer');
const DURATION = 4000;

function showSnackbar(message, actionLabel = '', type = '') {
  const el = document.createElement('div');
  el.className = 'snackbar' + (type ? ` snackbar--${type}` : '');

  el.innerHTML = `
    <span class="snackbar-msg">${message}</span>
    ${actionLabel ? `<button class="snackbar-action">${actionLabel}</button>` : ''}
    <button class="snackbar-close" aria-label="Dismiss">✕</button>
  `;

  container.appendChild(el);

  const dismiss = () => {
    clearTimeout(timer);
    el.classList.add('snackbar--out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };

  const timer = setTimeout(dismiss, DURATION);

  el.querySelector('.snackbar-close').addEventListener('click', dismiss);

  const actionBtn = el.querySelector('.snackbar-action');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      // Action callback — customize per use case
      dismiss();
    });
  }
}

// Trigger buttons
document.querySelectorAll('.trigger-btn[data-msg]').forEach(btn => {
  btn.addEventListener('click', () => {
    showSnackbar(btn.dataset.msg, btn.dataset.action, btn.dataset.type);
  });
});

// Spam test
document.getElementById('spamBtn').addEventListener('click', () => {
  const messages = [
    'Item added to cart',
    'Notification sent',
    'Settings saved',
    'Image uploaded',
    'Link copied',
  ];
  messages.forEach((msg, i) => {
    setTimeout(() => showSnackbar(msg), i * 300);
  });
});
