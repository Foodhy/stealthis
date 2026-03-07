const bellBtn = document.getElementById('bellBtn');
const bellBadge = document.getElementById('bellBadge');
const notifPanel = document.getElementById('notifPanel');
const notifBackdrop = document.getElementById('notifBackdrop');
const markAllBtn = document.getElementById('markAllBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');

let unreadCount = document.querySelectorAll('.notif-item.unread').length;

function updateBadge() {
  if (unreadCount > 0) {
    bellBadge.textContent = unreadCount;
    bellBadge.classList.remove('hidden');
  } else {
    bellBadge.classList.add('hidden');
  }
}

function openPanel() {
  notifPanel.hidden = false;
  notifBackdrop.hidden = false;
  bellBtn.classList.add('active');
}

function closePanel() {
  notifPanel.hidden = true;
  notifBackdrop.hidden = true;
  bellBtn.classList.remove('active');
}

bellBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  notifPanel.hidden ? openPanel() : closePanel();
});

notifBackdrop.addEventListener('click', closePanel);

// Mark individual as read on click
document.getElementById('notifList').addEventListener('click', (e) => {
  const item = e.target.closest('.notif-item');
  if (!item) return;
  if (item.classList.contains('unread')) {
    item.classList.remove('unread');
    const dot = item.querySelector('.unread-dot');
    if (dot) dot.remove();
    unreadCount = Math.max(0, unreadCount - 1);
    updateBadge();
  }
});

// Mark all read
markAllBtn.addEventListener('click', () => {
  document.querySelectorAll('.notif-item.unread').forEach(item => {
    item.classList.remove('unread');
    const dot = item.querySelector('.unread-dot');
    if (dot) dot.remove();
  });
  unreadCount = 0;
  updateBadge();
});

// Load more (demo: append a fake item)
let loadCount = 0;
loadMoreBtn.addEventListener('click', () => {
  loadCount++;
  const list = document.getElementById('notifList');
  const item = document.createElement('div');
  item.className = 'notif-item';
  item.innerHTML = `
    <div class="notif-avatar" style="background:#f3f4f6;color:#6b7280;">📋</div>
    <div class="notif-body">
      <p class="notif-text">Older notification #${loadCount}</p>
      <p class="notif-time">${loadCount + 3} days ago</p>
    </div>
  `;
  list.appendChild(item);
  if (loadCount >= 3) loadMoreBtn.textContent = 'No more notifications';
});
