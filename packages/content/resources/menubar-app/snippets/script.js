const menubar = document.getElementById('menubar');
const log     = document.getElementById('action-log');
let openMenu  = null;

function openDropdown(trigger, dropdown) {
  closeAll();
  trigger.setAttribute('aria-expanded', 'true');
  dropdown.classList.add('open');
  openMenu = { trigger, dropdown };
}

function closeAll() {
  document.querySelectorAll('.menu-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
  document.querySelectorAll('.menu-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.menu-option--submenu').forEach(b => b.setAttribute('aria-expanded', 'false'));
  openMenu = null;
}

// Top-level menu triggers
menubar.querySelectorAll('.menu-trigger').forEach(trigger => {
  const dropdown = document.getElementById(trigger.getAttribute('aria-controls'));
  if (!dropdown) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (trigger.getAttribute('aria-expanded') === 'true') closeAll();
    else openDropdown(trigger, dropdown);
  });

  trigger.addEventListener('mouseenter', () => {
    if (openMenu && openMenu.trigger !== trigger) openDropdown(trigger, dropdown);
  });
});

// Submenu triggers
document.querySelectorAll('.menu-option--submenu').forEach(btn => {
  const sub = btn.closest('.menu-item-wrap--sub')?.querySelector('.menu-dropdown--sub');
  if (!sub) return;

  btn.addEventListener('mouseenter', () => {
    btn.setAttribute('aria-expanded', 'true');
    sub.classList.add('open');
  });
  btn.closest('.menu-item-wrap--sub').addEventListener('mouseleave', () => {
    btn.setAttribute('aria-expanded', 'false');
    sub.classList.remove('open');
  });
});

// Click on menu options
document.querySelectorAll('.menu-option:not(.menu-option--submenu)').forEach(opt => {
  opt.addEventListener('click', () => {
    const label = opt.querySelector('span:first-child')?.textContent?.trim();
    if (label) addLog(`Clicked: ${label}`);
    closeAll();
  });
});

// Outside click
document.addEventListener('click', closeAll);

// Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});

// Arrow key navigation between top-level items
menubar.addEventListener('keydown', (e) => {
  const triggers = [...menubar.querySelectorAll('.menu-trigger')];
  const idx = triggers.indexOf(document.activeElement);
  if (idx === -1) return;

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const next = triggers[(idx + 1) % triggers.length];
    next.focus();
    if (openMenu) {
      const dd = document.getElementById(next.getAttribute('aria-controls'));
      if (dd) openDropdown(next, dd);
    }
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const prev = triggers[(idx - 1 + triggers.length) % triggers.length];
    prev.focus();
    if (openMenu) {
      const dd = document.getElementById(prev.getAttribute('aria-controls'));
      if (dd) openDropdown(prev, dd);
    }
  }
});

function addLog(text) {
  const el = document.createElement('div');
  el.className = 'log-entry';
  el.textContent = text;
  log.prepend(el);
  if (log.children.length > 5) log.lastChild.remove();
}
