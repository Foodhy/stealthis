const body = document.getElementById('lvBody');
const logCountEl = document.getElementById('logCount');
const autoScrollChk = document.getElementById('autoScroll');
const searchInput = document.getElementById('lvSearch');
const simBtn = document.getElementById('simBtn');
const stopBtn = document.getElementById('stopBtn');

let activeLevel = 'all';
let searchTerm = '';
let logLines = [];
let simInterval = null;
let lineCount = 0;

const SAMPLE_LOGS = [
  ['INFO', 'Server started on port 3000'],
  ['INFO', 'Database connection established'],
  ['DEBUG', 'Cache initialized with 512MB limit'],
  ['INFO', 'User auth-service ready'],
  ['INFO', 'GET /api/users 200 12ms'],
  ['DEBUG', 'Session token validated for user #42'],
  ['INFO', 'POST /api/orders 201 34ms'],
  ['WARN', 'Rate limit threshold at 80% for IP 192.168.1.5'],
  ['INFO', 'GET /api/products 200 8ms'],
  ['DEBUG', 'Cache hit for key: products:all'],
  ['ERROR', 'Failed to connect to payment gateway: timeout after 30s'],
  ['INFO', 'Retry attempt 1/3 for payment gateway'],
  ['WARN', 'Memory usage at 78% (6.2GB / 8GB)'],
  ['INFO', 'PUT /api/users/42 200 22ms'],
  ['ERROR', 'Unhandled exception in worker thread: RangeError: Maximum call stack size exceeded'],
  ['INFO', 'Worker thread restarted'],
  ['INFO', 'DELETE /api/sessions/old 200 5ms'],
  ['DEBUG', 'GC cycle completed, freed 124MB'],
  ['WARN', 'Slow query detected: SELECT * FROM orders took 2300ms'],
  ['INFO', 'Scheduled job "email-digest" completed in 1.2s'],
];

function pad(n) { return String(n).padStart(2, '0'); }

function getTimestamp() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3,'0')}`;
}

function addLog(level, msg) {
  lineCount++;
  const entry = { id: lineCount, level, msg, ts: getTimestamp() };
  logLines.push(entry);

  const line = document.createElement('div');
  line.className = `log-line${level === 'ERROR' ? ' lvl-ERROR-line' : ''}`;
  line.dataset.level = level;
  line.dataset.msg = msg.toLowerCase();
  line.innerHTML = `
    <span class="log-ts">${entry.ts}</span>
    <span class="log-lvl lvl-${level}">${level}</span>
    <span class="log-msg">${escHtml(msg)}</span>
  `;
  applyVisibility(line);
  body.appendChild(line);
  updateCount();
  if (autoScrollChk.checked) body.scrollTop = body.scrollHeight;
}

function applyVisibility(line) {
  const lvMatch = activeLevel === 'all' || line.dataset.level === activeLevel;
  const sMatch = !searchTerm || line.dataset.msg.includes(searchTerm);
  line.classList.toggle('hidden', !(lvMatch && sMatch));
}

function applyAllFilters() {
  body.querySelectorAll('.log-line').forEach(applyVisibility);
  updateCount();
}

function updateCount() {
  const visible = body.querySelectorAll('.log-line:not(.hidden)').length;
  logCountEl.textContent = `${visible} / ${lineCount} lines`;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Level filter
document.getElementById('levelFilters').addEventListener('click', e => {
  const btn = e.target.closest('.lvl-btn');
  if (!btn) return;
  document.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeLevel = btn.dataset.level;
  applyAllFilters();
});

// Search
searchInput.addEventListener('input', e => {
  searchTerm = e.target.value.toLowerCase();
  applyAllFilters();
});

// Clear
document.getElementById('clearLogs').addEventListener('click', () => {
  body.innerHTML = '';
  logLines = [];
  lineCount = 0;
  updateCount();
});

// Simulate
let sampleIdx = 0;
simBtn.addEventListener('click', () => {
  if (simInterval) return;
  simBtn.disabled = true;
  stopBtn.disabled = false;
  simInterval = setInterval(() => {
    const [level, msg] = SAMPLE_LOGS[sampleIdx % SAMPLE_LOGS.length];
    addLog(level, msg);
    sampleIdx++;
  }, 600);
});

stopBtn.addEventListener('click', () => {
  clearInterval(simInterval);
  simInterval = null;
  simBtn.disabled = false;
  stopBtn.disabled = true;
});

// Seed initial logs
const SEED = SAMPLE_LOGS.slice(0, 8);
SEED.forEach(([l, m]) => addLog(l, m));
