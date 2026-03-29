const backdrop = document.getElementById('backdrop');
let activeSheet = null;

function openSheet(id) {
  const sheet = document.getElementById(`sheet-${id}`);
  if (!sheet) return;
  activeSheet = sheet;
  backdrop.classList.add('visible');
  sheet.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  if (!activeSheet) return;
  activeSheet.classList.remove('open');
  backdrop.classList.remove('visible');
  document.body.style.overflow = '';
  activeSheet = null;
}

// Trigger buttons
document.querySelectorAll('.trigger-btn').forEach(btn => {
  btn.addEventListener('click', () => openSheet(btn.dataset.sheet));
});

// Backdrop
backdrop.addEventListener('click', closeSheet);

// Close buttons inside sheets
document.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', closeSheet);
});

// Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSheet();
});
