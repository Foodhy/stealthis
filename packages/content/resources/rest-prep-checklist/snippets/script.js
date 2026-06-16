/* ============================================================
   Kitchen Prep Checklist — script.js
   Phase 27 Restaurant Theme
   ============================================================ */

'use strict';

// ── TASK DATA ──────────────────────────────────────────────────
const TASKS = [
  // Garde Manger
  { id: 1,  station: 'Garde Manger', name: 'Butcher mise en place',       critical: true,  assignee: 'Sofia',  initials: 'SO', time: '30 min', done: false },
  { id: 2,  station: 'Garde Manger', name: 'Salad station setup',          critical: false, assignee: 'Diego',  initials: 'DG', time: '15 min', done: false },
  { id: 3,  station: 'Garde Manger', name: 'Vinaigrettes prepared',        critical: false, assignee: 'Diego',  initials: 'DG', time: '10 min', done: false },
  { id: 4,  station: 'Garde Manger', name: 'Charcuterie board stocked',    critical: true,  assignee: 'Sofia',  initials: 'SO', time: '20 min', done: false },

  // Hot Line
  { id: 5,  station: 'Hot Line', name: 'Stocks reduced and seasoned',      critical: true,  assignee: 'Sofia',  initials: 'SO', time: '45 min', done: false },
  { id: 6,  station: 'Hot Line', name: 'Sauces warmed and held',           critical: true,  assignee: 'Diego',  initials: 'DG', time: '20 min', done: false },
  { id: 7,  station: 'Hot Line', name: 'Grill preheated and cleaned',      critical: true,  assignee: 'Diego',  initials: 'DG', time: '10 min', done: false },
  { id: 8,  station: 'Hot Line', name: 'Protein portions counted',         critical: false, assignee: 'Sofia',  initials: 'SO', time: '15 min', done: false },

  // Pastry
  { id: 9,  station: 'Pastry', name: 'Dessert plates set',                 critical: false, assignee: 'Ana',    initials: 'AN', time: '10 min', done: false },
  { id: 10, station: 'Pastry', name: 'Tarta de queso plated ×8',           critical: true,  assignee: 'Ana',    initials: 'AN', time: '20 min', done: false },
  { id: 11, station: 'Pastry', name: 'Garnishes prepped',                  critical: false, assignee: 'Ana',    initials: 'AN', time: '15 min', done: false },

  // Bar
  { id: 12, station: 'Bar', name: 'Ice bins filled',                       critical: true,  assignee: 'Julian', initials: 'JU', time: '10 min', done: false },
  { id: 13, station: 'Bar', name: 'Speed rail stocked',                    critical: false, assignee: 'Julian', initials: 'JU', time: '15 min', done: false },
  { id: 14, station: 'Bar', name: 'Glassware polished',                    critical: false, assignee: 'Julian', initials: 'JU', time: '20 min', done: false },
  { id: 15, station: 'Bar', name: 'Cocktail garnishes prepped',            critical: false, assignee: 'Julian', initials: 'JU', time: '10 min', done: false },

  // FOH
  { id: 16, station: 'FOH', name: 'Tables set and candles lit',            critical: true,  assignee: 'Camila', initials: 'CA', time: '30 min', done: false },
  { id: 17, station: 'FOH', name: 'Menus distributed',                     critical: false, assignee: 'Camila', initials: 'CA', time: '10 min', done: false },
  { id: 18, station: 'FOH', name: 'POS stations checked',                  critical: false, assignee: 'Marco',  initials: 'MR', time: '5 min',  done: false },
  { id: 19, station: 'FOH', name: 'Reservation list printed',              critical: true,  assignee: 'Marco',  initials: 'MR', time: '5 min',  done: false },
  { id: 20, station: 'FOH', name: 'Staff briefing done',                   critical: true,  assignee: 'Marco',  initials: 'MR', time: '15 min', done: false },
];

const STATION_ORDER = ['Garde Manger', 'Hot Line', 'Pastry', 'Bar', 'FOH'];
const CIRCUMFERENCE = 314.159; // 2π × 50

// ── STATE ──────────────────────────────────────────────────────
let activeFilter = 'all';
let signedOff    = false;
let serviceStartTime = null;

// ── DOM REFS ───────────────────────────────────────────────────
const taskListEl    = document.getElementById('taskList');
const ringFill      = document.getElementById('ringFill');
const ringPct       = document.getElementById('ringPct');
const ringCount     = document.getElementById('ringCount');
const critDot       = document.getElementById('critDot');
const critText      = document.getElementById('critText');
const progressHint  = document.getElementById('progressHint');
const signoffBtn    = document.getElementById('signoffBtn');
const signedoffBanner = document.getElementById('signedoffBanner');
const signedoffTs   = document.getElementById('signedoffTs');
const filterChips   = document.querySelectorAll('.filter-chip');

// ── RENDER ─────────────────────────────────────────────────────
function buildTaskList() {
  taskListEl.innerHTML = '';

  STATION_ORDER.forEach(station => {
    const tasks = TASKS.filter(t => t.station === station);
    const group = document.createElement('div');
    group.className = 'station-group';
    group.dataset.station = station;

    // Station header
    const header = document.createElement('div');
    header.className = 'station-header';
    header.textContent = station;
    group.appendChild(header);

    tasks.forEach(task => {
      const row = document.createElement('div');
      row.className = 'task-row' + (task.done ? ' done' : '');
      row.dataset.taskId = task.id;
      row.setAttribute('role', 'checkbox');
      row.setAttribute('aria-checked', task.done ? 'true' : 'false');
      row.setAttribute('tabindex', '0');

      row.innerHTML = `
        <div class="task-checkbox ${task.done ? 'checked' : ''}"></div>
        <div class="task-body">
          <div class="task-name">${task.name}</div>
          <div class="task-tags">
            ${task.critical ? '<span class="badge-critical">Critical</span>' : ''}
            <span class="task-time">⏱ ${task.time}</span>
          </div>
        </div>
        <div class="assignee-chip" title="${task.assignee}">${task.initials}</div>
      `;

      row.addEventListener('click', () => toggleTask(task.id));
      row.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleTask(task.id);
        }
      });

      group.appendChild(row);
    });

    taskListEl.appendChild(group);
  });

  applyFilter();
}

// ── TOGGLE TASK ────────────────────────────────────────────────
function toggleTask(id) {
  if (signedOff) return;

  const task = TASKS.find(t => t.id === id);
  if (!task) return;

  task.done = !task.done;

  // Update row DOM
  const row = taskListEl.querySelector(`[data-task-id="${id}"]`);
  if (row) {
    const checkbox = row.querySelector('.task-checkbox');
    if (task.done) {
      row.classList.add('done');
      checkbox.classList.add('checked');
      row.setAttribute('aria-checked', 'true');
    } else {
      row.classList.remove('done');
      checkbox.classList.remove('checked');
      row.setAttribute('aria-checked', 'false');
    }
  }

  updateProgress();
}

// ── PROGRESS ───────────────────────────────────────────────────
function updateProgress() {
  const total    = TASKS.length;
  const done     = TASKS.filter(t => t.done).length;
  const critTotal = TASKS.filter(t => t.critical).length;
  const critDone  = TASKS.filter(t => t.critical && t.done).length;
  const pct       = Math.round((done / total) * 100);
  const allCritDone = critDone === critTotal;

  // Ring
  const offset = CIRCUMFERENCE - (done / total) * CIRCUMFERENCE;
  ringFill.style.strokeDashoffset = offset;
  ringPct.textContent   = pct + '%';
  ringCount.textContent = `${done} of ${total} done`;

  // Critical status
  critText.textContent = `${critDone} of ${critTotal} critical tasks done`;
  if (allCritDone) {
    critDot.className = 'dot dot--done';
  } else {
    critDot.className = 'dot dot--pending';
  }

  // Hint
  if (allCritDone && done < total) {
    progressHint.textContent = 'All critical tasks done — ready to sign off!';
  } else if (allCritDone && done === total) {
    progressHint.textContent = 'All tasks complete. Kitchen is ready!';
  } else {
    progressHint.textContent = 'Complete all critical tasks to sign off for service.';
  }

  // Sign-off button
  signoffBtn.disabled = !allCritDone || signedOff;
}

// ── FILTER ─────────────────────────────────────────────────────
function applyFilter() {
  const groups = taskListEl.querySelectorAll('.station-group');
  groups.forEach(group => {
    const station = group.dataset.station;
    if (activeFilter === 'all' || activeFilter === station) {
      group.hidden = false;
    } else {
      group.hidden = true;
    }
  });
}

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.station;
    applyFilter();
  });
});

// ── SIGN-OFF ───────────────────────────────────────────────────
signoffBtn.addEventListener('click', () => {
  if (signoffBtn.disabled || signedOff) return;

  signedOff = true;
  serviceStartTime = new Date();

  const hh = String(serviceStartTime.getHours()).padStart(2, '0');
  const mm = String(serviceStartTime.getMinutes()).padStart(2, '0');
  const dateStr = serviceStartTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  signedoffTs.textContent = `${dateStr} · Service opened at ${hh}:${mm}`;

  // Swap button for banner
  signoffBtn.hidden = true;
  signedoffBanner.hidden = false;
});

// ── CLOCK ──────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('currentTime').textContent = `${hh}:${mm}`;
}

updateClock();
setInterval(updateClock, 10000);

// ── INIT ───────────────────────────────────────────────────────
buildTaskList();
updateProgress();
