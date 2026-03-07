const fabContainer = document.getElementById('fabContainer');
const fabMain = document.getElementById('fabMain');
const backdrop = document.getElementById('fabBackdrop');
let isOpen = false;

function openFab() {
  isOpen = true;
  fabContainer.classList.add('open');
  backdrop.classList.add('visible');
  fabMain.setAttribute('aria-expanded', 'true');
  fabMain.setAttribute('aria-label', 'Close actions');
}

function closeFab() {
  isOpen = false;
  fabContainer.classList.remove('open');
  backdrop.classList.remove('visible');
  fabMain.setAttribute('aria-expanded', 'false');
  fabMain.setAttribute('aria-label', 'Open actions');
}

fabMain.addEventListener('click', () => (isOpen ? closeFab() : openFab()));

backdrop.addEventListener('click', closeFab);

// Sub-action buttons
document.querySelectorAll('.fab-action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    closeFab();
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isOpen) closeFab();
});
