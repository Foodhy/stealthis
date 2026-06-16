/* ======================================================
   Takeout Pickup Board — script.js
   Phase 27 Restaurant Theme
   ====================================================== */

// ── Base time for elapsed calculations (board is "live" at 20:46) ──
const BASE_TIME_STR = '20:46';
const BASE_MINUTES = timeToMinutes(BASE_TIME_STR);

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function elapsedLabel(orderedAt) {
  const diff = BASE_MINUTES - timeToMinutes(orderedAt);
  if (diff <= 0) return '0 min';
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function isUrgent(orderedAt) {
  return (BASE_MINUTES - timeToMinutes(orderedAt)) >= 20;
}

// ── Initial state ──
const INITIAL_ORDERS = {
  prep: [
    { id: 'T-048', name: 'Carmen López',   items: ['Burrata', 'Ribeye 14oz', 'Sorbete cítrico'], orderedAt: '20:31', addedToDoneAt: null },
    { id: 'T-051', name: 'David Kim',      items: ['Pulpo brasa', 'Risotto hongos'],              orderedAt: '20:38', addedToDoneAt: null },
  ],
  ready: [
    { id: 'T-044', name: 'Priya Shah',     items: ['Pappardelle ragú', 'Tarta de queso'],         orderedAt: '20:15', addedToDoneAt: null },
    { id: 'T-046', name: 'Luis Fernández', items: ['Pan masa madre', 'Pollo carbón'],             orderedAt: '20:22', addedToDoneAt: null },
  ],
  done: [
    { id: 'T-039', name: 'Emma Walsh',     items: ['Ensalada huerta'],                            orderedAt: '19:58', addedToDoneAt: Date.now() },
  ],
};

// Deep clone initial state
let state = JSON.parse(JSON.stringify(INITIAL_ORDERS));

// ── Counter for new orders ──
let orderCounter = 52;

// ── Random customer names and items pools ──
const NAMES = [
  'Sofia Martín', 'James O\'Brien', 'Yuki Tanaka', 'Ana Torres',
  'Marco Rossi', 'Léa Bernard', 'Carlos Vega', 'Nina Petrov',
  'Omar Khalil', 'Mei Lin', 'Tomás Reyes', 'Ingrid Holm',
];

const ITEMS_POOL = [
  'Croquetas jamón', 'Gazpacho andaluz', 'Patatas bravas',
  'Tortilla española', 'Pulpo a la gallega', 'Salmón tartar',
  'Chuletón 400g', 'Pasta al nero', 'Arroz meloso', 'Tarta Santiago',
  'Crema catalana', 'Helado trufa', 'Pan cristal', 'Burrata stracciatella',
  'Gambas al ajillo', 'Merluza a la vasca',
];

function randomName() {
  return NAMES[Math.floor(Math.random() * NAMES.length)];
}

function randomItems() {
  const count = 2 + Math.floor(Math.random() * 2); // 2 or 3 items
  const shuffled = [...ITEMS_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function nextOrderId() {
  orderCounter++;
  return `T-${String(orderCounter).padStart(3, '0')}`;
}

// ── Render a single order card ──
function renderCard(order, column) {
  const card = document.createElement('div');
  card.className = 'order-card';
  card.dataset.id = order.id;

  if (column === 'ready') card.classList.add('is-ready');
  if (column === 'done')  card.classList.add('is-done');

  const elapsed = elapsedLabel(order.orderedAt);
  const urgent  = isUrgent(order.orderedAt);

  const advanceLabel = column === 'prep'  ? '→ Ready'      :
                       column === 'ready' ? '→ Picked Up'  : null;

  const itemsHtml = order.items.slice(0, 3)
    .map(i => `<li>${escapeHtml(i)}</li>`)
    .join('');

  card.innerHTML = `
    <div class="card-top">
      <span class="order-number">${escapeHtml(order.id)}</span>
      <span class="ready-badge">READY 🔔</span>
    </div>
    <p class="order-customer">${escapeHtml(order.name)}</p>
    <ul class="order-items">${itemsHtml}</ul>
    <div class="card-meta">
      <span class="order-time">Ordered: ${escapeHtml(order.orderedAt)}</span>
      <span class="order-timer${urgent ? ' is-urgent' : ''}">⏱ ${elapsed}</span>
    </div>
    ${advanceLabel ? `<div class="card-footer"><button class="btn-advance" data-id="${escapeHtml(order.id)}" data-col="${column}">${advanceLabel}</button></div>` : ''}
  `;

  return card;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Render all columns ──
function render() {
  const lists = {
    prep:  document.getElementById('list-prep'),
    ready: document.getElementById('list-ready'),
    done:  document.getElementById('list-done'),
  };

  for (const [col, list] of Object.entries(lists)) {
    list.innerHTML = '';
    state[col].forEach(order => {
      const card = renderCard(order, col);
      list.appendChild(card);
    });
  }

  // Update badges
  document.getElementById('badge-prep').textContent  = state.prep.length;
  document.getElementById('badge-ready').textContent = state.ready.length;
  document.getElementById('badge-done').textContent  = state.done.length;

  // Attach advance button listeners
  document.querySelectorAll('.btn-advance').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = btn.dataset.id;
      const col = btn.dataset.col;
      advanceOrder(id, col);
    });
  });
}

// ── Advance order from one column to the next ──
function advanceOrder(id, fromCol) {
  const toCol = fromCol === 'prep' ? 'ready' : 'done';
  const idx = state[fromCol].findIndex(o => o.id === id);
  if (idx === -1) return;

  const [order] = state[fromCol].splice(idx, 1);

  if (toCol === 'done') {
    order.addedToDoneAt = Date.now();
  }

  state[toCol].push(order);
  render();

  if (toCol === 'ready') {
    triggerAlert(order);
    // Schedule removal of pulse class after animation
    requestAnimationFrame(() => {
      const card = document.querySelector(`.order-card[data-id="${order.id}"]`);
      if (card) {
        // pulse-green runs 3 times = 3 * 1.8s = 5.4s
        setTimeout(() => card.classList.remove('is-ready-pulse'), 5400);
      }
    });
  }

  if (toCol === 'done') {
    scheduleDoneCollapse(order.id);
  }
}

// ── Alert toast ──
let alertTimeout = null;

function triggerAlert(order) {
  const toast = document.getElementById('alert-toast');
  toast.textContent = `🔔 ${order.id} — ${order.name} ready!`;
  toast.classList.add('is-visible');

  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3500);
}

// ── Schedule collapse of a done card after 60s ──
function scheduleDoneCollapse(orderId) {
  setTimeout(() => {
    const card = document.querySelector(`#list-done .order-card[data-id="${orderId}"]`);
    if (!card) return;

    card.classList.add('is-collapsing');

    // Wait for CSS transition to finish, then remove from state + re-render
    card.addEventListener('transitionend', () => {
      state.done = state.done.filter(o => o.id !== orderId);
      render();
    }, { once: true });
  }, 60_000);
}

// ── Clock update ──
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('board-clock').textContent = `${h}:${m}`;
}

// ── Timer update (every 30s) ──
function updateTimers() {
  // Re-render is the simplest approach since there's no complex animation state
  render();
}

// ── "+ New Order" button ──
document.getElementById('btn-new-order').addEventListener('click', () => {
  addNewOrder();
});

function addNewOrder() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const newOrder = {
    id:           nextOrderId(),
    name:         randomName(),
    items:        randomItems(),
    orderedAt:    `${h}:${m}`,
    addedToDoneAt: null,
  };
  state.prep.push(newOrder);
  render();

  // Flash the new card
  requestAnimationFrame(() => {
    const card = document.querySelector(`#list-prep .order-card[data-id="${newOrder.id}"]`);
    if (card) {
      card.style.transition = 'box-shadow 0.2s, transform 0.2s, opacity 0.2s';
      card.style.boxShadow = '0 0 0 3px var(--gold)';
      card.style.transform = 'scale(1.025)';
      setTimeout(() => {
        card.style.boxShadow = '';
        card.style.transform = '';
      }, 600);
    }
  });
}

// ── Auto-demo toggle ──
let demoInterval = null;
const toggleDemoBtn = document.getElementById('toggle-demo');

toggleDemoBtn.addEventListener('click', () => {
  const isActive = toggleDemoBtn.classList.toggle('is-active');
  toggleDemoBtn.setAttribute('aria-pressed', String(isActive));

  if (isActive) {
    startAutoDemo();
  } else {
    stopAutoDemo();
  }
});

function startAutoDemo() {
  runDemoStep(); // run immediately
  demoInterval = setInterval(runDemoStep, 25_000);
}

function stopAutoDemo() {
  clearInterval(demoInterval);
  demoInterval = null;
}

function runDemoStep() {
  // Advance oldest prep order → ready, or if none add a new prep order
  if (state.prep.length > 0) {
    const oldest = state.prep[0];
    advanceOrder(oldest.id, 'prep');
  } else {
    addNewOrder();
  }
}

// ── Init ──
function init() {
  render();
  updateClock();

  // Schedule existing done orders for collapse
  state.done.forEach(order => {
    if (order.addedToDoneAt) {
      const elapsed = Date.now() - order.addedToDoneAt;
      const remaining = Math.max(0, 60_000 - elapsed);
      setTimeout(() => {
        const card = document.querySelector(`#list-done .order-card[data-id="${order.id}"]`);
        if (!card) return;
        card.classList.add('is-collapsing');
        card.addEventListener('transitionend', () => {
          state.done = state.done.filter(o => o.id !== order.id);
          render();
        }, { once: true });
      }, remaining);
    }
  });

  // Clock ticks every 30s
  setInterval(updateClock, 30_000);
  // Timer labels refresh every 30s
  setInterval(updateTimers, 30_000);
}

init();
