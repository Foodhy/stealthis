const menu = document.getElementById('contextMenu');
const menuTitle = document.getElementById('menuTitle');
const toast = document.getElementById('toast');

const LONG_PRESS_DURATION = 500;
let pressTimer = null;
let activeTarget = null;

function showMenu(x, y, title) {
  menuTitle.textContent = title || 'Options';

  // Position near the press point
  menu.style.left = '0px';
  menu.style.top = '0px';
  menu.classList.add('visible');

  const menuW = menu.offsetWidth;
  const menuH = menu.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const left = Math.min(Math.max(x, 8), vw - menuW - 8);
  const top = Math.min(Math.max(y, 8), vh - menuH - 8);

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

function hideMenu() {
  menu.classList.remove('visible');
  if (activeTarget) {
    activeTarget.classList.remove('pressing');
    activeTarget = null;
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Attach long-press to all cards
document.querySelectorAll('[data-long-press]').forEach(el => {
  const title = el.dataset.title || '';

  // Touch events
  el.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    activeTarget = el;
    el.classList.add('pressing');

    pressTimer = setTimeout(() => {
      showMenu(touch.clientX, touch.clientY, title);
    }, LONG_PRESS_DURATION);
  }, { passive: true });

  el.addEventListener('touchmove', () => {
    clearTimeout(pressTimer);
    el.classList.remove('pressing');
  }, { passive: true });

  el.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
    el.classList.remove('pressing');
  }, { passive: true });

  // Desktop right-click
  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    showMenu(e.clientX, e.clientY, title);
  });
});

// Menu item actions
menu.querySelectorAll('.menu-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const title = menuTitle.textContent;
    const messages = {
      share: `Shared "${title}"`,
      download: `Saved "${title}"`,
      favorite: `Added "${title}" to favorites`,
      delete: `Deleted "${title}"`,
    };
    showToast(messages[action] || 'Done');
    hideMenu();
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!menu.contains(e.target)) hideMenu();
});

document.addEventListener('touchstart', e => {
  if (!menu.contains(e.target)) hideMenu();
}, { passive: true });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideMenu();
});
