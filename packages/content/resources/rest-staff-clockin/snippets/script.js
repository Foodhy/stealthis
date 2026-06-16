/* =========================================================
   Staff Clock-In Terminal — script.js
   Phase 27 Restaurant Theme
   ========================================================= */

/* ----------------------------------------------------------
   Staff data
   ---------------------------------------------------------- */
const STAFF = [
  { id: 1, name: 'Marco Reyes',   role: 'Floor Manager', pin: '1111', status: 'in',  clockedAt: '19:02', onBreak: false, breakStart: null },
  { id: 2, name: 'Sofía Medina',  role: 'Head Chef',     pin: '2222', status: 'in',  clockedAt: '15:08', onBreak: false, breakStart: null },
  { id: 3, name: 'Diego Lara',    role: 'Sous Chef',     pin: '3333', status: 'out', clockedAt: null,    onBreak: false, breakStart: null },
  { id: 4, name: 'Camila Torres', role: 'Waitstaff',     pin: '4444', status: 'out', clockedAt: null,    onBreak: false, breakStart: null },
  { id: 5, name: 'Julián Ortiz',  role: 'Bartender',     pin: '5555', status: 'in',  clockedAt: '18:03', onBreak: true,  breakStart: '20:30' },
  { id: 6, name: 'Ana Petit',     role: 'Waitstaff',     pin: '6666', status: 'out', clockedAt: null,    onBreak: false, breakStart: null },
];

/* ----------------------------------------------------------
   Live clock — fixed base 20:46, advances with real elapsed time
   ---------------------------------------------------------- */
const BASE_MINUTES = 20 * 60 + 46; // 20:46 in minutes
const SESSION_START = Date.now();

function getNowMinutes() {
  const elapsed = Math.floor((Date.now() - SESSION_START) / 1000); // seconds
  return BASE_MINUTES + Math.floor(elapsed / 60);
}

function minutesToHHMM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function currentTimeStr() {
  return minutesToHHMM(getNowMinutes());
}

function updateClock() {
  const el = document.getElementById('header-clock');
  if (el) el.textContent = currentTimeStr();
}

setInterval(updateClock, 30000);

/* ----------------------------------------------------------
   State
   ---------------------------------------------------------- */
let selectedStaff = null;
let enteredPin = '';
let breakIntervalId = null;
let breakElapsedSeconds = 0;

/* ----------------------------------------------------------
   Screen management
   ---------------------------------------------------------- */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.querySelector(`[data-screen="${name}"]`);
  if (target) target.classList.add('active');
}

/* ----------------------------------------------------------
   Helpers
   ---------------------------------------------------------- */
function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function greetingByHour() {
  const h = Math.floor(getNowMinutes() / 60) % 24;
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Parse HH:MM string → total minutes */
function parseTime(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Compute duration between two HH:MM strings (handles overnight if needed) */
function durationStr(fromHHMM, toHHMM) {
  let diff = parseTime(toHHMM) - parseTime(fromHHMM);
  if (diff < 0) diff += 24 * 60; // overnight
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function fmtSeconds(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

/* ----------------------------------------------------------
   Home screen — staff grid render
   ---------------------------------------------------------- */
function renderGrid() {
  const grid = document.getElementById('staff-grid');
  grid.innerHTML = '';

  STAFF.forEach(member => {
    const chip = document.createElement('button');
    chip.className = `staff-chip chip--${member.status}`;
    chip.setAttribute('aria-label', `${member.name}, ${member.status === 'in' ? 'clocked in' : 'clocked out'}`);

    let breakBadge = '';
    if (member.onBreak) {
      breakBadge = `<span class="chip-break-badge">Break</span>`;
    }

    chip.innerHTML = `
      ${breakBadge}
      <div class="chip-avatar">${initials(member.name)}</div>
      <div class="chip-name">${member.name.split(' ')[0]}<br>${member.name.split(' ')[1] || ''}</div>
      <span class="chip-status-dot dot--${member.status}"></span>
    `;

    chip.addEventListener('click', () => onStaffSelect(member));
    grid.appendChild(chip);
  });
}

/* ----------------------------------------------------------
   Staff tap → PIN screen
   ---------------------------------------------------------- */
function onStaffSelect(member) {
  selectedStaff = member;
  enteredPin = '';

  document.getElementById('pin-avatar').textContent = initials(member.name);
  document.getElementById('pin-name').textContent = member.name;
  document.getElementById('pin-role').textContent = member.role;
  clearPinDots();
  hidePinError();

  showScreen('pin');
}

/* ----------------------------------------------------------
   PIN entry
   ---------------------------------------------------------- */
function clearPinDots() {
  document.querySelectorAll('.pin-dot').forEach(d => d.classList.remove('filled'));
}

function updatePinDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((d, i) => d.classList.toggle('filled', i < enteredPin.length));
}

function showPinError() {
  const el = document.getElementById('pin-error');
  el.classList.add('visible');
  const dots = document.getElementById('pin-dots');
  dots.classList.add('shake');
  dots.addEventListener('animationend', () => dots.classList.remove('shake'), { once: true });
}

function hidePinError() {
  document.getElementById('pin-error').classList.remove('visible');
}

function onDigit(d) {
  if (enteredPin.length >= 4) return;
  hidePinError();
  enteredPin += d;
  updatePinDots();
  if (enteredPin.length === 4) {
    setTimeout(validatePin, 120);
  }
}

function onBackspace() {
  if (enteredPin.length === 0) return;
  enteredPin = enteredPin.slice(0, -1);
  updatePinDots();
  hidePinError();
}

function validatePin() {
  if (!selectedStaff) return;
  if (enteredPin === selectedStaff.pin) {
    enteredPin = '';
    clearPinDots();
    navigateToAction(selectedStaff);
  } else {
    enteredPin = '';
    clearPinDots();
    showPinError();
  }
}

/* ----------------------------------------------------------
   Navigate to appropriate action screen
   ---------------------------------------------------------- */
function navigateToAction(member) {
  if (member.status === 'out') {
    // Clock-in screen
    document.getElementById('action-out-avatar').textContent = initials(member.name);
    document.getElementById('action-out-greeting').textContent = `${greetingByHour()}, ${member.name.split(' ')[0]}`;
    document.getElementById('action-out-time').textContent = currentTimeStr();
    document.getElementById('action-out-role').textContent = member.role;
    showScreen('action-out');

  } else if (member.onBreak) {
    // On break screen
    document.getElementById('break-avatar').textContent = initials(member.name);
    document.getElementById('break-name').textContent = member.name;
    startBreakTimer(member);
    showScreen('break');

  } else {
    // Clocked in screen
    document.getElementById('action-in-avatar').textContent = initials(member.name);
    document.getElementById('action-in-greeting').textContent = member.name;
    document.getElementById('action-in-role').textContent = member.role;
    document.getElementById('action-in-clockedat').textContent = member.clockedAt;
    document.getElementById('action-in-duration').textContent = durationStr(member.clockedAt, currentTimeStr());
    showScreen('action-in');
  }
}

/* ----------------------------------------------------------
   Clock In
   ---------------------------------------------------------- */
function clockIn() {
  if (!selectedStaff) return;
  const now = currentTimeStr();
  selectedStaff.status = 'in';
  selectedStaff.clockedAt = now;
  selectedStaff.onBreak = false;
  selectedStaff.breakStart = null;

  showConfirmation({
    type: 'in',
    title: 'Clocked In!',
    sub: `Shift started at ${now}`,
    rows: [
      { label: 'Staff', val: selectedStaff.name },
      { label: 'Role', val: selectedStaff.role },
      { label: 'Clock-in time', val: now },
    ]
  });
}

/* ----------------------------------------------------------
   Clock Out
   ---------------------------------------------------------- */
function clockOut() {
  if (!selectedStaff) return;
  const now = currentTimeStr();
  const duration = durationStr(selectedStaff.clockedAt, now);
  const from = selectedStaff.clockedAt;

  selectedStaff.status = 'out';
  selectedStaff.clockedAt = null;
  selectedStaff.onBreak = false;
  selectedStaff.breakStart = null;

  showConfirmation({
    type: 'out',
    title: 'Signed Off',
    sub: 'Good work today!',
    rows: [
      { label: 'Staff', val: selectedStaff.name },
      { label: 'Clocked in', val: from },
      { label: 'Clocked out', val: now },
      { label: 'Total hours', val: duration },
    ]
  });
}

/* ----------------------------------------------------------
   Break management
   ---------------------------------------------------------- */
function startBreak() {
  if (!selectedStaff) return;
  const now = currentTimeStr();
  selectedStaff.onBreak = true;
  selectedStaff.breakStart = now;

  document.getElementById('break-avatar').textContent = initials(selectedStaff.name);
  document.getElementById('break-name').textContent = selectedStaff.name;
  breakElapsedSeconds = 0;
  document.getElementById('break-timer').textContent = fmtSeconds(0);
  startBreakTimer(selectedStaff);
  showScreen('break');
}

function startBreakTimer(member) {
  clearInterval(breakIntervalId);
  // If member already on break, compute elapsed from breakStart
  if (member.breakStart) {
    const startMin = parseTime(member.breakStart);
    const nowMin = getNowMinutes();
    let diff = nowMin - startMin;
    if (diff < 0) diff += 24 * 60;
    breakElapsedSeconds = diff * 60;
  } else {
    breakElapsedSeconds = 0;
  }
  document.getElementById('break-timer').textContent = fmtSeconds(breakElapsedSeconds);

  breakIntervalId = setInterval(() => {
    breakElapsedSeconds++;
    document.getElementById('break-timer').textContent = fmtSeconds(breakElapsedSeconds);
  }, 1000);
}

function endBreak() {
  clearInterval(breakIntervalId);
  if (!selectedStaff) return;

  const breakDuration = fmtSeconds(breakElapsedSeconds);
  selectedStaff.onBreak = false;
  selectedStaff.breakStart = null;

  showConfirmation({
    type: 'in',
    title: 'Break Ended',
    sub: 'Welcome back!',
    rows: [
      { label: 'Staff', val: selectedStaff.name },
      { label: 'Break duration', val: breakDuration },
      { label: 'Back on shift', val: currentTimeStr() },
    ]
  });
}

/* ----------------------------------------------------------
   Confirmation screen
   ---------------------------------------------------------- */
function showConfirmation({ type, title, sub, rows }) {
  const icon = document.getElementById('confirm-icon');
  icon.textContent = type === 'in' ? '✓' : '✕';
  icon.className = type === 'in' ? 'confirm-icon' : 'confirm-icon icon--out';

  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-sub').textContent = sub;

  const summary = document.getElementById('confirm-summary');
  summary.innerHTML = rows.map(r => `
    <div class="summary-row">
      <span class="summary-label">${r.label}</span>
      <span class="summary-val">${r.val}</span>
    </div>
  `).join('');

  showScreen('confirm');
}

/* ----------------------------------------------------------
   Event wiring
   ---------------------------------------------------------- */
function init() {
  updateClock();
  renderGrid();

  // Numpad
  document.getElementById('numpad').addEventListener('click', e => {
    const key = e.target.closest('.numpad-key');
    if (!key) return;
    const k = key.dataset.key;
    if (k === 'back') onBackspace();
    else if (k === '*') { /* no-op */ }
    else onDigit(k);
  });

  // PIN cancel
  document.getElementById('btn-cancel').addEventListener('click', () => {
    enteredPin = '';
    clearPinDots();
    hidePinError();
    showScreen('home');
  });

  // Action-out screen
  document.getElementById('btn-clockin').addEventListener('click', clockIn);
  document.getElementById('btn-action-out-cancel').addEventListener('click', () => showScreen('home'));

  // Action-in screen
  document.getElementById('btn-clockout').addEventListener('click', clockOut);
  document.getElementById('btn-startbreak').addEventListener('click', startBreak);
  document.getElementById('btn-action-in-cancel').addEventListener('click', () => showScreen('home'));

  // Break screen
  document.getElementById('btn-endbreak').addEventListener('click', endBreak);
  document.getElementById('btn-break-cancel').addEventListener('click', () => {
    clearInterval(breakIntervalId);
    showScreen('home');
  });

  // Confirm / done
  document.getElementById('btn-done').addEventListener('click', () => {
    renderGrid(); // refresh home grid with updated state
    showScreen('home');
    selectedStaff = null;
  });
}

document.addEventListener('DOMContentLoaded', init);
