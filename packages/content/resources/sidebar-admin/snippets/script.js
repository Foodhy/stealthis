const sidebar   = document.getElementById('sidebar');
const collapseBtn = document.getElementById('collapseBtn');
const hamburger = document.getElementById('hamburger');
const overlay   = document.getElementById('overlay');

// Desktop collapse toggle
collapseBtn?.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  const isCollapsed = sidebar.classList.contains('collapsed');
  collapseBtn.setAttribute('aria-expanded', String(!isCollapsed));
});

// Mobile open
hamburger?.addEventListener('click', () => {
  sidebar.classList.add('mobile-open');
  overlay.classList.add('visible');
});

// Mobile close
function closeMobile() {
  sidebar.classList.remove('mobile-open');
  overlay.classList.remove('visible');
}
overlay?.addEventListener('click', closeMobile);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobile();
});

// Active nav item
document.querySelectorAll('.s-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.s-item').forEach(i => {
      i.classList.remove('active');
      i.removeAttribute('aria-current');
    });
    item.classList.add('active');
    item.setAttribute('aria-current', 'page');
    // Update topbar title
    const label = item.querySelector('.s-label')?.textContent?.trim();
    const title = document.querySelector('.topbar-title');
    if (label && title) title.textContent = label;
    // Close mobile
    closeMobile();
  });
});

// Persist collapse state
const savedCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
if (savedCollapsed) {
  sidebar.classList.add('collapsed');
  collapseBtn?.setAttribute('aria-expanded', 'false');
}
collapseBtn?.addEventListener('click', () => {
  localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed').toString());
});
