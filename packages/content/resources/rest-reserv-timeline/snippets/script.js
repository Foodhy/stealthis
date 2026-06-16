/* =================================================================
   REST-RESERV-TIMELINE — Reservation Timeline Script
   Phase 27 Restaurant Theme
   ================================================================= */

// ── CONSTANTS ────────────────────────────────────────────────────
const TABLES = [
  'T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12',
  'Bar 1','Bar 2','Patio 1','Patio 2'
];

const TIME_START = 18 * 60; // 18:00 in minutes from midnight
const TIME_END   = 23 * 60; // 23:00
const SLOT_MIN   = 30;
const TOTAL_SLOTS = (TIME_END - TIME_START) / SLOT_MIN; // 10
const CURRENT_TIME = 20 * 60 + 46; // 20:46 — fixed demo "now"

// ── INITIAL RESERVATIONS ─────────────────────────────────────────
let reservations = [
  { id: 1,  table: 'T1',     guest: 'Martinez',   pax: 4, start: 18*60+0,  duration: 90, status: 'confirmed', notes: 'Anniversary, window table' },
  { id: 2,  table: 'T2',     guest: 'Okafor',     pax: 2, start: 18*60+30, duration: 90, status: 'pending',   notes: '' },
  { id: 3,  table: 'T3',     guest: 'Chen',        pax: 6, start: 19*60+0,  duration: 90, status: 'confirmed', notes: 'Birthday — cake at dessert' },
  { id: 4,  table: 'T4',     guest: 'Hoffman',     pax: 3, start: 20*60+0,  duration: 90, status: 'seated',   notes: 'Allergy: shellfish' },
  { id: 5,  table: 'T5',     guest: 'Reyes',       pax: 2, start: 20*60+30, duration: 90, status: 'confirmed', notes: '' },
  { id: 6,  table: 'T6',     guest: 'Nguyen',      pax: 5, start: 21*60+0,  duration: 90, status: 'pending',   notes: 'Prefer quiet section' },
  { id: 7,  table: 'T7',     guest: 'Kowalski',    pax: 2, start: 19*60+30, duration: 90, status: 'done',     notes: 'Regular guests' },
  { id: 8,  table: 'T8',     guest: 'Patel',       pax: 4, start: 20*60+0,  duration: 90, status: 'seated',   notes: '' },
  { id: 9,  table: 'T9',     guest: 'Dubois',      pax: 3, start: 18*60+0,  duration: 90, status: 'done',     notes: '' },
  { id: 10, table: 'T10',    guest: 'Svensson',    pax: 2, start: 21*60+30, duration: 90, status: 'confirmed', notes: 'VIP — comp dessert' },
  { id: 11, table: 'T11',    guest: 'Almeida',     pax: 7, start: 19*60+0,  duration: 90, status: 'confirmed', notes: 'Corporate booking' },
  { id: 12, table: 'T12',    guest: 'Nakamura',    pax: 2, start: 20*60+30, duration: 90, status: 'pending',   notes: 'First visit' },
  { id: 13, table: 'Bar 1',  guest: 'Ellis',       pax: 1, start: 19*60+30, duration: 90, status: 'seated',   notes: '' },
  { id: 14, table: 'Bar 2',  guest: 'Brennan',     pax: 2, start: 21*60+0,  duration: 90, status: 'confirmed', notes: '' },
  { id: 15, table: 'Patio 1',guest: 'Russo',       pax: 4, start: 20*60+0,  duration: 90, status: 'confirmed', notes: 'Outdoor preference' },
];

let nextId = 16;

// ── HELPERS ──────────────────────────────────────────────────────
function minToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function getColWidth() {
  // Read from CSS variable
  const v = getComputedStyle(document.documentElement).getPropertyValue('--col-width').trim();
  return parseInt(v, 10) || 110;
}

// ── RENDER ───────────────────────────────────────────────────────
function render() {
  renderTimeHeader();
  renderTableLabels();
  renderGridBody();
}

function renderTimeHeader() {
  const header = document.getElementById('time-header');
  header.innerHTML = '';
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const min = TIME_START + i * SLOT_MIN;
    const cell = document.createElement('div');
    cell.className = 'time-cell';
    cell.textContent = minToTime(min);
    header.appendChild(cell);
  }
}

function renderTableLabels() {
  const labels = document.getElementById('table-labels');
  labels.innerHTML = '';
  TABLES.forEach(name => {
    const cell = document.createElement('div');
    cell.className = 'table-label-cell';
    cell.textContent = name;
    labels.appendChild(cell);
  });
}

function renderGridBody() {
  const body = document.getElementById('grid-body');
  body.innerHTML = '';

  const colW = getColWidth();

  TABLES.forEach((table, rowIdx) => {
    const row = document.createElement('div');
    row.className = 'grid-row';
    row.dataset.table = table;

    // Background cells
    for (let col = 0; col < TOTAL_SLOTS; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      row.appendChild(cell);
    }

    // Reservation blocks for this table
    const tableReservations = reservations.filter(r => r.table === table);
    tableReservations.forEach(res => {
      const startOffset = res.start - TIME_START; // minutes from grid start
      if (startOffset < 0 || startOffset >= (TIME_END - TIME_START)) return;

      const leftPct = startOffset / SLOT_MIN;
      const widthSlots = res.duration / SLOT_MIN;

      const block = document.createElement('div');
      block.className = `reservation-block ${res.status}`;
      block.style.left = `${leftPct * colW + 2}px`;
      block.style.width = `${widthSlots * colW - 4}px`;
      block.dataset.id = res.id;

      const guestEl = document.createElement('div');
      guestEl.className = 'block-guest';
      guestEl.textContent = res.guest;

      const paxEl = document.createElement('div');
      paxEl.className = 'block-pax';
      paxEl.textContent = `👥 ${res.pax} · ${minToTime(res.start)}`;

      block.appendChild(guestEl);
      block.appendChild(paxEl);

      // Tooltip events
      block.addEventListener('mouseenter', e => showTooltip(e, res));
      block.addEventListener('mousemove', e => moveTooltip(e));
      block.addEventListener('mouseleave', hideTooltip);

      // Click: status dropdown
      block.addEventListener('click', e => {
        e.stopPropagation();
        showStatusDropdown(e, res.id);
      });

      row.appendChild(block);
    });

    body.appendChild(row);
  });

  // Time marker
  if (CURRENT_TIME >= TIME_START && CURRENT_TIME <= TIME_END) {
    const marker = document.createElement('div');
    marker.className = 'time-marker';
    const offsetMin = CURRENT_TIME - TIME_START;
    const leftPx = (offsetMin / SLOT_MIN) * colW;
    marker.style.left = `${leftPx}px`;
    body.appendChild(marker);
  }
}

// ── TOOLTIP ──────────────────────────────────────────────────────
const tooltip = document.getElementById('tooltip');

function showTooltip(e, res) {
  tooltip.innerHTML = `
    <div class="tooltip-guest">${res.guest}</div>
    <div class="tooltip-row">👥 Party of ${res.pax}</div>
    <div class="tooltip-row">🕐 ${minToTime(res.start)} – ${minToTime(res.start + res.duration)}</div>
    <div class="tooltip-row">📋 Table ${res.table}</div>
    ${res.notes ? `<div class="tooltip-row">📝 ${res.notes}</div>` : ''}
    <span class="tooltip-status ${res.status}">${capitalise(res.status)}</span>
  `;
  tooltip.classList.add('visible');
  moveTooltip(e);
}

function moveTooltip(e) {
  const pad = 16;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  // Keep within viewport
  if (x + 240 > window.innerWidth)  x = e.clientX - 240 - pad;
  if (y + 160 > window.innerHeight) y = e.clientY - 160 - pad;
  tooltip.style.left = `${x}px`;
  tooltip.style.top  = `${y}px`;
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

// ── STATUS DROPDOWN ───────────────────────────────────────────────
const statusDropdown = document.getElementById('status-dropdown');
let activeResId = null;

function showStatusDropdown(e, resId) {
  activeResId = resId;
  const pad = 8;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  if (x + 170 > window.innerWidth)  x = e.clientX - 170 - pad;
  if (y + 200 > window.innerHeight) y = e.clientY - 200 - pad;
  statusDropdown.style.left = `${x}px`;
  statusDropdown.style.top  = `${y}px`;
  statusDropdown.classList.add('visible');
  hideTooltip();
}

function hideStatusDropdown() {
  statusDropdown.classList.remove('visible');
  activeResId = null;
}

statusDropdown.querySelectorAll('.status-option').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const newStatus = btn.dataset.status;
    if (activeResId === null) return;

    if (newStatus === 'cancel') {
      reservations = reservations.filter(r => r.id !== activeResId);
    } else {
      const res = reservations.find(r => r.id === activeResId);
      if (res) res.status = newStatus;
    }

    hideStatusDropdown();
    render();
  });
});

document.addEventListener('click', e => {
  if (!statusDropdown.contains(e.target)) hideStatusDropdown();
});

// ── NEW RESERVATION MODAL ─────────────────────────────────────────
const modalOverlay = document.getElementById('modal-overlay');
const btnNew       = document.getElementById('btn-new-reservation');
const btnAddModal  = document.getElementById('btn-add-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const modalClose   = document.getElementById('modal-close');
const formTable    = document.getElementById('form-table');
const formTime     = document.getElementById('form-time');
const formGuest    = document.getElementById('form-guest');
const formPax      = document.getElementById('form-pax');
const formNotes    = document.getElementById('form-notes');

// Populate selects
TABLES.forEach(t => {
  const opt = document.createElement('option');
  opt.value = t;
  opt.textContent = t;
  formTable.appendChild(opt);
});

for (let i = 0; i < TOTAL_SLOTS; i++) {
  const min = TIME_START + i * SLOT_MIN;
  const opt = document.createElement('option');
  opt.value = min;
  opt.textContent = minToTime(min);
  formTime.appendChild(opt);
}

function openModal() {
  formGuest.value = '';
  formPax.value   = '2';
  formNotes.value = '';
  modalOverlay.classList.add('visible');
  setTimeout(() => formGuest.focus(), 60);
}

function closeModal() {
  modalOverlay.classList.remove('visible');
}

btnNew.addEventListener('click', openModal);
btnCancelModal.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

btnAddModal.addEventListener('click', () => {
  const table = formTable.value;
  const start = parseInt(formTime.value, 10);
  const guest = formGuest.value.trim();
  const pax   = Math.max(1, parseInt(formPax.value, 10) || 1);
  const notes = formNotes.value.trim();

  if (!guest) {
    formGuest.focus();
    formGuest.style.borderColor = 'var(--terracotta)';
    setTimeout(() => { formGuest.style.borderColor = ''; }, 1200);
    return;
  }

  reservations.push({
    id: nextId++,
    table, guest, pax, start,
    duration: 90,
    status: 'pending',
    notes
  });

  closeModal();
  render();
});

// ── HEADER DATE ───────────────────────────────────────────────────
function setHeaderDate() {
  const el = document.getElementById('header-date');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── UTILS ─────────────────────────────────────────────────────────
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── INIT ──────────────────────────────────────────────────────────
setHeaderDate();
render();

// Re-render on resize to pick up updated col-width CSS variable
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 120);
});
