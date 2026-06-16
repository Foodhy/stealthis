/* ============================================================
   POS Void & Refund Manager — script.js
   Phase 27 Restaurant Theme
   ============================================================ */

'use strict';

/* ── Data ─────────────────────────────────────────────────── */
const TICKETS = [
  {
    id: 'T001',
    table: 'Table 3',
    time: '7:14 PM',
    server: 'Maria R.',
    status: 'open',
    items: [
      { id: 'i1', name: 'Ribeye Steak', qty: 1, price: 42.00, voided: false },
      { id: 'i2', name: 'Truffle Fries', qty: 2, price: 9.50, voided: false },
      { id: 'i3', name: 'House Salad', qty: 1, price: 7.00, voided: false },
      { id: 'i4', name: 'Sparkling Water', qty: 2, price: 4.00, voided: false },
    ],
  },
  {
    id: 'T002',
    table: 'Table 7',
    time: '6:52 PM',
    server: 'James T.',
    status: 'closed',
    items: [
      { id: 'i5', name: 'Pan-Seared Salmon', qty: 2, price: 28.00, voided: false },
      { id: 'i6', name: 'Mushroom Risotto', qty: 1, price: 18.50, voided: false },
      { id: 'i7', name: 'Crème Brûlée', qty: 2, price: 8.00, voided: false },
      { id: 'i8', name: 'Sauvignon Blanc (glass)', qty: 3, price: 12.00, voided: false },
    ],
  },
  {
    id: 'T003',
    table: 'Table 12',
    time: '7:33 PM',
    server: 'Sofia D.',
    status: 'open',
    items: [
      { id: 'i9', name: 'Duck Confit', qty: 1, price: 34.00, voided: false },
      { id: 'i10', name: 'Burrata & Heirloom Tomato', qty: 1, price: 16.00, voided: false },
      { id: 'i11', name: 'Tiramisu', qty: 1, price: 9.00, voided: false },
    ],
  },
  {
    id: 'T004',
    table: 'Bar 2',
    time: '8:05 PM',
    server: 'Alex M.',
    status: 'open',
    items: [
      { id: 'i12', name: 'Wagyu Slider (x3)', qty: 1, price: 22.00, voided: false },
      { id: 'i13', name: 'Craft Lager', qty: 2, price: 7.50, voided: false },
      { id: 'i14', name: 'Old Fashioned', qty: 1, price: 14.00, voided: false },
    ],
  },
  {
    id: 'T005',
    table: 'Table 5',
    time: '6:15 PM',
    server: 'Maria R.',
    status: 'voided',
    items: [
      { id: 'i15', name: 'Lobster Bisque', qty: 2, price: 14.00, voided: true },
      { id: 'i16', name: 'Caesar Salad', qty: 1, price: 10.00, voided: true },
    ],
  },
  {
    id: 'T006',
    table: 'Table 9',
    time: '7:48 PM',
    server: 'James T.',
    status: 'closed',
    items: [
      { id: 'i17', name: 'Foie Gras Terrine', qty: 1, price: 24.00, voided: false },
      { id: 'i18', name: 'Rack of Lamb', qty: 2, price: 46.00, voided: false },
      { id: 'i19', name: 'Molten Chocolate Cake', qty: 2, price: 10.00, voided: false },
      { id: 'i20', name: 'Champagne (bottle)', qty: 1, price: 85.00, voided: false },
    ],
  },
  {
    id: 'T007',
    table: 'Patio 1',
    time: '8:22 PM',
    server: 'Sofia D.',
    status: 'open',
    items: [
      { id: 'i21', name: 'Margherita Flatbread', qty: 1, price: 15.00, voided: false },
      { id: 'i22', name: 'Burrata Bowl', qty: 1, price: 17.00, voided: false },
      { id: 'i23', name: 'Lemonade (pitcher)', qty: 1, price: 11.00, voided: false },
    ],
  },
  {
    id: 'T008',
    table: 'Table 1',
    time: '5:58 PM',
    server: 'Alex M.',
    status: 'closed',
    items: [
      { id: 'i24', name: 'Charcuterie Board', qty: 1, price: 28.00, voided: false },
      { id: 'i25', name: 'Grilled Branzino', qty: 1, price: 32.00, voided: false },
      { id: 'i26', name: 'Roasted Vegetables', qty: 1, price: 11.00, voided: false },
      { id: 'i27', name: 'Dessert Trio', qty: 1, price: 18.00, voided: false },
    ],
  },
];

/* Audit log */
const auditLog = [];
const CORRECT_PIN = '1234';

/* ── State ────────────────────────────────────────────────── */
let selectedTicketId = null;
let selectedItemIds = new Set();
let currentFilter = 'all';
let searchQuery = '';
let pinBuffer = '';
let pendingVoidReason = '';

/* ── Helpers ──────────────────────────────────────────────── */
function getTicket(id) {
  return TICKETS.find(t => t.id === id) || null;
}

function ticketTotal(ticket) {
  return ticket.items.reduce((sum, it) => sum + it.qty * it.price, 0);
}

function ticketVoidableTotal(ticket) {
  return ticket.items
    .filter(it => !it.voided)
    .reduce((sum, it) => sum + it.qty * it.price, 0);
}

function selectedVoidAmount() {
  const ticket = getTicket(selectedTicketId);
  if (!ticket) return 0;
  return ticket.items
    .filter(it => selectedItemIds.has(it.id))
    .reduce((sum, it) => sum + it.qty * it.price, 0);
}

function fmt(n) {
  return '$' + n.toFixed(2);
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function statusClass(status) {
  return `status-chip status-chip--${status}`;
}

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* ── Render: Ticket List ──────────────────────────────────── */
function renderList() {
  const list = document.getElementById('ticket-list');
  const q = searchQuery.trim().toLowerCase();

  const filtered = TICKETS.filter(t => {
    if (currentFilter !== 'all' && t.status !== currentFilter) return false;
    if (q && !t.table.toLowerCase().includes(q)) return false;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = `<li class="ticket-row" style="cursor:default;opacity:0.6;font-size:0.85rem;color:rgba(240,235,224,0.6)">No tickets found</li>`;
    return;
  }

  list.innerHTML = filtered.map(t => {
    const icon = t.status === 'open' ? '🟡' : t.status === 'voided' ? '🔴' : '⚪';
    const isSelected = t.id === selectedTicketId;
    return `
      <li
        class="ticket-row${isSelected ? ' ticket-row--selected' : ''}"
        data-id="${t.id}"
        role="listitem"
        tabindex="0"
        aria-selected="${isSelected}"
      >
        <span class="ticket-row__icon">${icon}</span>
        <div class="ticket-row__body">
          <div class="ticket-row__table">${t.table}</div>
          <div class="ticket-row__meta">${t.time} · ${t.server}</div>
        </div>
        <div class="ticket-row__right">
          <span class="ticket-row__total">${fmt(ticketTotal(t))}</span>
          <span class="${statusClass(t.status)}">${statusLabel(t.status)}</span>
        </div>
      </li>
    `;
  }).join('');

  /* Event delegation */
  list.querySelectorAll('.ticket-row[data-id]').forEach(row => {
    row.addEventListener('click', () => selectTicket(row.dataset.id));
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectTicket(row.dataset.id);
      }
    });
  });
}

/* ── Render: Ticket Detail ────────────────────────────────── */
function renderDetail() {
  const emptyState = document.getElementById('empty-state');
  const detailView = document.getElementById('detail-view');

  if (!selectedTicketId) {
    emptyState.classList.remove('hidden');
    detailView.classList.add('hidden');
    return;
  }

  const ticket = getTicket(selectedTicketId);
  if (!ticket) return;

  emptyState.classList.add('hidden');
  detailView.classList.remove('hidden');

  /* Header */
  document.getElementById('detail-title').textContent = ticket.table;
  document.getElementById('detail-meta').textContent =
    `${ticket.time} · ${ticket.server} · ${ticket.items.length} items`;
  const statusEl = document.getElementById('detail-status');
  statusEl.className = statusClass(ticket.status);
  statusEl.textContent = statusLabel(ticket.status);

  /* Items */
  const itemsList = document.getElementById('items-list');
  const isVoidedTicket = ticket.status === 'voided';

  itemsList.innerHTML = ticket.items.map(it => {
    const isChecked = selectedItemIds.has(it.id);
    const isVoided = it.voided;
    const disabled = isVoided || isVoidedTicket ? 'disabled' : '';
    return `
      <li
        class="item-row${isChecked && !isVoided ? ' item-row--selected' : ''}${isVoided ? ' item-row--voided' : ''}"
        data-item-id="${it.id}"
      >
        <input
          type="checkbox"
          class="item-checkbox"
          id="cb-${it.id}"
          ${isChecked && !isVoided ? 'checked' : ''}
          ${disabled}
          aria-label="Select ${it.name} for void"
        />
        <label for="cb-${it.id}" class="item-row__name${isVoided ? ' item-row__name--voided' : ''}">${it.name}</label>
        <span class="item-row__qty">x${it.qty}</span>
        <span class="item-row__price${isVoided ? ' item-row__price--voided' : ''}">${fmt(it.qty * it.price)}</span>
        ${isVoided ? '<span class="item-row__voided-tag">Voided</span>' : ''}
      </li>
    `;
  }).join('');

  /* Item checkbox events */
  itemsList.querySelectorAll('.item-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const itemId = cb.id.replace('cb-', '');
      if (cb.checked) {
        selectedItemIds.add(itemId);
      } else {
        selectedItemIds.delete(itemId);
      }
      renderDetail();
    });
  });

  /* Item row click (row click toggles checkbox) */
  itemsList.querySelectorAll('.item-row').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.classList.contains('item-checkbox') || e.target.tagName === 'LABEL') return;
      const itemId = row.dataset.itemId;
      const it = ticket.items.find(i => i.id === itemId);
      if (!it || it.voided || isVoidedTicket) return;
      const cb = document.getElementById(`cb-${itemId}`);
      if (!cb || cb.disabled) return;
      cb.checked = !cb.checked;
      if (cb.checked) {
        selectedItemIds.add(itemId);
      } else {
        selectedItemIds.delete(itemId);
      }
      renderDetail();
    });
  });

  /* Select all button */
  const selectAllBtn = document.getElementById('select-all-btn');
  const voidableItems = ticket.items.filter(it => !it.voided);
  const allSelected = voidableItems.length > 0 && voidableItems.every(it => selectedItemIds.has(it.id));

  selectAllBtn.textContent = allSelected ? 'Deselect all' : 'Select all';
  selectAllBtn.disabled = isVoidedTicket || voidableItems.length === 0;

  selectAllBtn.onclick = () => {
    if (allSelected) {
      voidableItems.forEach(it => selectedItemIds.delete(it.id));
    } else {
      voidableItems.forEach(it => selectedItemIds.add(it.id));
    }
    renderDetail();
  };

  /* Summary */
  const voidAmt = selectedVoidAmount();
  document.getElementById('void-amount').textContent = fmt(voidAmt);
  document.getElementById('ticket-total').textContent = fmt(ticketTotal(ticket));

  /* Void button state */
  const voidBtn = document.getElementById('void-btn');
  const reasonSelect = document.getElementById('void-reason');
  const hasSelection = selectedItemIds.size > 0;
  const hasReason = reasonSelect.value !== '';
  voidBtn.disabled = !hasSelection || !hasReason || isVoidedTicket;
}

/* ── Render: Audit Trail ──────────────────────────────────── */
function renderAudit() {
  const tbody = document.getElementById('audit-tbody');
  const emptyMsg = document.getElementById('audit-empty');
  const badge = document.getElementById('audit-badge');

  const entries = auditLog.slice(-10).reverse();

  if (entries.length === 0) {
    tbody.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    badge.classList.add('hidden');
  } else {
    emptyMsg.classList.add('hidden');
    badge.classList.remove('hidden');
    badge.textContent = Math.min(auditLog.length, 10);

    tbody.innerHTML = entries.map(entry => `
      <tr>
        <td>${entry.time}</td>
        <td>${entry.table}</td>
        <td>${entry.items.join(', ')}</td>
        <td>${entry.reason}</td>
        <td>${entry.approver}</td>
        <td class="col-amount">${fmt(entry.amount)}</td>
      </tr>
    `).join('');
  }
}

/* ── Select Ticket ────────────────────────────────────────── */
function selectTicket(id) {
  if (selectedTicketId === id) return;
  selectedTicketId = id;
  selectedItemIds.clear();
  document.getElementById('void-reason').value = '';
  switchTab('detail');
  renderList();
  renderDetail();
}

/* ── Filter + Search ──────────────────────────────────────── */
function initFilters() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentFilter = chip.dataset.filter;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
      renderList();
    });
  });

  document.getElementById('search-input').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderList();
  });
}

/* ── Tabs ─────────────────────────────────────────────────── */
function switchTab(tab) {
  const tabs = document.querySelectorAll('.tab');
  const panels = { detail: 'panel-detail', audit: 'panel-audit' };

  tabs.forEach(t => {
    const isActive = t.dataset.tab === tab;
    t.classList.toggle('tab--active', isActive);
    t.setAttribute('aria-selected', isActive);
  });

  Object.entries(panels).forEach(([key, panelId]) => {
    const panel = document.getElementById(panelId);
    if (key === tab) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  if (tab === 'audit') {
    renderAudit();
  }
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

/* ── Void Button ──────────────────────────────────────────── */
function initVoidBtn() {
  const voidBtn = document.getElementById('void-btn');
  const reasonSelect = document.getElementById('void-reason');

  reasonSelect.addEventListener('change', () => renderDetail());

  voidBtn.addEventListener('click', () => {
    if (voidBtn.disabled) return;
    const reason = reasonSelect.value;
    if (!reason) {
      showToast('Please select a void reason.');
      return;
    }
    if (selectedItemIds.size === 0) {
      showToast('Please select at least one item to void.');
      return;
    }
    pendingVoidReason = reason;
    openPinOverlay();
  });
}

/* ── PIN Overlay ──────────────────────────────────────────── */
function openPinOverlay() {
  pinBuffer = '';
  updatePinDisplay();

  /* Populate summary */
  const ticket = getTicket(selectedTicketId);
  const voidAmt = selectedVoidAmount();
  const itemNames = ticket.items
    .filter(it => selectedItemIds.has(it.id))
    .map(it => it.name)
    .join(', ');
  document.getElementById('pin-summary').innerHTML =
    `Voiding <strong>${fmt(voidAmt)}</strong> from ${ticket.table}<br><span style="font-size:0.78rem;color:var(--warm-gray)">${itemNames}</span>`;

  document.getElementById('pin-error').classList.add('hidden');
  document.getElementById('pin-overlay').classList.remove('hidden');
  document.getElementById('pin-approve-btn').disabled = true;
}

function closePinOverlay() {
  pinBuffer = '';
  updatePinDisplay();
  document.getElementById('pin-error').classList.add('hidden');
  document.getElementById('pin-overlay').classList.add('hidden');
}

function updatePinDisplay() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    dot.classList.remove('pin-dot--filled', 'pin-dot--error');
    if (i < pinBuffer.length) {
      dot.classList.add('pin-dot--filled');
    }
  }
  document.getElementById('pin-approve-btn').disabled = pinBuffer.length < 4;
}

function showPinError() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    dot.classList.remove('pin-dot--filled');
    dot.classList.add('pin-dot--error');
  }
  document.getElementById('pin-error').classList.remove('hidden');
  pinBuffer = '';
  document.getElementById('pin-approve-btn').disabled = true;
  setTimeout(() => {
    for (let i = 0; i < 4; i++) {
      document.getElementById(`dot-${i}`).classList.remove('pin-dot--error');
    }
    document.getElementById('pin-error').classList.add('hidden');
  }, 1600);
}

function handlePin(key) {
  if (key === 'back') {
    pinBuffer = pinBuffer.slice(0, -1);
  } else if (key === 'clear') {
    pinBuffer = '';
  } else if (pinBuffer.length < 4) {
    pinBuffer += key;
  }
  updatePinDisplay();
}

function approveVoid() {
  if (pinBuffer !== CORRECT_PIN) {
    showPinError();
    return;
  }
  performVoid();
  closePinOverlay();
}

function performVoid() {
  const ticket = getTicket(selectedTicketId);
  if (!ticket) return;

  const voidedItems = [];
  let voidedAmount = 0;

  ticket.items.forEach(it => {
    if (selectedItemIds.has(it.id) && !it.voided) {
      it.voided = true;
      voidedItems.push(it.name);
      voidedAmount += it.qty * it.price;
    }
  });

  /* Check if all items are voided → update ticket status */
  const allVoided = ticket.items.every(it => it.voided);
  if (allVoided) {
    ticket.status = 'voided';
  }

  /* Add audit entry */
  auditLog.push({
    time: now(),
    table: ticket.table,
    items: voidedItems,
    reason: pendingVoidReason,
    approver: 'Manager',
    amount: voidedAmount,
  });

  /* Reset selection */
  selectedItemIds.clear();
  document.getElementById('void-reason').value = '';
  pendingVoidReason = '';

  /* Re-render */
  renderList();
  renderDetail();
  renderAudit();

  showToast(`Void approved — ${fmt(voidedAmount)} refunded from ${ticket.table}`);
}

function initPinOverlay() {
  document.getElementById('pin-close').addEventListener('click', closePinOverlay);
  document.getElementById('pin-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closePinOverlay();
  });

  document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => handlePin(key.dataset.key));
  });

  document.getElementById('pin-approve-btn').addEventListener('click', approveVoid);

  document.addEventListener('keydown', e => {
    const overlay = document.getElementById('pin-overlay');
    if (overlay.classList.contains('hidden')) return;

    if (e.key >= '0' && e.key <= '9') {
      handlePin(e.key);
    } else if (e.key === 'Backspace') {
      handlePin('back');
    } else if (e.key === 'Escape') {
      closePinOverlay();
    } else if (e.key === 'Enter' && pinBuffer.length === 4) {
      approveVoid();
    }
  });
}

/* ── Toast ────────────────────────────────────────────────── */
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3000);
}

/* ── Init ─────────────────────────────────────────────────── */
function init() {
  renderList();
  renderDetail();
  renderAudit();
  initFilters();
  initTabs();
  initVoidBtn();
  initPinOverlay();
}

document.addEventListener('DOMContentLoaded', init);
