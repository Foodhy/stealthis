const container = document.getElementById('scrollContainer');
const list = document.getElementById('feedList');
const indicator = document.querySelector('.pull-indicator');
const pullLabel = document.getElementById('pullLabel');

const THRESHOLD = 80;
let startY = 0;
let pulling = false;
let triggered = false;
let refreshing = false;

const newItems = [
  { name: 'Alex Morgan', time: 'just now', text: 'Just published a new article on mobile-first design patterns. Check it out!' },
  { name: 'Sam Rivera', time: 'just now', text: 'New sprint just started. Excited to build out the gesture library this week.' },
];

let newItemIndex = 0;

function setTranslation(y) {
  list.style.transform = `translateY(${y}px)`;
  indicator.style.transform = `translateY(${y}px)`;
  // Rotate arrow based on progress
  const progress = Math.min(y / THRESHOLD, 1);
  const arrow = indicator.querySelector('.arrow-icon');
  if (arrow) arrow.style.transform = `rotate(${progress * 180}deg)`;
  pullLabel.textContent = progress >= 1 ? 'Release to refresh' : 'Pull to refresh';
}

function reset() {
  list.classList.remove('dragging');
  list.style.transform = '';
  indicator.style.transform = '';
  indicator.classList.remove('spinning');
  pulling = false;
  triggered = false;
  refreshing = false;
  pullLabel.textContent = 'Pull to refresh';
}

async function doRefresh() {
  refreshing = true;
  indicator.classList.add('spinning');
  pullLabel.textContent = 'Refreshing…';
  list.style.transform = `translateY(${THRESHOLD}px)`;
  indicator.style.transform = `translateY(${THRESHOLD}px)`;

  await new Promise(r => setTimeout(r, 1200));

  // Prepend a new item
  const data = newItems[newItemIndex % newItems.length];
  newItemIndex++;

  const avatars = ['av1', 'av2', 'av3', 'av4'];
  const avClass = avatars[Math.floor(Math.random() * avatars.length)];

  const li = document.createElement('li');
  li.className = `feed-item new-item`;
  li.innerHTML = `
    <div class="item-avatar ${avClass}"></div>
    <div class="item-body">
      <div class="item-meta"><strong>${data.name}</strong><span>${data.time}</span></div>
      <p>${data.text}</p>
    </div>
  `;
  list.prepend(li);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => li.classList.add('visible'));
  });

  // Retract
  list.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
  indicator.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
  reset();

  setTimeout(() => {
    list.style.transition = '';
    indicator.style.transition = '';
  }, 350);
}

container.addEventListener('touchstart', e => {
  if (container.scrollTop > 0 || refreshing) return;
  startY = e.touches[0].clientY;
  pulling = true;
  list.classList.add('dragging');
}, { passive: true });

container.addEventListener('touchmove', e => {
  if (!pulling || refreshing) return;
  if (container.scrollTop > 0) {
    pulling = false;
    return;
  }
  const delta = e.touches[0].clientY - startY;
  if (delta <= 0) return;
  const dampened = Math.min(delta * 0.5, THRESHOLD * 1.4);
  setTranslation(dampened);
  triggered = dampened >= THRESHOLD;
}, { passive: true });

container.addEventListener('touchend', () => {
  if (!pulling) return;
  list.classList.remove('dragging');
  if (triggered) {
    doRefresh();
  } else {
    reset();
  }
});
