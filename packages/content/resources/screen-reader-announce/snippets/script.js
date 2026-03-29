const politeRegion = document.getElementById('livePolite');
const assertiveRegion = document.getElementById('liveAssertive');
const log = document.getElementById('announceLog');

function pad(n) { return String(n).padStart(2,'0'); }
function getTime() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function announce(msg, type) {
  // Clear and re-set to force re-announcement
  const region = type === 'assertive' ? assertiveRegion : politeRegion;
  region.textContent = '';
  setTimeout(() => { region.textContent = msg; }, 50);

  // Update visual log
  const empty = log.querySelector('.al-empty');
  if (empty) empty.remove();

  const entry = document.createElement('div');
  entry.className = 'al-entry';
  entry.innerHTML = `
    <span class="al-badge al-badge--${type}">${type}</span>
    <span class="al-msg">${msg}</span>
    <span class="al-time">${getTime()}</span>
  `;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

document.querySelectorAll('.ac-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const region = btn.dataset.region;
    const msg = btn.dataset.msg;
    announce(msg, region);
  });
});

document.getElementById('alClear').addEventListener('click', () => {
  log.innerHTML = '<div class="al-empty">Press a button above to see announcements here.</div>';
  politeRegion.textContent = '';
  assertiveRegion.textContent = '';
});
