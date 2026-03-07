const clearBtn = document.getElementById('clearBtn');
const clearBadge = document.getElementById('clearBadge');

clearBtn.addEventListener('click', () => {
  clearBadge.classList.add('hidden');
  setTimeout(() => clearBadge.remove(), 200);
});
