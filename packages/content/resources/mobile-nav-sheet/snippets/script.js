const openBtn = document.getElementById('openBtn');
const sheet = document.getElementById('sheet');
const backdrop = document.getElementById('backdrop');
const dragHandle = document.getElementById('dragHandle');

function openSheet() {
  sheet.classList.add('open');
  backdrop.classList.add('visible');
}

function closeSheet() {
  sheet.classList.remove('open');
  backdrop.classList.remove('visible');
}

openBtn.addEventListener('click', openSheet);
backdrop.addEventListener('click', closeSheet);
dragHandle.addEventListener('click', closeSheet);

document.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', closeSheet);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSheet();
});
